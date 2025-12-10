import React from "react";
import { FileText, Building, Calendar, Users } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "indigency", label: "Certificate of Indigency" },
  { value: "residency", label: "Certificate of Residency" },
  { value: "clearance", label: "Barangay Clearance" },
  { value: "business_permit", label: "Business Permit" },
  { value: "business_clearance", label: "Business Clearance" },
  { value: "good_moral", label: "Certificate of Good Moral" },
  { value: "barangay_id", label: "Barangay ID" },
  { value: "liquor_permit", label: "Liquor Permit" },
  { value: "missionary", label: "Missionary Certificate" },
  { value: "rehab", label: "Rehabilitation Certificate" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

export default function DocumentRequestTab({ formData, setField, errors, isBusinessDocument }) {
  const onChange = (e) => setField(e.target.name, e.target.value);

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
      {formData.documentType === 'rehab' && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-[var(--color-secondary)]" size={20} />
            <h2 className="text-lg font-medium">Beneficiary Information</h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Please provide information about the person who will undergo rehabilitation.
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
                <p className="text-xs text-red-500 mt-1">{errors.beneficiaryFullName}</p>
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
                  <p className="text-xs text-red-500 mt-1">{errors.beneficiaryDateOfBirth}</p>
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
                  <p className="text-xs text-red-500 mt-1">{errors.beneficiaryAge}</p>
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
                <p className="text-xs text-red-500 mt-1">{errors.beneficiaryRelationship}</p>
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>
                )}
              </div>

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
                  <p className="text-xs text-red-500 mt-1">{errors.natureOfBusiness}</p>
                )}
              </div>
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
          </div>
        </div>
      )}

      {/* Request Details */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-medium mb-3">Request Details</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-color)]">
            Request For <span className="text-red-500">*</span>
          </label>
          <input
            list="requestForOptions"
            name="requestFor"
            value={formData.requestFor || ""}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
              errors.requestFor
                ? "border-red-500"
                : "border-[var(--color-neutral-active)]"
            }`}
            placeholder="Select or type reason..."
          />
          <datalist id="requestForOptions">
            <option value="Employment" />
            <option value="School Requirement" />
            <option value="ID Application" />
            <option value="Loan Application" />
            <option value="Travel" />
            <option value="Medical Assistance" />
            <option value="Financial Assistance" />
            <option value="Others" />
          </datalist>
          {errors.requestFor && (
            <p className="text-xs text-red-500 mt-1">{errors.requestFor}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-color)]">
            Purpose of Request <span className="text-red-500">*</span>
          </label>
          <textarea
            name="purposeOfRequest"
            value={formData.purposeOfRequest}
            onChange={onChange}
            rows={4}
            className={`mt-1 block w-full rounded-md border px-3 py-2 outline-none transition ${
              errors.purposeOfRequest
                ? "border-red-500"
                : "border-[var(--color-neutral-active)]"
            }`}
            placeholder="Please specify the purpose of your request..."
          />
          {errors.purposeOfRequest && (
            <p className="text-xs text-red-500 mt-1">{errors.purposeOfRequest}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Preferred Date of Pickup
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="date"
                id="preferredPickupDate"
                name="preferredPickupDate"
                value={formData.preferredPickupDate}
                onChange={onChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-color)]">
              Remarks (optional)
            </label>
            <input
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border px-3 py-2 outline-none transition border-[var(--color-neutral-active)]"
              placeholder="Any additional notes..."
            />
          </div>
        </div>
      </div>

      <div className="pt-2 text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
        <FileText size={16} className="text-[var(--color-secondary)]" />
        <span>Please review all information before submitting your request.</span>
      </div>
    </div>
  );
}
