# Dashboard Service Documentation

> **Last Updated:** January 4, 2026

This document provides comprehensive documentation for the Admin Dashboard Service implementation across both frontend and backend systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
   - [API Routes](#api-routes)
   - [Controller Methods](#controller-methods)
   - [Data Aggregation Logic](#data-aggregation-logic)
3. [Frontend Implementation](#frontend-implementation)
   - [Component Architecture](#component-architecture)
   - [Data Fetching](#data-fetching)
   - [UI Components](#ui-components)
4. [Demographics Analytics](#demographics-analytics)
5. [Export Functionality](#export-functionality)
6. [Key Features](#key-features)
7. [API Reference](#api-reference)
8. [Color Scheme](#color-scheme)

---

## Overview

The Admin Dashboard Service provides a comprehensive, enterprise-grade analytics dashboard for barangay administrators. Key features include:

- **Real-time statistics** - All data is fetched live from the database
- **User demographics** - Gender, age, civil status, occupation, religion distributions
- **Area filtering** - Filter data by Purok/Area with dropdown selectors
- **Time range filtering** - View stats for week, month, quarter, year, or all time
- **Excel export** - Multi-sheet Excel export for Crystal Reports compatibility
- **Mobile responsive** - Tables on desktop, cards on mobile
- **Dark mode support** - Full dark theme compatibility

---

## Backend Implementation

### API Routes

**File:** `Culiat_Backend/routes/analyticsRoute.js`

```javascript
const express = require("express");
const router = express.Router();
const {
  getOverviewStats,
  getDocumentTypeDistribution,
  getStatusBreakdown,
  getMonthlyTrends,
  getPeakHours,
  getPopularServices,
  getSummary,
  getDashboardStats,
  getUserDemographics,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

// All routes require admin authentication
router.use(protect);
router.use(authorize(74932, 74933)); // SuperAdmin and Admin only

// Analytics routes
router.get("/overview", getOverviewStats);
router.get("/document-types", getDocumentTypeDistribution);
router.get("/status-breakdown", getStatusBreakdown);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/peak-hours", getPeakHours);
router.get("/popular-services", getPopularServices);
router.get("/summary", getSummary);

// Dashboard comprehensive stats (NEW)
router.get("/dashboard", getDashboardStats);
router.get("/demographics", getUserDemographics);

module.exports = router;
```

### Controller Methods

**File:** `Culiat_Backend/controllers/analyticsController.js`

| Method | Route | Description |
|--------|-------|-------------|
| `getDashboardStats` | GET /api/analytics/dashboard | Comprehensive dashboard statistics |
| `getUserDemographics` | GET /api/analytics/demographics | User demographic distributions |
| `getOverviewStats` | GET /api/analytics/overview | Basic overview statistics |
| `getDocumentTypeDistribution` | GET /api/analytics/document-types | Document request distribution |
| `getStatusBreakdown` | GET /api/analytics/status-breakdown | Request status breakdown |
| `getMonthlyTrends` | GET /api/analytics/monthly-trends | Monthly trends data |
| `getPeakHours` | GET /api/analytics/peak-hours | Peak activity hours |
| `getPopularServices` | GET /api/analytics/popular-services | Most popular services |
| `getSummary` | GET /api/analytics/summary | Summary statistics |

### Data Aggregation Logic

**getDashboardStats Function:**

```javascript
exports.getDashboardStats = async (req, res) => {
  const { timeRange = "month", area = "all" } = req.query;
  
  // Calculate date ranges based on timeRange
  const now = new Date();
  let startDate, prevPeriodStart;
  
  switch (timeRange) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "quarter":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case "all":
      startDate = new Date(0);
      break;
    case "month":
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  // Build area filter
  const areaFilter = area !== "all" ? { "address.area": area } : {};
  const residentFilter = { role: 74934, registrationStatus: "approved", ...areaFilter };
  
  // Aggregate statistics...
};
```

**getUserDemographics Function:**

```javascript
exports.getUserDemographics = async (req, res) => {
  const { area = "all" } = req.query;
  
  // Gender distribution using aggregation
  const genderStats = await User.aggregate([
    { $match: baseFilter },
    { $group: { _id: "$gender", count: { $sum: 1 } } }
  ]);
  
  // Age distribution (calculated from dateOfBirth)
  const users = await User.find({ ...baseFilter, dateOfBirth: { $ne: null } })
    .select("dateOfBirth");
  
  const ageRanges = {
    "0-17": 0, "18-24": 0, "25-34": 0, "35-44": 0,
    "45-54": 0, "55-64": 0, "65+": 0, notSpecified: 0
  };
  
  users.forEach(user => {
    const age = calculateAge(user.dateOfBirth);
    // Assign to appropriate range...
  });
  
  // Civil status, occupation, religion, area distributions...
};
```

---

## Frontend Implementation

### Component Architecture

**File:** `Culiat_Frontend/src/admin/pages/Dashboard/AdminDashboard.jsx`

The dashboard is built with modular, reusable components:

```
AdminDashboard
├── StatCard (8 instances)
│   └── Dropdown filter for area selection
├── DemographicsCard (4 instances)
│   └── Gender, Civil Status, Summary, Age Groups
├── ProgressBar (multiple)
│   └── Age distribution, Occupations, Religions
├── DataTable (2 instances)
│   └── Recent Documents, Recent Reports
└── Registration Trends Chart
    └── Bar chart with 6-month data
```

### Data Fetching

```jsx
const fetchDashboardData = async (isRefresh = false) => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [dashboardRes, demographicsRes] = await Promise.all([
    axios.get(`${API_URL}/api/analytics/dashboard`, {
      params: { timeRange, area: selectedArea },
      headers,
    }),
    axios.get(`${API_URL}/api/analytics/demographics`, {
      params: { area: selectedArea },
      headers,
    }),
  ]);

  if (dashboardRes.data.success) {
    setDashboardData(dashboardRes.data.data);
    setAreas(dashboardRes.data.data.areas || []);
  }

  if (demographicsRes.data.success) {
    setDemographics(demographicsRes.data.data);
  }
};

useEffect(() => {
  fetchDashboardData();
}, [timeRange, selectedArea]);
```

### UI Components

**1. StatCard Component**

Gradient stat card with optional dropdown for filtering:

```jsx
const StatCard = ({ 
  title, 
  value, 
  change, 
  trend = "up", 
  icon: Icon, 
  color = "blue",
  onClick,
  dropdown,
  dropdownValue,
  onDropdownChange,
  dropdownOptions = [],
  subtitle,
  loading = false
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-200",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-200",
    yellow: "from-amber-500 to-amber-600 shadow-amber-200",
    // ... more colors
  };

  return (
    <div className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} p-4 shadow-lg`}>
      {/* Card content */}
    </div>
  );
};
```

**2. DemographicsCard Component**

Card displaying key-value demographic data:

```jsx
const DemographicsCard = ({ title, data, icon: Icon, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
    <div className="px-4 py-3 border-b flex items-center gap-2">
      <Icon className="w-4 h-4 text-blue-500" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    <div className="p-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="text-gray-600">{key}</span>
          <span className="font-semibold">{value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
);
```

**3. ProgressBar Component**

Horizontal progress bar with percentage:

```jsx
const ProgressBar = ({ label, value, total, color = "blue" }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{percentage}% of total</p>
    </div>
  );
};
```

**4. DataTable Component**

Responsive table (desktop) / cards (mobile):

```jsx
const DataTable = ({ title, columns, data, loading, onViewAll }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
    {/* Header */}
    <div className="px-4 py-3 border-b flex justify-between">
      <h3 className="font-semibold">{title}</h3>
      <button onClick={onViewAll}>View All</button>
    </div>
    
    {/* Desktop Table */}
    <div className="hidden md:block">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Mobile Cards */}
    <div className="md:hidden p-3 space-y-3">
      {data.map((row, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-3">
          {columns.map(col => (
            <div key={col.key} className="flex justify-between">
              <span>{col.label}</span>
              <span>{col.render ? col.render(row[col.key]) : row[col.key]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
```

---

## Demographics Analytics

### Available Demographics Data

| Category | Fields |
|----------|--------|
| **Gender** | Male, Female, Other, Not Specified |
| **Civil Status** | Single, Married, Widowed, Separated, Divorced |
| **Age Ranges** | 0-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+ |
| **Area Distribution** | All Puroks/Areas in the barangay |
| **Occupations** | Top 10 most common occupations |
| **Religion** | Top 8 religions |
| **Voter Status** | Registered voters, Non-voters |
| **Special Categories** | Senior citizens (60+) |
| **Registration Trends** | Last 6 months of new registrations |

### Age Calculation

Age is calculated dynamically using a virtual field in the User model:

```javascript
// Culiat_Backend/models/User.js
userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});
```

> **Note:** Age is not stored in the database. It's calculated on-the-fly every time it's accessed, ensuring it's always accurate without needing scheduled updates.

---

## Export Functionality

### Excel Export (Multi-Sheet)

The dashboard includes an export function that generates a multi-sheet Excel file compatible with Crystal Reports.

**Exported Sheets:**

| Sheet # | Name | Contents |
|---------|------|----------|
| 1 | Overview | Summary statistics, document requests, reports |
| 2 | Gender | Gender distribution with percentages |
| 3 | Civil Status | Single, Married, Widowed, etc. |
| 4 | Age Distribution | All age ranges with counts |
| 5 | Area Distribution | Residents by Purok/Area |
| 6 | Occupations | Top occupations |
| 7 | Religion | Religion distribution |
| 8 | Reg Trends | Monthly registration trends |
| 9 | Voters & Seniors | Voter statistics & senior citizens |
| 10 | Recent Docs | Recent document requests |
| 11 | Recent Reports | Recent reports |

**Implementation:**

```jsx
import * as XLSX from "xlsx";

const handleExportToExcel = () => {
  const workbook = XLSX.utils.book_new();
  const exportDate = new Date().toLocaleDateString();

  // Sheet 1: Overview Summary
  const overviewData = [
    ["BARANGAY CULIAT - DASHBOARD REPORT"],
    [`Generated: ${exportDate}`],
    [`Time Range: ${timeRange}`],
    [`Selected Area: ${selectedArea}`],
    [],
    ["OVERVIEW STATISTICS"],
    ["Metric", "Value", "Change (%)"],
    ["Total Residents", dashboardData?.overview?.totalResidents || 0, "..."],
    // ... more rows
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  overviewSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  // ... Create more sheets

  // Generate file
  const filename = `Barangay_Culiat_Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};
```

**Package Dependency:**

```bash
npm install xlsx
```

---

## Key Features

### 1. Real-Time Data
All statistics are fetched live from MongoDB with aggregation pipelines.

### 2. Area Filtering
Filter all data by selecting a specific Purok/Area from the dropdown on the Total Residents card.

### 3. Time Range Filtering
Select time range for trend calculations:
- This Week
- This Month (default)
- This Quarter
- This Year
- All Time

### 4. Responsive Design
- **Desktop:** Full tables with all columns visible
- **Mobile:** Compact cards with stacked layout
- **Tablet:** Adaptive grid layouts

### 5. Loading States
Skeleton loaders for all data sections during fetch.

### 6. Dark Mode
Full dark theme support with appropriate color adjustments.

### 7. Quick Actions
Six quick-access buttons for common admin tasks:
- Announcements
- View Reports
- Pending Users
- All Users
- Analytics
- Documents

---

## API Reference

### Dashboard Stats Endpoint

**GET** `/api/analytics/dashboard`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| timeRange | string | "month" | week, month, quarter, year, all |
| area | string | "all" | Filter by specific area/purok |

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalResidents": 1234,
      "residentChange": 5.2,
      "newResidentsThisPeriod": 45,
      "pendingRegistrations": 12,
      "totalDocRequests": 89,
      "docRequestChange": 8.5,
      "pendingRequests": 15,
      "approvedRequests": 20,
      "completedRequests": 50,
      "rejectedRequests": 4,
      "completionRate": 56.2,
      "totalReports": 34,
      "reportChange": -2.1,
      "pendingReports": 8,
      "resolvedReports": 26,
      "totalTermsAccepted": 156
    },
    "areas": ["Purok 1", "Purok 2", "Purok 3", ...],
    "recentActivity": {
      "documentRequests": [...],
      "reports": [...]
    }
  }
}
```

### Demographics Endpoint

**GET** `/api/analytics/demographics`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| area | string | "all" | Filter by specific area/purok |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 1234,
      "totalWithDOB": 1100,
      "totalWithoutDOB": 134,
      "votersRegistered": 890,
      "nonVoters": 344,
      "seniorCitizens": 156
    },
    "gender": {
      "male": 620,
      "female": 580,
      "other": 10,
      "notSpecified": 24
    },
    "civilStatus": {
      "single": 450,
      "married": 600,
      "widowed": 80,
      "separated": 50,
      "divorced": 10,
      "notSpecified": 44
    },
    "ageRanges": {
      "0-17": 120,
      "18-24": 180,
      "25-34": 280,
      "35-44": 250,
      "45-54": 180,
      "55-64": 120,
      "65+": 104,
      "notSpecified": 0
    },
    "areaDistribution": [
      { "area": "Purok 1", "count": 234 },
      { "area": "Purok 2", "count": 189 },
      ...
    ],
    "topOccupations": [
      { "occupation": "Student", "count": 280 },
      { "occupation": "Private Employee", "count": 220 },
      ...
    ],
    "religionDistribution": [
      { "religion": "Roman Catholic", "count": 890 },
      { "religion": "Born Again Christian", "count": 120 },
      ...
    ],
    "registrationTrends": [
      { "month": "Aug", "year": 2025, "count": 45 },
      { "month": "Sep", "year": 2025, "count": 52 },
      ...
    ]
  }
}
```

---

## Color Scheme

The dashboard uses a consistent **bluish gradient theme** matching the website.

### Primary Gradient Colors
| Usage | Tailwind Classes |
|-------|-----------------|
| Total Residents | `from-blue-500 to-blue-600` |
| Document Requests | `from-cyan-500 to-cyan-600` |
| Pending | `from-amber-500 to-amber-600` |
| Completion Rate | `from-emerald-500 to-emerald-600` |
| Registrations | `from-purple-500 to-purple-600` |
| Reports | `from-red-500 to-red-600` |
| Resolved | `from-emerald-500 to-emerald-600` |
| Terms | `from-indigo-500 to-indigo-600` |

### Card Backgrounds
| Mode | Background |
|------|------------|
| Light | `bg-white` |
| Dark | `bg-gray-800` |

### Text Colors
| Mode | Primary | Secondary |
|------|---------|-----------|
| Light | `text-gray-900` | `text-gray-500` |
| Dark | `text-white` | `text-gray-400` |

### Border Colors
| Mode | Color |
|------|-------|
| Light | `border-gray-100` |
| Dark | `border-gray-700` |

---

## File Structure

```
Culiat_Backend/
├── controllers/
│   └── analyticsController.js   # Dashboard & demographics logic
├── routes/
│   └── analyticsRoute.js        # API endpoints
└── models/
    └── User.js                  # User model with age virtual

Culiat_Frontend/
└── src/
    └── admin/
        └── pages/
            └── Dashboard/
                └── AdminDashboard.jsx  # Main dashboard component
```

---

## Troubleshooting

### Common Issues

1. **404 Error on `/api/analytics/dashboard`**
   - **Cause:** Backend server not restarted after adding new routes
   - **Fix:** Restart the backend server with `npm run dev`

2. **Empty Demographics Data**
   - **Cause:** No users with `registrationStatus: "approved"`
   - **Fix:** Approve some user registrations first

3. **Excel Export Not Working**
   - **Cause:** xlsx package not installed
   - **Fix:** Run `npm install xlsx` in the frontend directory

4. **Registration Trends Shows Empty**
   - **Cause:** No user registrations in the last 6 months
   - **Fix:** The chart shows an empty state message instead of blank space

5. **Area Dropdown Empty**
   - **Cause:** Users don't have `address.area` field populated
   - **Fix:** Ensure users fill in their Purok/Area during registration

---

## Dependencies

### Backend
- `mongoose` - MongoDB ODM
- `express` - Web framework

### Frontend
- `axios` - HTTP client
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `xlsx` - Excel export

---

## Future Improvements

- [ ] Add more chart types (pie, line, area)
- [ ] PDF export option
- [ ] Scheduled email reports
- [ ] Comparison between time periods
- [ ] Custom date range picker
- [ ] Export to CSV format
- [ ] Print-friendly view
- [ ] Dashboard customization (drag & drop widgets)
- [ ] Real-time updates with WebSockets
