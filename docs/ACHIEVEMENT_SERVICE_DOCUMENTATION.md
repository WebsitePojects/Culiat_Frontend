# Achievement Service Documentation

> **Last Updated:** January 3, 2026  

This document provides comprehensive documentation for the Achievement Service implementation across both frontend (client & admin) and backend systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
   - [Model Schema](#model-schema)
   - [API Routes](#api-routes)
   - [Controller Methods](#controller-methods)
   - [Image Upload Handling](#image-upload-handling)
3. [Frontend Client Implementation](#frontend-client-implementation)
   - [Achievements List Page](#achievements-list-page)
   - [Home Section Achievements](#home-section-achievements)
4. [Frontend Admin Implementation](#frontend-admin-implementation)
   - [Premium UI/UX Design](#premium-uiux-design)
   - [CRUD Operations](#crud-operations)
   - [Image Gallery Modal](#image-gallery-modal)
5. [Key Features](#key-features)
6. [API Reference](#api-reference)
7. [Color Scheme](#color-scheme)

---

## Overview

The Achievement Service enables barangay administrators to create, manage, and showcase the barangay's accomplishments including awards, recognitions, and partnerships. Key features include:

- **Dynamic content** - All achievements are fetched from the database (no hardcoded data)
- **Category filtering** - Filter achievements by Awards, Recognitions, or Partnerships
- **Premium admin UI** - Modern card-based design matching the Reports management interface
- **Cloud image support** - Upload images to Cloudinary with fallback to local storage
- **Image URL handling** - Automatic detection and display of Cloudinary vs local images
- **Responsive design** - Full mobile, tablet, and desktop support
- **View modal** - Click to view full achievement details with image gallery

---

## Backend Implementation

### Model Schema

**File:** `Culiat_Backend/models/Achievement.js`

```javascript
const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Awards', 'Recognitions', 'Partnerships']
  },
  description: {
    type: String,
    maxlength: [10000, 'Description can not be more than 10000 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

**Key Schema Features:**
- `title` - Required, max 100 characters
- `category` - Required enum: Awards, Recognitions, Partnerships
- `description` - Optional, max 10000 characters
- `date` - Achievement date, defaults to creation date
- `image` - Stores Cloudinary URL or local filename

### API Routes

**File:** `Culiat_Backend/routes/achievementsRoute.js`

```javascript
const router = express.Router();

// Public routes
router.get('/', getAchievements);
router.get('/:id', getAchievement);

// Protected routes (Admin only)
router.post('/', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), upload.single('achievementImage'), createAchievement);
router.put('/:id', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), upload.single('achievementImage'), updateAchievement);
router.delete('/:id', protect, authorize(ROLES.SuperAdmin, ROLES.Admin), deleteAchievement);
```

> **Important:** The image upload uses `upload.single('achievementImage')` - the form field name must match exactly.

### Controller Methods

**File:** `Culiat_Backend/controllers/achievementController.js`

| Method | Description |
|--------|-------------|
| `getAchievements` | Returns all achievements sorted by date (newest first) |
| `getAchievement` | Returns single achievement by ID |
| `createAchievement` | Creates a new achievement with optional image upload |
| `updateAchievement` | Updates achievement, replaces image if new one uploaded |
| `deleteAchievement` | Permanently deletes achievement and its image |

### Image Upload Handling

The controller includes smart image handling for both Cloudinary and local storage:

```javascript
// Check if using Cloudinary
const isCloudinaryEnabled = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Helper to get image URL/path from uploaded file
const getImageFromFile = (file) => {
  if (!file) return null;
  // Cloudinary returns the URL in file.path
  // Local storage returns just the filename
  return file.path || file.filename;
};

// Helper to delete old image
const deleteOldImage = async (imageUrl) => {
  if (!imageUrl || imageUrl === 'no-photo.jpg') return;
  
  if (isCloudinaryEnabled() && imageUrl.includes('cloudinary')) {
    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  } else {
    // Delete from local storage
    const imagePath = path.join(__dirname, '../uploads/achievements', imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
};
```

**Key Points:**
- Cloudinary stores full URL in `image` field (e.g., `https://res.cloudinary.com/...`)
- Local storage stores just filename (e.g., `achievement-1234567890.jpg`)
- Old images are automatically deleted when updating with new image

---

## Frontend Client Implementation

### Achievements List Page

**File:** `Culiat_Frontend/src/users/pages/Achievements/Achievements.jsx`

**Key Features:**
- Premium search & filter bar matching Reports page style
- Category filter pills with active state
- Search input with clear button
- Results count display
- Responsive card grid layout
- View modal with full details
- Full-screen image gallery

**Image URL Helper:**

```jsx
// Helper function to get proper image URL (Cloudinary or local)
const getImageUrl = (achievement) => {
  if (!achievement?.image || achievement.image === "no-photo.jpg") return null;
  return achievement.image.includes("http")
    ? achievement.image
    : `${API_URL}/uploads/achievements/${achievement.image}`;
};
```

**Search & Filter Implementation:**

```jsx
const filteredAchievements = useMemo(() => {
  let filtered = activeCategory === "All" 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);
  
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(a => 
      a.title?.toLowerCase().includes(searchLower) ||
      a.description?.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
}, [achievements, activeCategory, searchTerm]);
```

**View Modal with Image Gallery:**

```jsx
{/* View Achievement Modal */}
<AnimatePresence>
  {selectedAchievement && (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal content with image, title, description */}
      <button onClick={() => setImageGalleryOpen(true)}>
        View Full Image
      </button>
    </motion.div>
  )}
</AnimatePresence>

{/* Full Screen Image Gallery */}
<AnimatePresence>
  {imageGalleryOpen && selectedAchievement && (
    <motion.div className="fixed inset-0 z-[100] bg-black">
      <img src={getImageUrl(selectedAchievement)} className="max-w-full max-h-full object-contain" />
    </motion.div>
  )}
</AnimatePresence>
```

### Home Section Achievements

**File:** `Culiat_Frontend/src/users/pages/Home/HomeSections/AchievementSummary.jsx`

**Features:**
- Displays 4 most recent achievements
- Responsive grid (1-2-4 columns based on screen size)
- Image hover zoom effect
- Category badge overlay
- "View All Achievements" link button

**Implementation:**

```jsx
const AchievementSummary = () => {
  const [achievements, setAchievements] = useState([]);

  const fetchAchievements = async () => {
    const response = await axios.get(`${API_URL}/api/achievements?limit=4`);
    if (response.data.success) {
      setAchievements(response.data.data?.slice(0, 4) || []);
    }
  };

  // Helper function to get proper image URL (Cloudinary or local)
  const getImageUrl = (achievement) => {
    if (!achievement?.image || achievement.image === "no-photo.jpg") return null;
    return achievement.image.includes("http")
      ? achievement.image
      : `${API_URL}/uploads/achievements/${achievement.image}`;
  };

  return (
    <section className="py-16 px-6 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((achievement) => (
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg">
            {getImageUrl(achievement) ? (
              <img src={getImageUrl(achievement)} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-blue-700">
                <Trophy className="w-16 h-16 text-white/50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
```

---

## Frontend Admin Implementation

### Premium UI/UX Design

**File:** `Culiat_Frontend/src/admin/pages/Achievements/AdminAchievements.jsx`

The admin interface uses premium UI/UX design matching the Reports management page.

**Design Elements:**

1. **Gradient Header**
```jsx
<div className="relative overflow-hidden rounded-2xl p-6 md:p-8" 
     style={{ background: "linear-gradient(135deg, #002366 0%, #334b9f 100%)" }}>
  {/* Decorative blurs */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl"></div>
</div>
```

2. **Stats Grid**
```jsx
{[
  { label: "Total", count: categoryCounts.all, icon: Inbox, gradient: "from-blue-500 to-blue-600", filterValue: "all" },
  { label: "Awards", count: categoryCounts.Awards, icon: Trophy, gradient: "from-amber-500 to-orange-500", filterValue: "Awards" },
  { label: "Recognitions", count: categoryCounts.Recognitions, icon: Award, gradient: "from-cyan-500 to-blue-500", filterValue: "Recognitions" },
  { label: "Partnerships", count: categoryCounts.Partnerships, icon: Handshake, gradient: "from-emerald-500 to-green-500", filterValue: "Partnerships" },
].map((stat) => (
  <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl cursor-pointer"
       onClick={() => setFilter(stat.filterValue)}>
    <p className="text-2xl font-bold text-white">{stat.count}</p>
  </div>
))}
```

3. **Search & Filter Bar**
```jsx
<div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5">
  {/* Search Input */}
  <div className="relative">
    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input type="text" placeholder="Search achievements..." className="w-full pl-10 pr-4 py-2.5" />
  </div>
  
  {/* Filter Pills */}
  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
    {["all", "Awards", "Recognitions", "Partnerships"].map((cat) => (
      <button className={`px-3 py-1.5 text-xs font-medium rounded-md ${filter === cat ? "bg-white shadow-sm" : ""}`}>
        {cat}
      </button>
    ))}
  </div>
</div>
```

4. **Achievement Cards**
- Image preview with hover zoom
- Category badge with icon
- Quick action buttons (Edit, Delete) on hover
- Selection checkbox
- Responsive grid layout

### CRUD Operations

**Create Achievement:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const submitData = new FormData();
  submitData.append("title", formData.title);
  submitData.append("category", formData.category);
  submitData.append("description", formData.description);
  submitData.append("date", formData.date);
  if (formData.image) {
    submitData.append("achievementImage", formData.image); // Must match backend field name
  }

  await axios.post(`${API_URL}/api/achievements`, submitData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data" 
    },
  });
};
```

**Update Achievement:**
```jsx
await axios.put(`${API_URL}/api/achievements/${selectedAchievement._id}`, submitData, {
  headers: { 
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data"
  },
});
```

**Delete Achievement:**
```jsx
await axios.delete(`${API_URL}/api/achievements/${selectedAchievement._id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Image Gallery Modal

The admin interface includes a full-screen image gallery:

```jsx
{/* Full Screen Image Gallery */}
{imageGalleryOpen && selectedAchievement && getImageUrl(selectedAchievement) && (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
       onClick={closeImageGallery}>
    {/* Close Button */}
    <button onClick={closeImageGallery} className="absolute top-4 right-4 z-10 p-3 bg-white/10">
      <X className="w-6 h-6" />
    </button>

    {/* Main Image */}
    <img src={getImageUrl(selectedAchievement)} className="max-w-full max-h-full object-contain" />
  </div>
)}
```

**Keyboard Navigation:**
```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (!imageGalleryOpen) return;
    if (e.key === "Escape") closeImageGallery();
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [imageGalleryOpen, closeImageGallery]);
```

---

## Key Features

### 1. No Hardcoded Data
All achievement data is fetched from the MongoDB database via the backend API.

### 2. Smart Image URL Handling
The `getImageUrl()` helper function automatically detects and handles both:
- **Cloudinary URLs** (contains "http") - Used directly
- **Local filenames** - Prefixed with `${API_URL}/uploads/achievements/`

```jsx
const getImageUrl = (achievement) => {
  if (!achievement?.image || achievement.image === "no-photo.jpg") return null;
  return achievement.image.includes("http")
    ? achievement.image
    : `${API_URL}/uploads/achievements/${achievement.image}`;
};
```

### 3. Category Filtering
Three categories with distinct icons and colors:
- **Awards** - Trophy icon, amber/orange gradient
- **Recognitions** - Award icon, blue/cyan gradient
- **Partnerships** - Handshake icon, emerald/green gradient

### 4. Search Functionality
Client-side search across title and description fields with instant results.

### 5. Responsive Modals
All modals (View, Create/Edit, Delete) are fully responsive:
- Full-width on mobile
- Max-width containers on desktop
- Proper touch targets for mobile

### 6. Dark Mode Support
Admin interface fully supports dark mode with appropriate color schemes.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/achievements` | Get all achievements (sorted by date desc) |
| GET | `/api/achievements/:id` | Get single achievement by ID |

### Admin Endpoints (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/achievements` | Create new achievement |
| PUT | `/api/achievements/:id` | Update achievement |
| DELETE | `/api/achievements/:id` | Delete achievement |

### Request/Response Examples

**Create Achievement (POST /api/achievements)**

Request (FormData):
```
title: "Best Barangay Award 2025"
category: "Awards"
description: "Awarded for outstanding community service..."
date: "2025-12-15"
achievementImage: [File]
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Best Barangay Award 2025",
    "category": "Awards",
    "description": "Awarded for outstanding community service...",
    "date": "2025-12-15T00:00:00.000Z",
    "image": "https://res.cloudinary.com/xxx/image/upload/achievements/xxx.jpg",
    "createdAt": "2025-12-15T08:00:00.000Z"
  }
}
```

**Get All Achievements (GET /api/achievements)**

Response:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "title": "Best Barangay Award 2025",
      "category": "Awards",
      "description": "...",
      "date": "2025-12-15T00:00:00.000Z",
      "image": "https://res.cloudinary.com/xxx/image/upload/achievements/xxx.jpg",
      "createdAt": "2025-12-15T08:00:00.000Z"
    }
  ]
}
```

---

## Color Scheme

The achievement service uses a consistent color scheme matching the website theme.

### Primary Colors
| Usage | Tailwind Class | Hex |
|-------|---------------|-----|
| Primary Blue | `blue-600` | #2563EB |
| Dark Blue | `blue-900` | #1E3A8A |
| Header Gradient Start | - | #002366 |
| Header Gradient End | - | #334b9f |

### Category Colors
| Category | Background (Light) | Text (Light) | Gradient |
|----------|-------------------|--------------|----------|
| Awards | `amber-100` | `amber-800` | `from-amber-500 to-orange-500` |
| Recognitions | `blue-100` | `blue-800` | `from-blue-500 to-cyan-500` |
| Partnerships | `emerald-100` | `emerald-800` | `from-emerald-500 to-green-500` |

### Dark Mode Colors
| Category | Background (Dark) | Text (Dark) |
|----------|-------------------|-------------|
| Awards | `amber-900/30` | `amber-400` |
| Recognitions | `blue-900/30` | `blue-400` |
| Partnerships | `emerald-900/30` | `emerald-400` |

---

## File Structure

```
Culiat_Backend/
├── models/
│   └── Achievement.js              # Mongoose schema
├── controllers/
│   └── achievementController.js    # CRUD operations with image handling
├── routes/
│   └── achievementsRoute.js        # API routes
├── config/
│   └── cloudinary.js               # Cloudinary configuration
├── middleware/
│   └── fileUpload.js               # Image upload handler (Multer + Cloudinary)
└── uploads/
    └── achievements/               # Local image storage (fallback)

Culiat_Frontend/
└── src/
    ├── users/
    │   └── pages/
    │       ├── Achievements/
    │       │   └── Achievements.jsx       # Client list page with search, filter, modal
    │       └── Home/
    │           └── HomeSections/
    │               └── AchievementSummary.jsx  # Home section (4 recent achievements)
    └── admin/
        └── pages/
            └── Achievements/
                └── AdminAchievements.jsx  # Admin management with premium UI
```

---

## Troubleshooting

### Common Issues

1. **Images not displaying**
   - **Cause:** Frontend using local path for Cloudinary images
   - **Fix:** Use `getImageUrl()` helper that checks if URL contains "http"

2. **Image upload fails**
   - **Cause:** Wrong form field name
   - **Fix:** Use `achievementImage` as the form field name (matches backend)

3. **500 Error on Create**
   - **Cause:** Category validation failure
   - **Fix:** Ensure category is one of: Awards, Recognitions, Partnerships

4. **Images not deleting with achievement**
   - **Cause:** Missing Cloudinary cleanup
   - **Fix:** Controller now uses `deleteOldImage()` helper

5. **Search not working**
   - **Cause:** Case-sensitive comparison
   - **Fix:** Use `.toLowerCase()` for both search term and fields

---

## Future Improvements

- [ ] Rich text editor for achievement description
- [ ] Multi-image gallery support (multiple images per achievement)
- [ ] Achievement pinning/featuring on home page
- [ ] Social media sharing functionality
- [ ] PDF export of achievement certificates
- [ ] Analytics for most viewed achievements
- [ ] Date range filtering
- [ ] Drag-and-drop reordering
