# Reports Service Documentation

> Complete implementation guide for the Reports feature in Barangay Culiat Management System

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Component Structure](#component-structure)
7. [Image Upload Feature](#image-upload-feature)
8. [Mobile Responsiveness](#mobile-responsiveness)

---

## Overview

The Reports Service allows barangay residents to submit reports/complaints and enables administrators to manage, track, and resolve these reports. The system supports:

- **Report Submission**: Residents can create reports with title, description, category, priority, location, and images
- **Image Upload**: Multiple image attachments stored on Cloudinary
- **Status Tracking**: Pending → In Progress → Resolved/Rejected workflow
- **Admin Management**: View, update status, delete, bulk actions, and export to CSV

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│  Client Side                    │  Admin Side                    │
│  ├── Reports.jsx                │  ├── AdminReports.jsx          │
│  ├── NewReport.jsx              │  └── (Status updates, Delete)  │
│  └── (View, Filter, Search)     │                                │
├─────────────────────────────────────────────────────────────────┤
│                        API Service Layer                         │
│                        reportAPI (axios)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                  │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/reports                                            │
│  ├── POST /           → Create report                           │
│  ├── GET /            → Get all reports (admin)                 │
│  ├── GET /my-reports  → Get user's reports                      │
│  ├── GET /:id         → Get single report                       │
│  ├── PUT /:id/status  → Update status                           │
│  └── DELETE /:id      → Delete report                           │
├─────────────────────────────────────────────────────────────────┤
│  Middleware: auth.js, fileUpload.js (Cloudinary)                │
├─────────────────────────────────────────────────────────────────┤
│  Model: Report.js (MongoDB/Mongoose)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STORAGE                                      │
│  ├── MongoDB Atlas (Report data)                                │
│  └── Cloudinary (Image files)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Implementation

### 1. Report Model (`models/Report.js`)

```javascript
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["infrastructure", "safety", "health", "sanitation", "other"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    location: {
      type: String,
      trim: true,
    },
    images: [{
      type: String, // Cloudinary URLs
    }],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminNotes: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
```

### 2. Report Controller (`controllers/reportController.js`)

```javascript
const Report = require("../models/Report");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;

    // Handle uploaded images (Cloudinary URLs)
    const images = req.files ? req.files.map((file) => file.path) : [];

    const report = await Report.create({
      title,
      description,
      category,
      priority,
      location,
      images,
      reportedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message,
    });
  }
};

// Get all reports (Admin only)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

// Get current user's reports
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate("assignedTo", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your reports",
      error: error.message,
    });
  }
};

// Update report status (Admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === "resolved") updateData.resolvedAt = new Date();

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update report status",
      error: error.message,
    });
  }
};

// Delete report (Admin only)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};
```

### 3. Report Routes (`routes/reportRoutes.js`)

```javascript
const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/fileUpload");

// All routes require authentication
router.use(protect);

// User routes
router.post("/", upload.array("images", 5), createReport);
router.get("/my-reports", getMyReports);
router.get("/:id", getReportById);

// Admin only routes
router.get("/", authorize("admin"), getAllReports);
router.put("/:id/status", authorize("admin"), updateReportStatus);
router.delete("/:id", authorize("admin"), deleteReport);

module.exports = router;
```

### 4. File Upload Middleware (`middleware/fileUpload.js`)

```javascript
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for reports
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "culiat-reports",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = { upload, cloudinary };
```

---

## Frontend Implementation

### 1. API Service (`services/api.js`)

```javascript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Report API methods
export const reportAPI = {
  // Get all reports (admin)
  getAll: () => api.get("/api/reports"),

  // Get current user's reports
  getMyReports: () => api.get("/api/reports/my-reports"),

  // Get single report
  getById: (id) => api.get(`/api/reports/${id}`),

  // Create new report with images
  create: (formData) =>
    api.post("/api/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update report status (admin)
  updateStatus: (id, status) =>
    api.put(`/api/reports/${id}/status`, { status }),

  // Delete report (admin)
  delete: (id) => api.delete(`/api/reports/${id}`),
};
```

### 2. Client Reports Page (`users/pages/Reports/Reports.jsx`)

Key features implemented:

```javascript
// State Management
const [reports, setReports] = useState([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState({ status: "", category: "" });
const [searchTerm, setSearchTerm] = useState("");
const [sortOrder, setSortOrder] = useState("desc");
const [selectedReport, setSelectedReport] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
const [currentImageIndex, setCurrentImageIndex] = useState(0);

// Fetch user's reports
const fetchReports = async () => {
  try {
    setLoading(true);
    const response = isAdmin
      ? await reportAPI.getAll()
      : await reportAPI.getMyReports();
    
    if (response.data.success) {
      setReports(response.data.data || []);
    }
  } catch (error) {
    setReports([]);
  } finally {
    setLoading(false);
  }
};

// Filter and sort logic
const filteredReports = reports
  .filter((report) => {
    if (filter.status && report.status !== filter.status) return false;
    if (filter.category && report.category !== filter.category) return false;
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      return (
        report.title?.toLowerCase().includes(search) ||
        report.description?.toLowerCase().includes(search) ||
        report.location?.toLowerCase().includes(search)
      );
    }
    return true;
  })
  .sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });
```

**Component Structure:**
- Premium gradient header with stats cards
- Search and filter bar with category dropdown
- Reports grid (1-3 columns responsive)
- Report detail modal with image gallery
- Full-screen image viewer with prev/next navigation

### 3. New Report Form (`users/pages/Reports/NewReport.jsx`)

```javascript
// Form state
const [formData, setFormData] = useState({
  title: "",
  description: "",
  category: "",
  priority: "medium",
  location: "",
});
const [images, setImages] = useState([]);
const [previews, setPreviews] = useState([]);

// Handle image selection
const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  if (files.length + images.length > 5) {
    alert("Maximum 5 images allowed");
    return;
  }
  
  setImages([...images, ...files]);
  
  // Create preview URLs
  const newPreviews = files.map((file) => URL.createObjectURL(file));
  setPreviews([...previews, ...newPreviews]);
};

// Submit report with images
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    images.forEach((image) => {
      data.append("images", image);
    });

    await reportAPI.create(data);
    navigate("/reports");
  } catch (error) {
    console.error("Failed to submit report");
  } finally {
    setSubmitting(false);
  }
};
```

### 4. Admin Reports Page (`admin/pages/Reports/AdminReports.jsx`)

Key admin features:

```javascript
// Additional admin states
const [selectedReports, setSelectedReports] = useState([]); // Bulk selection
const [statusUpdateModal, setStatusUpdateModal] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [newStatus, setNewStatus] = useState("");

// Update single report status
const confirmStatusUpdate = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/api/reports/${selectedReport.id}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    showSuccess(`Report status updated to ${newStatus}`);
    if (newStatus === "resolved") {
      notifyReportResolved(selectedReport.title);
    }
    setStatusUpdateModal(false);
    fetchReports();
  } catch (error) {
    showError("Failed to update status");
  }
};

// Bulk status update
const handleBulkStatusUpdate = async (status) => {
  try {
    const token = localStorage.getItem("token");
    await Promise.all(
      selectedReports.map((id) =>
        axios.put(
          `${API_URL}/api/reports/${id}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      )
    );
    
    showSuccess(`${selectedReports.length} reports updated`);
    setSelectedReports([]);
    fetchReports();
  } catch (error) {
    showError("Failed to update reports");
  }
};

// Export to CSV
const exportToCSV = () => {
  const headers = ["ID", "Title", "Resident", "Category", "Status", "Date"];
  const rows = filteredReports.map((report) => [
    report.id,
    report.title,
    report.resident,
    report.category,
    report.status,
    report.date,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `reports_${new Date().toISOString()}.csv`);
  link.click();
};

// Delete report
const confirmDeleteReport = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/api/reports/${selectedReport.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showSuccess("Report deleted successfully");
    setDeleteModalOpen(false);
    fetchReports();
  } catch (error) {
    showError("Failed to delete report");
  }
};
```

---

## API Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/api/reports` | Create new report | ✅ | User |
| `GET` | `/api/reports` | Get all reports | ✅ | Admin |
| `GET` | `/api/reports/my-reports` | Get user's reports | ✅ | User |
| `GET` | `/api/reports/:id` | Get single report | ✅ | Any |
| `PUT` | `/api/reports/:id/status` | Update status | ✅ | Admin |
| `DELETE` | `/api/reports/:id` | Delete report | ✅ | Admin |

### Request/Response Examples

**Create Report:**
```javascript
// Request (FormData)
POST /api/reports
Content-Type: multipart/form-data

{
  title: "Broken Streetlight",
  description: "The streetlight on Main St is not working",
  category: "infrastructure",
  priority: "high",
  location: "Main Street, Block 5",
  images: [File, File] // Max 5 files
}

// Response
{
  success: true,
  message: "Report submitted successfully",
  data: {
    _id: "...",
    title: "Broken Streetlight",
    status: "pending",
    images: ["https://res.cloudinary.com/...", "..."],
    createdAt: "2026-01-03T..."
  }
}
```

**Update Status:**
```javascript
// Request
PUT /api/reports/:id/status
{
  status: "in-progress"
}

// Response
{
  success: true,
  message: "Report status updated to in-progress",
  data: { ... }
}
```

---

## Component Structure

### Client Side
```
src/users/pages/Reports/
├── Reports.jsx          # Main reports listing page
│   ├── Hero Header      # Gradient header with stats
│   ├── Filter Bar       # Search, category, sort
│   ├── Reports Grid     # Card layout (responsive)
│   ├── Detail Modal     # Report popup with info
│   └── Image Gallery    # Full-screen image viewer
│
└── NewReport.jsx        # Report submission form
    ├── Form Fields      # Title, description, etc.
    ├── Image Upload     # Drag & drop, preview
    └── Submit Button    # With loading state
```

### Admin Side
```
src/admin/pages/Reports/
└── AdminReports.jsx     # Admin management page
    ├── Header           # Title, refresh, export
    ├── Stats Cards      # Count by status
    ├── Bulk Actions     # When items selected
    ├── Filters          # Status, category, priority
    ├── Reports Grid     # Cards with actions
    ├── View Modal       # Detailed report view
    ├── Status Modal     # Update status form
    ├── Delete Modal     # Confirmation dialog
    └── Image Gallery    # Full-screen viewer
```

---

## Image Upload Feature

### Frontend Implementation

1. **File Selection with Preview:**
```jsx
<input
  type="file"
  accept="image/*"
  multiple
  onChange={handleImageChange}
  className="hidden"
/>

{/* Preview Grid */}
<div className="grid grid-cols-3 gap-2">
  {previews.map((preview, idx) => (
    <div key={idx} className="relative aspect-square">
      <img src={preview} className="object-cover" />
      <button onClick={() => removeImage(idx)}>
        <X className="w-4 h-4" />
      </button>
    </div>
  ))}
</div>
```

2. **FormData Submission:**
```javascript
const data = new FormData();
images.forEach((image) => {
  data.append("images", image);
});
await reportAPI.create(data);
```

### Backend Processing

1. **Multer + Cloudinary Storage:**
```javascript
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "culiat-reports",
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

router.post("/", upload.array("images", 5), createReport);
```

2. **Save URLs to MongoDB:**
```javascript
const images = req.files.map((file) => file.path);
// file.path contains Cloudinary URL
```

---

## Mobile Responsiveness

### Responsive Breakpoints Used

| Breakpoint | Size | Usage |
|------------|------|-------|
| Default | < 640px | Mobile |
| `sm:` | ≥ 640px | Small tablets |
| `md:` | ≥ 768px | Tablets |
| `lg:` | ≥ 1024px | Desktops |
| `xl:` | ≥ 1280px | Large screens |

### Key Responsive Patterns

1. **Typography Scaling:**
```jsx
className="text-sm md:text-lg lg:text-xl"
className="text-[10px] md:text-xs"
```

2. **Grid Columns:**
```jsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
className="grid grid-cols-2 md:grid-cols-4" // Stats
```

3. **Spacing:**
```jsx
className="p-3 md:p-4 lg:p-6"
className="gap-2 md:gap-4"
```

4. **Show/Hide Elements:**
```jsx
className="hidden sm:inline" // Hide on mobile
className="sm:hidden"        // Show only on mobile
```

5. **Modal Adjustments:**
```jsx
className="max-h-[85vh] md:max-h-[90vh]"
className="p-3 md:p-4"
```

### Z-Index Hierarchy

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Header | `z-50` | Navigation |
| Detail Modal | `z-[9999]` | Above header |
| Image Gallery | `z-[99999]` | Above modals |

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## Status Flow

```
┌──────────┐     Admin Action     ┌─────────────┐
│ PENDING  │ ──────────────────► │ IN-PROGRESS │
└──────────┘                      └─────────────┘
     │                                   │
     │         Admin Action              │
     ▼                                   ▼
┌──────────┐                      ┌──────────┐
│ REJECTED │                      │ RESOLVED │
└──────────┘                      └──────────┘
```

### Status Colors

| Status | Badge Color | Gradient |
|--------|-------------|----------|
| Pending | Amber | `from-amber-500 to-orange-500` |
| In Progress | Blue | `from-blue-500 to-cyan-500` |
| Resolved | Emerald | `from-emerald-500 to-green-500` |
| Rejected | Red | `from-red-500 to-rose-500` |

---

## Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Report comments/thread
- [ ] Geolocation for automatic location
- [ ] Report analytics dashboard
- [ ] Email notifications on status change
- [ ] Report assignment to specific admin

---

*Documentation created: January 3, 2026*
*Last updated: January 3, 2026*
