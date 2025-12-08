# Backend Sync Prompt - Salutation & Address Updates

## Overview
This document describes the **changes needed** to support:
1. **Salutation field** - explicit user-provided salutation (Mr./Mrs./Ms.)
2. **Address handling** - user address is only house number + street; barangay/city are fixed

---

## User Model Changes

Add `salutation` field to User schema:

```javascript
// In User model schema
salutation: {
  type: String,
  enum: ['', 'Mr.', 'Mrs.', 'Ms.'],
  default: ''
}
```

---

## Document Request Changes

Add `salutation` field to DocumentRequest schema:

```javascript
// In DocumentRequest model schema
salutation: {
  type: String,
  enum: ['', 'Mr.', 'Mrs.', 'Ms.'],
  default: ''
}
```

---

## Document Generator Updates

### Updated `getSalutation` Function

Replace the existing function with this version that prioritizes explicit salutation:

```javascript
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
```

### Updated Address Building

Replace the address building section in `generateDocument`:

```javascript
// Build user's address (house number and street only - barangay/city are fixed)
const addressParts = [
  requestData.address?.houseNumber,
  requestData.address?.street
].filter(Boolean);
const fullAddress = addressParts.join(' ');  // e.g., "123 Main Street"

// Fixed location constants for Barangay Culiat
const BARANGAY = 'Culiat';
const CITY = 'Quezon City';
```

### Updated Template Data

Add these to `templateData` object:

```javascript
const templateData = {
  // ... existing fields ...
  salutation: getSalutation(requestData),  // Use updated function
  full_address: fullAddress,               // Now: house + street only
  barangay: BARANGAY,                       // Fixed: "Culiat"
  city: CITY,                               // Fixed: "Quezon City"
};
```

---

## New/Updated Template Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{salutation}` | User's salutation (explicit or derived) | Mr. |
| `{full_address}` | User's address: house + street only | 123 Main Street |
| `{barangay}` | Fixed: Barangay name | Culiat |
| `{city}` | Fixed: City name | Quezon City |

### Template Usage Example

In your DOCX templates, use addresses like this:

```
{full_address}, Barangay Culiat, Quezon City
```

**Result:** `123 Main Street, Barangay Culiat, Quezon City`

---

## API Changes

### Registration Endpoint Updates

Accept `salutation` field in registration:

```javascript
// POST /api/auth/register
// Accept salutation in request body
if (req.body.salutation) {
  user.salutation = req.body.salutation;
}
```

### Document Request Endpoint Updates

Accept `salutation` field in document requests:

```javascript
// POST /api/document-requests
// Accept salutation in request body
if (req.body.salutation) {
  documentRequest.salutation = req.body.salutation;
}
```

---

## Summary of Changes

| Area | Change |
|------|--------|
| User Model | Add `salutation` field |
| DocumentRequest Model | Add `salutation` field |
| `getSalutation()` | Prioritize explicit salutation, fallback to derived |
| `full_address` | Changed to house + street only (not subdivision) |
| New placeholders | `{barangay}`, `{city}` for fixed location |
