import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [occupationSearch, setOccupationSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Optional PSA Step states
  const [showOptionalPSA, setShowOptionalPSA] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [acceptedDeadlineTerms, setAcceptedDeadlineTerms] = useState(false);
  // PSA section toggles - matches PSABirthCertificateForm.jsx sections exactly
  const [psaSections, setPsaSections] = useState({
    certificate: true,
    yourInfo: true,
    mother: false,
    father: false,
    marriage: false,
  });
  
  // Terms & Conditions Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
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
    houseNumber: "",
    street: "",
    subdivision: "",
    area: "",
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
    // PSA Birth Certificate optional fields - MATCHES PSABirthCertificateForm.jsx exactly
    skipPSAStep: true,
    psaBirthCertificate: {
      // === CERTIFICATE DETAILS ===
      certificateNumber: "",
      registryNumber: "",
      dateIssued: "",
      placeIssued: "",
      province: "",
      cityMunicipality: "",
      
      // === YOUR INFORMATION (as registered on birth certificate) ===
      yourInfo: {
        firstName: "",
        middleName: "",
        lastName: "",
        sex: "",
        dateOfBirth: "",
        placeOfBirth: {
          hospital: "",
          cityMunicipality: "",
          province: "",
        },
        typeOfBirth: "Single",
        birthOrder: "",
        birthWeight: "",
      },
      
      // === MOTHER'S INFORMATION ===
      mother: {
        maidenName: {
          firstName: "",
          middleName: "",
          lastName: "",
        },
        citizenship: "Filipino",
        religion: "",
        occupation: "",
        ageAtBirth: "",
        residence: {
          houseNo: "",
          street: "",
          barangay: "",
          cityMunicipality: "",
          province: "",
          country: "Philippines",
        },
        totalChildrenBornAlive: "",
        childrenStillLiving: "",
        childrenNowDead: "",
      },
      
      // === FATHER'S INFORMATION ===
      father: {
        name: {
          firstName: "",
          middleName: "",
          lastName: "",
        },
        citizenship: "Filipino",
        religion: "",
        occupation: "",
        ageAtBirth: "",
        residence: {
          houseNo: "",
          street: "",
          barangay: "",
          cityMunicipality: "",
          province: "",
          country: "Philippines",
        },
      },
      
      // === PARENTS' MARRIAGE ===
      parentsMarriage: {
        dateOfMarriage: "",
        placeOfMarriage: {
          cityMunicipality: "",
          province: "",
          country: "Philippines",
        },
      },
      
      // === REMARKS ===
      remarks: "",
    },
    psaCertificateFile: null,
  });

  // Preview states for ID uploads
  const [validIDPreview, setValidIDPreview] = useState(null);
  const [backOfValidIDPreview, setBackOfValidIDPreview] = useState(null);
  // New preview states for 2 ID system
  const [primaryID1Preview, setPrimaryID1Preview] = useState(null);
  const [primaryID1BackPreview, setPrimaryID1BackPreview] = useState(null);
  const [primaryID2Preview, setPrimaryID2Preview] = useState(null);
  const [primaryID2BackPreview, setPrimaryID2BackPreview] = useState(null);
  const [psaCertificatePreview, setPsaCertificatePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Valid Government IDs (Philippines) - Primary IDs only
  const governmentIDOptions = [
    { value: "", label: "Select ID Type" },
    { value: "philippine_passport", label: "Philippine Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "umid", label: "UMID (Unified Multi-Purpose ID)" },
    { value: "philhealth", label: "PhilHealth ID" },
    { value: "sss", label: "SSS ID" },
    { value: "prc", label: "PRC ID (Professional Regulation Commission)" },
    { value: "voters_id", label: "Voter's ID / COMELEC ID" },
    { value: "senior_citizen", label: "Senior Citizen ID" },
    { value: "pwd", label: "PWD ID" },
    { value: "philsys", label: "Philippine National ID (PhilSys)" },
    { value: "nbi_clearance", label: "NBI Clearance" },
    { value: "postal_id", label: "Postal ID" },
  ];

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

  // Area/Zone options for Barangay Culiat
  const areaOptions = [
    "Zone 1",
    "Zone 2",
    "Zone 3",
    "Zone 4",
    "Zone 5",
    "Zone 6",
    "Zone 7",
    "Zone 8",
    "Zone 9",
    "Zone 10",
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

  const handleFileChange = (e, fieldName = "validIDFile") => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const allowedTypesWithPDF = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      
      const typesToCheck = fieldName === "psaCertificateFile" ? allowedTypesWithPDF : allowedTypes;
      
      if (!typesToCheck.includes(file.type)) {
        setError(fieldName === "psaCertificateFile" 
          ? "Only JPG, JPEG, PNG, and PDF files are allowed" 
          : "Only JPG, JPEG, and PNG files are allowed");
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
      } else if (fieldName === "psaCertificateFile") {
        setFormData({ ...formData, psaCertificateFile: file });
        if (file.type === "application/pdf") {
          setPsaCertificatePreview("pdf");
        } else {
          setPsaCertificatePreview(URL.createObjectURL(file));
        }
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
    } else if (fieldName === "psaCertificateFile") {
      setFormData({ ...formData, psaCertificateFile: null });
      if (psaCertificatePreview && psaCertificatePreview !== "pdf") {
        URL.revokeObjectURL(psaCertificatePreview);
      }
      setPsaCertificatePreview(null);
    }
  };

  const validateStep = (step) => {
    setError("");

    if (step === 1) {
      if (
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill in all account fields");
        return false;
      }
      if (!validateEmail(formData.email)) {
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
      if (!formData.houseNumber || !formData.street) {
        setError("Please fill in your address");
        return false;
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
      // Validate Primary ID 1
      if (!formData.primaryID1Type) {
        setError("Please select the type of your first primary ID");
        return false;
      }
      if (!formData.primaryID1File) {
        setError("Please upload the front of your first primary ID");
        return false;
      }
      if (!formData.primaryID1BackFile) {
        setError("Please upload the back of your first primary ID");
        return false;
      }
      
      // Validate Primary ID 2
      if (!formData.primaryID2Type) {
        setError("Please select the type of your second primary ID");
        return false;
      }
      if (!formData.primaryID2File) {
        setError("Please upload the front of your second primary ID");
        return false;
      }
      if (!formData.primaryID2BackFile) {
        setError("Please upload the back of your second primary ID");
        return false;
      }
      
      // Check that both IDs are different types
      if (formData.primaryID1Type === formData.primaryID2Type) {
        setError("Please select two different types of government IDs");
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

  // Handle showing optional PSA step
  const handleShowOptionalPSA = () => {
    if (validateStep(currentStep)) {
      setShowOptionalPSA(true);
      setFormData(prev => ({ ...prev, skipPSAStep: false }));
    }
  };

  // Handle skipping PSA step
  const handleSkipPSA = () => {
    setShowOptionalPSA(false);
    setFormData(prev => ({ ...prev, skipPSAStep: true }));
    // Continue to submit
    setShowConfirmationModal(true);
  };

  // Handle PSA field changes
  const handlePSAChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newPSA = { ...prev.psaBirthCertificate };
      let current = newPSA;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return { ...prev, psaBirthCertificate: newPSA };
    });
  };

  // Toggle PSA sections
  const togglePSASection = (section) => {
    setPsaSections(prev => ({ ...prev, [section]: !prev[section] }));
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
      formDataToSend.append("email", formData.email);
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

      formDataToSend.append("address[houseNumber]", formData.houseNumber || "");
      formDataToSend.append("address[street]", formData.street || "");
      formDataToSend.append("address[subdivision]", formData.subdivision || "");
      if (formData.area)
        formDataToSend.append("address[area]", formData.area);

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

      // PSA Birth Certificate data (optional)
      formDataToSend.append("skipPSAStep", formData.skipPSAStep);
      
      if (!formData.skipPSAStep) {
        // Include PSA birth certificate data
        formDataToSend.append("birthCertificate", JSON.stringify(formData.psaBirthCertificate));
        
        // Include PSA certificate file if uploaded
        if (formData.psaCertificateFile) {
          formDataToSend.append("birthCertificateDoc", formData.psaCertificateFile);
        }
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
    // Show confirmation modal instead of direct submit
    setShowConfirmationModal(true);
  };

  const stepLabels = ['Account', 'Personal', 'Address', 'ID Upload', 'Terms'];
  
  const renderStepIndicator = () => (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="relative h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                currentStep > step
                  ? "bg-blue-600 text-white"
                  : currentStep === step
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
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
            <span className={`text-[9px] mt-1 font-medium transition-colors ${
              currentStep >= step ? 'text-slate-700' : 'text-slate-400'
            }`}>
              {stepLabels[step - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
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
            <User className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Choose a username"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Email *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.email ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm`}
            placeholder="your.email@example.com"
          />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Password *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-800">
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
              <Calendar className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
              <Phone className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className={`block w-full pl-10 pr-3 py-2 bg-slate-50 border ${fieldErrors.phoneNumber ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm`}
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
              <Briefcase className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
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
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
                        className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors pl-4"
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
                    className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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

      {formData.civilStatus === "Married" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
        >
          <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Spouse Information
          </h4>
          <input
            type="text"
            name="spouseName"
            value={formData.spouseName}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Spouse Full Name"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="spouseOccupation"
              value={formData.spouseOccupation}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
              placeholder="Spouse Occupation"
            />
            <input
              type="tel"
              name="spouseContact"
              value={formData.spouseContact}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" /> Your Address
      </h4>

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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Full Name"
          />
          <input
            type="text"
            name="emergencyRelationship"
            value={formData.emergencyRelationship}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm ${fieldErrors.emergencyContact ? 'border-red-500' : 'border-slate-200'}`}
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="House No."
          />
          <input
            type="text"
            name="emergencyStreet"
            value={formData.emergencyStreet}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
            placeholder="Street"
          />
          <input
            type="text"
            name="emergencySubdivision"
            value={formData.emergencySubdivision}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 text-xs"
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" /> ID Requirements
        </h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
          <li>2 different valid government-issued IDs required</li>
          <li>Both front and back of each ID must be uploaded</li>
          <li>Full name and address must be clearly visible on each ID</li>
          <li>Files must be JPG, JPEG, or PNG format (max 5MB each)</li>
        </ul>
      </div>

      {/* PRIMARY ID 1 */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-blue-600" />
          Primary Government ID #1 *
        </h4>
        
        {/* ID Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select ID Type *
          </label>
          <select
            name="primaryID1Type"
            value={formData.primaryID1Type}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            {governmentIDOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Front of ID 1 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Front of ID *
            </label>
            {!primaryID1Preview ? (
              <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-xs font-medium text-center">Upload Front</span>
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
                  alt="Primary ID 1 Front"
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

          {/* Back of ID 1 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Back of ID *
            </label>
            {!primaryID1BackPreview ? (
              <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
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
        </div>
      </div>

      {/* PRIMARY ID 2 */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-green-600" />
          Primary Government ID #2 *
        </h4>
        
        {/* ID Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select ID Type *
          </label>
          <select
            name="primaryID2Type"
            value={formData.primaryID2Type}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
            <p className="text-xs text-red-500 mt-1">Please select a different ID type from your first ID</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Front of ID 2 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Front of ID *
            </label>
            {!primaryID2Preview ? (
              <label className="flex flex-col items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-green-400 transition-all">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-xs font-medium text-center">Upload Front</span>
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
                  alt="Primary ID 2 Front"
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

          {/* Back of ID 2 */}
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
        </div>
      </div>

      {/* Upload Progress Indicator */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Upload Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {formData.primaryID1Type && formData.primaryID1File && formData.primaryID1BackFile ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            )}
            <span className={`text-xs ${formData.primaryID1Type && formData.primaryID1File && formData.primaryID1BackFile ? 'text-green-700' : 'text-slate-500'}`}>
              Primary ID #1: {formData.primaryID1Type ? governmentIDOptions.find(o => o.value === formData.primaryID1Type)?.label : 'Not selected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {formData.primaryID2Type && formData.primaryID2File && formData.primaryID2BackFile ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            )}
            <span className={`text-xs ${formData.primaryID2Type && formData.primaryID2File && formData.primaryID2BackFile ? 'text-green-700' : 'text-slate-500'}`}>
              Primary ID #2: {formData.primaryID2Type ? governmentIDOptions.find(o => o.value === formData.primaryID2Type)?.label : 'Not selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Review Your Information
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
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
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
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
        className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg"
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
            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
        <label
          htmlFor="termsAccepted"
          className="text-sm text-slate-700 cursor-pointer select-none"
        >
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="font-bold text-blue-700 hover:text-blue-800 underline transition-colors"
          >
            Terms and Conditions
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="font-bold text-blue-700 hover:text-blue-800 underline transition-colors"
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

  // Optional PSA Birth Certificate Step
  const renderOptionalPSAStep = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          PSA Birth Certificate Information
        </h3>
        <button
          type="button"
          onClick={handleSkipPSA}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Skip & Continue
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Why provide PSA Birth Certificate details?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Faster document request processing</li>
              <li>Pre-verified identity for barangay services</li>
              <li>Complete your profile now instead of later</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Certificate Details Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => togglePSASection('certificate')}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Certificate Details
          </span>
          {psaSections.certificate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {psaSections.certificate && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Certificate Number</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.certificateNumber}
                  onChange={(e) => handlePSAChange('certificateNumber', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Certificate #"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Registry Number</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.registryNumber}
                  onChange={(e) => handlePSAChange('registryNumber', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="e.g., 2000-12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date Issued</label>
                <input
                  type="date"
                  value={formData.psaBirthCertificate.dateIssued}
                  onChange={(e) => handlePSAChange('dateIssued', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Place Issued</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.placeIssued}
                  onChange={(e) => handlePSAChange('placeIssued', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Place issued"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.province}
                  onChange={(e) => handlePSAChange('province', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Province"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City/Municipality</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.cityMunicipality}
                  onChange={(e) => handlePSAChange('cityMunicipality', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="City/Municipality"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Your Information Section (As Registered on Birth Certificate) */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => togglePSASection('yourInfo')}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <Baby className="w-4 h-4" /> Your Information (As Registered)
          </span>
          {psaSections.yourInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {psaSections.yourInfo && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-500 mb-2">Name as it appears on your birth certificate</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.firstName}
                  onChange={(e) => handlePSAChange('yourInfo.firstName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.middleName}
                  onChange={(e) => handlePSAChange('yourInfo.middleName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Middle Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.lastName}
                  onChange={(e) => handlePSAChange('yourInfo.lastName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sex</label>
                <select
                  value={formData.psaBirthCertificate.yourInfo.sex}
                  onChange={(e) => handlePSAChange('yourInfo.sex', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.psaBirthCertificate.yourInfo.dateOfBirth}
                  onChange={(e) => handlePSAChange('yourInfo.dateOfBirth', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 mb-2">Place of Birth</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hospital/Institution</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.placeOfBirth.hospital}
                  onChange={(e) => handlePSAChange('yourInfo.placeOfBirth.hospital', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Hospital name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City/Municipality</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.placeOfBirth.cityMunicipality}
                  onChange={(e) => handlePSAChange('yourInfo.placeOfBirth.cityMunicipality', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.placeOfBirth.province}
                  onChange={(e) => handlePSAChange('yourInfo.placeOfBirth.province', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Province"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type of Birth</label>
                <select
                  value={formData.psaBirthCertificate.yourInfo.typeOfBirth}
                  onChange={(e) => handlePSAChange('yourInfo.typeOfBirth', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  <option value="Single">Single</option>
                  <option value="Twin">Twin</option>
                  <option value="Triplet">Triplet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Birth Order</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.birthOrder}
                  onChange={(e) => handlePSAChange('yourInfo.birthOrder', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="e.g., 1st, 2nd"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Birth Weight (g)</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.yourInfo.birthWeight}
                  onChange={(e) => handlePSAChange('yourInfo.birthWeight', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Weight in grams"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mother's Information Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => togglePSASection('mother')}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4" /> Mother's Information
          </span>
          {psaSections.mother ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {psaSections.mother && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-500 mb-2">Mother's Maiden Name</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.maidenName.firstName}
                  onChange={(e) => handlePSAChange('mother.maidenName.firstName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.maidenName.middleName}
                  onChange={(e) => handlePSAChange('mother.maidenName.middleName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Middle Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Last Name (Maiden)</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.maidenName.lastName}
                  onChange={(e) => handlePSAChange('mother.maidenName.lastName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Citizenship</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.citizenship}
                  onChange={(e) => handlePSAChange('mother.citizenship', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="e.g., Filipino"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.religion}
                  onChange={(e) => handlePSAChange('mother.religion', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Religion"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.occupation}
                  onChange={(e) => handlePSAChange('mother.occupation', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Occupation"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Age at Your Birth</label>
                <input
                  type="number"
                  value={formData.psaBirthCertificate.mother.ageAtBirth}
                  onChange={(e) => handlePSAChange('mother.ageAtBirth', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Age"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 mb-2">Residence at Time of Birth</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">House No.</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.residence.houseNo}
                  onChange={(e) => handlePSAChange('mother.residence.houseNo', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="House No."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Street</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.residence.street}
                  onChange={(e) => handlePSAChange('mother.residence.street', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Street"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Barangay</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.residence.barangay}
                  onChange={(e) => handlePSAChange('mother.residence.barangay', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Barangay"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City/Municipality</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.residence.cityMunicipality}
                  onChange={(e) => handlePSAChange('mother.residence.cityMunicipality', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.residence.province}
                  onChange={(e) => handlePSAChange('mother.residence.province', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Province"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.mother.residence.country}
                  onChange={(e) => handlePSAChange('mother.residence.country', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Country"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 mb-2">Children Information</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Total Born Alive</label>
                <input
                  type="number"
                  value={formData.psaBirthCertificate.mother.totalChildrenBornAlive}
                  onChange={(e) => handlePSAChange('mother.totalChildrenBornAlive', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Total"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Still Living</label>
                <input
                  type="number"
                  value={formData.psaBirthCertificate.mother.childrenStillLiving}
                  onChange={(e) => handlePSAChange('mother.childrenStillLiving', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Living"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Now Dead</label>
                <input
                  type="number"
                  value={formData.psaBirthCertificate.mother.childrenNowDead}
                  onChange={(e) => handlePSAChange('mother.childrenNowDead', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Deceased"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Father's Information Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => togglePSASection('father')}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4" /> Father's Information
          </span>
          {psaSections.father ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {psaSections.father && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-500 mb-2">Father's Name</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.name.firstName}
                  onChange={(e) => handlePSAChange('father.name.firstName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.name.middleName}
                  onChange={(e) => handlePSAChange('father.name.middleName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Middle Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.name.lastName}
                  onChange={(e) => handlePSAChange('father.name.lastName', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Citizenship</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.citizenship}
                  onChange={(e) => handlePSAChange('father.citizenship', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="e.g., Filipino"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.religion}
                  onChange={(e) => handlePSAChange('father.religion', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Religion"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.occupation}
                  onChange={(e) => handlePSAChange('father.occupation', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Occupation"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Age at Your Birth</label>
                <input
                  type="number"
                  value={formData.psaBirthCertificate.father.ageAtBirth}
                  onChange={(e) => handlePSAChange('father.ageAtBirth', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Age"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 mb-2">Residence at Time of Birth</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">House No.</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.residence.houseNo}
                  onChange={(e) => handlePSAChange('father.residence.houseNo', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="House No."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Street</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.residence.street}
                  onChange={(e) => handlePSAChange('father.residence.street', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Street"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Barangay</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.residence.barangay}
                  onChange={(e) => handlePSAChange('father.residence.barangay', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Barangay"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City/Municipality</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.residence.cityMunicipality}
                  onChange={(e) => handlePSAChange('father.residence.cityMunicipality', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.residence.province}
                  onChange={(e) => handlePSAChange('father.residence.province', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Province"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.father.residence.country}
                  onChange={(e) => handlePSAChange('father.residence.country', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parents' Marriage Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => togglePSASection('marriage')}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Parents' Marriage (if applicable)
          </span>
          {psaSections.marriage ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {psaSections.marriage && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of Marriage</label>
                <input
                  type="date"
                  value={formData.psaBirthCertificate.parentsMarriage.dateOfMarriage}
                  onChange={(e) => handlePSAChange('parentsMarriage.dateOfMarriage', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City/Municipality</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.parentsMarriage.placeOfMarriage.cityMunicipality}
                  onChange={(e) => handlePSAChange('parentsMarriage.placeOfMarriage.cityMunicipality', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="City/Municipality"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.psaBirthCertificate.parentsMarriage.placeOfMarriage.province}
                  onChange={(e) => handlePSAChange('parentsMarriage.placeOfMarriage.province', e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  placeholder="Province"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remarks Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Remarks (Optional)</label>
        <textarea
          value={formData.psaBirthCertificate.remarks}
          onChange={(e) => handlePSAChange('remarks', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          rows={2}
          placeholder="Any additional remarks or annotations on the certificate..."
        />
      </div>

      {/* PSA Certificate Upload */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          Upload PSA Birth Certificate
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Upload a scanned copy or photo of your PSA Birth Certificate (JPG, PNG, or PDF)
        </p>

        {!psaCertificatePreview ? (
          <label className="flex flex-col items-center px-6 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
            <Upload className="w-10 h-10 mb-2 text-slate-400" />
            <span className="text-sm font-medium">Click to upload PSA Certificate</span>
            <span className="text-xs mt-1">JPG, PNG, or PDF (Max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e, "psaCertificateFile")}
            />
          </label>
        ) : (
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {psaCertificatePreview === "pdf" ? (
              <div className="flex items-center justify-center p-6 bg-slate-100 border-2 border-slate-200 rounded-lg">
                <FileText className="w-12 h-12 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-700">PDF Document</p>
                  <p className="text-xs text-slate-500">{formData.psaCertificateFile?.name}</p>
                </div>
              </div>
            ) : (
              <img
                src={psaCertificatePreview}
                alt="PSA Certificate Preview"
                className="w-full h-48 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
              />
            )}
            <button
              type="button"
              onClick={() => removeFile("psaCertificateFile")}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={handleSkipPSA}
          className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          Skip & Register
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, skipPSAStep: false }));
            // Proceed directly to registration since user will provide PSA info
            performRegistration();
          }}
          className="flex-1 bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1557b0] hover:to-[#0d47a1] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg text-sm"
        >
          Register with PSA Info
        </button>
      </div>
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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Terms & Conditions</h2>
                  <p className="text-sm text-slate-600">Barangay Culiat Resident Registration</p>
                </div>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-6"
              onScroll={handleTermsScroll}
            >
              {/* Privacy Policy Section */}
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                  Privacy Policy
                </h3>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <p>
                    Barangay Culiat ("we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you register and use our barangay services.
                  </p>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Information We Collect</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Personal identification information (Name, Date of Birth, Gender)</li>
                      <li>Contact information (Phone number, Email address)</li>
                      <li>Address and residency information</li>
                      <li>Government-issued identification documents</li>
                      <li>PSA Birth Certificate details (if provided)</li>
                      <li>Emergency contact information</li>
                    </ul>
                  </div>

                  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">How We Use Your Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Process your resident registration and verification</li>
                      <li>Provide access to barangay services and document requests</li>
                      <li>Send important announcements and emergency notifications</li>
                      <li>Maintain accurate records for government reporting</li>
                      <li>Improve our services and user experience</li>
                      <li>Comply with legal obligations and regulations</li>
                    </ul>
                  </div>

                  <p>
                    <strong>Data Security:</strong> We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely and access is restricted to authorized personnel only.
                  </p>

                  <p>
                    <strong>Data Retention:</strong> We retain your personal information for as long as your account is active or as needed to provide services. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce agreements.
                  </p>
                </div>
              </section>

              {/* Terms of Service */}
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                  Terms of Service
                </h3>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <p>
                    By registering for Barangay Culiat services, you agree to comply with and be bound by the following terms and conditions. Please review these terms carefully.
                  </p>

                  <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Account Registration</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>You must be a resident or stakeholder of Barangay Culiat to register</li>
                      <li>You must provide accurate and complete information</li>
                      <li>You are responsible for maintaining the confidentiality of your account</li>
                      <li>Your registration is subject to admin verification and approval</li>
                      <li>False information may result in account suspension or termination</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">User Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Provide truthful and accurate information during registration</li>
                      <li>Update your profile information when changes occur</li>
                      <li>Complete PSA Birth Certificate verification within 90 days (if applicable)</li>
                      <li>Use the services in compliance with applicable laws and regulations</li>
                      <li>Respect the privacy and rights of other users</li>
                      <li>Report any suspicious activity or security concerns</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Account Restrictions</h4>
                    <p className="text-sm mb-2">Your account may be suspended or terminated if you:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Provide false or misleading information</li>
                      <li>Violate any terms or conditions</li>
                      <li>Fail to complete PSA verification within 90 days</li>
                      <li>Engage in fraudulent or illegal activities</li>
                      <li>Abuse or misuse barangay services</li>
                    </ul>
                  </div>

                  <p>
                    <strong>Service Availability:</strong> While we strive to provide uninterrupted service, we do not guarantee that our services will be available at all times. We may suspend or discontinue services for maintenance, updates, or other reasons without prior notice.
                  </p>
                </div>
              </section>

              {/* User Rights */}
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                  Your Rights
                </h3>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <p>Under the Data Privacy Act of 2012 (Republic Act No. 10173), you have the following rights:</p>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Right to Access
                      </h4>
                      <p className="text-sm">Request access to your personal information we hold</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Right to Correction
                      </h4>
                      <p className="text-sm">Request correction of inaccurate information</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Right to Erasure
                      </h4>
                      <p className="text-sm">Request deletion of your personal data</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Right to Object
                      </h4>
                      <p className="text-sm">Object to processing of your personal information</p>
                    </div>
                  </div>

                  <p className="text-sm">
                    To exercise these rights or for any privacy concerns, please contact the Barangay Data Protection Officer at <strong>dpo@barangayculiat.gov.ph</strong>
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                  Contact & Updates
                </h3>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <p>
                    <strong>Questions or Concerns:</strong> If you have questions about these terms or our privacy practices, please contact us at:
                  </p>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm space-y-1">
                      <strong>Barangay Culiat, Quezon City</strong><br />
                      Email: info@barangayculiat.gov.ph<br />
                      Phone: (02) 8XXX-XXXX<br />
                      Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
                    </p>
                  </div>

                  <p className="text-sm">
                    <strong>Changes to Terms:</strong> We reserve the right to modify these terms at any time. Significant changes will be communicated through email or system notifications. Continued use of services after changes constitutes acceptance of updated terms.
                  </p>

                  <p className="text-sm">
                    <strong>Last Updated:</strong> January 6, 2026
                  </p>
                </div>
              </section>

              {/* Scroll indicator */}
              {!canAcceptTerms && (
                <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4">
                  <div className="flex items-center justify-center gap-2 text-blue-600 animate-bounce">
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
                    "Please read all terms and conditions"
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
                    className={`flex-1 sm:flex-none px-6 py-3 font-semibold rounded-lg transition-all ${
                      canAcceptTerms
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
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

  // Confirmation Modal
  const renderConfirmationModal = () => (
    <AnimatePresence>
      {showConfirmationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Important Notice
              </h3>
              <p className="text-slate-600 text-sm">
                Please read carefully before completing registration
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Profile Completion Requirement
              </h4>
              <ul className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You have <strong className="text-amber-900">90 days</strong> from registration to complete your profile with PSA birth certificate information.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You must upload a copy of your <strong className="text-amber-900">PSA Birth Certificate</strong> for verification.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    If not completed within 90 days, your account will be <strong className="text-red-700">locked</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    To unlock, complete the missing fields and wait for <strong className="text-amber-900">admin review</strong>.
                  </span>
                </li>
              </ul>
            </div>

            {formData.skipPSAStep && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    You can complete your PSA birth certificate details anytime from your profile page after registration.
                  </span>
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="acceptDeadlineTerms"
                checked={acceptedDeadlineTerms}
                onChange={(e) => setAcceptedDeadlineTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="acceptDeadlineTerms" className="text-sm text-slate-700 cursor-pointer">
                I understand and agree that I must complete my profile with PSA birth certificate information within <strong>90 days</strong>, or my account may be locked until verification is complete.
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmationModal(false);
                  setAcceptedDeadlineTerms(false);
                  setError("");
                }}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedSubmit}
                disabled={!acceptedDeadlineTerms || loading}
                className="flex-1 bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1557b0] hover:to-[#0d47a1] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Confirm & Register"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-auto">
      {/* Premium Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[340px] xl:w-[400px] relative bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0d2847] overflow-hidden flex-col">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-5 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 flex flex-col h-full p-8 xl:p-10">
          {/* Header with Logo */}
          <Link to="/" className="group inline-flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <img
                src="/images/logo/brgy-culiat-logo.svg"
                alt="Logo"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <span className="block text-white/90 font-semibold text-sm tracking-wide">Barangay</span>
              <span className="block text-white font-bold text-lg -mt-0.5">Culiat</span>
            </div>
          </Link>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center -mt-10">
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full mb-4 border border-blue-400/20">
                  Resident Portal
                </span>
                <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                  Join Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    Community Today
                  </span>
                </h1>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                Register to access barangay services, request documents, and stay connected with your community.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-white text-xs font-semibold">Document Requests</span>
                  <span className="text-white/50 text-[10px]">Barangay clearance, certificates & more</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-white text-xs font-semibold">Quick Verification</span>
                  <span className="text-white/50 text-[10px]">Fast approval with valid ID</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block text-white text-xs font-semibold">Stay Informed</span>
                  <span className="text-white/50 text-[10px]">Announcements & emergency alerts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-white/40 text-[10px]">
              � 2025 Barangay Culiat, Quezon City
            </p>
            <p className="text-white/30 text-[10px] mt-1">
              Secure � Trusted � Community-Driven
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-y-auto">
        <Link
          to="/"
          className="lg:hidden absolute top-4 left-4 inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-xs font-medium group z-20"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        {/* Subtle Background for Mobile */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-50 rounded-full opacity-30 blur-3xl"></div>
        </div>

        <div className="w-full max-w-xl relative my-auto">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-5 mt-10">
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
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
            <div className="p-5 md:p-6">
              {/* Form Header */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-slate-800">
                    Create Account
                  </h2>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {showOptionalPSA ? 'Optional' : `Step ${currentStep}/5`}
                  </span>
                </div>
                <p className="text-slate-500 text-xs">
                  {showOptionalPSA ? (
                    "PSA Birth Certificate Information"
                  ) : (
                    <>
                      {currentStep === 1
                        ? "Set up your login credentials"
                        : currentStep === 2
                        ? "Tell us about yourself"
                        : currentStep === 3
                        ? "Your address & emergency contact"
                        : currentStep === 4
                        ? "Upload valid government ID"
                        : "Review and accept terms"}
                    </>
                  )}
                </p>
              </div>

              {!showOptionalPSA && renderStepIndicator()}

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
                  {showOptionalPSA ? (
                    renderOptionalPSAStep()
                  ) : (
                    <>
                      {currentStep === 1 && renderStep1()}
                      {currentStep === 2 && renderStep2()}
                      {currentStep === 3 && renderStep3()}
                      {currentStep === 4 && renderStep4()}
                      {currentStep === 5 && renderStep5()}
                    </>
                  )}
                </AnimatePresence>

                {!showOptionalPSA && (
                  <div className="flex gap-2.5 mt-5">
                    {currentStep > 1 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors text-xs"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Previous
                      </motion.button>
                    )}

                    {currentStep < 5 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Continue
                      </motion.button>
                    ) : (
                      <div className="flex-1 flex flex-col gap-3">
                        {/* Main Submit Button */}
                        <motion.button
                          type="submit"
                          disabled={loading || !formData.termsAccepted}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                          whileHover={{
                            scale: loading || !formData.termsAccepted ? 1 : 1.01,
                          }}
                          whileTap={{
                            scale: loading || !formData.termsAccepted ? 1 : 0.99,
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {loading ? "Processing..." : "Complete Registration"}
                        </motion.button>
                        
                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center text-[10px]">
                            <span className="bg-white px-2 text-slate-400">or add optional info</span>
                          </div>
                        </div>
                        
                        {/* Optional PSA button */}
                        <motion.button
                          type="button"
                          onClick={handleShowOptionalPSA}
                          disabled={!formData.termsAccepted}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-dashed border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: formData.termsAccepted ? 1.01 : 1 }}
                          whileTap={{ scale: formData.termsAccepted ? 0.99 : 1 }}
                        >
                          <FileCheck className="w-4 h-4" />
                          Add PSA Birth Certificate (Optional)
                        </motion.button>
                        
                        <p className="text-[10px] text-center text-slate-400 -mt-1">
                          Complete later within 90 days
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </form>

              {/* Render Confirmation Modal */}
              {renderConfirmationModal()}

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
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
      {renderConfirmationModal()}
    </div>
  );
};

export default Register;
