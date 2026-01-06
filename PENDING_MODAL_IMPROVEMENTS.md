# Pending Registration Modal Improvements

## Issues to Fix

### 1. UI Bug - White Curved Gap
- **Issue**: White curved rectangular element appearing between header and body content
- **Fix**: Remove the rounded corners on tab buttons bottom or adjust the modal structure

### 2. Add Age Calculation
- **Issue**: Age is not displayed
- **Fix**: Calculate age from `dateOfBirth` field and display it in Personal Info section

### 3. Additional Information Section Blank
- **Issue**: Additional Information card shows but has no content visible
- **Fix**: Check conditional rendering and ensure TIN/SSS/Precinct values display properly

### 4. Tab Navigation Not Working
- **Issue**: PSA Info tab and Documents tab not showing content
- **Fix**: Debug `activeTab` state and ensure tab content renders correctly

### 5. Update ID Requirements
- **Issue**: Current system only requires 1 ID (front + back)
- **New Requirement**: 
  - 2 Primary Government IDs (each with front and back)
  - Full name and address must be visible on ID
  - Accepted IDs: Philippine Passport, Driver's License, UMID, PhilHealth, SSS, PRC, Voter's ID, Senior Citizen ID, PWD ID, NBI Clearance, Postal ID

### 6. Update Modal Document Display
- **Issue**: Modal only shows 1 ID
- **New Requirement**: Display 2 IDs + 1 Birth Certificate in Documents tab

### 7. Advanced OCR Integration
- **Issue**: OCR verification is manual
- **New Requirement**: 
  - Auto-start OCR scan when modal opens
  - Advanced text extraction for verification score
  - Verify name and address match on both IDs

---

## Files to Edit

### Frontend (Culiat_Frontend)

| File | Path | Changes |
|------|------|---------|
| **PendingRegistrations.jsx** | `src/admin/pages/Users/PendingRegistrations.jsx` | Fix modal UI gap, add age calculation, fix tabs, update document display, auto-start OCR |
| **Register.jsx** | `src/users/pages/Auth/Register.jsx` | Update ID upload to require 2 primary IDs with front/back, add ID type selector |

### Backend (Culiat_Backend)

| File | Path | Changes |
|------|------|---------|
| **auth.js** | `routes/auth.js` | Update multer fields to accept `primaryID1`, `primaryID1Back`, `primaryID2`, `primaryID2Back` |
| **authController.js** | `controllers/authController.js` | Handle 4 ID file uploads, store ID types |
| **User.js** | `models/User.js` | Update schema for 2 primary IDs with type field |

---

## Task Breakdown

### Phase 1: Fix Current Modal Issues
- [x] 1.1 Fix white gap between header and body (CSS adjustment)
- [x] 1.2 Add age calculation helper function
- [x] 1.3 Fix Additional Information section display
- [x] 1.4 Debug and fix tab navigation

### Phase 2: Update ID Requirements (Frontend)
- [x] 2.1 Add government ID type dropdown in Register.jsx
- [x] 2.2 Update file upload to require 2 IDs (4 images total)
- [x] 2.3 Add validation for ID visibility requirements
- [x] 2.4 Update form state and submission

### Phase 3: Update Backend for 2 IDs
- [x] 3.1 Update User.js schema for primaryID1, primaryID2
- [x] 3.2 Update multer config in auth.js route
- [x] 3.3 Update authController.js to handle new fields

### Phase 4: Update Modal Document Display
- [x] 4.1 Update Documents tab to show 2 IDs
- [x] 4.2 Show birth certificate document
- [x] 4.3 Display ID types selected

### Phase 5: Advanced OCR Auto-Scan
- [x] 5.1 Trigger OCR scan on modal open (useEffect)
- [x] 5.2 Scan all 4 ID images + birth certificate
- [x] 5.3 Calculate verification score for name match
- [x] 5.4 Calculate verification score for address match
- [x] 5.5 Display combined verification score

---

## Valid Government IDs (Philippines)

### Primary IDs
1. Philippine Passport
2. Driver's License
3. UMID (Unified Multi-Purpose ID)
4. PhilHealth ID
5. SSS ID
6. PRC ID (Professional Regulation Commission)
7. Voter's ID / COMELEC ID
8. Senior Citizen ID
9. PWD ID
10. Philippine National ID (PhilSys)

### Secondary IDs (if needed)
1. NBI Clearance
2. Police Clearance
3. Postal ID
4. Barangay ID
5. Company ID
6. School ID

---

## Status: ALL PHASES COMPLETE ✅
