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
  const [pendingDocumentConfirmation, setPendingDocumentConfirmation] = useState({
    fieldName: "",
    value: "",
  });

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
    civilStatus: "Single",
    salutation: "",
    nationality: "Filipino",
    phoneNumber: "+63",
    // Resident address (Barangay Culiat)
    houseNumber: "",
    street: "",
    subdivision: "",
    area: "",
    compound: "",
    // Non-resident address (outside Barangay Culiat)
    nonResidentHouseNumber: "",
    nonResidentStreet: "",
    nonResidentSubdivision: "",
    nonResidentBarangay: "",
    nonResidentDistrict: "",
    nonResidentCity: "",
    nonResidentProvince: "",
    nonResidentRegion: "",
    nonResidentPostalCode: "",
    precinctNumber: "",
    religion: "",
    heightWeight: "",
    colorOfHairEyes: "",
    occupation: "",
    spouseName: "",
    spouseOccupation: "",
    spouseContact: "",
    // Sectoral Groups (multiple selection)
    sectoralGroups: [],
    womensOrganization: "",
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
  const civilStatusOptions = ["Single", "Married", "Widowed", "Separated", "Divorced"];
  const districtOptions = [
    "District 1",
    "District 2",
    "District 3",
    "District 4",
    "District 5",
    "District 6",
  ];

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

  const compoundOptions = [
    "Vargas Compound",
    "MACHIACA Compound",
    "SALAM Compound",
    "CRUZ Compound",
    "DESIRE Compound",
    "BISTEKVILLE 4",
    "BISTEKVILLE 16",
  ];

  // Auto-determine salutation based on gender
  const getSalutation = (gender) => {
    if (gender === "Male") {
      return "Mr.";
    } else if (gender === "Female") {
      return "Ms.";
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

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  const validateNameField = (value) => !value || nameRegex.test(value.trim());
  const isOccupationValid = (value) => !value || !/^\d+$/.test(value.trim());

  const normalizeCivilStatus = (value) => {
    if (!value || value.toLowerCase() === "n/a") return "Single";
    return value;
  };

  const extractLocalPhoneDigits = (value) => {
    let cleaned = (value || "").replace(/\D/g, "");

    if (cleaned.startsWith("63")) {
      cleaned = cleaned.substring(2);
    }

    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    const firstNineIndex = cleaned.indexOf("9");
    if (cleaned.length > 0 && firstNineIndex > 0) {
      cleaned = cleaned.substring(firstNineIndex);
    }

    if (cleaned.length > 0 && !cleaned.startsWith("9")) {
      cleaned = "";
    }

    return cleaned.substring(0, 10);
  };

  // Phone number formatting - always keeps +63 prefix
  const formatPhoneNumber = (value) => {
    const cleaned = extractLocalPhoneDigits(value);

    if (cleaned.length === 0) return "+63";
    if (cleaned.length <= 3) return `+63 ${cleaned}`;
    if (cleaned.length <= 6) return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  };

  // Validate phone number
  const validatePhone = (value) => {
    const cleaned = extractLocalPhoneDigits(value);
    return cleaned.length === 10 && cleaned.startsWith("9");
  };

  const handlePhoneKeyDown = (e) => {
    const protectedPrefixLength = 3; // +63
    const cursorStart = e.target.selectionStart ?? 0;
    const cursorEnd = e.target.selectionEnd ?? 0;
    const isDeletion = e.key === "Backspace" || e.key === "Delete";

    if (isDeletion && cursorStart <= protectedPrefixLength) {
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace" && cursorStart === cursorEnd && cursorStart === 4) {
      e.preventDefault();
      return;
    }
  };

  const queueDocumentConfirmation = (fieldName, value) => {
    setPendingDocumentConfirmation({ fieldName, value });
  };

  const confirmDocumentAddressMatch = (confirmed) => {
    const { fieldName, value } = pendingDocumentConfirmation;
    if (!fieldName || !value) return;

    if (confirmed) {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      setError("");
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: "" }));
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: "Please choose a document type where your registered address is clearly visible.",
      }));
      setError("You must choose a document that contains the same address as your registration details.");
    }

    setPendingDocumentConfirmation({ fieldName: "", value: "" });
  };

  const handleDocumentTypeChange = (e) => {
    const { name, value } = e.target;

    if (!value) {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      setPendingDocumentConfirmation({ fieldName: "", value: "" });
      return;
    }

    if (isGovernmentID(value)) {
      queueDocumentConfirmation(name, value);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Phone number formatting - auto prepend +63 and validate
  const filteredOccupations = occupationOptions.filter((occ) =>
    occ.toLowerCase().includes(occupationSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    let newFieldErrors = { ...fieldErrors };

    if (name === "civilStatus") {
      newValue = normalizeCivilStatus(value);
    }

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
      const digits = extractLocalPhoneDigits(newValue);
      if (digits.length > 0 && !digits.startsWith("9")) {
        newFieldErrors.phoneNumber = "Phone must start with 9 after +63";
      } else if (digits.length > 0 && digits.length < 10) {
        newFieldErrors.phoneNumber = "Please complete your phone number";
      } else if (digits.length === 10 && !validatePhone(newValue)) {
        newFieldErrors.phoneNumber = "Phone number must be in +63 9XX XXX XXXX format";
      } else {
        delete newFieldErrors.phoneNumber;
      }
    }

    if (["firstName", "middleName", "lastName"].includes(name)) {
      if (!validateNameField(value)) {
        newFieldErrors[name] = "Only alphabet letters are allowed";
      } else {
        delete newFieldErrors[name];
      }
    }

    if (name === "occupation") {
      if (!isOccupationValid(value)) {
        newFieldErrors.occupation = "Please enter a valid Occupation";
      } else {
        delete newFieldErrors.occupation;
      }
    }

    setFieldErrors(newFieldErrors);

    // Create updated form data
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    // Auto-determine salutation when gender changes
    if (name === "gender") {
      updatedFormData.salutation = getSalutation(newValue);
    }

    setFormData(updatedFormData);
  };

  // Handler for sectoral group checkbox changes
  const handleSectoralGroupChange = (group) => {
    setFormData(prev => {
      const currentGroups = prev.sectoralGroups || [];
      if (currentGroups.includes(group)) {
        // Remove if already selected
        const updatedData = { ...prev, sectoralGroups: currentGroups.filter(g => g !== group) };
        // Clear women's org if 'woman' is removed
        if (group === 'woman') {
          updatedData.womensOrganization = "";
        }
        return updatedData;
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
    const errors = {};

    // Step 0: Resident type selection
    if (step === 0) {
      if (!formData.residentType) {
        setError("Please select whether you are a Barangay Culiat resident");
        errors.residentType = true;
        setFieldErrors(errors);
        return false;
      }
    }

    if (step === 1) {
      // Username validation
      if (!formData.username) {
        errors.username = "Username is required";
      }
      
      // Email validation - only if provided
      if (formData.email && !validateEmail(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
      
      // Password validation
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError("Please fill in all required account fields correctly");
        scrollToFirstError(errors);
        return false;
      }
    }

    if (step === 2) {
      // Personal information validation
      if (!formData.firstName) errors.firstName = "First name is required";
      if (formData.firstName && !validateNameField(formData.firstName)) {
        errors.firstName = "Only alphabet letters are allowed";
      }
      if (!formData.lastName) errors.lastName = "Last name is required";
      if (formData.lastName && !validateNameField(formData.lastName)) {
        errors.lastName = "Only alphabet letters are allowed";
      }
      if (formData.middleName && !validateNameField(formData.middleName)) {
        errors.middleName = "Only alphabet letters are allowed";
      }
      if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.civilStatus || formData.civilStatus === "N/A") {
        errors.civilStatus = "Civil status defaults to Single and cannot be N/A";
      }
      if (!formData.phoneNumber || !validatePhone(formData.phoneNumber)) {
        errors.phoneNumber = "Please enter a valid phone number in +63 9XX XXX XXXX format";
      }
      if (!isOccupationValid(formData.occupation)) {
        errors.occupation = "Please enter a valid Occupation";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError("Please fill in all required personal information fields");
        scrollToFirstError(errors);
        return false;
      }
    }

    if (step === 3) {
      // Address validation depends on resident type
      if (formData.residentType === "resident") {
        if (!formData.houseNumber) errors.houseNumber = "House number is required";
        if (!formData.street) errors.street = "Street is required";
      } else if (formData.residentType === "non_resident") {
        if (!formData.nonResidentHouseNumber) errors.nonResidentHouseNumber = "House number is required";
        if (!formData.nonResidentStreet) errors.nonResidentStreet = "Street is required";
        if (!formData.nonResidentBarangay) errors.nonResidentBarangay = "Barangay is required";
        if (!formData.nonResidentCity) errors.nonResidentCity = "City is required";
        if (!formData.nonResidentProvince) errors.nonResidentProvince = "Province is required";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError("Please fill in your complete address");
        scrollToFirstError(errors);
        return false;
      }
    }

    if (step === 4) {
      // Validate Document 1
      if (!formData.primaryID1Type) {
        errors.primaryID1Type = "Document type is required";
        setError("Please select the type of your first document");
      }
      if (!formData.primaryID1File) {
        errors.primaryID1File = "Document file is required";
        if (!errors.primaryID1Type) setError("Please upload your first document");
      }
      // Only require back for non-endorsement letters
      if (!isEndorsementLetter(formData.primaryID1Type) && !formData.primaryID1BackFile) {
        errors.primaryID1BackFile = "Back of ID is required";
        if (!errors.primaryID1Type && !errors.primaryID1File) setError("Please upload the back of your first ID");
      }

      // Check for Primary ID 2 only for Non-Residents
      if (formData.residentType === 'non_resident') {
        // Validate Document 2
        if (!formData.primaryID2Type) {
          errors.primaryID2Type = "Second document type is required";
          if (Object.keys(errors).length === 0) setError("Please select the type of your second document");
        }
        if (!formData.primaryID2File) {
          errors.primaryID2File = "Second document file is required";
          if (Object.keys(errors).length === 0) setError("Please upload your second document");
        }
        // Only require back for non-endorsement letters
        if (!isEndorsementLetter(formData.primaryID2Type) && !formData.primaryID2BackFile) {
          errors.primaryID2BackFile = "Back of second ID is required";
          if (Object.keys(errors).length === 0) setError("Please upload the back of your second ID");
        }

        // Check that both documents are different types
        if (formData.primaryID1Type === formData.primaryID2Type && formData.primaryID1Type && formData.primaryID2Type) {
          errors.primaryID2Type = "Must be different from first document";
          if (Object.keys(errors).length === 1) setError("Please select two different types of documents");
        }
      }

      // Validate at least one is a valid government ID
      if (Object.keys(errors).length === 0) {
        const docValidation = validateDocumentCombination(formData.primaryID1Type, formData.primaryID2Type, formData.residentType);
        if (!docValidation.valid) {
          setError(docValidation.message);
          errors.primaryID1Type = docValidation.message;
          setFieldErrors(errors);
          scrollToFirstError(errors);
          return false;
        }
      } else {
        setFieldErrors(errors);
        scrollToFirstError(errors);
        return false;
      }
    }

    if (step === 5) {
      if (!formData.termsAccepted) {
        setError("You must accept the Terms and Conditions to register");
        errors.termsAccepted = true;
        setFieldErrors(errors);
        return false;
      }
    }

    setFieldErrors({});
    return true;
  };

  // Scroll to first field with error
  const scrollToFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      // Try to find the input element
      const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                     document.querySelector(`#${firstErrorField}`) ||
                     document.querySelector(`.error-${firstErrorField}`);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus on the element after a short delay
        setTimeout(() => {
          element.focus?.();
        }, 300);
      }
    }
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
      formDataToSend.append("civilStatus", normalizeCivilStatus(formData.civilStatus));

      // Auto-calculated salutation based on gender
      const autoSalutation = getSalutation(formData.gender);
      formDataToSend.append("salutation", autoSalutation);

      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("phoneNumber", formData.phoneNumber);

      // Resident type
      formDataToSend.append("residentType", formData.residentType);

      // Address based on resident type
      if (formData.residentType === "resident") {
        const residentAddr = {
          houseNumber: formData.houseNumber || "",
          street: formData.street || "",
          subdivision: formData.subdivision || "",
          area: formData.area || "",
          compound: formData.compound || "",
          district: "District 6",
        };
        formDataToSend.append("address", JSON.stringify(residentAddr));
      } else if (formData.residentType === "non_resident") {
        // Send non-resident address as JSON
        const nonResidentAddr = {
          houseNumber: formData.nonResidentHouseNumber || "",
          street: formData.nonResidentStreet || "",
          subdivision: formData.nonResidentSubdivision || "",
          barangay: formData.nonResidentBarangay || "",
          district: formData.nonResidentDistrict || "",
          city: formData.nonResidentCity || "",
          province: formData.nonResidentProvince || "",
          region: formData.nonResidentRegion || "",
          postalCode: formData.nonResidentPostalCode || "",
        };
        formDataToSend.append("nonResidentAddress", JSON.stringify(nonResidentAddr));
      }

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

      // Spouse info - only if provided
      if (formData.spouseName) {
        const spouseInfo = {
          name: formData.spouseName || "",
          occupation: formData.spouseOccupation || "",
          contactNumber: formData.spouseContact || ""
        };
        formDataToSend.append("spouseInfo", JSON.stringify(spouseInfo));
      }

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

      if (formData.womensOrganization) {
        formDataToSend.append("womensOrganization", formData.womensOrganization);
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

  const stepLabels = ['Account', 'Personal', 'Address', 'Documents', 'Terms'];
  const stepIcons = [User, Users, MapPin, IdCard, FileText];

  // Step info for page headers
  const stepInfo = {
    0: { title: 'Create Your Account', desc: 'Select your residency status to get started' },
    1: { title: 'Account Setup', desc: 'Create your login credentials' },
    2: { title: 'Personal Information', desc: 'Tell us about yourself' },
    3: { title: 'Address Details', desc: 'Where do you currently reside?' },
    4: { title: 'Document Verification', desc: 'Upload your identification documents' },
    5: { title: 'Terms & Conditions', desc: 'Review and accept to complete registration' },
  };

  const renderStepIndicator = () => (
    <div>
      {/* Progress Bar */}
      <div className="relative h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => {
          const StepIcon = stepIcons[step - 1];
          return (
            <div key={step} className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  currentStep > step
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : currentStep === step
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-lg shadow-emerald-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
                initial={false}
                animate={{ scale: currentStep === step ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {currentStep > step ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                ) : (
                  <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </motion.div>
              <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${
                currentStep >= step ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {stepLabels[step - 1]}
              </span>
            </div>
          );
        })}
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
          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ${formData.residentType === 'resident'
            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${formData.residentType === 'resident' ? 'bg-emerald-500' : 'bg-slate-100'
              }`}>
              <MapPin className={`w-6 h-6 ${formData.residentType === 'resident' ? 'text-white' : 'text-slate-400'
                }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-base mb-1 ${formData.residentType === 'resident' ? 'text-emerald-700' : 'text-slate-700'
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
          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ${formData.residentType === 'non_resident'
            ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
            : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${formData.residentType === 'non_resident' ? 'bg-amber-500' : 'bg-slate-100'
              }`}>
              <Users className={`w-6 h-6 ${formData.residentType === 'non_resident' ? 'text-white' : 'text-slate-400'
                }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-base mb-1 ${formData.residentType === 'non_resident' ? 'text-amber-700' : 'text-slate-700'
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
      className="space-y-4 sm:space-y-5"
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
            className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.username ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
            placeholder="Choose a username"
          />
        </div>
        {fieldErrors.username && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>
        )}
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
            className={`block w-full pl-10 pr-10 py-2 bg-slate-50 border ${fieldErrors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
              placeholder="Minimum 8 characters"
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
        {fieldErrors.password && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
        )}
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
            className={`block w-full pl-10 pr-10 py-2 bg-slate-50 border ${fieldErrors.confirmPassword ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
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
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      className="space-y-4 sm:space-y-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.firstName ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
            placeholder="Juan"
          />
          {fieldErrors.firstName && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
          )}
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
            className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.lastName ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
            placeholder="Dela Cruz"
          />
          {fieldErrors.lastName && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.dateOfBirth ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm`}
            />
          </div>
          {fieldErrors.dateOfBirth && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.dateOfBirth}</p>
          )}
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
            className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.gender ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm`}
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {fieldErrors.gender && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.gender}</p>
          )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Civil Status *
          </label>
          <select
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleChange}
            className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.civilStatus ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm`}
          >
            {civilStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {fieldErrors.civilStatus && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.civilStatus}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              onKeyDown={handlePhoneKeyDown}
              onClick={(e) => {
                if ((e.target.selectionStart ?? 0) < 3) {
                  e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                }
              }}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.occupation ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
              placeholder="Search or select occupation"
              autoComplete="off"
            />
          </div>
          {fieldErrors.occupation && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.occupation}</p>
          )}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            { value: 'senior', label: 'Senior Citizen', icon: '👴' },
            { value: 'woman', label: 'Woman', icon: '👩' },
            { value: 'youth', label: 'Youth', icon: '🧑' },
            { value: 'solo_parent', label: 'Solo Parent', icon: '👨‍👧' },
            { value: 'pwd', label: 'PWD', icon: '♿' },
            { value: 'lgbtqia', label: 'LGBTQIA+', icon: '🏳️‍🌈' },
            { value: 'toda', label: 'TODA', icon: '🚗' },
            { value: 'vendor', label: 'Vendors', icon: '🏪' },
            { value: '4ps', label: '4Ps', icon: '👨‍👩‍👧‍👦' }
          ].map((group) => (
            <label
              key={group.value}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${formData.sectoralGroups?.includes(group.value)
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

        {/* Women's Organization Sub-dropdown */}
        <AnimatePresence>
          {formData.sectoralGroups?.includes('woman') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm"
            >
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Women's Organization (Optional)
              </label>
              <select
                name="womensOrganization"
                value={formData.womensOrganization}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
              >
                <option value="">Select Organization</option>
                <option value="K.K.K">K.K.K</option>
                <option value="B.A.B.A.E">B.A.B.A.E</option>
                <option value="MSKC">MSKC</option>
                <option value="BANTAY BUNTIS">BANTAY BUNTIS</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      className="space-y-4 sm:space-y-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Resident Type Badge */}
      <div className={`flex items-center gap-2 p-2 rounded-lg ${formData.residentType === 'resident'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.houseNumber ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="123"
              />
              {fieldErrors.houseNumber && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.houseNumber}</p>
              )}
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.street ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="Main Street"
              />
              {fieldErrors.street && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.street}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                Purok / Area
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
              >
                <option value="">Select Area (If any)</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Compound
            </label>
            <select
              name="compound"
              value={formData.compound}
              onChange={handleChange}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
            >
              <option value="">Select Compound (if any)</option>
              {compoundOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
            <p className="text-xs text-slate-600">
              <strong>Barangay:</strong> Culiat | <strong>City:</strong> Quezon City
              | <strong>Region:</strong> NCR
            </p>
            <p className="text-xs text-slate-600 mt-1">
              <strong>District:</strong> District 6
            </p>
          </div>
        </>
      )}

      {/* NON-RESIDENT ADDRESS FORM */}
      {formData.residentType === 'non_resident' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.nonResidentHouseNumber ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="123"
              />
              {fieldErrors.nonResidentHouseNumber && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.nonResidentHouseNumber}</p>
              )}
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.nonResidentStreet ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="Main Street"
              />
              {fieldErrors.nonResidentStreet && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.nonResidentStreet}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.nonResidentBarangay ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="Your Barangay"
              />
              {fieldErrors.nonResidentBarangay && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.nonResidentBarangay}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              District (if applicable)
            </label>
            <input
              type="text"
              name="nonResidentDistrict"
              value={formData.nonResidentDistrict}
              onChange={handleChange}
              list="district-options"
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
              placeholder="District 1 to District 6"
            />
            <datalist id="district-options">
              {districtOptions.map((district) => (
                <option key={district} value={district} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.nonResidentCity ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="City / Municipality"
              />
              {fieldErrors.nonResidentCity && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.nonResidentCity}</p>
              )}
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
                className={`block w-full px-3 py-2 bg-slate-50 border ${fieldErrors.nonResidentProvince ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs`}
                placeholder="Province (e.g., Metro Manila)"
              />
              {fieldErrors.nonResidentProvince && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.nonResidentProvince}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
          {formData.residentType === 'resident' ? (
            <>
              <li>Only 1 valid government-issued ID is required for residents</li>
              {(calculateAge(formData.dateOfBirth) < 18 || formData.sectoralGroups?.includes('youth')) && (
                <li>Minors and Youth may provide a Barangay ID or Birth Certificate</li>
              )}
            </>
          ) : (
            <>
              <li>Non-residents must provide 1 valid government ID AND 1 endorsement letter</li>
              {calculateAge(formData.dateOfBirth) < 18 || formData.sectoralGroups?.includes('youth') ? (
                <li>For the ID, minors/youth may use Barangay ID or Birth Certificate</li>
              ) : null}
              <li>Endorsement letter must be from Homeowners President or Purok Leaders</li>
            </>
          )}
          <li>For IDs: Both front and back must be uploaded</li>
          <li>For Endorsement Letters: Only one image is required</li>
          <li>Files must be JPG, JPEG, or PNG format (max 5MB each)</li>
        </ul>
      </div>

      {/* DOCUMENT 1 */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-emerald-600" />
          {formData.residentType === 'resident'
            ? 'Valid Government ID *'
            : isEndorsementLetter(formData.primaryID1Type)
              ? 'Document #1 - Endorsement Letter'
              : 'Primary Government ID #1 *'}
        </h4>

        {/* Document Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select Document Type *
          </label>
          <select
            name="primaryID1Type"
            value={formData.primaryID1Type}
            onChange={handleDocumentTypeChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            {governmentIDOptions
              .filter(option => {
                const age = calculateAge(formData.dateOfBirth);
                const isChildOrYouth = age < 18 || formData.sectoralGroups?.includes('youth');
                const isSpecialID = option.value === 'barangay_id' || option.value === 'birth_certificate';

                if (isSpecialID && !isChildOrYouth) {
                  return false;
                }

                if (formData.residentType === 'resident') {
                  return option.value === "" || isGovernmentID(option.value);
                }
                return true;
              })
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          {fieldErrors.primaryID1Type && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.primaryID1Type}</p>
          )}
          {pendingDocumentConfirmation.fieldName === "primaryID1Type" && (
            <div className="mt-2 p-3 rounded-lg border border-amber-300 bg-amber-50">
              <p className="text-xs text-amber-900 font-semibold">
                Please confirm: Does your {getDocumentTypeLabel(pendingDocumentConfirmation.value)} clearly show the same address you entered in this registration form?
              </p>
              <p className="text-[11px] text-amber-700 italic mt-1">
                Pakikumpirma: Ang napili mong ID ba ay may kaparehong address na inilagay mo sa registration form na ito?
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                If the address does not match, the registration will be rejected during verification.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => confirmDocumentAddressMatch(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Yes, it matches
                </button>
                <button
                  type="button"
                  onClick={() => confirmDocumentAddressMatch(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  No, choose another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Show warning if endorsement letter selected as first document for non-residents */}
        {formData.residentType === 'non_resident' && isEndorsementLetter(formData.primaryID1Type) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Since Document #1 is an endorsement letter, Document #2 must be a valid government ID.
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

      {/* DOCUMENT 2 - ONLY FOR NON-RESIDENTS */}
      {formData.residentType === 'non_resident' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <IdCard className="h-4 w-4 text-green-600" />
            {isEndorsementLetter(formData.primaryID2Type)
              ? 'Document #2 - Endorsement Letter'
              : isEndorsementLetter(formData.primaryID1Type)
                ? 'Primary Government ID * (Required)'
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
              onChange={handleDocumentTypeChange}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
            >
              {governmentIDOptions
                .filter(option => {
                  const age = calculateAge(formData.dateOfBirth);
                  const isChildOrYouth = age < 18 || formData.sectoralGroups?.includes('youth');
                  const isSpecialID = option.value === 'barangay_id' || option.value === 'birth_certificate';

                  if (isSpecialID && !isChildOrYouth) return false;
                  return option.value !== formData.primaryID1Type || option.value === "";
                })
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
            {fieldErrors.primaryID2Type && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.primaryID2Type}</p>
            )}
            {pendingDocumentConfirmation.fieldName === "primaryID2Type" && (
              <div className="mt-2 p-3 rounded-lg border border-amber-300 bg-amber-50">
                <p className="text-xs text-amber-900 font-semibold">
                  Please confirm: Does your {getDocumentTypeLabel(pendingDocumentConfirmation.value)} clearly show the same address you entered in this registration form?
                </p>
                <p className="text-[11px] text-amber-700 italic mt-1">
                  Pakikumpirma: Ang napili mong ID ba ay may kaparehong address na inilagay mo sa registration form na ito?
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  If the address does not match, the registration will be rejected during verification.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => confirmDocumentAddressMatch(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Yes, it matches
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDocumentAddressMatch(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    No, choose another
                  </button>
                </div>
              </div>
            )}
            {formData.primaryID1Type && formData.primaryID2Type && formData.primaryID1Type === formData.primaryID2Type && (
              <p className="text-xs text-red-500 mt-1">Please select a different document type from your first one</p>
            )}
            {/* Show requirement if first document is endorsement letter */}
            {isEndorsementLetter(formData.primaryID1Type) && !isGovernmentID(formData.primaryID2Type) && formData.primaryID2Type && (
              <p className="text-xs text-red-500 mt-1">Since Document #1 is an endorsement letter, Document #2 must be a valid government ID</p>
            )}
            {/* Show requirement if first document is government ID */}
            {isGovernmentID(formData.primaryID1Type) && !isEndorsementLetter(formData.primaryID2Type) && formData.primaryID2Type && (
              <p className="text-xs text-red-500 mt-1">Since Document #1 is a government ID, Document #2 must be an endorsement letter</p>
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
      )}

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
          {formData.residentType === 'non_resident' && (
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
          )}
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

      {/* Instructions Box */}
      <motion.div
        className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-1 text-sm">Important Instructions:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Click on the <span className="font-semibold underline">Terms and Conditions</span> and <span className="font-semibold underline">Privacy Policy</span> buttons below to read each document</li>
              <li>Scroll down to the bottom of each document in the popup window</li>
              <li>After reading both documents completely, check the acceptance box</li>
            </ol>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white border-2 border-slate-200 rounded-lg p-6 h-80 overflow-y-auto text-sm text-slate-700 shadow-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="font-bold text-base text-slate-800 mb-3">
          Privacy Policy & Terms of Service Summary
        </h4>

        <p className="mb-4 leading-relaxed">
          This summary reflects the current contents of the Privacy Policy and
          Terms & Conditions pages. Please read both tabs in the popup for full
          details.
        </p>

        <div className="space-y-4">
          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
            <h5 className="font-semibold text-slate-800 mb-2">Privacy Policy Highlights</h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
              <li>We collect identity, contact, address, residency, and verification document data.</li>
              <li>Cookies are used for functionality, preferences, analytics, and security.</li>
              <li>Data is used for registration processing, service access, notices, and legal compliance.</li>
              <li>We apply technical safeguards and retain data only as needed for services and law.</li>
              <li>Your rights include access, correction, erasure, and objection under RA 10173.</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
            <h5 className="font-semibold text-slate-800 mb-2">Terms & Conditions Highlights</h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
              <li>You must provide truthful and complete information for account verification.</li>
              <li>You are responsible for account security and lawful, proper use of services.</li>
              <li>False information, fraud, and misuse may lead to account suspension.</li>
              <li>Service availability may vary due to maintenance and operational requirements.</li>
              <li>Terms and policies may be updated, and continued use means acceptance.</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700">
              <strong>Contact:</strong> Barangay Culiat, Quezon City • Email: brgy.culiat@yahoo.com • Cellphone: 0962-582-1531 • Telephone: 856722-60 • Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 italic">
            Last updated: February 1, 2026
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
            className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />
        </div>
        <label
          htmlFor="termsAccepted"
          className="text-sm text-slate-700 select-none cursor-pointer"
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
                  className={`flex-1 py-3 px-4 font-semibold rounded-t-lg transition-all ${termsTab === 'privacy'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                    }`}
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setTermsTab('terms')}
                  className={`flex-1 py-3 px-4 font-semibold rounded-t-lg transition-all ${termsTab === 'terms'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* ═══════════ Top Navigation Bar ═══════════ */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-md ring-1 ring-slate-200/50 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/logo/brgy-culiat-logo.svg"
                  alt="Barangay Culiat"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-bold text-slate-800 leading-tight">Barangay Culiat</span>
                <span className="block text-[10px] text-slate-500 font-medium">Quezon City</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-500 hidden sm:inline">Already registered?</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
              >
                Sign In
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════ Step Indicator Bar ═══════════ */}
      <AnimatePresence>
        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-14 sm:top-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100"
          >
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              {renderStepIndicator()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Main Content Area ═══════════ */}
      <main className="relative">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-50 rounded-full opacity-40 blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50 rounded-full opacity-30 blur-3xl translate-y-1/2" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
          {/* Page Header */}
          <motion.div
            key={`header-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-6 sm:mb-8"
          >
            {/* Mobile Logo - shown only on small screens */}
            {currentStep === 0 && (
              <div className="sm:hidden mb-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg ring-1 ring-slate-200">
                  <img
                    src="/images/logo/brgy-culiat-logo.svg"
                    alt="Barangay Culiat"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              {stepInfo[currentStep]?.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1.5">
              {stepInfo[currentStep]?.desc}
            </p>
            {currentStep > 0 && (
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Step {currentStep} of 5
                </span>
              </div>
            )}
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                  !
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">Something needs attention</p>
                  <p className="text-sm text-red-700 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Card */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <div className="p-5 sm:p-7 md:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && renderStep0()}
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-7 md:px-8 lg:px-10 py-4 sm:py-5">
                {currentStep < 5 ? (
                  <div className={`flex ${currentStep === 0 ? 'justify-center' : 'justify-between'} items-center gap-3`}>
                    {currentStep > 0 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white hover:border-slate-400 transition-all duration-200 text-sm shadow-sm hover:shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Back</span>
                      </motion.button>
                    )}
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white hover:border-slate-400 transition-all duration-200 text-sm shadow-sm hover:shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Back</span>
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading || !formData.termsAccepted}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
                      whileHover={{ scale: loading || !formData.termsAccepted ? 1 : 1.02 }}
                      whileTap={{ scale: loading || !formData.termsAccepted ? 1 : 0.98 }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {loading ? 'Processing...' : 'Complete Registration'}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 sm:mt-12 text-center space-y-2 pb-6">
            <p className="text-xs text-slate-400">
              &copy; 2025 Barangay Culiat, Quezon City. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Your personal data is protected under the Data Privacy Act of 2012 (R.A. 10173).
              By registering, you consent to the collection and processing of your information
              for barangay services and official purposes.
            </p>
          </div>
        </div>
      </main>

      {/* Terms Modal */}
      {renderTermsModal()}
    </div>
  );
};

export default Register;
