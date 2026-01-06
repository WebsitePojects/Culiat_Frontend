# PSA Profile Completion & Verification System

## Overview

This feature implements a comprehensive PSA (Philippine Statistics Authority) birth certificate profile completion system for residents. Residents are given **3 months** from registration to complete their PSA birth certificate information. The system includes automated email reminders, login warning modals, and an admin review workflow.

---

## Feature Summary

| Feature | Description |
|---------|-------------|
| PSA Deadline | 90 days from registration to complete profile |
| Email Reminders | Automated notifications at 30, 14, and 7 days before deadline |
| Login Warning Modal | Pop-up warning when deadline is approaching |
| Profile Form | Tabbed interface with PSA birth certificate form |
| Document Upload | Birth certificate image/PDF upload (Cloudinary or local) |
| Admin Review | Verification queue for admin to approve/reject submissions |
| Email Notifications | Approval/rejection emails sent to residents |

---

## User Flow

### Resident Journey

```
Registration → 90-day deadline set
       ↓
Email reminders sent (30/14/7 days before deadline)
       ↓
Login triggers warning modal if deadline approaching
       ↓
Resident fills PSA form in Profile page
       ↓
Uploads birth certificate document
       ↓
Submits for verification → Status: "Pending"
       ↓
Admin reviews submission
       ↓
Approved → Profile updated, email sent
   or
Rejected → Reason provided, email sent, resident can resubmit
```

### Admin Journey

```
Navigate to Admin → User Management → PSA Verifications
       ↓
View pending submissions in table
       ↓
Click "View Details" to review
       ↓
Compare submitted data with uploaded document
       ↓
Approve (updates user profile, sends success email)
   or
Reject (requires reason, sends rejection email)
```

---

## Backend Implementation

### Files Modified/Created

| File | Type | Description |
|------|------|-------------|
| `models/User.js` | Modified | Added `psaCompletion` and `profileVerification` subdocuments |
| `models/ProfileVerification.js` | Created | New model for verification queue |
| `controllers/profileVerificationController.js` | Created | 10 endpoints for resident and admin actions |
| `routes/profileVerificationRoute.js` | Created | Route definitions with multer upload |
| `controllers/authController.js` | Modified | Set PSA deadline on registration |
| `utils/emailService.js` | Modified | Added email templates for reminders and notifications |
| `server.js` | Modified | Added profile-verification route |

### User Model Additions

```javascript
// PSA Completion Tracking
psaCompletion: {
  deadline: Date,           // 90 days from registration
  isComplete: Boolean,      // All fields filled
  firstReminderSent: Boolean,
  secondReminderSent: Boolean,
  finalReminderSent: Boolean,
  warningDismissedAt: Date,
  completedAt: Date
}

// Profile Verification Status
profileVerification: {
  status: String,           // 'none' | 'pending' | 'approved' | 'rejected'
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId,
  rejectionReason: String
}
```

### Helper Methods (User Model)

```javascript
isPsaProfileComplete()      // Check if all PSA fields are filled
getDaysUntilPsaDeadline()   // Get remaining days
isPsaDeadlineApproaching()  // Within 30 days
isPsaDeadlinePassed()       // Past deadline
```

### API Endpoints

#### Resident Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile-verification/status` | Get PSA completion status |
| POST | `/api/profile-verification/submit` | Submit PSA verification (with file upload) |
| POST | `/api/profile-verification/dismiss-warning` | Dismiss warning modal |

#### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile-verification/admin/count` | Get pending count (for badge) |
| GET | `/api/profile-verification/admin/pending` | List pending verifications |
| GET | `/api/profile-verification/admin/history` | List processed verifications |
| GET | `/api/profile-verification/admin/:id` | Get verification details |
| PUT | `/api/profile-verification/admin/:id/approve` | Approve verification |
| PUT | `/api/profile-verification/admin/:id/reject` | Reject verification |
| POST | `/api/profile-verification/admin/send-reminders` | Trigger reminder emails (SuperAdmin) |

### Email Templates

1. **PSA Completion Reminder** - Sent at 30, 14, and 7 days before deadline
   - Includes urgency level (first/second/final)
   - Link to profile page
   - Deadline date

2. **Verification Approved** - Sent when admin approves
   - Confirmation of approval
   - Thank you message

3. **Verification Rejected** - Sent when admin rejects
   - Rejection reason from admin
   - Instructions to resubmit

---

## Frontend Implementation

### Files Modified/Created

| File | Type | Description |
|------|------|-------------|
| `src/components/ProfileWarningModal.jsx` | Created | Warning modal component |
| `src/context/AuthContext.jsx` | Modified | Added PSA warning state and check function |
| `src/App.jsx` | Modified | Added PsaWarningModalWrapper |
| `src/users/pages/Profile/Profile.jsx` | Modified | Added PSA tab with form |
| `src/admin/pages/ProfileVerifications/` | Created | Admin verification page directory |
| `src/admin/pages/ProfileVerifications/ProfileVerifications.jsx` | Created | Admin verification page |
| `src/admin/components/Sidebar.jsx` | Modified | Added PSA Verifications menu item |

### Profile Page (Resident)

The Profile page now has a tabbed interface:

1. **Overview Tab** - Existing profile information display
2. **PSA Birth Certificate Tab** - New form for PSA data entry

#### PSA Form Fields

| Field | Description |
|-------|-------------|
| Certificate Number | PSA certificate number |
| Registry Number | Registry number |
| Date Issued | Certificate issue date |
| Place of Registration | Where registered |
| Father's First Name | Father's given name |
| Father's Middle Name | Father's middle name |
| Father's Last Name | Father's surname |
| Father's Nationality | Father's citizenship |
| Mother's First Name | Mother's given name |
| Mother's Middle Name | Mother's middle name |
| Mother's Maiden Last Name | Mother's maiden surname |
| Mother's Nationality | Mother's citizenship |
| Birth Certificate Upload | Image or PDF file |

#### Status Display

- **None** - Form available for submission
- **Pending** - Shows "Under Review" badge, form disabled
- **Approved** - Shows success badge, form disabled
- **Rejected** - Shows rejection reason, form available for resubmission

### Warning Modal

Triggered on login when:
- User is a resident (role 74934)
- PSA profile is incomplete
- Deadline is within 30 days OR has passed

Features:
- Urgency levels (Critical: ≤7 days, Warning: ≤14 days, Info: ≤30 days)
- Shows days remaining or "OVERDUE"
- Dismiss option (tracked, won't show again for 24 hours)
- Direct link to profile page

### Admin Verification Page

Location: `Admin → User Management → PSA Verifications`

Features:
- **Pending Tab** - List of submissions awaiting review
- **History Tab** - Previously processed submissions
- **Detail Modal** - Full view of submission with:
  - Resident information
  - PSA certificate details
  - Father's information
  - Mother's maiden information
  - Document preview (image or PDF link)
- **Approve Button** - One-click approval
- **Reject Button** - Opens reason input modal
- **Pagination** - Handles large lists

---

## Configuration

### Environment Variables (Backend)

```env
# Cloudinary (for document uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Brevo)
BREVO_API_KEY=your_brevo_key
EMAIL_FROM=noreply@culiat.gov.ph
```

### Role Definitions

```javascript
ROLES = {
  SuperAdmin: 74932,
  Admin: 74933,
  Resident: 74934
}
```

---

## Cron Job Setup (Optional)

To automate reminder emails, set up a cron job to call:

```bash
POST /api/profile-verification/admin/send-reminders
Authorization: Bearer <superadmin_token>
```

Recommended schedule: Daily at 9:00 AM

---

## Testing Checklist

### Resident Flow
- [ ] New registration sets 90-day deadline
- [ ] Login shows warning modal when deadline approaching
- [ ] Warning modal can be dismissed
- [ ] Profile page shows PSA tab
- [ ] Form validates required fields
- [ ] File upload works (image and PDF)
- [ ] Submission creates verification request
- [ ] Status updates to "pending" after submission
- [ ] Form disabled while pending

### Admin Flow
- [ ] PSA Verifications appears in sidebar
- [ ] Pending tab shows new submissions
- [ ] Detail modal shows all information
- [ ] Document preview works
- [ ] Approve updates user and sends email
- [ ] Reject requires reason and sends email
- [ ] History tab shows processed items

### Email Flow
- [ ] Reminder emails sent at correct intervals
- [ ] Approval email received
- [ ] Rejection email includes reason

---

## Troubleshooting

### Common Issues

1. **Backend won't start with "handler must be a function"**
   - Check that all controller functions are properly exported
   - Verify middleware imports are correct

2. **File upload fails**
   - Check Cloudinary credentials
   - Ensure uploads directory exists for local storage

3. **Warning modal not showing**
   - Verify user role is 74934 (Resident)
   - Check psaCompletion.deadline is set
   - Ensure checkPsaCompletionWarning is called in AuthContext

4. **Emails not sending**
   - Verify Brevo API key is valid
   - Check EMAIL_FROM is configured

---

## Future Enhancements

- [ ] Add bulk approval for admins
- [ ] Implement document OCR for auto-verification
- [ ] Add deadline extension request feature
- [ ] Dashboard widget showing pending count
- [ ] Export verification reports

---

*Documentation created: January 5, 2026*
