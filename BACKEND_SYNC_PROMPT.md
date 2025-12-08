# Backend Sync Prompt - Document Generation System

## Overview
Implement document generation APIs for the Barangay Culiat system. When admin generates a document, it should return the DOCX file directly for download.

### Workflow:
1. **Resident** submits a service request → status: `pending`
2. **Admin** reviews and approves → status: `approved`
3. **Admin** clicks "Generate Document" → **DOCX file downloads immediately**
4. **Admin** prints and hands document to resident → status: `completed`

---

## Technology Stack
- **docxtemplater**: For filling DOCX templates with dynamic data
- **pizzip**: For reading/writing DOCX files (used by docxtemplater)

### Install Dependencies
```bash
npm install docxtemplater pizzip --save
```

---

## File Structure
```
backend/
├── templates/                        # DOCX templates folder
│   ├── certificate_of_indigency.docx
│   ├── certificate_of_residency.docx
│   ├── barangay_clearance.docx
│   └── ...
├── controllers/
│   └── documentController.js         # Document generation logic
├── routes/
│   └── documentRoutes.js             # Document API routes
└── utils/
    └── documentGenerator.js          # Template filling utility
```

---

## API Endpoints

### 1. Generate Document (Admin Only)
**POST** `/api/documents/generate/:requestId`

Generates the document and returns it as a DOCX file download.

**Request Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Response:** Binary DOCX file with headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="Certificate_of_Indigency_LASTNAME.docx"
```

**Error Responses:**
- `400`: Request not approved (must be status: approved or completed)
- `403`: Not authorized (non-admin)
- `404`: Request not found

---

### 2. Get Available Templates
**GET** `/api/documents/templates`

Returns list of available document templates.

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
      },
      {
        "id": "residency",
        "name": "Certificate of Residency", 
        "price": 50,
        "available": true
      }
    ]
  }
}
```

---

## Implementation Details

### documentGenerator.js Utility
```javascript
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

/**
 * Generate official date format: "7th day of December 2025"
 */
function formatOfficialDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  
  // Add ordinal suffix
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  const ordinal = suffix[(v - 20) % 10] || suffix[v] || suffix[0];
  
  return `${day}${ordinal} day of ${month} ${year}`;
}

/**
 * Determine salutation - use explicit if provided, otherwise derive from gender/civilStatus
 */
function getSalutation(requestData) {
  // Use explicit salutation if provided by user
  if (requestData.salutation) return requestData.salutation;
  
  // Fall back to derived salutation from gender and civil status
  const { gender, civilStatus } = requestData;
  if (gender?.toLowerCase() === 'male') return 'Mr.';
  if (gender?.toLowerCase() === 'female') {
    if (civilStatus?.toLowerCase() === 'married') return 'Mrs.';
    return 'Ms.';
  }
  return '';
}

/**
 * Generate control number: IND-2025-00001
 */
function generateControlNumber(documentType) {
  const prefix = {
    indigency: 'IND',
    residency: 'RES',
    clearance: 'CLR',
    business_permit: 'BIZ',
    good_moral: 'GMC'
  };
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix[documentType] || 'DOC'}-${year}-${random}`;
}

/**
 * Generate a document from template with data
 */
async function generateDocument(templateName, requestData) {
  const templatePath = path.join(__dirname, '../templates', templateName);
  const content = fs.readFileSync(templatePath, 'binary');
  
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Build full name
  const nameParts = [
    requestData.firstName,
    requestData.middleName,
    requestData.lastName,
    requestData.suffix
  ].filter(Boolean);
  const fullName = nameParts.join(' ');

  // Build user's address (house number and street only - barangay/city are fixed)
  const addressParts = [
    requestData.address?.houseNumber,
    requestData.address?.street
  ].filter(Boolean);
  const fullAddress = addressParts.join(' ');  // e.g., "123 Main Street"

  // Fixed location constants for Barangay Culiat
  // Note: In templates, use: {full_address}, Barangay Culiat, Quezon City
  const BARANGAY = 'Culiat';
  const CITY = 'Quezon City';

  // Prepare template data
  const templateData = {
    salutation: getSalutation(requestData),
    full_name: fullName,
    first_name: requestData.firstName || '',
    middle_name: requestData.middleName || '',
    last_name: requestData.lastName || '',
    suffix: requestData.suffix || '',
    full_address: fullAddress,
    house_number: requestData.address?.houseNumber || '',
    street: requestData.address?.street || '',
    subdivision: requestData.address?.subdivision || '',
    barangay: BARANGAY,
    city: CITY,
    date_of_birth: requestData.dateOfBirth ? formatOfficialDate(requestData.dateOfBirth) : '',
    gender: requestData.gender || '',
    civil_status: requestData.civilStatus?.replace(/_/g, ' ') || '',
    nationality: requestData.nationality || 'Filipino',
    contact_number: requestData.contactNumber || '',
    purpose_of_request: requestData.purposeOfRequest || '',
    issue_date: formatOfficialDate(new Date()),
    control_number: generateControlNumber(requestData.documentType),
    barangay_captain: 'Hon. [CAPTAIN NAME]',  // Configure per barangay
    barangay_secretary: '[SECRETARY NAME]',   // Configure per barangay
  };

  // Render template
  doc.render(templateData);

  // Generate output buffer
  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buf;
}

module.exports = { generateDocument, formatOfficialDate, getSalutation, generateControlNumber };
```

---

### documentController.js
```javascript
const { generateDocument } = require('../utils/documentGenerator');
const DocumentRequest = require('../models/DocumentRequest');

// Template file mapping
const TEMPLATE_FILES = {
  indigency: 'Certificate of Indigency.docx',
  residency: 'Certificate of Residency.docx',
  clearance: 'Barangay Clearance.docx',
  business_permit: 'Certificate for Business Permit.docx',
  business_clearance: 'Certificate for Business Closure.docx',
  good_moral: 'Certificate of Good Moral.docx'
};

/**
 * Generate and download document (Admin only)
 * POST /api/documents/generate/:requestId
 */
exports.generateDocumentController = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get the document request
    const request = await DocumentRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only allow for approved or completed requests
    if (request.status !== 'approved' && request.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Document can only be generated for approved requests' 
      });
    }

    // Get template file
    const templateFile = TEMPLATE_FILES[request.documentType];
    if (!templateFile) {
      return res.status(400).json({ message: 'Unknown document type' });
    }

    // Generate the document
    const docBuffer = await generateDocument(templateFile, request);

    // Create filename
    const filename = `${request.documentType}_${request.lastName || 'certificate'}.docx`;

    // Send file as download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docBuffer);

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ message: 'Failed to generate document' });
  }
};

/**
 * Get available templates
 * GET /api/documents/templates
 */
exports.getTemplates = async (req, res) => {
  const templates = [
    { id: 'indigency', name: 'Certificate of Indigency', price: 0, available: true },
    { id: 'residency', name: 'Certificate of Residency', price: 50, available: true },
    { id: 'clearance', name: 'Barangay Clearance', price: 100, available: true },
    { id: 'business_permit', name: 'Business Permit Certificate', price: 500, available: true },
    { id: 'good_moral', name: 'Certificate of Good Moral', price: 75, available: true },
  ];

  res.json({ success: true, data: { templates } });
};
```

---

### documentRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
  generateDocumentController,
  getTemplates 
} = require('../controllers/documentController');

// Public route
router.get('/templates', getTemplates);

// Admin only routes
router.post('/generate/:requestId', protect, adminOnly, generateDocumentController);

module.exports = router;
```

---

### Register Routes in server.js
```javascript
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);
```

---

## Template Placeholders Reference

Templates use `{placeholder}` syntax. Available placeholders:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{salutation}` | Mr., Mrs., Ms. | Mr. |
| `{full_name}` | Complete name with suffix | Juan Dela Cruz Jr. |
| `{first_name}` | First name | Juan |
| `{middle_name}` | Middle name | Santos |
| `{last_name}` | Last name | Dela Cruz |
| `{suffix}` | Name suffix | Jr. |
| `{full_address}` | User's address (house + street) | 123 Main Street |
| `{house_number}` | House/Building number | 123 |
| `{street}` | Street name | Main Street |
| `{subdivision}` | Subdivision/Village | Green Village |
| `{barangay}` | Fixed: Barangay name | Culiat |
| `{city}` | Fixed: City name | Quezon City |
| `{date_of_birth}` | Official format | 15th day of January 1990 |

> **Template Usage Note:** For addresses, use the format: `{full_address}, Barangay Culiat, Quezon City` since barangay and city are fixed.

| `{gender}` | Gender | Male |
| `{civil_status}` | Civil status | Single |
| `{nationality}` | Nationality | Filipino |
| `{contact_number}` | Phone number | 09171234567 |
| `{purpose_of_request}` | Document purpose | Employment |
| `{issue_date}` | Today's date | 7th day of December 2025 |
| `{control_number}` | Unique reference | IND-2025-12345 |
| `{barangay_captain}` | Captain's name | Hon. [Name] |
| `{barangay_secretary}` | Secretary's name | [Name] |

---

## Document Type Mapping

| documentType | Template File | Price (PHP) |
|--------------|---------------|-------------|
| `indigency` | Certificate of Indigency.docx | 0 (Free) |
| `residency` | Certificate of Residency.docx | 50 |
| `clearance` | Barangay Clearance.docx | 100 |
| `business_permit` | Certificate for Business Permit.docx | 500 |
| `business_clearance` | Certificate for Business Closure.docx | 200 |
| `good_moral` | Certificate of Good Moral.docx | 75 |

---

## Frontend Integration

The frontend calls the API and downloads the blob:

```javascript
const handleGenerateDocument = async (requestId) => {
  const response = await axios.post(
    `/api/documents/generate/${requestId}`,
    {},
    { 
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'  // Important: expect binary data
    }
  );

  // Create download link
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'certificate.docx');
  link.click();
};
```

---

## Testing

1. Create a test document request with status `approved`
2. Call `POST /api/documents/generate/:requestId` with admin token
3. Verify DOCX file downloads with correct data filled in
4. Open in Word to verify all placeholders are replaced correctly
