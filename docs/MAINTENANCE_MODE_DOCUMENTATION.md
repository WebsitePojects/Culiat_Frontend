# Maintenance Mode Documentation

> **Last Updated:** January 4, 2026

This document provides comprehensive documentation for the Maintenance Mode feature in the Barangay Culiat Frontend application.

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Configuration](#configuration)
4. [Enabling/Disabling Maintenance Mode](#enablingdisabling-maintenance-mode)
5. [Component Details](#component-details)
6. [Customization](#customization)
7. [File Structure](#file-structure)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The **Maintenance Mode** feature allows administrators to temporarily block all users from accessing the website during system updates, maintenance, or emergency situations. When enabled, all routes (regardless of authentication status) will show a professional maintenance page instead of the normal application.

### Key Features

- **Global Block:** Overrides all routes - public, protected, and admin routes
- **Professional Design:** Beautiful, modern UI with animations and dark mode support
- **Countdown Timer:** Shows estimated time until service restoration
- **Easy Toggle:** Enable/disable via environment variable
- **No Code Changes Required:** Just update `.env` file and restart server
- **Contact Information:** Displays support email for urgent matters
- **Refresh Button:** Users can check if maintenance is complete

---

## How It Works

The maintenance check happens at the **root level** in `App.jsx`, before any routing logic:

```jsx
function App() {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // If maintenance mode is active, show maintenance page regardless of route
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    // Normal app routes...
  );
}
```

**Flow:**
1. User visits any URL (e.g., `/dashboard`, `/admin`, `/services`, etc.)
2. App checks `VITE_MAINTENANCE_MODE` environment variable
3. If `true` → Show `MaintenancePage` component
4. If `false` → Proceed with normal routing

---

## Configuration

### Environment Variables

Create or update your `.env` file in the project root:

```env
# Maintenance Mode
# Set to 'true' to enable maintenance mode, 'false' to disable
VITE_MAINTENANCE_MODE=false

# Optional: Set a specific date/time when maintenance will end
# Format: YYYY-MM-DD HH:MM (24-hour format)
# Example: VITE_MAINTENANCE_END_TIME=2026-01-04 18:00
VITE_MAINTENANCE_END_TIME=

# Optional: Custom maintenance message
VITE_MAINTENANCE_MESSAGE=We're currently performing scheduled maintenance to improve your experience. Our system will be back online shortly.
```

### Environment Variable Details

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `VITE_MAINTENANCE_MODE` | boolean | Yes | `true` = ON, `false` = OFF |
| `VITE_MAINTENANCE_END_TIME` | string | No | Future implementation for dynamic countdown |
| `VITE_MAINTENANCE_MESSAGE` | string | No | Future implementation for custom messages |

> **Important:** All Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## Enabling/Disabling Maintenance Mode

### To Enable Maintenance Mode

1. **Open `.env` file:**
   ```bash
   # In the project root: Culiat_Frontend/.env
   ```

2. **Set VITE_MAINTENANCE_MODE to true:**
   ```env
   VITE_MAINTENANCE_MODE=true
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Verify:** Visit any URL - you should see the maintenance page

### To Disable Maintenance Mode

1. **Open `.env` file:**
   ```bash
   # In the project root: Culiat_Frontend/.env
   ```

2. **Set VITE_MAINTENANCE_MODE to false:**
   ```env
   VITE_MAINTENANCE_MODE=false
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Verify:** Website should function normally

### Production Deployment

For production environments (e.g., Vercel, Netlify):

1. **Set environment variable in hosting dashboard:**
   - Variable Name: `VITE_MAINTENANCE_MODE`
   - Value: `true` or `false`

2. **Redeploy or restart the application** (some platforms auto-restart on env changes)

---

## Component Details

### MaintenancePage Component

**File:** `src/components/MaintenancePage.jsx`

**Features:**

1. **Animated Background:**
   - Gradient blob animations with blur effects
   - Three-layered animated circles

2. **Icon Animation:**
   - Spinning wrench icon with pulsing glow
   - Smooth rotation animation

3. **Loading Dots:**
   - Animated ellipsis (...) in the title
   - Updates every 500ms

4. **Countdown Timer:**
   - Shows estimated restoration time
   - Format: `30m 45s` → `Anytime now`
   - Can be customized in the component

5. **Status Cards:**
   - **Estimated Time:** Shows countdown timer
   - **Current Status:** "In Progress" with spinning refresh icon

6. **Contact Section:**
   - Email link for urgent assistance
   - Customizable contact information

7. **Refresh Button:**
   - Allows users to manually check if maintenance is complete
   - Reloads the entire page

8. **Footer Stats:**
   - Uptime Record: 99.9%
   - Support: 24/7
   - Security: Secure badge

### Component Structure

```jsx
<div className="min-h-screen bg-gradient-to-br">
  {/* Background Pattern (animated blobs) */}
  
  <div className="relative z-10">
    <div className="bg-white rounded-3xl shadow-2xl">
      {/* Icon Container (spinning wrench) */}
      {/* Heading (We'll Be Right Back) */}
      {/* Description */}
      
      {/* Status Cards Grid */}
      <div className="grid grid-cols-2">
        {/* Estimated Time Card */}
        {/* Current Status Card */}
      </div>
      
      {/* Contact Info */}
      {/* Refresh Button */}
      {/* Footer Note */}
    </div>
    
    {/* Additional Stats Cards (3-column) */}
  </div>
</div>
```

---

## Customization

### Change Countdown Timer

Edit `src/components/MaintenancePage.jsx`:

```jsx
// Line ~15: Set estimated completion time
const estimatedTime = new Date();
estimatedTime.setMinutes(estimatedTime.getMinutes() + 30); // 30 minutes from now

// Or set a specific date/time:
const estimatedTime = new Date('2026-01-04T18:00:00'); // 6 PM on Jan 4
```

### Change Contact Email

Edit `src/components/MaintenancePage.jsx`:

```jsx
// Line ~115: Update email
<a
  href="mailto:your-email@example.com"
  className="text-blue-600 hover:underline"
>
  your-email@example.com
</a>
```

### Change Maintenance Message

Edit `src/components/MaintenancePage.jsx`:

```jsx
// Line ~75: Update the description text
<p className="text-gray-700 text-center text-lg">
  Your custom maintenance message here...
</p>
```

### Change Colors

Edit the gradient colors in `src/components/MaintenancePage.jsx`:

```jsx
// Background gradient
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">

// Icon background
<div className="bg-gradient-to-br from-blue-500 to-cyan-600">

// Card backgrounds
<div className="bg-blue-50"> {/* Change blue-50 to any color */}
```

### Disable Countdown Timer

Comment out the countdown effect in `src/components/MaintenancePage.jsx`:

```jsx
// useEffect(() => {
//   const estimatedTime = new Date();
//   ...
// }, []);
```

And display static text:

```jsx
<p className="text-2xl font-bold">
  30 minutes
</p>
```

---

## File Structure

```
Culiat_Frontend/
├── .env                                  # Environment configuration
├── .env.example                          # Environment template
├── src/
│   ├── App.jsx                          # Maintenance check logic
│   └── components/
│       └── MaintenancePage.jsx          # Maintenance UI component
└── docs/
    └── MAINTENANCE_MODE_DOCUMENTATION.md # This file
```

---

## Troubleshooting

### Issue 1: Maintenance Page Not Showing

**Symptoms:**
- Set `VITE_MAINTENANCE_MODE=true` but website still loads normally

**Causes & Solutions:**

1. **Server not restarted**
   ```bash
   # Stop the dev server (Ctrl+C) and restart:
   npm run dev
   ```

2. **Wrong variable name**
   ```env
   # ❌ Wrong:
   MAINTENANCE_MODE=true
   
   # ✅ Correct:
   VITE_MAINTENANCE_MODE=true
   ```

3. **Extra spaces in .env**
   ```env
   # ❌ Wrong:
   VITE_MAINTENANCE_MODE = true
   
   # ✅ Correct:
   VITE_MAINTENANCE_MODE=true
   ```

4. **`.env` file not in project root**
   - Ensure `.env` is at `Culiat_Frontend/.env`
   - NOT inside `src/` or any subdirectory

### Issue 2: Website Still Shows After Disabling

**Symptoms:**
- Set `VITE_MAINTENANCE_MODE=false` but maintenance page still shows

**Solutions:**

1. **Clear browser cache:**
   ```
   Chrome: Ctrl+Shift+Delete → Clear cached images and files
   ```

2. **Hard refresh:**
   ```
   Windows: Ctrl+Shift+R
   Mac: Cmd+Shift+R
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Issue 3: Countdown Timer Not Working

**Symptoms:**
- Timer shows "30m 0s" but doesn't count down

**Causes & Solutions:**

1. **Check console for JavaScript errors**
   - Open DevTools (F12) → Console tab

2. **Verify countdown logic:**
   ```jsx
   // Ensure this useEffect is not commented out
   useEffect(() => {
     const estimatedTime = new Date();
     estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
     // ... rest of the code
   }, []);
   ```

### Issue 4: Styles Not Applied

**Symptoms:**
- Maintenance page shows but looks broken/unstyled

**Solutions:**

1. **Ensure Tailwind CSS is configured:**
   ```bash
   # Check if Tailwind is installed
   npm list tailwindcss
   ```

2. **Verify `tailwind.config.js` includes the component:**
   ```js
   content: [
     "./src/**/*.{js,jsx,ts,tsx}",
   ]
   ```

3. **Check if dark mode is enabled in `tailwind.config.js`:**
   ```js
   module.exports = {
     darkMode: 'class',
     // ...
   }
   ```

### Issue 5: Production Environment Variables Not Working

**Symptoms:**
- Maintenance mode works locally but not in production

**Solutions:**

1. **Set environment variables in hosting platform:**
   - **Vercel:** Project Settings → Environment Variables
   - **Netlify:** Site Settings → Environment Variables

2. **Ensure variable names match exactly:**
   ```
   VITE_MAINTENANCE_MODE=true
   ```

3. **Trigger redeployment** after adding environment variables

---

## Best Practices

### 1. Communication
- **Notify users in advance** via announcements
- Post on social media about scheduled maintenance
- Send email notifications to registered users

### 2. Timing
- Schedule during **low-traffic hours** (e.g., 2-4 AM)
- Avoid maintenance during business hours
- Consider weekends for major updates

### 3. Testing
- Test maintenance mode in **development first**
- Verify refresh button works
- Check on mobile devices
- Test both light and dark modes

### 4. Monitoring
- Keep backend monitoring active during maintenance
- Have a rollback plan ready
- Test critical features before disabling maintenance mode

### 5. Documentation
- Document what maintenance was performed
- Note the duration and any issues encountered
- Update this documentation if process changes

---

## Production Checklist

Before enabling maintenance mode in production:

- [ ] Announce maintenance schedule to users
- [ ] Update countdown timer to accurate time
- [ ] Test maintenance page in staging environment
- [ ] Verify contact email is correct
- [ ] Have rollback plan ready
- [ ] Set `VITE_MAINTENANCE_MODE=true` in production env
- [ ] Deploy/restart application
- [ ] Verify maintenance page is showing
- [ ] Perform maintenance tasks
- [ ] Test functionality thoroughly
- [ ] Set `VITE_MAINTENANCE_MODE=false`
- [ ] Deploy/restart application
- [ ] Verify website is accessible
- [ ] Monitor for issues

---

## Future Enhancements

Potential improvements for the maintenance mode feature:

- [ ] **Backend-controlled toggle:** API endpoint to enable/disable maintenance
- [ ] **Admin bypass:** Allow admins to access the site during maintenance
- [ ] **Scheduled maintenance:** Auto-enable/disable at specific times
- [ ] **Real-time notifications:** WebSocket to notify users when site is back
- [ ] **Multi-language support:** Maintenance message in multiple languages
- [ ] **Progressive countdown:** Show "Almost ready" states
- [ ] **Maintenance log:** Track all maintenance events
- [ ] **Custom branding:** Different designs for different maintenance types

---

## Related Documentation

- [Dashboard Service Documentation](./DASHBOARD_SERVICE_DOCUMENTATION.md)
- [Announcement Service Documentation](./ANNOUNCEMENT_SERVICE_DOCUMENTATION.md)

---

**Questions or Issues?**  
Contact the development team at: barangayculiat@gmail.com
