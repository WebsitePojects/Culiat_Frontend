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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [occupationSearch, setOccupationSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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
    validIDFile: null,
    backOfValidIDFile: null,
    termsAccepted: false,
  });

  const [validIDPreview, setValidIDPreview] = useState(null);
  const [backOfValidIDPreview, setBackOfValidIDPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG files are allowed");
        return;
      }

      if (file.size > 5242880) {
        setError("File size must not exceed 5MB");
        return;
      }

      if (fieldName === "validIDFile") {
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
    if (fieldName === "validIDFile") {
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
      if (!formData.validIDFile) {
        setError("Please upload a valid ID");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateStep(5)) {
      return;
    }

    setLoading(true);

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

      formDataToSend.append("validID", formData.validIDFile);
      if (formData.backOfValidIDFile) {
        formDataToSend.append("backOfValidID", formData.backOfValidIDFile);
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center flex-1">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              currentStep >= step
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
            initial={false}
            animate={{
              scale: currentStep === step ? [1, 1.1, 1] : 1,
              backgroundColor: currentStep >= step ? "#2563eb" : "#e2e8f0",
            }}
            transition={{ duration: 0.3 }}
          >
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </motion.div>
          {step < 5 && (
            <motion.div
              className={`flex-1 h-1 mx-2 transition-all ${
                currentStep > step ? "bg-blue-600" : "bg-slate-200"
              }`}
              initial={false}
              animate={{
                scaleX: currentStep > step ? 1 : 0.5,
                backgroundColor: currentStep > step ? "#2563eb" : "#e2e8f0",
              }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Username *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Choose a username"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Email *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 ${fieldErrors.email ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm`}
            placeholder="your.email@example.com"
          />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Password *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
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
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Confirm Password *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Juan"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Dela Cruz"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Santos"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Suffix
          </label>
          <select
            name="suffix"
            value={formData.suffix}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Date of Birth *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Sex *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Place of Birth
        </label>
        <input
          type="text"
          name="placeOfBirth"
          value={formData.placeOfBirth}
          onChange={handleChange}
          className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
          placeholder="Quezon City"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Civil Status *
          </label>
          <select
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Phone Number *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 ${fieldErrors.phoneNumber ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm`}
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Occupation
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
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
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Search or select occupation"
              autoComplete="off"
            />
          </div>
          {showOccupationDropdown && filteredOccupations.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredOccupations.map((occ) => (
                <div
                  key={occ}
                  className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
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
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Religion
          </label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
            className="block w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Spouse Full Name"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="spouseOccupation"
              value={formData.spouseOccupation}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Spouse Occupation"
            />
            <input
              type="tel"
              name="spouseContact"
              value={formData.spouseContact}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            House No. *
          </label>
          <input
            type="text"
            name="houseNumber"
            value={formData.houseNumber}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="123"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Street *
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Main Street"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Subdivision
          </label>
          <input
            type="text"
            name="subdivision"
            value={formData.subdivision}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Village"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Area / Zone
          </label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 text-sm"
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
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Full Name"
          />
          <input
            type="text"
            name="emergencyRelationship"
            value={formData.emergencyRelationship}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
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
            className={`block w-full px-3 py-2.5 bg-slate-50 border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm ${fieldErrors.emergencyContact ? 'border-red-500' : 'border-slate-200'}`}
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
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="House No."
          />
          <input
            type="text"
            name="emergencyStreet"
            value={formData.emergencyStreet}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Street"
          />
          <input
            type="text"
            name="emergencySubdivision"
            value={formData.emergencySubdivision}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="Subdivision"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            TIN Number
          </label>
          <input
            type="text"
            name="tinNumber"
            value={formData.tinNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="000-000-000"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            SSS/GSIS Number
          </label>
          <input
            type="text"
            name="sssGsisNumber"
            value={formData.sssGsisNumber}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 text-sm"
            placeholder="00-0000000-0"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-blue-600" />
          Upload Valid ID (Front) *
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Upload a clear photo of the front of your valid ID (Government ID, Driver's
          License, Passport, etc.)
        </p>

        {!validIDPreview ? (
          <label className="flex flex-col items-center px-6 py-8 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
            <Upload className="w-12 h-12 mb-3 text-slate-400" />
            <span className="text-sm font-medium">
              Click to upload Valid ID (Front)
            </span>
            <span className="text-xs mt-1">JPG, JPEG, PNG (Max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => handleFileChange(e, "validIDFile")}
              required
            />
          </label>
        ) : (
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={validIDPreview}
              alt="Valid ID Front Preview"
              className="w-full h-48 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
            />
            <button
              type="button"
              onClick={() => removeFile("validIDFile")}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <IdCard className="h-4 w-4 text-blue-600" />
          Upload Valid ID (Back)
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Upload a clear photo of the back of your valid ID (optional but recommended)
        </p>

        {!backOfValidIDPreview ? (
          <label className="flex flex-col items-center px-6 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
            <Upload className="w-10 h-10 mb-2 text-slate-400" />
            <span className="text-sm font-medium">
              Click to upload Valid ID (Back)
            </span>
            <span className="text-xs mt-1">JPG, JPEG, PNG (Max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => handleFileChange(e, "backOfValidIDFile")}
            />
          </label>
        ) : (
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={backOfValidIDPreview}
              alt="Valid ID Back Preview"
              className="w-full h-48 object-contain border-2 border-slate-200 rounded-lg bg-slate-50"
            />
            <button
              type="button"
              onClick={() => removeFile("backOfValidIDFile")}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

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
          administrators. You will receive an email notification once your
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
          <span className="font-bold text-blue-700">Terms and Conditions</span>{" "}
          and <span className="font-bold text-blue-700">Privacy Policy</span> of
          Barangay Culiat. I understand that my registration is subject to
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

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-auto">
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 text-sm font-medium group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="mb-6">
            <div className="w-20 h-20 bg-white/95 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-blue-500/30 mb-4">
              <img
                src="/images/logo/brgy-culiat-logo.svg"
                alt="Barangay Culiat Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Join Barangay Culiat
              <span className="block text-white/90 text-2xl xl:text-3xl mt-2">
                Resident Registration
              </span>
            </h1>

            <p className="text-lg text-white/90 mb-6 leading-relaxed">
              Register now to access barangay services, submit reports, and stay
              connected with your community.
            </p>

            <div className="space-y-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-bold text-base mb-1.5 flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  Quick Access
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Get instant access to document requests and barangay services
                  once approved.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-bold text-base mb-1.5 flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  Stay Updated
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Receive important announcements and updates from your
                  barangay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-4 md:p-8 relative overflow-y-auto">
        <Link
          to="/"
          className="lg:hidden absolute top-4 left-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group z-20"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="w-full max-w-2xl relative my-auto">
          <div className="lg:hidden text-center mb-6 mt-12">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl ring-2 ring-blue-500/30">
              <img
                src="/images/logo/brgy-culiat-logo.svg"
                alt="Barangay Culiat Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-1">
              Barangay Culiat
            </h1>
            <p className="text-slate-600 text-sm">Resident Registration</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1.5">
                  Create Your Account
                </h2>
                <p className="text-slate-500 text-sm">
                  Step {currentStep} of 5:{" "}
                  {currentStep === 1
                    ? "Account Credentials"
                    : currentStep === 2
                    ? "Personal Information"
                    : currentStep === 3
                    ? "Address & Contact"
                    : currentStep === 4
                    ? "Valid ID Upload"
                    : "Terms & Conditions"}
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
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </AnimatePresence>

                <div className="flex gap-3 mt-6">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Previous
                    </motion.button>
                  )}

                  {currentStep < 5 ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1557b0] hover:to-[#0d47a1] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm tracking-wide"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Next Step
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={loading || !formData.termsAccepted}
                      className="flex-1 bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1557b0] hover:to-[#0d47a1] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                      whileHover={{
                        scale: loading || !formData.termsAccepted ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: loading || !formData.termsAccepted ? 1 : 0.98,
                      }}
                    >
                      {loading ? "Submitting..." : "Complete Registration"}
                    </motion.button>
                  )}
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 px-6 md:px-8 py-3 text-center border-t border-slate-200">
              <p className="text-xs text-slate-600 font-medium">
                © 2025 Barangay Culiat. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
