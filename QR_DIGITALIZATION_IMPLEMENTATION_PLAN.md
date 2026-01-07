# 📋 QR Code & Document Digitalization Implementation Plan

## Barangay Culiat Document Management System

**Date:** January 7, 2026  
**Status:** Certificate of Residency ✅ DONE | Others: Pending Implementation

---

## 📊 Overview

This document provides a comprehensive step-by-step guide to implement QR code verification and digitalization for all barangay documents. The Certificate of Residency is already complete and serves as the reference implementation.

---

## 🗂️ Document Types Inventory

| # | Document Type | DB Key | Prefix | Template File | Status |
|---|---------------|--------|--------|---------------|--------|
| 1 | Certificate of Residency | `certificate-of-residency` | RES | `Certificate of Residency(QC Hall...).docx` | ✅ **DONE** |
| 2 | Certificate of Indigency | `certificate-of-indigency` | IND | `Certificate of Indigency.docx` | ⏳ Pending |
| 3 | Barangay Clearance | `barangay-clearance` | CLR | `Barangay Certificate.docx` | ⏳ Pending |
| 4 | Good Moral Certificate | `good-moral-certificate` | GMC | `Barangay Certificate.docx` | ⏳ Pending |
| 5 | Business Permit | `business-permit` | BPM | `Certificate for Business Permit.docx` | ⏳ Pending |
| 6 | Business Closure | `business-closure` | BCL | `Certificate for Business Closure.docx` | ⏳ Pending |
| 7 | Barangay ID | `barangay-id` | BID | `Barangay ID.docx` | ⏳ Pending |
| 8 | Liquor Permit | `liquor-permit` | LQR | `Certificate for Liquor Permit.docx` | ⏳ Pending |
| 9 | Missionary Certificate | `missionary-certificate` | MIS | `Certificate for Missionary.docx` | ⏳ Pending |
| 10 | Rehabilitation Certificate | `rehabilitation-certificate` | REH | `Certificate for Rehab.docx` | ⏳ Pending |
| 11 | Community Tax Certificate | `community-tax-certificate` | CTC | *(needs template)* | ⏳ Pending |
| 12 | Building Permit | `building-permit` | BLD | *(needs template)* | ⏳ Pending |

---

## ✅ What's Already Implemented (Global System)

The following components are **already working** and apply to ALL document types:

### Backend Systems Ready ✅
- **Verification Token Generator** - `Culiat_Backend/utils/verificationUtils.js`
- **QR Code Generator** - `Culiat_Backend/utils/qrCodeGenerator.js`
- **Control Number Generator** - `Culiat_Backend/utils/generateControlNumber.js`
- **Verification API Endpoints** - `Culiat_Backend/routes/verificationRoutes.js`
- **Document Model** - Already has verification fields in schema

### Frontend Systems Ready ✅
- **Public Verification Page** - `Culiat_Frontend/src/users/pages/Public/DocumentVerification.jsx`
- **Route** - `/verify/:token`

### Verification Token Format
```
VRF-{PREFIX}{YEAR}{SEQ}-{uuid8}-{timestamp36}
Example: VRF-RES202600001-fb54a833-mk3clnn3
```

---

## 🔄 Document Digitalization Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT REQUEST LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. RESIDENT REQUEST                                                 │
│     └── User submits request via frontend form                       │
│                                                                      │
│  2. ADMIN APPROVAL                                                   │
│     └── Admin reviews and approves request                           │
│     └── Control Number auto-generated (e.g., CLR-2026-00001)         │
│                                                                      │
│  3. DOCUMENT GENERATION                                              │
│     └── Admin clicks "Generate Document"                             │
│     └── Verification Token created from Control Number               │
│     └── QR Code PNG generated with verification URL                  │
│     └── QR Code embedded in Word template                            │
│     └── DOCX file generated and downloaded                           │
│                                                                      │
│  4. VERIFICATION (Public)                                            │
│     └── Anyone scans QR code                                         │
│     └── Redirects to: /verify/{token}                                │
│     └── Shows document authenticity and details                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Implementation Per Document

### What You Need To Do For EACH Document Type:

Since the verification system is already universal, you mainly need to:

1. **Update the Word Template (.docx)** - Add QR code placeholder
2. **Update Template Placeholders** - Ensure all fields are mapped
3. **Test the flow** - Request → Approve → Generate → Verify

---

## 📄 Document #2: Certificate of Indigency

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Certificate of Indigency.docx`

### Step 1: Modify Word Template

**Open the .docx file and:**

#### ➕ ADD (QR Code Section):
1. Insert a placeholder image (any square image ~100x100 pixels)
2. Right-click the image → **Edit Alt Text**
3. Set alt text to exactly: `qr_code`
4. Position the QR code where you want it (bottom-right recommended)

#### ➕ ADD (Verification URL - Optional):
Add a text line near the QR code:
```
Verify at: {verification_url}
```

#### ➕ ADD (Control Number):
If not present, add:
```
Control No.: {control_number}
```

### Step 2: Available Placeholders

| Placeholder | Description | Auto-filled |
|-------------|-------------|-------------|
| `{resident_name}` | Full name of resident | ✅ |
| `{resident_address}` | Complete address | ✅ |
| `{purpose}` | Purpose of request | ✅ |
| `{date_issued}` | Current date | ✅ |
| `{control_number}` | e.g., IND-2026-00001 | ✅ |
| `{verification_url}` | QR verification link | ✅ |
| `{barangay_captain}` | Captain's name | ✅ |
| `{barangay_secretary}` | Secretary's name | ✅ |
| `{qr_code}` | (Image replacement) | ✅ |

### Step 3: What to REMOVE (Old Manual Elements)
- ❌ Remove any manual "Office Copy" stamps
- ❌ Remove blank signature lines that should be digital
- ❌ Remove manual date fields (use `{date_issued}`)
- ❌ Remove manual reference numbers (use `{control_number}`)

### Step 4: Test Flow
1. Create a test indigency request
2. Approve it (control number generates)
3. Generate document (QR embeds)
4. Scan QR → Should show verification page

---

## 📄 Document #3: Barangay Clearance

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Barangay Certificate.docx`

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. Text: `Control No.: {control_number}`
3. Text: `Verify at: {verification_url}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{resident_name}` | Full name |
| `{resident_address}` | Address |
| `{age}` | Age of resident |
| `{birthdate}` | Date of birth |
| `{civil_status}` | Single/Married/etc. |
| `{purpose}` | Purpose of clearance |
| `{date_issued}` | Issue date |
| `{control_number}` | CLR-2026-XXXXX |
| `{valid_until}` | Expiration date |
| `{or_number}` | Official receipt |
| `{barangay_captain}` | Captain's name |

### Step 3: What to REMOVE
- ❌ Manual certificate numbers
- ❌ Hand-written date fields
- ❌ Old format headers without digital markers

---

## 📄 Document #4: Good Moral Certificate

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Barangay Certificate.docx`
*(Note: May share template with Barangay Clearance - consider separate template)*

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. `Control No.: {control_number}`
3. `Verify at: {verification_url}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{resident_name}` | Full name |
| `{resident_address}` | Address |
| `{purpose}` | Purpose (school, employment, etc.) |
| `{date_issued}` | Issue date |
| `{control_number}` | GMC-2026-XXXXX |
| `{barangay_captain}` | Captain's name |
| `{years_of_residency}` | How long resident |

### Step 3: What to REMOVE
- ❌ Manual "Good Standing" text (should be auto)
- ❌ Old reference number formats

---

## 📄 Document #5: Business Permit

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Certificate for Business Permit.docx`

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. `Control No.: {control_number}`
3. `Verify at: {verification_url}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{business_name}` | Name of business |
| `{business_type}` | Type/nature |
| `{business_address}` | Business location |
| `{owner_name}` | Owner's full name |
| `{owner_address}` | Owner's residence |
| `{date_issued}` | Issue date |
| `{valid_until}` | Permit expiration |
| `{control_number}` | BPM-2026-XXXXX |
| `{barangay_captain}` | Captain's name |

### Step 3: What to REMOVE
- ❌ Old permit number format
- ❌ Manual validity dates
- ❌ Non-digital stamps

---

## 📄 Document #6: Business Closure

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Certificate for Business Closure.docx`

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. `Control No.: {control_number}`
3. `Verify at: {verification_url}`
4. `Closure Date: {closure_date}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{business_name}` | Business being closed |
| `{business_type}` | Type of business |
| `{business_address}` | Location |
| `{owner_name}` | Owner |
| `{closure_date}` | Date of closure |
| `{closure_reason}` | Reason for closure |
| `{control_number}` | BCL-2026-XXXXX |
| `{date_issued}` | Certificate date |

### Step 3: What to REMOVE
- ❌ Manual closure stamps
- ❌ Hand-written dates

---

## 📄 Document #7: Barangay ID

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Barangay ID.docx`

### Special Considerations
- QR code should be smaller (fit in ID format)
- Photo placeholder needed: `{resident_photo}`
- Consider front/back layout

### Step 1: Modify Word Template

#### ➕ ADD:
1. Small QR Code image with alt text: `qr_code` (50x50px)
2. `ID No.: {control_number}`
3. Photo placeholder: `{resident_photo}` (as image alt text)

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{resident_name}` | Full name |
| `{resident_address}` | Address |
| `{birthdate}` | Date of birth |
| `{blood_type}` | Blood type |
| `{emergency_contact}` | Emergency contact |
| `{emergency_phone}` | Contact number |
| `{control_number}` | BID-2026-XXXXX |
| `{valid_until}` | ID expiration |
| `{resident_photo}` | 2x2 photo |

### Step 3: What to REMOVE
- ❌ Manual ID numbers
- ❌ Old lamination marks
- ❌ Manual photo slots

---

## 📄 Document #8: Liquor Permit

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Certificate for Liquor Permit.docx`

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. `Permit No.: {control_number}`
3. `Verify at: {verification_url}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{business_name}` | Establishment name |
| `{business_address}` | Location |
| `{owner_name}` | Permit holder |
| `{permit_type}` | Type of liquor permit |
| `{operating_hours}` | Allowed hours |
| `{control_number}` | LQR-2026-XXXXX |
| `{date_issued}` | Issue date |
| `{valid_until}` | Expiration |

### Step 3: What to REMOVE
- ❌ Old permit stickers
- ❌ Manual renewal dates

---

## 📄 Document #9: Missionary Certificate

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Certificate for Missionary.docx`

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. `Certificate No.: {control_number}`
3. `Verify at: {verification_url}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{resident_name}` | Missionary name |
| `{organization}` | Religious organization |
| `{mission_purpose}` | Purpose of mission |
| `{mission_location}` | Where they'll serve |
| `{control_number}` | MIS-2026-XXXXX |
| `{date_issued}` | Issue date |

---

## 📄 Document #10: Rehabilitation Certificate

### Template File
`Culiat_Backend/public/Certificates and Dashboard (Culiat)/Certificate for Rehab.docx`

### Step 1: Modify Word Template

#### ➕ ADD:
1. QR Code image with alt text: `qr_code`
2. `Certificate No.: {control_number}`
3. `Verify at: {verification_url}`

### Step 2: Available Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{resident_name}` | Person's name |
| `{resident_address}` | Address |
| `{rehabilitation_program}` | Program completed |
| `{completion_date}` | When completed |
| `{control_number}` | REH-2026-XXXXX |
| `{date_issued}` | Issue date |

---

## 📄 Document #11 & #12: CTC & Building Permit

### Status: Need Templates Created

These documents need:
1. Word template files created
2. Placeholders defined
3. Added to template mapping in backend

---

## 🔧 Technical Implementation Checklist

### For Each Document Type:

#### Word Template Changes
- [ ] Open template in Microsoft Word
- [ ] Insert placeholder image for QR code
- [ ] Set image alt text to `qr_code`
- [ ] Add `{control_number}` text field
- [ ] Add `{verification_url}` text field
- [ ] Remove old manual reference numbers
- [ ] Remove old manual date stamps
- [ ] Save and test

#### Backend Verification (Already Done)
- [x] Verification token generation
- [x] QR code generation utility
- [x] Public verification endpoint
- [x] Control number generation

#### Frontend (Already Done)
- [x] Public verification page
- [x] Document display components
- [x] Status indicators

---

## 🎨 QR Code Placement Guidelines

### Recommended Positions:

| Document Type | QR Position | Size |
|---------------|-------------|------|
| Certificates (Letter size) | Bottom-right corner | 100x100 px |
| Permits | Bottom-center | 80x80 px |
| Barangay ID | Back side, center | 50x50 px |
| Clearances | Bottom-right | 100x100 px |

### Design Tips:
1. Leave 10px margin around QR code
2. Add "Scan to Verify" label below QR
3. Include verification URL as text backup
4. Don't place QR over busy backgrounds

---

## 🔄 Transition from Manual to Digital

### What to REMOVE from ALL templates:

| Remove | Replace With |
|--------|--------------|
| Manual certificate numbers | `{control_number}` |
| Hand-written dates | `{date_issued}` |
| Physical stamps | QR code + digital verification |
| "Office Copy" labels | Digital record in database |
| Manual signatures | `{barangay_captain}` + digital signature image |
| Blank lines for filling | Pre-filled placeholders |

### What to ADD to ALL templates:

| Add | Purpose |
|-----|---------|
| QR Code | Instant verification |
| Control Number | Unique identifier |
| Verification URL | Backup verification method |
| Issue Date | Audit trail |
| Valid Until (if applicable) | Expiration tracking |

---

## 📁 File Locations Reference

### Backend Files
```
Culiat_Backend/
├── models/
│   └── Document.js              # Document schema with verification fields
├── controllers/
│   └── documentController.js    # Document generation logic
├── routes/
│   └── verificationRoutes.js    # Public verification API
├── utils/
│   ├── verificationUtils.js     # Token generation
│   ├── qrCodeGenerator.js       # QR code creation
│   ├── generateControlNumber.js # Control number logic
│   └── templatePlaceholders.js  # Placeholder mapping
└── public/
    └── Certificates and Dashboard (Culiat)/
        └── *.docx               # All Word templates
```

### Frontend Files
```
Culiat_Frontend/
└── src/
    └── users/
        └── pages/
            └── Public/
                └── DocumentVerification.jsx  # Verification page
```

---

## ✅ Implementation Progress Tracker

| Document | Template Updated | QR Added | Tested | Live |
|----------|-----------------|----------|--------|------|
| Certificate of Residency | ✅ | ✅ | ✅ | ✅ |
| Certificate of Indigency | ⬜ | ⬜ | ⬜ | ⬜ |
| Barangay Clearance | ⬜ | ⬜ | ⬜ | ⬜ |
| Good Moral Certificate | ⬜ | ⬜ | ⬜ | ⬜ |
| Business Permit | ⬜ | ⬜ | ⬜ | ⬜ |
| Business Closure | ⬜ | ⬜ | ⬜ | ⬜ |
| Barangay ID | ⬜ | ⬜ | ⬜ | ⬜ |
| Liquor Permit | ⬜ | ⬜ | ⬜ | ⬜ |
| Missionary Certificate | ⬜ | ⬜ | ⬜ | ⬜ |
| Rehabilitation Certificate | ⬜ | ⬜ | ⬜ | ⬜ |
| Community Tax Certificate | ⬜ | ⬜ | ⬜ | ⬜ |
| Building Permit | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 🚀 Quick Start: Adding QR to a Document

### 5-Minute Process:

1. **Open Word Template**
   ```
   Location: Culiat_Backend/public/Certificates and Dashboard (Culiat)/
   ```

2. **Insert QR Placeholder**
   - Insert any square image (100x100)
   - Right-click → Edit Alt Text → Type: `qr_code`

3. **Add Control Number**
   - Add text: `Control No.: {control_number}`

4. **Add Verification URL**
   - Add text: `Verify at: {verification_url}`

5. **Save and Test**
   - Create request → Approve → Generate → Scan QR

**That's it!** The backend automatically handles everything else.

---

## 📞 Support & References

### Related Documentation
- `Culiat_Backend/PLACEHOLDER_REFERENCE.md` - All placeholder mappings
- `Culiat_Backend/docs/` - API documentation
- `Culiat_Frontend/docs/` - Frontend guides

### Verification URL Format
```
Production: https://your-domain.com/verify/{token}
Development: http://localhost:5173/verify/{token}
```

---

## 📅 Suggested Implementation Order

### Priority 1 (High Usage)
1. ⬜ Certificate of Indigency
2. ⬜ Barangay Clearance
3. ⬜ Barangay ID

### Priority 2 (Medium Usage)
4. ⬜ Business Permit
5. ⬜ Good Moral Certificate
6. ⬜ Business Closure

### Priority 3 (Lower Usage)
7. ⬜ Liquor Permit
8. ⬜ Missionary Certificate
9. ⬜ Rehabilitation Certificate

### Priority 4 (Needs Templates)
10. ⬜ Community Tax Certificate
11. ⬜ Building Permit

---

*Last Updated: January 7, 2026*
