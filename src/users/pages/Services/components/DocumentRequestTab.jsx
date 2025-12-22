import React from "react";
import {
  FileText,
  Building,
  Calendar,
  Users,
  Home,
  Globe,
  CreditCard,
  IdCard,
} from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "indigency", label: "Certificate of Indigency" },
  { value: "residency", label: "Certificate of Residency (for City Hall requirement)" },
  { value: "clearance", label: "Barangay Clearance" },
  { value: "business_permit", label: "Certificate for Business Permit" },
  { value: "business_clearance", label: "Certificate for Business Closure" },
  { value: "barangay_id", label: "Barangay ID" },
  { value: "liquor_permit", label: "Liquor Permit" },
  { value: "missionary", label: "Missionary Certificate" },
  { value: "rehab", label: "Rehabilitation Certificate" },
];

// Common purposes for document requests
const PURPOSE_OPTIONS = [
  { value: "Employment", label: "Employment" },
  { value: "City Hall Requirements", label: "City Hall Requirements" },
  { value: "Bank Requirements", label: "Bank Requirements" },
  { value: "Legal Purposes", label: "Legal Purposes" },
  { value: "School Requirements", label: "School Requirements" },
  { value: "Travel/Visa", label: "Travel/Visa" },
  { value: "Business Permit", label: "Business Permit" },
  { value: "Medical Purposes", label: "Medical Purposes" },
  { value: "Government Transaction", label: "Government Transaction" },
  { value: "Personal Use", label: "Personal Use" },
  { value: "Other", label: "Other (Please specify)" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

const RESIDENCY_TYPE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "renter", label: "Renter" },
  { value: "boarder", label: "Boarder" },
  { value: "relative", label: "Relative" },
  { value: "other", label: "Other" },
];

export default function DocumentRequestTab({
  formData,
  setField,
  errors,
  isBusinessDocument,
}) {
  const onChange = (e) => setField(e.target.name, e.target.value);
  
  // State for custom purpose input
  const [showCustomPurpose, setShowCustomPurpose] = React.useState(false);
  
  const handlePurposeChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setShowCustomPurpose(true);
      setField("purposeOfRequest", "");
    } else {
      setShowCustomPurpose(false);
      setField("purposeOfRequest", value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Document Request</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Select the document you need and provide necessary details
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-color)]">
          Document Type <span className="text-red-500">*</span>
        </label>
        <select
          name="documentType"
          value={formData.documentType}
          onChange={onChange}
          className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
            errors.documentType
              ? "border-red-500"
              : "border-[var(--color-neutral-active)]"
          }`}
        >
          <option value="">Select a document type</option>
          {DOCUMENT_TYPES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        {errors.documentType && (
          <p className="text-xs text-red-500 mt-1">{errors.documentType}</p>
        )}
      </div>

      {/* Beneficiary Information Section - Only show for rehab documents */}
      {formData.documentType === "rehab" && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-[var(--color-secondary)]" size={20} />
            <h2 className="text-lg font-medium">Beneficiary Information</h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Please provide information about the person who will undergo
            rehabilitation.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-color)]">
                Beneficiary Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="beneficiaryFullName"
                value={formData.beneficiaryFullName || ""}
                onChange={onChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                  errors.beneficiaryFullName
                    ? "border-red-500"
                    : "border-[var(--color-neutral-active)]"
                }`}
                placeholder="Enter beneficiary's full name"
              />
              {errors.beneficiaryFullName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.beneficiaryFullName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="beneficiaryDateOfBirth"
                  value={formData.beneficiaryDateOfBirth || ""}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                    errors.beneficiaryDateOfBirth
                      ? "border-red-500"
                      : "border-[var(--color-neutral-active)]"
                  }`}
                />
                {errors.beneficiaryDateOfBirth && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.beneficiaryDateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="beneficiaryAge"
                  value={formData.beneficiaryAge || ""}
                  onChange={onChange}
                  min="1"
                  max="150"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                    errors.beneficiaryAge
                      ? "border-red-500"
                      : "border-[var(--color-neutral-active)]"
                  }`}
                  placeholder="Age"
                />
                {errors.beneficiaryAge && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.beneficiaryAge}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-color)]">
                Relationship to You <span className="text-red-500">*</span>
              </label>
              <select
                name="beneficiaryRelationship"
                value={formData.beneficiaryRelationship || ""}
                onChange={onChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                  errors.beneficiaryRelationship
                    ? "border-red-500"
                    : "border-[var(--color-neutral-active)]"
                }`}
              >
                <option value="">Select relationship</option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.beneficiaryRelationship && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.beneficiaryRelationship}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Residency Info Section - Only show for residency certificates */}
      {formData.documentType === "residency" && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Home className="text-[var(--color-secondary)]" size={20} />
            <h2 className="text-lg font-medium">Residency Information</h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Additional details for your Certificate of Residency.
          </p>

          <div className="space-y-4">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-[var(--color-text-color)]">
                Residing in Barangay Since{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                name="residencySince"
                value={
                  formData.residencySince 
                    ? (() => {
                        // Convert "Month YYYY" format back to "YYYY-MM" for the input
                        const monthNames = [
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ];
                        const parts = formData.residencySince.split(' ');
                        if (parts.length === 2) {
                          const monthIndex = monthNames.indexOf(parts[0]);
                          if (monthIndex !== -1) {
                            const month = String(monthIndex + 1).padStart(2, '0');
                            return `${parts[1]}-${month}`;
                          }
                        }
                        return '';
                      })()
                    : ""
                }
                onChange={(e) => {
                  // Convert YYYY-MM format to "Month YYYY" format for storage
                  const value = e.target.value;
                  if (value) {
                    const [year, month] = value.split('-');
                    const monthNames = [
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ];
                    const monthName = monthNames[parseInt(month) - 1];
                    const formattedValue = `${monthName} ${year}`;
                    onChange({ target: { name: 'residencySince', value: formattedValue } });
                  } else {
                    onChange({ target: { name: 'residencySince', value: '' } });
                  }
                }}
                className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                  errors.residencySince
                    ? "border-red-500"
                    : "border-[var(--color-neutral-active)]"
                }`}
              />
              {errors.residencySince && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.residencySince}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Select the month and year when you started residing in the barangay. Reference No., Document File No., and Prepared By are automatically generated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barangay ID Fields Section */}
      {formData.documentType === "barangay_id" && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <IdCard className="text-[var(--color-secondary)]" size={20} />
            <h2 className="text-lg font-medium">Barangay ID Information</h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Additional details for your Barangay ID application.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-color)]">
                Residency Type <span className="text-red-500">*</span>
              </label>
              <select
                name="residencyType"
                value={formData.residencyType || ""}
                onChange={onChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                  errors.residencyType
                    ? "border-red-500"
                    : "border-[var(--color-neutral-active)]"
                }`}
              >
                <option value="">Select residency type</option>
                {RESIDENCY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.residencyType && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.residencyType}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  Precinct Number
                </label>
                <input
                  name="precinctNumber"
                  value={formData.precinctNumber || ""}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="e.g., 1234 or None"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  SSS/GSIS Number
                </label>
                <input
                  name="sssGsisNumber"
                  value={formData.sssGsisNumber || ""}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="e.g., 12-3456789-0 or None"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  TIN Number
                </label>
                <input
                  name="tinNumber"
                  value={formData.tinNumber || ""}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="e.g., 123-456-789 or None"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Foreign National Info Section - Only show for missionary certificates */}
      {formData.documentType === "missionary" && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-[var(--color-secondary)]" size={20} />
            <h2 className="text-lg font-medium">
              Foreign National Information
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Required for missionary visa applications.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  name="nationality"
                  value={formData.nationality || ""}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                    errors.nationality
                      ? "border-red-500"
                      : "border-[var(--color-neutral-active)]"
                  }`}
                  placeholder="e.g., Vietnamese"
                />
                {errors.nationality && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.nationality}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  ACR Number
                </label>
                <input
                  name="acrNumber"
                  value={formData.acrNumber || ""}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="e.g., G0000156451"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Alien Certificate of Registration
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  ACR Valid Until
                </label>
                <input
                  type="date"
                  name="acrValidUntil"
                  value={formData.acrValidUntil || ""}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  Passport Number
                </label>
                <input
                  name="passportNumber"
                  value={formData.passportNumber || ""}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="e.g., C4366706"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Information Section - Only show for business documents */}
      {isBusinessDocument && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-[var(--color-secondary)]" size={20} />
            <h2 className="text-lg font-medium">Business Information</h2>
          </div>

          <div className="space-y-4">
            {/* Business Name - Required for all business documents */}
            <div
              className={
                formData.documentType === "liquor_permit"
                  ? ""
                  : "grid grid-cols-1 md:grid-cols-2 gap-4"
              }
            >
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-color)]">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="businessName"
                  value={formData.businessName}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                    errors.businessName
                      ? "border-red-500"
                      : "border-[var(--color-neutral-active)]"
                  }`}
                  placeholder="e.g., Juan's Sari-Sari Store"
                />
                {errors.businessName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.businessName}
                  </p>
                )}
              </div>

              {/* Nature of Business - Only for business_permit and business_clearance */}
              {["business_permit", "business_clearance"].includes(
                formData.documentType
              ) && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-color)]">
                    Nature of Business <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="natureOfBusiness"
                    value={formData.natureOfBusiness}
                    onChange={onChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                      errors.natureOfBusiness
                        ? "border-red-500"
                        : "border-[var(--color-neutral-active)]"
                    }`}
                    placeholder="e.g., Retail Store, Food Business"
                  />
                  {errors.natureOfBusiness && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.natureOfBusiness}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-color)] mb-2">
                Business Address
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  name="businessHouseNumber"
                  value={formData.businessHouseNumber}
                  onChange={onChange}
                  className="block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="Unit/House No."
                />
                <input
                  name="businessStreet"
                  value={formData.businessStreet}
                  onChange={onChange}
                  className="block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="Street"
                />
                <input
                  name="businessSubdivision"
                  value={formData.businessSubdivision}
                  onChange={onChange}
                  className="block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                  placeholder="Subdivision/Area"
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Barangay Culiat, Quezon City, Metro Manila, 1128, Philippines
              </p>
            </div>

            {/* Application Type & Owner fields - Only for business_permit and business_clearance */}
            {["business_permit", "business_clearance"].includes(
              formData.documentType
            ) && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-color)]">
                      Application Type
                    </label>
                    <select
                      name="applicationType"
                      value={formData.applicationType}
                      onChange={onChange}
                      className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                    >
                      <option value="">Select type</option>
                      <option value="new">New Application</option>
                      <option value="renewal">Renewal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-color)]">
                      Owner/Representative Name
                    </label>
                    <input
                      name="ownerRepresentative"
                      value={formData.ownerRepresentative}
                      onChange={onChange}
                      className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                      placeholder="Full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-color)]">
                      Owner Contact Number
                    </label>
                    <input
                      name="ownerContactNumber"
                      value={formData.ownerContactNumber}
                      onChange={onChange}
                      className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-color)]">
                      Representative Contact Number
                    </label>
                    <input
                      name="representativeContactNumber"
                      value={formData.representativeContactNumber}
                      onChange={onChange}
                      className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Note: Business Permit fees and OR number are filled by admin when processing */}

            {/* Business Closure Specific Fields */}
            {formData.documentType === "business_clearance" && (
              <div className="border-t pt-4 mt-4">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-[var(--color-text-color)]">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Closure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="closureDate"
                    value={formData.closureDate || ""}
                    onChange={onChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
                      errors.closureDate
                        ? "border-red-500"
                        : "border-[var(--color-neutral-active)]"
                    }`}
                  />
                  {errors.closureDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.closureDate}
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Date when the business ceased operations
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Details */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-medium mb-3">Request Details</h2>

        {/* Purpose of Request - Dropdown with Custom Option */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-color)]">
            Purpose of Request <span className="text-red-500">*</span>
          </label>
          <select
            name="purposeDropdown"
            value={showCustomPurpose ? "Other" : (PURPOSE_OPTIONS.find(p => p.value === formData.purposeOfRequest)?.value || "")}
            onChange={handlePurposeChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
              errors.purposeOfRequest && !formData.purposeOfRequest
                ? "border-red-500"
                : "border-[var(--color-neutral-active)]"
            }`}
          >
            <option value="">Select purpose...</option>
            {PURPOSE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          
          {/* Custom Purpose Input - shows when "Other" is selected */}
          {showCustomPurpose && (
            <textarea
              name="purposeOfRequest"
              value={formData.purposeOfRequest}
              onChange={onChange}
              rows={3}
              className={`mt-2 block w-full rounded-md border px-3 py-2 outline-none transition ${
                errors.purposeOfRequest
                  ? "border-red-500"
                  : "border-[var(--color-neutral-active)]"
              }`}
              placeholder="Please specify your purpose..."
            />
          )}
          {errors.purposeOfRequest && (
            <p className="text-xs text-red-500 mt-1">
              {errors.purposeOfRequest}
            </p>
          )}
        </div>

        {/* Remarks Field */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--color-text-color)]">
            Remarks (optional)
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={onChange}
            rows={3}
            className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
            placeholder="Any additional notes or special requests..."
          />
        </div>
      </div>

      <div className="pt-2 text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
        <FileText size={16} className="text-[var(--color-secondary)]" />
        <span>
          Please review all information before submitting your request.
        </span>
      </div>
    </div>
  );
}
