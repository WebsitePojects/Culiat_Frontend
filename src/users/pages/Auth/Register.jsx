import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  governmentIDOptions as documentTypeOptions,
  isEndorsementLetter,
  isGovernmentID,
  validateDocumentCombination,
  getDocumentTypeLabel,
} from "../../../utils/documentTypes";
import {
  Upload,
  X,
  ArrowLeft,
  Home,
  Mail,
  User,
  Users,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Calendar,
  Briefcase,
  Heart,
  IdCard,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  FileSignature,
  Baby,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  // Step 0 = Resident type selection, Steps 1-5 = Main registration flow
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [occupationSearch, setOccupationSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Terms & Conditions Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsTab, setTermsTab] = useState('privacy'); // 'privacy' or 'terms'
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    // Resident type - determines registration flow
    residentType: "", // 'resident' or 'non_resident'
    username: "",
    email: "", // Optional for elderly users
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    civilStatus: "",
    salutation: "",
    nationality: "Filipino",
    phoneNumber: "",
    // Resident address (Barangay Culiat)
    houseNumber: "",
    street: "",
    subdivision: "",
    area: "",
    // Non-resident address (outside Barangay Culiat)
    nonResidentHouseNumber: "",
    nonResidentStreet: "",
    nonResidentSubdivision: "",
    nonResidentBarangay: "",
    nonResidentCity: "",
    nonResidentProvince: "",
    nonResidentRegion: "",
    nonResidentPostalCode: "",
    tinNumber: "",
    sssGsisNumber: "",
    precinctNumber: "",
    religion: "",
    heightWeight: "",
    colorOfHairEyes: "",
    occupation: "",
    spouseName: "",
    spouseOccupation: "",
    spouseContact: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyContact: "",
    emergencyHouseNumber: "",
    emergencyStreet: "",
    emergencySubdivision: "",
    // Sectoral Groups (multiple selection)
    sectoralGroups: [],
    // Primary ID 1
    primaryID1Type: "",
    primaryID1File: null,
    primaryID1BackFile: null,
    // Primary ID 2
    primaryID2Type: "",
    primaryID2File: null,
    primaryID2BackFile: null,
    // Legacy fields for backward compatibility
    validIDFile: null,
    backOfValidIDFile: null,
    termsAccepted: false,
  });

  // Preview states for ID uploads
  const [validIDPreview, setValidIDPreview] = useState(null);
  const [backOfValidIDPreview, setBackOfValidIDPreview] = useState(null);
  // New preview states for 2 ID system
  const [primaryID1Preview, setPrimaryID1Preview] = useState(null);
  const [primaryID1BackPreview, setPrimaryID1BackPreview] = useState(null);
  const [primaryID2Preview, setPrimaryID2Preview] = useState(null);
  const [primaryID2BackPreview, setPrimaryID2BackPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Document options now imported from utils/documentTypes.js
  // Includes government IDs + endorsement letters
  const governmentIDOptions = documentTypeOptions;

  // Philippine occupations dropdown - comprehensive list
  const occupationOptions = [
    // Employment Status
    "Employed",
    "Self-Employed",
    "Unemployed",
    "Student",
    "Retired",
    // Government Sector
    "Government Employee",
    "Public School Teacher",
    "Military/Armed Forces",
    "Police/Law Enforcement",
    "Barangay Official",
    "LGU Employee",
    // Private Sector
    "Private Employee",
    "Office Worker/Clerk",
    "Sales/Marketing",
    "Customer Service",
    "IT/Software Developer",
    "Engineer",
    "Accountant",
    "Human Resources",
    // Healthcare
    "Doctor/Physician",
    "Nurse",
    "Midwife",
    "Pharmacist",
    "Medical Technologist",
    "Caregiver",
    // Education
    "Teacher",
    "Professor",
    "Tutor",
    // Trades & Services
    "Driver (Public/Private)",
    "Tricycle/Jeepney Driver",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mason/Construction Worker",
    "Mechanic",
    "Welder",
    "Painter",
    "Security Guard",
    "Janitor/Maintenance",
    "Housekeeper/Helper",
    // Business & Entrepreneurship
    "Business Owner",
    "Sari-sari Store Owner",
    "Vendor/Market Seller",
    "Online Seller",
    "Freelancer",
    // Agriculture & Fisheries
    "Farmer",
    "Fisherman",
    "Agricultural Worker",
    // Professional Services
    "Lawyer",
    "Architect",
    "Dentist",
    "Veterinarian",
    "Real Estate Agent",
    // Creative & Media
    "Artist/Designer",
    "Writer/Journalist",
    "Photographer/Videographer",
    // Hospitality
    "Chef/Cook",
    "Waiter/Waitress",
    "Hotel Staff",
    // Other
    "OFW (Overseas Filipino Worker)",
    "Homemaker/Housewife",
    "Others",
  ];

  // Categorized occupations for dropdown display
  const occupationCategories = {
    "Employment Status": [
      "Employed",
      "Self-Employed",
      "Unemployed",
      "Student",
      "Retired",
    ],
    "Government Sector": [
      "Government Employee",
      "Public School Teacher",
      "Military/Armed Forces",
      "Police/Law Enforcement",
      "Barangay Official",
      "LGU Employee",
    ],
    "Private Sector": [
      "Private Employee",
      "Office Worker/Clerk",
      "Sales/Marketing",
      "Customer Service",
      "IT/Software Developer",
      "Engineer",
      "Accountant",
      "Human Resources",
    ],
    "Healthcare": [
      "Doctor/Physician",
      "Nurse",
      "Midwife",
      "Pharmacist",
      "Medical Technologist",
      "Caregiver",
    ],
    "Education": [
      "Teacher",
      "Professor",
      "Tutor",
    ],
    "Trades & Services": [
      "Driver (Public/Private)",
      "Tricycle/Jeepney Driver",
      "Electrician",
      "Plumber",
      "Carpenter",
      "Mason/Construction Worker",
      "Mechanic",
      "Welder",
      "Painter",
      "Security Guard",
      "Janitor/Maintenance",
      "Housekeeper/Helper",
    ],
    "Business & Entrepreneurship": [
      "Business Owner",
      "Sari-sari Store Owner",
      "Vendor/Market Seller",
      "Online Seller",
      "Freelancer",
    ],
    "Agriculture & Fisheries": [
      "Farmer",
      "Fisherman",
      "Agricultural Worker",
    ],
    "Professional Services": [
      "Lawyer",
      "Architect",
      "Dentist",
      "Veterinarian",
      "Real Estate Agent",
    ],
    "Creative & Media": [
      "Artist/Designer",
      "Writer/Journalist",
      "Photographer/Videographer",
    ],
    "Hospitality": [
      "Chef/Cook",
      "Waiter/Waitress",
      "Hotel Staff",
    ],
    "Other": [
      "OFW (Overseas Filipino Worker)",
      "Homemaker/Housewife",
      "Others",
    ],
  };

  // Philippine religions dropdown - Major religions only
  const religionOptions = [
    "Roman Catholic",
    "Islam",
    "Iglesia ni Cristo",
    "Born Again Christian",
    "Protestant",
    "Buddhism",
    "Hinduism",
    "None/Atheist",
    "Prefer not to say",
    "Others",
  ];

  // Suffix options for dropdown
  const suffixOptions = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

  // Area/Purok options for Barangay Culiat
  const areaOptions = [
    "PUROK 1",
    "PUROK 1A",
    "PUROK 2",
    "PUROK 3",
    "PUROK 3A",
    "PUROK 4",
    "PUROK 4A",
    "PUROK 4B",
    "PUROK 5",
    "PUROK 6",
  ];

  // Auto-determine salutation based on sex and civil status
  const getSalutation = (gender, civilStatus) => {
    if (gender === "Male") {
      return "Mr.";
    } else if (gender === "Female") {
      if (civilStatus === "Single") {
        return "Ms.";
      } else {
        // Married, Widowed, Separated are all Mrs.
        return "Mrs.";
      }
    }
    return "";
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Phone number formatting - auto prepend +63 and validate
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, "");

    // Remove leading 63 if present (we'll add it back)
    if (cleaned.startsWith("63")) {
      cleaned = cleaned.substring(2);
    }

    // Remove leading 0 if present
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    // Limit to 10 digits (9XX XXX XXXX)
    cleaned = cleaned.substring(0, 10);

    // Format as +63 9XX XXX XXXX
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return `+63 ${cleaned}`;
    if (cleaned.length <= 6) return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  };

  // Validate phone number
  const validatePhone = (value) => {
    const cleaned = value.replace(/\D/g, "");
    // Should be 12 digits total (63 + 10 digit number starting with 9)
    if (cleaned.length === 12 && cleaned.startsWith("639")) {
      return true;
    }
    if (cleaned.length === 10 && cleaned.startsWith("9")) {
      return true;
    }
    return false;
  };

  // TIN formatting - ###-###-###-###
  const formatTIN = (value) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 12);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 3) {
      parts.push(cleaned.substring(i, i + 3));
    }
    return parts.join("-");
  };

  // SSS formatting - ##-#######-#
  const formatSSS = (value) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 10);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 9) return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 9)}-${cleaned.substring(9)}`;
  };

  // GSIS formatting - 11 digits
  const formatGSIS = (value) => {
    return value.replace(/\D/g, "").substring(0, 11);
  };

  // Filtered occupation options based on search
  const filteredOccupations = occupationOptions.filter((occ) =>
    occ.toLowerCase().includes(occupationSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    let newFieldErrors = { ...fieldErrors };

    // Special handling for email validation
    if (name === "email") {
      if (value && !validateEmail(value)) {
        newFieldErrors.email = "Please enter a valid email address";
      } else {
        delete newFieldErrors.email;
      }
    }

    // Special handling for phone number
    if (name === "phoneNumber") {
      newValue = formatPhoneNumber(value);
      if (newValue && !validatePhone(newValue)) {
        newFieldErrors.phoneNumber = "Phone must start with 9 after +63";
      } else {
        delete newFieldErrors.phoneNumber;
      }
    }

    // Special handling for TIN
    if (name === "tinNumber") {
      newValue = formatTIN(value);
      const tinRegex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
      if (newValue && newValue.length > 0 && !tinRegex.test(newValue) && newValue.replace(/-/g, "").length === 12) {
        // Only show error when fully typed
      } else if (newValue && newValue.replace(/-/g, "").length === 12 && !tinRegex.test(newValue)) {
        newFieldErrors.tinNumber = "Invalid TIN format (###-###-###-###)";
      } else {
        delete newFieldErrors.tinNumber;
      }
    }

    // Special handling for SSS/GSIS
    if (name === "sssGsisNumber") {
      // Detect format based on length
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 10) {
        newValue = formatSSS(value);
      } else {
        newValue = formatGSIS(value);
      }
      delete newFieldErrors.sssGsisNumber;
    }

    // Special handling for emergency contact phone number
    if (name === "emergencyContact") {
      newValue = formatPhoneNumber(value);
      if (newValue && !validatePhone(newValue)) {
        newFieldErrors.emergencyContact = "Phone must start with 9 after +63";
      } else {
        delete newFieldErrors.emergencyContact;
      }
    }

    setFieldErrors(newFieldErrors);

    // Create updated form data
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    // Auto-determine salutation when gender or civil status changes
    if (name === "gender" || name === "civilStatus") {
      const gender = name === "gender" ? newValue : formData.gender;
      const civilStatus = name === "civilStatus" ? newValue : formData.civilStatus;
      updatedFormData.salutation = getSalutation(gender, civilStatus);
    }

    setFormData(updatedFormData);
  };

  // Handler for sectoral group checkbox changes
  const handleSectoralGroupChange = (group) => {
    setFormData(prev => {
      const currentGroups = prev.sectoralGroups || [];
      if (currentGroups.includes(group)) {
        // Remove if already selected
        return { ...prev, sectoralGroups: currentGroups.filter(g => g !== group) };
      } else {
        // Add if not selected
        return { ...prev, sectoralGroups: [...currentGroups, group] };
      }
    });
  };

  const handleFileChange = (e, fieldName = "validIDFile") => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG files are allowed");
        return;
      }

      if (file.size > 5242880) {
        setError("File size must not exceed 5MB");
        return;
      }

      // Handle new 2-ID system
      if (fieldName === "primaryID1File") {
        setFormData({ ...formData, primaryID1File: file, validIDFile: file });
        setPrimaryID1Preview(URL.createObjectURL(file));
        setValidIDPreview(URL.createObjectURL(file));
      } else if (fieldName === "primaryID1BackFile") {
        setFormData({ ...formData, primaryID1BackFile: file, backOfValidIDFile: file });
        setPrimaryID1BackPreview(URL.createObjectURL(file));
        setBackOfValidIDPreview(URL.createObjectURL(file));
      } else if (fieldName === "primaryID2File") {
        setFormData({ ...formData, primaryID2File: file });
        setPrimaryID2Preview(URL.createObjectURL(file));
      } else if (fieldName === "primaryID2BackFile") {
        setFormData({ ...formData, primaryID2BackFile: file });
        setPrimaryID2BackPreview(URL.createObjectURL(file));
      } else if (fieldName === "validIDFile") {
        setFormData({ ...formData, validIDFile: file });
        setValidIDPreview(URL.createObjectURL(file));
      } else if (fieldName === "backOfValidIDFile") {
        setFormData({ ...formData, backOfValidIDFile: file });
        setBackOfValidIDPreview(URL.createObjectURL(file));
      }
      setError("");
    }
  };

  const removeFile = (fieldName = "validIDFile") => {
    // Handle new 2-ID system
    if (fieldName === "primaryID1File") {
      setFormData({ ...formData, primaryID1File: null, validIDFile: null });
      if (primaryID1Preview) {
        URL.revokeObjectURL(primaryID1Preview);
        setPrimaryID1Preview(null);
      }
      if (validIDPreview) {
        URL.revokeObjectURL(validIDPreview);
        setValidIDPreview(null);
      }
    } else if (fieldName === "primaryID1BackFile") {
      setFormData({ ...formData, primaryID1BackFile: null, backOfValidIDFile: null });
      if (primaryID1BackPreview) {
        URL.revokeObjectURL(primaryID1BackPreview);
        setPrimaryID1BackPreview(null);
      }
      if (backOfValidIDPreview) {
        URL.revokeObjectURL(backOfValidIDPreview);
        setBackOfValidIDPreview(null);
      }
    } else if (fieldName === "primaryID2File") {
      setFormData({ ...formData, primaryID2File: null });
      if (primaryID2Preview) {
        URL.revokeObjectURL(primaryID2Preview);
        setPrimaryID2Preview(null);
      }
    } else if (fieldName === "primaryID2BackFile") {
      setFormData({ ...formData, primaryID2BackFile: null });
      if (primaryID2BackPreview) {
        URL.revokeObjectURL(primaryID2BackPreview);
        setPrimaryID2BackPreview(null);
      }
    } else if (fieldName === "validIDFile") {
      setFormData({ ...formData, validIDFile: null });
      if (validIDPreview) {
        URL.revokeObjectURL(validIDPreview);
        setValidIDPreview(null);
      }
    } else if (fieldName === "backOfValidIDFile") {
      setFormData({ ...formData, backOfValidIDFile: null });
      if (backOfValidIDPreview) {
        URL.revokeObjectURL(backOfValidIDPreview);
        setBackOfValidIDPreview(null);
      }
    }
  };

  const validateStep = (step) => {
    setError("");

    // Step 0: Resident type selection
    if (step === 0) {
      if (!formData.residentType) {
        setError("Please select whether you are a Barangay Culiat resident");
        return false;
      }
    }

    if (step === 1) {
      // Email is optional for elderly users
      if (
        !formData.username ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill in all account fields");
        return false;
      }
      // Only validate email if provided
      if (formData.email && !validateEmail(formData.email)) {
        setError("Please enter a valid email address (e.g., example@domain.com)");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    if (step === 2) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.dateOfBirth ||
        !formData.gender ||
        !formData.civilStatus ||
        !formData.phoneNumber
      ) {
        setError("Please fill in all required personal information fields");
        return false;
      }
    }

    if (step === 3) {
      // Address validation depends on resident type
      if (formData.residentType === "resident") {
        if (!formData.houseNumber || !formData.street) {
          setError("Please fill in your address");
          return false;
        }
      } else if (formData.residentType === "non_resident") {
        if (!formData.nonResidentHouseNumber || !formData.nonResidentStreet || 
            !formData.nonResidentBarangay || !formData.nonResidentCity || 
            !formData.nonResidentProvince) {
          setError("Please fill in your complete address");
          return false;
        }
      }
      if (!formData.emergencyName || !formData.emergencyContact) {
        setError("Please provide emergency contact information");
        return false;
      }
      // Validate emergency contact phone format
      if (formData.emergencyContact && !validatePhone(formData.emergencyContact)) {
        setError("Please enter a valid emergency contact number (must start with 9 after +63)");
        return false;
      }
    }

    if (step === 4) {
      // Validate Document 1
      if (!formData.primaryID1Type) {
        setError("Please select the type of your first document");
        return false;
      }
      if (!formData.primaryID1File) {
        setError("Please upload your first document");
        return false;
      }
      // Only require back for non-endorsement letters
      if (!isEndorsementLetter(formData.primaryID1Type) && !formData.primaryID1BackFile) {
        setError("Please upload the back of your first ID");
        return false;
      }

      // Validate Document 2
      if (!formData.primaryID2Type) {
        setError("Please select the type of your second document");
        return false;
      }
      if (!formData.primaryID2File) {
        setError("Please upload your second document");
        return false;
      }
      // Only require back for non-endorsement letters
      if (!isEndorsementLetter(formData.primaryID2Type) && !formData.primaryID2BackFile) {
        setError("Please upload the back of your second ID");
        return false;
      }

      // Check that both documents are different types
      if (formData.primaryID1Type === formData.primaryID2Type) {
        setError("Please select two different types of documents");
        return false;
      }

      // Validate at least one is a valid government ID
      const docValidation = validateDocumentCombination(formData.primaryID1Type, formData.primaryID2Type);
      if (!docValidation.valid) {
        setError(docValidation.message);
        return false;
      }
    }

    if (step === 5) {
      if (!formData.termsAccepted) {
        setError("You must accept the Terms and Conditions to register");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError("");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  // Handle terms scroll
  const handleTermsScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom && !hasScrolledTerms) {
      setHasScrolledTerms(true);
      setCanAcceptTerms(true);
    }
  };

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    setFormData(prev => ({ ...prev, termsAccepted: true }));
    setShowTermsModal(false);
  };

  // Handle submit click - show confirmation modal ONLY if PSA was skipped
  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (validateStep(5)) {
      // Only show warning modal if user skipped PSA step
      if (formData.skipPSAStep) {
        setShowConfirmationModal(true);
      } else {
        // User provided PSA info, proceed directly
        performRegistration();
      }
    }
  };

  // Handle confirmed submit (when user skipped PSA and accepted terms)
  const handleConfirmedSubmit = async () => {
    if (!acceptedDeadlineTerms) {
      setError("You must accept the profile completion terms to continue");
      return;
    }

    setShowConfirmationModal(false);
    await performRegistration();
  };

  // Actual registration function
  const performRegistration = async () => {
    if (loading) return; // Prevent duplicate submissions
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("username", formData.username);
      // Email is optional
      if (formData.email) {
        formDataToSend.append("email", formData.email);
      }
      formDataToSend.append("password", formData.password);
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      if (formData.middleName)
        formDataToSend.append("middleName", formData.middleName);
      if (formData.suffix) formDataToSend.append("suffix", formData.suffix);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      if (formData.placeOfBirth)
        formDataToSend.append("placeOfBirth", formData.placeOfBirth);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("civilStatus", formData.civilStatus);

      // Auto-calculated salutation based on sex and civil status
      const autoSalutation = getSalutation(formData.gender, formData.civilStatus);
      formDataToSend.append("salutation", autoSalutation);

      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("phoneNumber", formData.phoneNumber);

      // Resident type
      formDataToSend.append("residentType", formData.residentType);

      // Address based on resident type
      if (formData.residentType === "resident") {
        formDataToSend.append("address[houseNumber]", formData.houseNumber || "");
        formDataToSend.append("address[street]", formData.street || "");
        formDataToSend.append("address[subdivision]", formData.subdivision || "");
        if (formData.area)
          formDataToSend.append("address[area]", formData.area);
      } else if (formData.residentType === "non_resident") {
        // Send non-resident address as JSON
        const nonResidentAddr = {
          houseNumber: formData.nonResidentHouseNumber || "",
          street: formData.nonResidentStreet || "",
          subdivision: formData.nonResidentSubdivision || "",
          barangay: formData.nonResidentBarangay || "",
          city: formData.nonResidentCity || "",
          province: formData.nonResidentProvince || "",
          region: formData.nonResidentRegion || "",
          postalCode: formData.nonResidentPostalCode || "",
          country: "Philippines",
        };
        formDataToSend.append("nonResidentAddress", JSON.stringify(nonResidentAddr));
      }

      // TIN, SSS, GSIS - send "N/A" if empty
      formDataToSend.append("tinNumber", formData.tinNumber || "N/A");
      formDataToSend.append("sssGsisNumber", formData.sssGsisNumber || "N/A");
      if (formData.precinctNumber)
        formDataToSend.append("precinctNumber", formData.precinctNumber);
      if (formData.religion)
        formDataToSend.append("religion", formData.religion);
      if (formData.heightWeight)
        formDataToSend.append("heightWeight", formData.heightWeight);
      if (formData.colorOfHairEyes)
        formDataToSend.append("colorOfHairEyes", formData.colorOfHairEyes);
      if (formData.occupation)
        formDataToSend.append("occupation", formData.occupation);

      if (formData.spouseName)
        formDataToSend.append("spouseInfo[name]", formData.spouseName);
      if (formData.spouseOccupation)
        formDataToSend.append(
          "spouseInfo[occupation]",
          formData.spouseOccupation
        );
      if (formData.spouseContact)
        formDataToSend.append(
          "spouseInfo[contactNumber]",
          formData.spouseContact
        );

      formDataToSend.append(
        "emergencyContact[fullName]",
        formData.emergencyName
      );
      if (formData.emergencyRelationship)
        formDataToSend.append(
          "emergencyContact[relationship]",
          formData.emergencyRelationship
        );
      formDataToSend.append(
        "emergencyContact[contactNumber]",
        formData.emergencyContact
      );
      formDataToSend.append(
        "emergencyContact[address][houseNumber]",
        formData.emergencyHouseNumber || ""
      );
      formDataToSend.append(
        "emergencyContact[address][street]",
        formData.emergencyStreet || ""
      );
      formDataToSend.append(
        "emergencyContact[address][subdivision]",
        formData.emergencySubdivision || ""
      );

      // Primary ID 1 - use validID/backOfValidID field names for backward compatibility
      // Only send each file once to avoid multer "unexpected field" error
      formDataToSend.append("primaryID1Type", formData.primaryID1Type);
      if (formData.primaryID1File) {
        formDataToSend.append("validID", formData.primaryID1File);
      }
      if (formData.primaryID1BackFile) {
        formDataToSend.append("backOfValidID", formData.primaryID1BackFile);
      }

      // Primary ID 2
      formDataToSend.append("primaryID2Type", formData.primaryID2Type);
      if (formData.primaryID2File) {
        formDataToSend.append("primaryID2", formData.primaryID2File);
      }
      if (formData.primaryID2BackFile) {
        formDataToSend.append("primaryID2Back", formData.primaryID2BackFile);
      }

      // Sectoral Groups - send as JSON array
      if (formData.sectoralGroups && formData.sectoralGroups.length > 0) {
        formDataToSend.append("sectoralGroups", JSON.stringify(formData.sectoralGroups));
      }

      const result = await register(formDataToSend);

      if (result.success || result.pending) {
        navigate("/registration-pending");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) {
      return;
    }
    // Direct submit - no PSA confirmation needed
    await performRegistration();
  };

  const stepLabels = ['Account', 'Personal', 'Address', 'ID Upload', 'Terms'];

  const renderStepIndicator = () => (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="relative h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <motion.div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${currentStep > step
                  ? "bg-emerald-600 text-white"
                  : currentStep === step
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              initial={false}
              animate={{
                scale: currentStep === step ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {currentStep > step ? <CheckCircle className="w-3.5 h-3.5" /> : step}
            </motion.div>
            <span className={`text-[9px] mt-1 font-medium transition-colors ${currentStep >= step ? 'text-slate-700' : 'text-slate-400'
              }`}>
              {stepLabels[step - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 0: Resident Type Selection
  const renderStep0 = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
        >
          <Home className="w-8 h-8 text-emerald-600" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Welcome to Barangay Culiat
        </h2>
        <p className="text-sm text-slate-500">
          Are you a resident of Barangay Culiat?
        </p>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Resident Option */}
        <motion.button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, residentType: 'resident' }));
            setCurrentStep(1);
          }}
          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ${
            formData.residentType === 'resident'
              ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
              : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              formData.residentType === 'resident' ? 'bg-emerald-500' : 'bg-slate-100'
            }`}>
              <MapPin className={`w-6 h-6 ${
                formData.residentType === 'resident' ? 'text-white' : 'text-slate-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-base mb-1 ${
                formData.residentType === 'resident' ? 'text-emerald-700' : 'text-slate-700'
              }`}>
                Yes, I am a Barangay Culiat Resident
              </h3>
              <p className="text-xs text-slate-500">
                I currently live within Barangay Culiat, Quezon City
              </p>
            </div>
            {formData.residentType === 'resident' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </motion.div>
            )}
          </div>
        </motion.button>

        {/* Non-Resident Option */}
        <motion.button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, residentType: 'non_resident' }));
            setCurrentStep(1);
          }}
          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ${
            formData.residentType === 'non_resident'
              ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
              : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              formData.residentType === 'non_resident' ? 'bg-amber-500' : 'bg-slate-100'
            }`}>
              <Users className={`w-6 h-6 ${
                formData.residentType === 'non_resident' ? 'text-white' : 'text-slate-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-base mb-1 ${
                formData.residentType === 'non_resident' ? 'text-amber-700' : 'text-slate-700'
              }`}>
                No, I live outside Barangay Culiat
              </h3>
              <p className="text-xs text-slate-500">
                I reside in another barangay, city, or province
              </p>
            </div>
            {formData.residentType === 'non_resident' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3"
              >
                <CheckCircle className="w-5 h-5 text-amber-500" />
              </motion.div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
      >
        <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Non-residents may have limited access to certain barangay services. 
          Your residency status will be verified during the approval process.
        </p>
      </motion.div>
    </motion.div>
  );

  const renderStep1 = () => (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Username *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Choose a username"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Email <span className="text-slate-400 font-normal">(Optional - for elderly users without email)</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.email ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm`}
            placeholder="your.email@example.com (optional)"
          />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          Email is used for account recovery and notifications. Leave empty if not available.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Password *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Minimum 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Confirm Password *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Re-enter your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Salutation is auto-calculated based on sex and civil status */}
      {formData.salutation && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <p className="text-xs text-emerald-800">
            <strong>Salutation:</strong> {formData.salutation} (auto-determined based on sex and civil status)
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Juan"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Dela Cruz"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Santos"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Suffix
          </label>
          <select
            name="suffix"
            value={formData.suffix}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            <option value="">No Suffix</option>
            {suffixOptions.filter(s => s).map((suffix) => (
              <option key={suffix} value={suffix}>
                {suffix}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Date of Birth *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Sex *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Place of Birth
        </label>
        <input
          type="text"
          name="placeOfBirth"
          value={formData.placeOfBirth}
          onChange={handleChange}
          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
          placeholder="Quezon City"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Civil Status *
          </label>
          <select
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Phone Number *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.phoneNumber ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm`}
              placeholder="+63 9XX XXX XXXX"
            />
          </div>
          {fieldErrors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.phoneNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Occupation
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={(e) => {
                handleChange(e);
                setOccupationSearch(e.target.value);
                setShowOccupationDropdown(true);
              }}
              onFocus={() => setShowOccupationDropdown(true)}
              onBlur={() => setTimeout(() => setShowOccupationDropdown(false), 150)}
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
              placeholder="Search or select occupation"
              autoComplete="off"
            />
          </div>
          {showOccupationDropdown && filteredOccupations.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {occupationSearch.length === 0 ? (
                // Show categorized view when no search
                Object.entries(occupationCategories).map(([category, jobs]) => (
                  <div key={category}>
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                      {category}
                    </div>
                    {jobs.map((occ) => (
                      <div
                        key={occ}
                        className="px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors pl-4"
                        onMouseDown={() => {
                          setFormData({ ...formData, occupation: occ });
                          setOccupationSearch(occ);
                          setShowOccupationDropdown(false);
                        }}
                      >
                        {occ}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                // Show filtered results when searching
                filteredOccupations.map((occ) => (
                  <div
                    key={occ}
                    className="px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors"
                    onMouseDown={() => {
                      setFormData({ ...formData, occupation: occ });
                      setOccupationSearch(occ);
                      setShowOccupationDropdown(false);
                    }}
                  >
                    {occ}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Religion
          </label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            <option value="">Select Religion</option>
            {religionOptions.map((religion) => (
              <option key={religion} value={religion}>
                {religion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sectoral Groups Selection */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" /> Sectoral Group Membership
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Select all that apply (optional)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { value: 'senior', label: 'Senior Citizen', icon: '👴' },
            { value: 'woman', label: 'Woman', icon: '👩' },
            { value: 'youth', label: 'Youth', icon: '🧑' },
            { value: 'solo_parent', label: 'Solo Parent', icon: '👨‍👧' },
            { value: 'pwd', label: 'PWD', icon: '♿' },
            { value: 'lgbtqia', label: 'LGBTQIA+', icon: '🏳️‍🌈' }
          ].map((group) => (
            <label
              key={group.value}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                formData.sectoralGroups?.includes(group.value)
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 hover:border-emerald-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.sectoralGroups?.includes(group.value) || false}
                onChange={() => handleSectoralGroupChange(group.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm">{group.icon}</span>
              <span className="text-xs font-medium">{group.label}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.civilStatus === "Married" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3"
        >
          <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Spouse Information
          </h4>
          <input
            type="text"
            name="spouseName"
            value={formData.spouseName}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-white border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Spouse Full Name"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="spouseOccupation"
              value={formData.spouseOccupation}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-white border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
              placeholder="Spouse Occupation"
            />
            <input
              type="tel"
              name="spouseContact"
              value={formData.spouseContact}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-white border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
              placeholder="Spouse Contact"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Resident Type Badge */}
      <div className={`flex items-center gap-2 p-2 rounded-lg ${
        formData.residentType === 'resident' 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        {formData.residentType === 'resident' ? (
          <>
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Barangay Culiat Resident</span>
          </>
        ) : (
          <>
            <Users className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Non-Resident (Outside Barangay Culiat)</span>
          </>
        )}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-emerald-600" /> 
        {formData.residentType === 'resident' ? 'Your Barangay Culiat Address' : 'Your Current Address'}
      </h4>

      {/* RESIDENT ADDRESS FORM */}
      {formData.residentType === 'resident' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                House No. *
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Street *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="Main Street"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Subdivision
              </label>
              <input
                type="text"
                name="subdivision"
                value={formData.subdivision}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="Village"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Area / Zone
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
              >
                <option value="">Select Area/Zone</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
            <p className="text-xs text-slate-600">
              <strong>Barangay:</strong> Culiat | <strong>City:</strong> Quezon City
              | <strong>Region:</strong> NCR
            </p>
          </div>
        </>
      )}

      {/* NON-RESIDENT ADDRESS FORM */}
      {formData.residentType === 'non_resident' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                House No. *
              </label>
              <input
                type="text"
                name="nonResidentHouseNumber"
                value={formData.nonResidentHouseNumber}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Street *
              </label>
              <input
                type="text"
                name="nonResidentStreet"
                value={formData.nonResidentStreet}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="Main Street"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Subdivision / Village
              </label>
              <input
                type="text"
                name="nonResidentSubdivision"
                value={formData.nonResidentSubdivision}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Barangay *
              </label>
              <input
                type="text"
                name="nonResidentBarangay"
                value={formData.nonResidentBarangay}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="Your Barangay"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                City / Municipality *
              </label>
              <input
                type="text"
                name="nonResidentCity"
                value={formData.nonResidentCity}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="City / Municipality"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Province *
              </label>
              <input
                type="text"
                name="nonResidentProvince"
                value={formData.nonResidentProvince}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="Province (e.g., Metro Manila)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Region
              </label>
              <input
                type="text"
                name="nonResidentRegion"
                value={formData.nonResidentRegion}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="e.g., NCR, Region IV-A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="nonResidentPostalCode"
                value={formData.nonResidentPostalCode}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
                placeholder="e.g., 1126"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> As a non-resident, you may have limited access to certain barangay services 
              that are reserved for Barangay Culiat residents only.
            </p>
          </div>
        </>
      )}

      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          Emergency Contact *
        </h4>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            name="emergencyName"
            value={formData.emergencyName}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Full Name"
          />
          <input
            type="text"
            name="emergencyRelationship"
            value={formData.emergencyRelationship}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Relationship"
          />
        </div>

        <div className="mb-3">
          <input
            type="tel"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            required
            className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm ${fieldErrors.emergencyContact ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="Contact Number (e.g., +63 9XX XXX XXXX)"
          />
          {fieldErrors.emergencyContact && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.emergencyContact}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            name="emergencyHouseNumber"
            value={formData.emergencyHouseNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="House No."
          />
          <input
            type="text"
            name="emergencyStreet"
            value={formData.emergencyStreet}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Street"
          />
          <input
            type="text"
            name="emergencySubdivision"
            value={formData.emergencySubdivision}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Subdivision"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            TIN Number
          </label>
          <input
            type="text"
            name="tinNumber"
            value={formData.tinNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="000-000-000"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            SSS/GSIS Number
          </label>
          <input
            type="text"
            name="sssGsisNumber"
            value={formData.sssGsisNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="00-0000000-0"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Requirements Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Document Requirements
        </h4>
        <ul className="text-xs text-emerald-800 space-y-1 list-disc pl-4">
          <li>At least 1 valid government-issued ID is required</li>
          <li>You may also upload an Endorsement Letter from Homeowners President or Purok Leaders</li>
          <li>For IDs: Both front and back must be uploaded</li>
          <li>For Endorsement Letters: Only one image is required</li>
          <li>Files must be JPG, JPEG, or PNG format (max 5MB each)</li>
        </ul>
      </div>

      {/* DOCUMENT 1 */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-emerald-600" />
          {isEndorsementLetter(formData.primaryID1Type) ? 'Document #1 - Endorsement Letter' : 'Primary Government ID #1 *'}
        </h4>

        {/* Document Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select Document Type *
          </label>
          <select
            name="primaryID1Type"
            value={formData.primaryID1Type}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            {governmentIDOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show warning if endorsement letter selected as first document */}
        {isEndorsementLetter(formData.primaryID1Type) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> An endorsement letter alone is not sufficient. You must also upload at least 1 valid government-issued ID.
            </p>
          </div>
        )}

        <div className={`grid ${isEndorsementLetter(formData.primaryID1Type) ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {/* Front of Document 1 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {isEndorsementLetter(formData.primaryID1Type) ? 'Upload Endorsement Letter *' : 'Front of ID *'}
            </label>
            {!primaryID1Preview ? (
              <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-emerald-400 transition-all">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-xs font-medium text-center">
                  {isEndorsementLetter(formData.primaryID1Type) ? 'Upload Letter' : 'Upload Front'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileChange(e, "primaryID1File")}
                />
              </label>
            ) : (
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={primaryID1Preview}
                  alt="Primary Document 1"
                  className="w-full h-32 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => removeFile("primaryID1File")}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Back of ID 1 - Only show for government IDs */}
          {!isEndorsementLetter(formData.primaryID1Type) && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Back of ID *
              </label>
              {!primaryID1BackPreview ? (
                <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-emerald-400 transition-all">
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <span className="text-xs font-medium text-center">Upload Back</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, "primaryID1BackFile")}
                  />
                </label>
              ) : (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={primaryID1BackPreview}
                    alt="Primary ID 1 Back"
                    className="w-full h-32 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("primaryID1BackFile")}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT 2 */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-green-600" />
          {isEndorsementLetter(formData.primaryID2Type) 
            ? 'Document #2 - Endorsement Letter' 
            : isEndorsementLetter(formData.primaryID1Type) 
              ? 'Primary Government ID #1 * (Required)' 
              : 'Primary Government ID #2 *'}
        </h4>

        {/* Document Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select Document Type *
          </label>
          <select
            name="primaryID2Type"
            value={formData.primaryID2Type}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            {governmentIDOptions
              .filter(option => option.value !== formData.primaryID1Type || option.value === "")
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          {formData.primaryID1Type && formData.primaryID2Type && formData.primaryID1Type === formData.primaryID2Type && (
            <p className="text-xs text-red-500 mt-1">Please select a different document type from your first one</p>
          )}
          {/* Show requirement if first document is endorsement letter */}
          {isEndorsementLetter(formData.primaryID1Type) && !isGovernmentID(formData.primaryID2Type) && formData.primaryID2Type && (
            <p className="text-xs text-red-500 mt-1">Since Document #1 is an endorsement letter, Document #2 must be a valid government ID</p>
          )}
        </div>

        <div className={`grid ${isEndorsementLetter(formData.primaryID2Type) ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {/* Front of Document 2 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {isEndorsementLetter(formData.primaryID2Type) ? 'Upload Endorsement Letter *' : 'Front of ID *'}
            </label>
            {!primaryID2Preview ? (
              <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-green-400 transition-all">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-xs font-medium text-center">
                  {isEndorsementLetter(formData.primaryID2Type) ? 'Upload Letter' : 'Upload Front'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileChange(e, "primaryID2File")}
                />
              </label>
            ) : (
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={primaryID2Preview}
                  alt="Primary Document 2"
                  className="w-full h-32 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => removeFile("primaryID2File")}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Back of ID 2 - Only show for government IDs */}
          {!isEndorsementLetter(formData.primaryID2Type) && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Back of ID *
              </label>
              {!primaryID2BackPreview ? (
                <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-green-400 transition-all">
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <span className="text-xs font-medium text-center">Upload Back</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, "primaryID2BackFile")}
                  />
                </label>
              ) : (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={primaryID2BackPreview}
                    alt="Primary ID 2 Back"
                    className="w-full h-32 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("primaryID2BackFile")}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress Indicator */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Upload Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {formData.primaryID1Type && formData.primaryID1File && (isEndorsementLetter(formData.primaryID1Type) || formData.primaryID1BackFile) ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            )}
            <span className={`text-xs ${formData.primaryID1Type && formData.primaryID1File && (isEndorsementLetter(formData.primaryID1Type) || formData.primaryID1BackFile) ? 'text-green-700' : 'text-slate-500'}`}>
              Document #1: {formData.primaryID1Type ? getDocumentTypeLabel(formData.primaryID1Type) : 'Not selected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {formData.primaryID2Type && formData.primaryID2File && (isEndorsementLetter(formData.primaryID2Type) || formData.primaryID2BackFile) ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            )}
            <span className={`text-xs ${formData.primaryID2Type && formData.primaryID2File && (isEndorsementLetter(formData.primaryID2Type) || formData.primaryID2BackFile) ? 'text-green-700' : 'text-slate-500'}`}>
              Document #2: {formData.primaryID2Type ? getDocumentTypeLabel(formData.primaryID2Type) : 'Not selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-emerald-900 mb-2">
          Review Your Information
        </h4>
        <div className="text-xs text-emerald-800 space-y-1">
          <p>
            <strong>Name:</strong> {formData.salutation} {formData.firstName} {formData.middleName}{" "}
            {formData.lastName} {formData.suffix}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phoneNumber}
          </p>
          {formData.dateOfBirth && (
            <p>
              <strong>Age:</strong> {calculateAge(formData.dateOfBirth)} years old
            </p>
          )}
          <p>
            <strong>Address:</strong> {formData.houseNumber} {formData.street}{" "}
            {formData.subdivision}{formData.area ? `, ${formData.area}` : ""}, Brgy. Culiat
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-800">
          <strong>Note:</strong> Your registration will be reviewed by barangay
          administrators. Both IDs will be verified for authenticity. You will receive an email notification once your
          account is approved (typically within 1-3 business days).
        </p>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">
            Terms and Conditions
          </h3>
          <p className="text-sm text-slate-600">
            Please read and accept to continue
          </p>
        </div>
      </div>

      <motion.div
        className="bg-white border-2 border-slate-200 rounded-lg p-6 h-80 overflow-y-auto text-sm text-slate-700 shadow-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="font-bold text-base text-slate-800 mb-3">
          Barangay Culiat Online Portal - Terms of Service
        </h4>

        <p className="mb-4 leading-relaxed">
          Welcome to the Barangay Culiat Online Portal. By registering and using
          this platform, you acknowledge that you have read, understood, and
          agree to be bound by the following terms and conditions:
        </p>

        <div className="space-y-4">
          <div>
            <h5 className="font-semibold text-slate-800 mb-2">
              1. Account Registration and Verification
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                You certify that all information provided during registration is
                true, accurate, and complete.
              </li>
              <li>
                You agree to provide a valid government-issued ID for
                verification purposes.
              </li>
              <li>
                You understand that your account is subject to approval by the
                Barangay Administration.
              </li>
              <li>
                False information may result in the rejection of your
                application or suspension of your account.
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-800 mb-2">
              2. Acceptable Use
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                You agree to use this portal exclusively for legitimate
                barangay-related transactions.
              </li>
              <li>
                You will not misuse, abuse, or attempt to gain unauthorized
                access to the system.
              </li>
              <li>
                You will maintain the confidentiality of your account
                credentials.
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-800 mb-2">
              3. Data Privacy and Protection
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                You consent to the collection and processing of your personal
                data in accordance with the Data Privacy Act of 2012 (Republic
                Act No. 10173).
              </li>
              <li>
                Your personal information will be used solely for barangay
                service delivery and administration.
              </li>
              <li>
                We implement appropriate security measures to protect your data
                from unauthorized access.
              </li>
              <li>
                Your data will not be shared with third parties without your
                consent, except as required by law.
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-800 mb-2">
              4. User Responsibilities
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                You are responsible for maintaining accurate and up-to-date
                information in your profile.
              </li>
              <li>
                You must notify the barangay office immediately of any changes
                to your contact information.
              </li>
              <li>
                You agree to comply with all applicable laws and regulations
                when using this portal.
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-800 mb-2">
              5. Service Availability
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                The Barangay reserves the right to modify, suspend, or
                discontinue any service without prior notice.
              </li>
              <li>
                We strive to maintain system availability but do not guarantee
                uninterrupted access.
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-800 mb-2">6. Amendments</h5>
            <p className="text-slate-600">
              The Barangay Culiat Administration reserves the right to update
              these terms at any time. Continued use of the portal after changes
              constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-800 mb-2">
              7. Contact Information
            </h5>
            <p className="text-slate-600">
              For questions or concerns about these terms, please contact the
              Barangay Culiat office during regular business hours.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 italic">
            Last updated: January 2025
          </p>
        </div>
      </motion.div>

      <motion.div
        className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-indigo-50 border-2 border-emerald-200 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center h-5 pt-0.5">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={handleChange}
            disabled={!formData.termsAccepted}
            className={`w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 ${
              formData.termsAccepted ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
          />
        </div>
        <label
          htmlFor="termsAccepted"
          className={`text-sm text-slate-700 select-none ${
            formData.termsAccepted ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
          }`}
        >
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
          >
            Terms and Conditions
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
          >
            Privacy Policy
          </button>{" "}
          of Barangay Culiat. I understand that my registration is subject to
          approval and that providing false information may result in account
          suspension.
        </label>
      </motion.div>

      {!formData.termsAccepted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-amber-600 text-sm"
        >
          <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold">!</span>
          </div>
          <p>
            Please accept the terms and conditions to complete your registration
          </p>
        </motion.div>
      )}
    </motion.div>
  );

  // Terms & Conditions Modal
  const renderTermsModal = () => (
    <AnimatePresence>
      {showTermsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowTermsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Tabs */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-indigo-50">
              <div className="flex items-center justify-between p-6 pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Legal Information</h2>
                    <p className="text-sm text-slate-600">Please review before continuing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 pt-4">
                <button
                  onClick={() => setTermsTab('privacy')}
                  className={`flex-1 py-3 px-4 font-semibold rounded-t-lg transition-all ${
                    termsTab === 'privacy'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setTermsTab('terms')}
                  className={`flex-1 py-3 px-4 font-semibold rounded-t-lg transition-all ${
                    termsTab === 'terms'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  Terms of Service
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto p-6 space-y-6"
              onScroll={handleTermsScroll}
            >
              {/* Privacy Policy Tab */}
              {termsTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <section>
                    <div className="space-y-4 text-slate-700 leading-relaxed">
                      <p>
                        Barangay Culiat ("we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you register and use our barangay services.
                      </p>

                      <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">Information We Collect</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Personal identification information (Name, Date of Birth, Gender)</li>
                          <li>Contact information (Phone number, Email address)</li>
                          <li>Address and residency information</li>
                          <li>Government-issued identification documents</li>
                          <li>Emergency contact information</li>
                          <li>Cookies and tracking technologies for functionality</li>
                          <li>IP address and device information for security</li>
                          <li>Usage data to improve our services</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">Cookies & Tracking Technologies</h4>
                        <p className="text-sm mb-2">
                          We use cookies to enhance your experience and maintain security:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                          <li><strong>Preference Cookies:</strong> Remember your settings</li>
                          <li><strong>Analytics Cookies:</strong> Help us understand site usage</li>
                          <li><strong>Security Cookies:</strong> Log IP addresses to prevent fraud and abuse</li>
                        </ul>
                        <p className="text-sm mt-2">
                          You can control cookies through your browser settings. Disabling essential cookies may limit functionality.
                        </p>
                      </div>

                      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">How We Use Your Information</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Process registration and verification</li>
                          <li>Provide access to barangay services</li>
                          <li>Send important announcements</li>
                          <li>Maintain records for government reporting</li>
                          <li>Improve services and user experience</li>
                          <li>Comply with legal obligations</li>
                        </ul>
                      </div>

                      <p>
                        <strong>Data Security:</strong> We implement appropriate technical measures to protect your personal information against unauthorized access, alteration, or destruction.
                      </p>

                      <p>
                        <strong>Data Retention:</strong> We retain your personal information for as long as your account is active or as needed to provide services and comply with legal obligations.
                      </p>

                      <p>
                        <strong>Data Sharing:</strong> We do not sell or rent your personal information. We may share data with government agencies as required by law, or with service providers under strict confidentiality agreements.
                      </p>

                      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">Your Rights (Data Privacy Act 2012)</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Right to access your personal information</li>
                          <li>Right to request correction of inaccurate data</li>
                          <li>Right to erasure/deletion of your data</li>
                          <li>Right to object to processing</li>
                        </ul>
                        <p className="text-sm mt-2">
                          Contact our Data Protection Officer at <strong>bautista.vergel.agripa@gmail.com</strong> to exercise these rights.
                        </p>
                      </div>

                      <p className="text-sm text-slate-500">
                        <strong>Last Updated:</strong> February 1, 2026
                      </p>

                      <div className="pt-4">
                        <a
                          href="/legal#privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold underline text-sm"
                        >
                          View full Privacy Policy on dedicated page →
                        </a>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* Terms of Service Tab */}
              {termsTab === 'terms' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <section>
                    <div className="space-y-4 text-slate-700 leading-relaxed">
                      <p>
                        By registering for Barangay Culiat services, you agree to comply with and be bound by the following terms and conditions.
                      </p>

                      <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">Account Registration</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>You must be a resident or stakeholder of Barangay Culiat</li>
                          <li>You must provide accurate and complete information</li>
                          <li>You are responsible for account confidentiality</li>
                          <li>Registration subject to admin verification</li>
                          <li>False information may result in account suspension</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">User Responsibilities</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Provide truthful and accurate information</li>
                          <li>Update your profile when changes occur</li>
                          <li>Use services in compliance with applicable laws</li>
                          <li>Respect privacy and rights of other users</li>
                          <li>Report suspicious activity or security concerns</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">Account Restrictions</h4>
                        <p className="text-sm mb-2">Your account may be suspended if you:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Provide false or misleading information</li>
                          <li>Violate any terms or conditions</li>
                          <li>Engage in fraudulent or illegal activities</li>
                          <li>Abuse or misuse barangay services</li>
                        </ul>
                      </div>

                      <p>
                        <strong>Service Availability:</strong> While we strive to provide uninterrupted service, we do not guarantee availability at all times. We may suspend services for maintenance or updates.
                      </p>

                      <p>
                        <strong>Changes to Terms:</strong> We reserve the right to modify these terms at any time. Significant changes will be communicated through email or system notifications.
                      </p>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-sm">
                          <strong>Contact Us:</strong><br />
                          Barangay Culiat, Quezon City<br />
                          Email: brgy.culiat@yahoo.com<br />
                          Cellphone: 0962-582-1531 <br />
                          Telephone: 856722-60 <br />
                          Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
                        </p>
                      </div>

                      <p className="text-sm text-slate-500">
                        <strong>Last Updated:</strong> February 1, 2026
                      </p>

                      <div className="pt-4">
                        <a
                          href="/legal#terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-semibold underline text-sm"
                        >
                          View full Terms of Service on dedicated page →
                        </a>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* Scroll indicator */}
              {!canAcceptTerms && (
                <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 animate-bounce">
                    <ChevronDown className="w-5 h-5" />
                    <span className="text-sm font-medium">Scroll down to continue</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  {canAcceptTerms ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      You may now accept the terms
                    </span>
                  ) : (
                    "Please read both Privacy Policy and Terms of Service"
                  )}
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAcceptTerms}
                    disabled={!canAcceptTerms}
                    className={`flex-1 sm:flex-none px-6 py-3 font-semibold rounded-lg transition-all ${canAcceptTerms
                        ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white hover:from-emerald-700 hover:to-indigo-700 shadow-lg'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                  >
                    I Agree
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 overflow-auto">
      {/* Premium Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[300px] xl:w-[340px] 2xl:w-[380px] relative overflow-hidden flex-col flex-shrink-0">
        {/* Nature Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200')] bg-cover bg-center"></div>
        {/* Subtle dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50"></div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.2),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-8 xl:p-10">
          {/* Header with Logo */}
          <Link to="/" className="group inline-flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl shadow-black/40 group-hover:shadow-black/60 transition-all duration-300 group-hover:scale-105">
              <img
                src="/images/logo/brgy-culiat-logo.svg"
                alt="Logo"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div className="drop-shadow-lg">
              <span className="block text-white font-semibold text-sm tracking-wide drop-shadow-md">Barangay</span>
              <span className="block text-white font-bold text-lg -mt-0.5 drop-shadow-md">Culiat</span>
            </div>
          </Link>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center -mt-10">
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 bg-white/25 text-white text-xs font-medium rounded-full mb-4 border border-white/40 backdrop-blur-md shadow-lg">
                  Resident Portal
                </span>
                <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight drop-shadow-xl">
                  Join Your
                  <span className="block text-white drop-shadow-xl">
                    Community Today
                  </span>
                </h1>
              </div>
              <p className="text-white text-sm leading-relaxed max-w-xs drop-shadow-lg">
                Register to access barangay services, request documents, and stay connected with your community.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/15 transition-colors shadow-lg">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-xl">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-white text-xs font-semibold drop-shadow-md">Document Requests</span>
                  <span className="text-white/80 text-[10px] drop-shadow">Barangay clearance, certificates & more</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/15 transition-colors shadow-lg">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-xl">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-white text-xs font-semibold drop-shadow-md">Quick Verification</span>
                  <span className="text-white/80 text-[10px] drop-shadow">Fast approval with valid ID</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/15 transition-colors shadow-lg">
                <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-xl">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-white text-xs font-semibold drop-shadow-md">Stay Informed</span>
                  <span className="text-white/80 text-[10px] drop-shadow">Announcements & emergency alerts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/20">
            <p className="text-white/90 text-[10px] drop-shadow-md">
              © 2025 Barangay Culiat, Quezon City
            </p>
            <p className="text-white/80 text-[10px] mt-1 drop-shadow">
              Secure • Trusted • Community-Driven
            </p>
            <p className="text-white/70 text-[9px] mt-3 leading-relaxed drop-shadow">
              Your personal data is protected under the Data Privacy Act of 2012 (R.A. 10173). 
              By registering, you consent to the collection and processing of your information 
              for barangay services and official purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex items-stretch justify-center p-0 lg:p-4 xl:p-6 relative overflow-hidden">
        <Link
          to="/"
          className="lg:hidden absolute top-4 left-4 inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-xs font-medium group z-20"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        {/* Subtle Background for Mobile */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-50 rounded-full opacity-30 blur-3xl"></div>
        </div>

        <div className="w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl relative flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-4 mt-6 px-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 shadow-lg ring-1 ring-slate-200">
              <img
                src="/images/logo/brgy-culiat-logo.svg"
                alt="Barangay Culiat Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-base font-bold text-slate-800">
              Barangay Culiat
            </h1>
            <p className="text-slate-500 text-xs">Resident Registration</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-slate-100 lg:rounded-2xl shadow-xl shadow-slate-300/50 border-0 lg:border border-slate-300/80 overflow-hidden flex-1 lg:my-0 flex flex-col max-h-full">
            <div className="p-4 md:p-5 lg:p-6 overflow-y-auto flex-1">
              {/* Form Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-slate-800">
                    Create Account
                  </h2>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Step {currentStep}/5
                  </span>
                </div>
                <p className="text-slate-500 text-xs">
                  {currentStep === 0
                    ? "Select your residency status"
                    : currentStep === 1
                    ? "Set up your login credentials"
                    : currentStep === 2
                      ? "Tell us about yourself"
                      : currentStep === 3
                        ? "Your address & emergency contact"
                        : currentStep === 4
                          ? "Upload verification documents"
                          : "Review and accept terms"}
                </p>
              </div>

              {renderStepIndicator()}

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-2"
                  >
                    <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      !
                    </div>
                    <p className="text-xs font-medium text-red-800">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 0 && renderStep0()}
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </AnimatePresence>

                <div className="mt-6">
                    {/* Navigation Buttons for Steps 0-4 */}
                    {currentStep < 5 ? (
                      <div className="grid grid-cols-[auto_1fr] gap-3">
                        {currentStep > 0 && (
                          <motion.button
                            type="button"
                            onClick={prevStep}
                            className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm shadow-sm hover:shadow"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Previous
                          </motion.button>
                        )}
                        <motion.button
                          type="button"
                          onClick={nextStep}
                          className={`bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm ${currentStep === 0 ? 'col-span-2' : ''}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Continue
                        </motion.button>
                      </div>
                    ) : (
                      /* Step 5: Final Submission Layout */
                      <div className="space-y-4">
                        {/* Action Buttons Row */}
                        <div className="grid grid-cols-[auto_1fr] gap-3">
                          <motion.button
                            type="button"
                            onClick={prevStep}
                            className="px-5 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm shadow-sm hover:shadow"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Previous
                          </motion.button>

                          <motion.button
                            type="submit"
                            disabled={loading || !formData.termsAccepted}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                            whileHover={{
                              scale: loading || !formData.termsAccepted ? 1 : 1.02,
                            }}
                            whileTap={{
                              scale: loading || !formData.termsAccepted ? 1 : 0.98,
                            }}
                          >
                            <CheckCircle className="w-5 h-5" />
                            {loading ? "Processing..." : "Complete Registration"}
                          </motion.button>
                        </div>
                      </div>
                    )}
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-5 md:px-6 py-2.5 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400">
                � 2025 Barangay Culiat, Quezon City � All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderTermsModal()}
    </div>
  );
};

export default Register;
