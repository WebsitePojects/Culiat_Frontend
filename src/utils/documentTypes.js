/**
 * Document Type Labels Configuration for Frontend
 * Maps database values to human-readable display names
 */

// Valid Government ID Types
export const GOVERNMENT_ID_TYPES = {
  philippine_passport: "Philippine Passport",
  drivers_license: "Driver's License",
  umid: "UMID (Unified Multi-Purpose ID)",
  qc_id: "Quezon City ID (QC ID)",
  philhealth: "PhilHealth ID",
  sss: "SSS ID",
  prc: "PRC ID (Professional Regulation Commission)",
  voters_id: "Voter's ID / COMELEC ID",
  senior_citizen: "Senior Citizen ID",
  pwd: "PWD ID",
  philsys: "Philippine National ID (PhilSys)",
  nbi_clearance: "NBI Clearance",
  postal_id: "Postal ID",
  barangay_id: "Barangay ID",
  birth_certificate: "Birth Certificate",
};

// Non-ID Document Types (for verification)
export const NON_ID_DOCUMENT_TYPES = {
  endorsement_letter_hoa: "Endorsement Letter from HOA President",
  endorsement_letter_purok: "Endorsement Letter from Purok Leader",
};

// Combined document types
export const ALL_DOCUMENT_TYPES = {
  ...GOVERNMENT_ID_TYPES,
  ...NON_ID_DOCUMENT_TYPES,
};

// Government ID options for dropdown
export const governmentIDOptions = [
  { value: "", label: "Select Document Type" },
  { value: "philippine_passport", label: "Philippine Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "umid", label: "UMID (Unified Multi-Purpose ID)" },
  { value: "qc_id", label: "Quezon City ID (QC ID)" },
  { value: "philhealth", label: "PhilHealth ID" },
  { value: "sss", label: "SSS ID" },
  { value: "prc", label: "PRC ID (Professional Regulation Commission)" },
  { value: "voters_id", label: "Voter's ID / COMELEC ID" },
  { value: "senior_citizen", label: "Senior Citizen ID" },
  { value: "pwd", label: "PWD ID" },
  { value: "philsys", label: "Philippine National ID (PhilSys)" },
  { value: "nbi_clearance", label: "NBI Clearance" },
  { value: "postal_id", label: "Postal ID" },
  { value: "barangay_id", label: "Barangay ID" },
  { value: "birth_certificate", label: "Birth Certificate" },
  // Endorsement Letters
  { value: "endorsement_letter_hoa", label: "Endorsement Letter from HOA President" },
  { value: "endorsement_letter_purok", label: "Endorsement Letter from Purok Leader" },
];

/**
 * Get display label for a document type
 * @param {string} type - The document type code
 * @returns {string} - Human readable label
 */
export const getDocumentTypeLabel = (type) => {
  if (!type) return "Unknown Document";
  return ALL_DOCUMENT_TYPES[type] || type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Check if document type is a valid government ID
 * @param {string} type - The document type code
 * @returns {boolean}
 */
export const isGovernmentID = (type) => {
  return Object.keys(GOVERNMENT_ID_TYPES).includes(type);
};

/**
 * Check if document type is an endorsement letter
 * @param {string} type - The document type code
 * @returns {boolean}
 */
export const isEndorsementLetter = (type) => {
  return type === "endorsement_letter_hoa" || type === "endorsement_letter_purok";
};

/**
 * Validate document requirements based on resident type
 * @param {string} doc1Type - First document type
 * @param {string} doc2Type - Second document type
 * @param {string} residentType - 'resident' or 'non_resident'
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateDocumentCombination = (doc1Type, doc2Type, residentType) => {
  if (residentType === "resident") {
    // Residents only need 1 valid government ID
    if (!doc1Type) {
      return { valid: false, message: "Please select your document type" };
    }
    if (!isGovernmentID(doc1Type)) {
      return { valid: false, message: "Residents must provide a valid government-issued ID" };
    }
    return { valid: true, message: "" };
  } else {
    // Non-residents need 1 government ID AND 1 endorsement letter
    if (!doc1Type || !doc2Type) {
      return { valid: false, message: "Non-residents must provide both a hollow ID and an endorsement letter" };
    }

    const hasID = isGovernmentID(doc1Type) || isGovernmentID(doc2Type);
    const hasEndorsement = isEndorsementLetter(doc1Type) || isEndorsementLetter(doc2Type);

    if (!hasID) {
      return { valid: false, message: "At least one document must be a valid government-issued ID" };
    }
    if (!hasEndorsement) {
      return { valid: false, message: "Non-residents must also provide an endorsement letter" };
    }
    if (doc1Type === doc2Type) {
      return { valid: false, message: "Please select two different types of documents" };
    }
    return { valid: true, message: "" };
  }
};

export default {
  GOVERNMENT_ID_TYPES,
  NON_ID_DOCUMENT_TYPES,
  ALL_DOCUMENT_TYPES,
  governmentIDOptions,
  getDocumentTypeLabel,
  isGovernmentID,
  isEndorsementLetter,
  validateDocumentCombination,
};
