# Announcement Service Documentation

> **Last Updated:** January 3, 2026  

This document provides comprehensive documentation for the Announcement Service implementation across both frontend (client & admin) and backend systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
   - [Model Schema](#model-schema)
   - [API Routes](#api-routes)
   - [Controller Methods](#controller-methods)
3. [Frontend Client Implementation](#frontend-client-implementation)
   - [Announcements List Page](#announcements-list-page)
   - [Announcement Detail Page](#announcement-detail-page)
   - [Home Section Announcements](#home-section-announcements)
4. [Frontend Admin Implementation](#frontend-admin-implementation)
   - [Premium UI/UX Design](#premium-uiux-design)
   - [CRUD Operations](#crud-operations)
   - [Archive Functionality](#archive-functionality)
5. [Key Features](#key-features)
6. [API Reference](#api-reference)
7. [Color Scheme](#color-scheme)

---

## Overview

The Announcement Service enables barangay administrators to create, manage, and publish announcements to residents. Key features include:

- **Dynamic content** - All announcements are fetched from the database (no hardcoded data)
- **Category filtering** - Filter announcements by category with instant response
- **Archive system** - Announcements older than 1 year are automatically hidden from public view but retained in admin archive
- **Premium admin UI** - Modern card-based design matching the Reports management interface
- **Image support** - Upload and display images for announcements
- **View tracking** - Track how many times an announcement has been viewed

---

## Backend Implementation

### Model Schema

**File:** `Culiat_Backend/models/Announcement.js`

```javascript
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
  },
  category: {
    type: String,
    enum: [
      'Health Program',
      'Community Activity', 
      'Education & Training',
      'Social Services',
      'Sports & Recreation',
      'Safety & Security',
      'General',
      'Event',
      'Emergency',
      'Update'
    ],
    default: 'General',
  },
  priority: {
    type: String,
    enum: ['normal', 'important', 'urgent'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: 'Barangay Culiat',
  },
  image: {
    type: String,
    default: null,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  eventDate: {
    type: Date,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});
```

**Key Schema Features:**
- `slug` - Auto-generated from title for SEO-friendly URLs
- `status` - Three states: draft, published, archived
- `views` - Increments when announcement is viewed
- `image` - Supports Cloudinary or local file storage

### API Routes

**File:** `Culiat_Backend/routes/announcementsRoute.js`

```javascript
// Admin routes (must come BEFORE /:id routes to avoid conflicts)
router.get('/admin/all', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), getAllAnnouncements);
router.post('/', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), upload.single('image'), createAnnouncement);

// Public routes
router.get('/', getPublishedAnnouncements);
router.get('/:id', getAnnouncement);

// Protected routes with :id parameter
router.put('/:id', protect, authorize(ROLES.Admin, ROLES.SuperAdmin), upload.single('image'), updateAnnouncement);
router.put('/:id/publish', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), togglePublish);
router.put('/:id/archive', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), toggleArchive);
router.delete('/:id', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), deleteAnnouncement);
```

> **Important:** Route order matters! Static routes like `/admin/all` must be defined before dynamic routes like `/:id` to prevent Express from treating "admin" as an ID parameter.

### Controller Methods

**File:** `Culiat_Backend/controllers/announcementController.js`

| Method | Description |
|--------|-------------|
| `createAnnouncement` | Creates a new announcement with optional image upload |
| `getAllAnnouncements` | Returns all announcements for admin (includes archived) |
| `getPublishedAnnouncements` | Returns only published announcements less than 1 year old |
| `getAnnouncement` | Returns single announcement by ID or slug, increments view count |
| `updateAnnouncement` | Updates announcement with optional new image |
| `togglePublish` | Toggles between published/draft status |
| `toggleArchive` | Toggles between archived/draft status |
| `deleteAnnouncement` | Permanently deletes an announcement |

**1-Year Filter Logic (Client Side):**

```javascript
exports.getPublishedAnnouncements = async (req, res) => {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const announcements = await Announcement.find({
    isPublished: true,
    status: 'published',
    createdAt: { $gte: oneYearAgo }, // Only announcements within the last year
    $or: [
      { expiryDate: null },
      { expiryDate: { $gte: now } }
    ]
  });
};
```

---

## Frontend Client Implementation

### Announcements List Page

**File:** `Culiat_Frontend/src/users/pages/Announcement/Announcements.jsx`

**Key Features:**
- Fetches announcements from backend API
- Category filter with instant response (no delay)
- Bluish color scheme
- Responsive grid layout
- Loading and error states

**Implementation Details:**

```jsx
// API fetch with axios
const fetchAnnouncements = async () => {
  const response = await axios.get(`${API_URL}/api/announcements`);
  if (response.data.success) {
    setAnnouncements(response.data.data);
  }
};

// Client-side 1-year filter (double protection)
const recentAnnouncements = useMemo(() => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return announcements.filter(a => new Date(a.createdAt) >= oneYearAgo);
}, [announcements]);

// Category filter with useMemo for performance
const filteredAnnouncements = useMemo(() => {
  if (activeFilter === "All") return recentAnnouncements;
  return recentAnnouncements.filter((a) => a.category === activeFilter);
}, [activeFilter, recentAnnouncements]);
```

**Quick Filter Fix:**
The delay when switching filters was fixed by:
1. Using `useMemo` for filtered results
2. Optimized animation variants with shorter durations
3. Using `AnimatePresence` with `mode="popLayout"` for instant transitions

### Announcement Detail Page

**File:** `Culiat_Frontend/src/users/pages/Announcement/AnnouncementDetail.jsx`

**Features:**
- Fetches announcement by slug or ID
- Hero image display
- View count display
- Share functionality
- Bluish color scheme
- Responsive design

```jsx
// Supports both slug and ID lookup
const { slug } = useParams();
const response = await axios.get(`${API_URL}/api/announcements/${slug}`);
```

### Home Section Announcements

**File:** `Culiat_Frontend/src/users/pages/Home/HomeSections/Announcements.jsx`

**Features:**
- Featured layout (1 main + 3 sidebar)
- Smart sorting prioritizing upcoming events
- Connects to backend API
- Empty state handling

```jsx
// Smart sorting - upcoming events first, then recent past events
const sortedAnnouncements = useMemo(() => {
  const now = new Date();
  return [...announcements]
    .sort((a, b) => {
      const aIsFuture = a.parsedDate >= now;
      const bIsFuture = b.parsedDate >= now;
      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;
      return aIsFuture ? a.parsedDate - b.parsedDate : b.parsedDate - a.parsedDate;
    });
}, [announcements]);
```

---

## Frontend Admin Implementation

### Premium UI/UX Design

**File:** `Culiat_Frontend/src/admin/pages/Announcements/AdminAnnouncements.jsx`

The admin interface was redesigned to match the premium UI/UX of the Reports management page (`AdminReportsV2.jsx`).

**Design Elements:**

1. **Gradient Header**
```jsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8">
  {/* Decorative blurs */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
</div>
```

2. **Stats Cards**
```jsx
{[
  { label: "Total", count: statusCounts.all, icon: Inbox, gradient: "from-blue-500 to-blue-600" },
  { label: "Published", count: statusCounts.published, icon: CheckCircle, gradient: "from-emerald-500 to-green-500" },
  { label: "Drafts", count: statusCounts.draft, icon: Clock, gradient: "from-gray-500 to-slate-500" },
  { label: "Archived", count: statusCounts.archived, icon: Archive, gradient: "from-amber-500 to-orange-500" },
].map((stat) => (
  <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
    {/* Stat content */}
  </div>
))}
```

3. **Card Grid Layout**
- Each announcement displayed as a card
- Image preview with hover zoom effect
- Quick action buttons on hover
- Category and status badges
- Dark mode support

### CRUD Operations

**Create Announcement:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const submitData = new FormData();
  submitData.append("title", formData.title);
  submitData.append("content", formData.content);
  submitData.append("category", formData.category);
  submitData.append("status", formData.status);
  submitData.append("location", formData.location);
  if (formData.eventDate) submitData.append("eventDate", formData.eventDate);
  if (formData.image) submitData.append("image", formData.image);

  await axios.post(`${API_URL}/api/announcements`, submitData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

**Update Announcement:**
```jsx
await axios.put(`${API_URL}/api/announcements/${selectedAnnouncement._id}`, submitData, {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Delete Announcement:**
```jsx
await axios.delete(`${API_URL}/api/announcements/${selectedAnnouncement._id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Archive Functionality

Announcements older than 1 year are not shown to public users but remain accessible in the admin panel under the "Archived" filter.

**Toggle Archive:**
```jsx
const handleArchiveToggle = async (announcement) => {
  await axios.put(
    `${API_URL}/api/announcements/${announcement._id}/archive`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
```

---

## Key Features

### 1. No Hardcoded Data
All announcement data is fetched from the MongoDB database via the backend API.

### 2. 1-Year Filter
- **Backend:** `getPublishedAnnouncements` filters announcements created within the last year
- **Frontend:** Additional `useMemo` filter as double protection

### 3. Instant Category Filtering
Fixed the slow filter response by:
- Using `useMemo` for memoized filtering
- Optimized Framer Motion animation variants
- Reduced animation durations

### 4. Archive System
- Announcements can be archived instead of deleted
- Archived announcements hidden from public but visible in admin
- Easy unarchive functionality

### 5. Image Upload
- Supports Cloudinary (production) or local storage (development)
- Image preview in admin forms
- Responsive image display in cards and detail pages

### 6. View Tracking
Each time an announcement is viewed, the view counter increments.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements` | Get all published announcements (< 1 year old) |
| GET | `/api/announcements/:id` | Get single announcement by ID or slug |

### Admin Endpoints (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements/admin/all` | Get all announcements including archived |
| POST | `/api/announcements` | Create new announcement |
| PUT | `/api/announcements/:id` | Update announcement |
| PUT | `/api/announcements/:id/publish` | Toggle publish status |
| PUT | `/api/announcements/:id/archive` | Toggle archive status |
| DELETE | `/api/announcements/:id` | Delete announcement |

### Request/Response Examples

**Create Announcement (POST /api/announcements)**

Request (FormData):
```
title: "Community Clean-up Drive"
content: "Join us for a community clean-up activity..."
category: "Community Activity"
status: "published"
location: "Barangay Hall"
eventDate: "2026-01-15"
image: [File]
```

Response:
```json
{
  "success": true,
  "message": "Announcement created successfully",
  "data": {
    "_id": "...",
    "title": "Community Clean-up Drive",
    "slug": "community-clean-up-drive-1704312000000",
    "status": "published",
    ...
  }
}
```

---

## Color Scheme

The announcement service uses a consistent **bluish color scheme** matching the website theme.

### Primary Colors
| Usage | Tailwind Class | Hex |
|-------|---------------|-----|
| Primary Blue | `blue-600` | #2563EB |
| Dark Blue | `blue-900` | #1E3A8A |
| Light Blue | `blue-50` | #EFF6FF |
| Accent Blue | `blue-400` | #60A5FA |

### Status Colors
| Status | Background | Text |
|--------|------------|------|
| Published | `emerald-50` | `emerald-700` |
| Draft | `gray-50` | `gray-700` |
| Archived | `amber-50` | `amber-700` |

### Category Colors
| Category | Background | Text |
|----------|------------|------|
| General | `blue-100` | `blue-800` |
| Event | `purple-100` | `purple-800` |
| Emergency | `red-100` | `red-800` |
| Health Program | `green-100` | `green-800` |
| Community Activity | `teal-100` | `teal-800` |

---

## File Structure

```
Culiat_Backend/
├── models/
│   └── Announcement.js          # Mongoose schema
├── controllers/
│   └── announcementController.js # CRUD operations
├── routes/
│   └── announcementsRoute.js    # API routes
├── config/
│   └── logConstants.js          # Action logging constants
├── middleware/
│   └── fileUpload.js            # Image upload handler
└── uploads/
    └── announcements/           # Local image storage

Culiat_Frontend/
└── src/
    ├── users/
    │   └── pages/
    │       ├── Announcement/
    │       │   ├── Announcements.jsx      # List page
    │       │   └── AnnouncementDetail.jsx # Detail page
    │       └── Home/
    │           └── HomeSections/
    │               └── Announcements.jsx  # Home section
    └── admin/
        └── pages/
            └── Announcements/
                └── AdminAnnouncements.jsx # Admin management
```

---

## Troubleshooting

### Common Issues

1. **404 Error on `/api/announcements/admin/all`**
   - **Cause:** Route order issue - `/:id` route catches "admin" as parameter
   - **Fix:** Place `/admin/all` route BEFORE `/:id` route

2. **500 Error on Create**
   - **Cause:** Category validation failure or missing required fields
   - **Fix:** Ensure category matches enum values, check required fields

3. **Images not uploading**
   - **Cause:** Missing `uploads/announcements` directory
   - **Fix:** Create the directory or configure Cloudinary

4. **Slow filter response**
   - **Cause:** Re-rendering entire list on filter change
   - **Fix:** Use `useMemo` for filtered results, optimize animations

---

## Future Improvements

- [ ] Rich text editor for announcement content
- [ ] Scheduled publishing (publish at specific date/time)
- [ ] Email notifications to residents
- [ ] Announcement pinning/featuring
- [ ] Multi-image gallery support
- [ ] Analytics dashboard for announcement performance
