# Frontend Sync Prompt - Document Generation System

## Overview
Frontend integration guide for the Barangay Culiat Document Generation system. This allows admins to generate and download DOCX certificates for approved document requests.

---

## API Endpoints

### 1. Get Available Templates
**GET** `/api/documents/templates`

No authentication required.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "indigency",
        "name": "Certificate of Indigency",
        "description": "Certificate confirming resident's indigent status",
        "price": 0,
        "available": true
      }
    ]
  }
}
```

---

### 2. Generate Document (Admin Only)
**POST** `/api/documents/generate/:requestId`

**Request Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Response:** Binary DOCX file download

**Error Responses:**
- `400`: Request not approved
- `403`: Not authorized (non-admin)
- `404`: Request not found

---

### 3. Download Document (Resident - After Payment)
**GET** `/api/documents/download/:requestId`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** Binary DOCX file download

**Error Responses:**
- `402`: Payment required
- `403`: Not authorized
- `404`: Document not found

---

### 4. Check Document Status
**GET** `/api/documents/status/:requestId`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "abc123",
    "documentType": "indigency",
    "status": "approved",
    "paymentStatus": "paid",
    "canDownload": true,
    "amount": 0
  }
}
```

---

## Template Placeholders Reference

Templates use `{placeholder}` syntax. Available placeholders:

| Placeholder | Description |
|-------------|-------------|
| `{salutation}` | Mr., Mrs., Ms. |
| `{full_name}` | Complete name with suffix |
| `{first_name}` | First name |
| `{middle_name}` | Middle name |
| `{last_name}` | Last name |
| `{suffix}` | Name suffix (Jr., Sr., etc.) |
| `{full_address}` | House, Street, Subdivision |
| `{date_of_birth}` | "15th day of January 1990" |
| `{age}` | Calculated age |
| `{gender}` | Gender |
| `{civil_status}` | Civil status |
| `{nationality}` | Nationality (default: Filipino) |
| `{contact_number}` | Phone number |
| `{purpose_of_request}` | Document purpose |
| `{issue_date}` | "7th day of December 2025" |
| `{control_number}` | Unique reference (e.g., IND-2025-12345) |
| `{barangay_captain}` | Captain's name |
| `{barangay_secretary}` | Secretary's name |

---

## Document Type Mapping

| documentType | Template File | Price (PHP) |
|--------------|---------------|-------------|
| `indigency` | Certificate of Indigency.docx | 0 |
| `residency` | Certificate of Residency.docx | 50 |
| `clearance` | Barangay Certificate.docx | 100 |
| `business_permit` | Certificate for Business Permit.docx | 500 |
| `business_clearance` | Certificate for Business Closure.docx | 200 |
| `good_moral` | Barangay Certificate.docx | 75 |

---

## Notes

1. **CORS**: Ensure your frontend origin is allowed in the backend CORS configuration
2. **Blob Handling**: Document downloads return binary data - use `responseType: 'blob'`
3. **Free Documents**: Certificate of Indigency is free (price: 0), no payment required
4. **Admin Only**: Only Admin/SuperAdmin roles can use the `/generate` endpoint
