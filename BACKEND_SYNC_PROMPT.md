# Backend Sync Prompt - Document Generation System

## Overview
Implement document generation APIs for the AIBarangay system with **payment-gated downloads**.

### Workflow:
1. **Resident** submits a service request
2. **Admin** reviews and approves, then generates the document
3. **Resident** is notified to pay for the document
4. **Payment** is processed (via PayMongo or other gateway)
5. After successful payment, **document becomes available for download**

---

## Technology Stack
- **docxtemplater**: For filling DOCX templates with dynamic data
- **pizzip**: For reading/writing DOCX files (used by docxtemplater)
- **libreoffice-convert** (optional): For converting DOCX to PDF

### Install Dependencies
```bash
npm install docxtemplater pizzip --save
npm install libreoffice-convert --save  # Optional: for PDF conversion
```

---

## File Structure
```
backend/
├── templates/                    # [NEW] DOCX templates folder
│   └── certificate_of_indigency.docx
├── controllers/
│   └── documentController.js     # [NEW] Document generation logic
├── routes/
│   └── documentRoutes.js         # [NEW] Document API routes
├── utils/
│   └── documentGenerator.js      # [NEW] Template filling utility
└── generated/                    # [NEW] Temporary generated documents
```

---

## API Endpoints

### 1. Generate Document (Admin Only)
**POST** `/api/documents/generate/:requestId`

Admin generates the document and stores it. Resident is notified to pay.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Document generated successfully. Awaiting payment.",
  "requestId": "abc123",
  "documentType": "certificate_of_indigency",
  "amount": 50.00,
  "status": "pending_payment"
}
```

**Behavior:**
- Generates document and stores in `generated/` folder or database
- Updates service request status to `pending_payment`
- Sends notification to resident to pay

---

### 2. Download Document (Resident - After Payment)
**GET** `/api/documents/download/:requestId`

Resident downloads their document **only after payment is verified**.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
Returns the DOCX file for download.

**Error Responses:**
- `402`: Payment required - document not yet paid
- `403`: Not authorized to download this document
- `404`: Document not found

---

### 3. Verify Payment Status
**GET** `/api/documents/status/:requestId`

Check if document is available for download.

**Response:**
```json
{
  "requestId": "abc123",
  "documentType": "certificate_of_indigency",
  "status": "paid",           // pending_payment | paid | downloaded
  "canDownload": true,
  "amount": 50.00,
  "paidAt": "2025-12-07T12:30:00Z"
}
```

---

### 4. Get Available Templates
**GET** `/api/documents/templates`

Returns list of available document templates with prices.

**Response:**
```json
{
  "templates": [
    {
      "id": "certificate_of_indigency",
      "name": "Certificate of Indigency",
      "description": "Certificate confirming resident's indigent status",
      "price": 50.00
    },
    {
      "id": "barangay_clearance",
      "name": "Barangay Clearance",
      "description": "General purpose barangay clearance",
      "price": 100.00
    }
  ]
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
 * Generate a document from template with data
 * @param {string} templateName - Template filename (e.g., 'certificate_of_indigency.docx')
 * @param {object} data - Data to fill in template
 * @returns {Buffer} - Generated document buffer
 */
async function generateDocument(templateName, data) {
  const templatePath = path.join(__dirname, '../templates', templateName);
  const content = fs.readFileSync(templatePath, 'binary');
  
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Set template data
  doc.render(data);

  // Generate output buffer
  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buf;
}

module.exports = { generateDocument };
```

### documentController.js
```javascript
const ServiceRequest = require('../models/ServiceRequest');
const { generateDocument } = require('../utils/documentGenerator');

// Helper to format date in official government format (e.g., "7th day of December 2025")
const formatOfficialDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-PH', { month: 'long' });
  const year = d.getFullYear();
  
  // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${ordinal(day)} day of ${month} ${year}`;
};

// Helper to get salutation based on gender and civil status
const getSalutation = (gender, civilStatus) => {
  if (gender?.toLowerCase() === 'male') return 'Mr.';
  if (gender?.toLowerCase() === 'female') {
    if (civilStatus?.toLowerCase() === 'married') return 'Mrs.';
    return 'Ms.';
  }
  return ''; // Default empty if unknown
};

// Helper to calculate age
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Generate control number
const generateControlNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `COI-${year}-${random}`;
};

exports.generateDocument = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { format = 'docx' } = req.body;

    // Fetch the service request with all data
    const serviceRequest = await ServiceRequest.findById(requestId).populate('user');
    
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Check if request is approved and paid
    if (serviceRequest.status !== 'approved' && serviceRequest.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Document can only be generated for approved requests' 
      });
    }

    // Build full address
    const address = serviceRequest.address || {};
    const fullAddress = [
      address.houseNumber,
      address.street,
      address.subdivision
    ].filter(Boolean).join(', ');

    // Build full name
    const fullName = [
      serviceRequest.firstName,
      serviceRequest.middleName,
      serviceRequest.lastName,
      serviceRequest.suffix
    ].filter(Boolean).join(' ');

    // Prepare template data
    const templateData = {
      // Salutation
      salutation: getSalutation(serviceRequest.gender, serviceRequest.civilStatus),
      
      // Personal info
      full_name: fullName,
      first_name: serviceRequest.firstName || '',
      middle_name: serviceRequest.middleName || '',
      last_name: serviceRequest.lastName || '',
      suffix: serviceRequest.suffix || '',
      
      // Address
      full_address: fullAddress,
      house_number: address.houseNumber || '',
      street: address.street || '',
      subdivision: address.subdivision || '',
      
      // Demographics
      date_of_birth: formatOfficialDate(serviceRequest.dateOfBirth),
      age: calculateAge(serviceRequest.dateOfBirth),
      gender: serviceRequest.gender || '',
      civil_status: serviceRequest.civilStatus || '',
      nationality: serviceRequest.nationality || 'Filipino',
      contact_number: serviceRequest.contactNumber || '',
      
      // Request info
      purpose_of_request: serviceRequest.purposeOfRequest || '',
      
      // Document metadata - Official date format
      issue_date: formatOfficialDate(new Date()),
      control_number: generateControlNumber(),
      
      // Barangay officials (from settings or hardcoded for now)
      barangay_captain: 'HON. BARANGAY CAPTAIN NAME',
      barangay_secretary: 'SECRETARY NAME',
      
      // Fixed values - Government document
      // Note: "Barangay Culiat" and "Quezon City" are hardcoded in template
    };

    // Map document type to template file
    const templateMap = {
      'certificate_of_indigency': 'certificate_of_indigency.docx',
      'barangay_clearance': 'barangay_clearance.docx',
      'barangay_certificate': 'barangay_certificate.docx',
    };

    const templateFile = templateMap[serviceRequest.documentType] || 'certificate_of_indigency.docx';
    
    // Generate document
    const docBuffer = await generateDocument(templateFile, templateData);

    // Set response headers for file download
    const fileName = `${serviceRequest.documentType}_${serviceRequest.lastName}_${serviceRequest.firstName}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return res.send(docBuffer);

  } catch (error) {
    console.error('Document generation error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate document',
      error: error.message 
    });
  }
};
```

### documentRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const { generateDocument, getTemplates } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const staffOrAdmin = require('../middleware/staffOrAdmin');

// All routes require authentication and staff/admin role
router.use(authMiddleware);
router.use(staffOrAdmin);

// Generate document for a service request
router.post('/generate/:requestId', generateDocument);

// Get available templates
router.get('/templates', getTemplates);

module.exports = router;
```

---

## Register Routes in server.js
```javascript
const documentRoutes = require('./routes/documentRoutes');

// Add after other routes
app.use('/api/documents', documentRoutes);
```

---

## Template Placeholders Reference

| Placeholder | Description | Example |
|------------|-------------|---------|
| `{salutation}` | Mr., Mrs., Ms. | "Mr." |
| `{full_name}` | Complete name with suffix | "Juan Dela Cruz Jr." |
| `{first_name}` | First name | "Juan" |
| `{middle_name}` | Middle name | "Santos" |
| `{last_name}` | Last name | "Dela Cruz" |
| `{suffix}` | Name suffix | "Jr." |
| `{full_address}` | Complete address | "123 Main St., Green Village" |
| `{house_number}` | House/Unit number | "123" |
| `{street}` | Street name | "Main Street" |
| `{subdivision}` | Subdivision/Village | "Green Village" |
| `{date_of_birth}` | Formatted DOB (official) | "15th day of January 1990" |
| `{age}` | Calculated age | "34" |
| `{gender}` | Gender | "Male" |
| `{civil_status}` | Civil status | "Single" |
| `{nationality}` | Nationality | "Filipino" |
| `{contact_number}` | Phone number | "09171234567" |
| `{purpose_of_request}` | Document purpose | "scholarship application" |
| `{issue_date}` | Official date format | "7th day of December 2025" |
| `{control_number}` | Unique reference | "COI-2024-12345" |
| `{barangay_captain}` | Captain's name | "HON. CAPTAIN NAME" |
| `{barangay_secretary}` | Secretary's name | "SECRETARY NAME" |

> **Note:** "Barangay Culiat" and "Quezon City" are hardcoded directly in your DOCX template since they never change.

---

## Frontend Integration (Admin Panel)

Add a "Generate Document" button in the admin service request details:

```jsx
const handleGenerateDocument = async (requestId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/documents/generate/${requestId}`,
      { format: 'docx' },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Certificate.docx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
  } catch (error) {
    console.error('Failed to generate document:', error);
  }
};
```

---

## Testing Steps

1. Place your `certificate_of_indigency.docx` template in `backend/templates/`
2. Ensure template uses `{placeholder}` syntax (not underscores)
3. Create a test service request
4. Approve the service request
5. Call the API or click "Generate Document" button
6. Verify downloaded DOCX has all placeholders replaced correctly
