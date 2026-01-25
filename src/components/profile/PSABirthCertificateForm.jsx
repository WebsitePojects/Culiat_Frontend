import { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  FileText, ChevronDown, ChevronUp, Upload, Loader2, CheckCircle,
  User, Users, Heart, AlertCircle, FileSignature
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Memoized Input Field Component - defined OUTSIDE the main component to prevent re-creation
const InputField = memo(({ label, name, value, onChange, type = 'text', required = false, placeholder = '', options = null }) => {
  if (options) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          required={required}
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
});

InputField.displayName = 'InputField';

/**
 * Comprehensive PSA Birth Certificate Form
 * Based on actual Philippine Statistics Authority (PSA) Birth Certificate fields
 */
const PSABirthCertificateForm = ({ existingData = null, onSuccess, isUpdate = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [filePreview, setFilePreview] = useState(existingData?.documentUrl || null);

  // Collapsible section states
  const [sections, setSections] = useState({
    certificate: true,
    yourInfo: true,
    mother: false,
    father: false,
    marriage: false,
  });

  // Form state - comprehensive PSA Birth Certificate fields
  const [formData, setFormData] = useState({
    // Certificate Details
    certificateNumber: '',
    registryNumber: '',
    dateIssued: '',
    placeIssued: '',
    province: '',
    cityMunicipality: '',

    // Your Information (the registered person)
    yourInfo: {
      firstName: '',
      middleName: '',
      lastName: '',
      sex: '',
      dateOfBirth: '',
      placeOfBirth: {
        hospital: '',
        cityMunicipality: '',
        province: '',
      },
      typeOfBirth: 'Single',
      birthOrder: '',
      birthWeight: '',
    },

    // Mother's Information
    mother: {
      maidenName: {
        firstName: '',
        middleName: '',
        lastName: '',
      },
      citizenship: 'Filipino',
      religion: '',
      occupation: '',
      ageAtBirth: '',
      residence: {
        houseNo: '',
        street: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: 'Philippines',
      },
      totalChildrenBornAlive: '',
      childrenStillLiving: '',
      childrenNowDead: '',
    },

    // Father's Information
    father: {
      name: {
        firstName: '',
        middleName: '',
        lastName: '',
      },
      citizenship: 'Filipino',
      religion: '',
      occupation: '',
      ageAtBirth: '',
      residence: {
        houseNo: '',
        street: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: 'Philippines',
      },
    },

    // Parents Marriage
    parentsMarriage: {
      dateOfMarriage: '',
      placeOfMarriage: {
        cityMunicipality: '',
        province: '',
        country: 'Philippines',
      },
    },

    // Remarks
    remarks: '',
  });

  // Deep merge helper function
  const deepMerge = useCallback((target, source) => {
    const result = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
        result[key] = deepMerge(target[key], source[key]);
      } else if (source[key] !== undefined && source[key] !== null) {
        result[key] = source[key];
      }
    }
    return result;
  }, []);

  // Pre-fill form if existingData is provided
  useEffect(() => {
    if (existingData) {
      // Map 'child' to 'yourInfo' if existingData has 'child' key
      const mappedData = { ...existingData };
      if (existingData.child) {
        mappedData.yourInfo = existingData.child;
        delete mappedData.child;
      }
      setFormData(prev => deepMerge(prev, mappedData));
      if (existingData.documentUrl) {
        setFilePreview(existingData.documentUrl);
      }
    }
  }, [existingData, deepMerge]);

  // Get nested value from object using dot notation
  const getNestedValue = useCallback((obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }, []);

  // Handle input change with nested object support
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const keys = name.split('.');
      if (keys.length === 1) {
        return { ...prev, [name]: value };
      }

      // Deep clone and update nested value
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  // Toggle section collapse
  const toggleSection = useCallback((section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setDocumentFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview('pdf');
      }
    }
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.certificateNumber || !formData.registryNumber) {
      toast.error('Certificate Number and Registry Number are required');
      return;
    }

    if (!documentFile && !filePreview) {
      toast.error('Please upload your PSA Birth Certificate document');
      return;
    }

    // Validate required parent info
    if (!formData.mother?.maidenName?.firstName || !formData.mother?.maidenName?.lastName) {
      toast.error('Mother\'s maiden name is required');
      return;
    }

    if (!formData.father?.name?.firstName || !formData.father?.name?.lastName) {
      toast.error('Father\'s name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // For initial submission (profile-verification), send flat fields that backend expects
      if (!isUpdate) {
        // Certificate details
        submitData.append('certificateNumber', formData.certificateNumber || '');
        submitData.append('registryNumber', formData.registryNumber || '');
        submitData.append('dateIssued', formData.dateIssued || '');
        submitData.append('placeOfRegistration', `${formData.cityMunicipality || ''}, ${formData.province || ''}`);

        // Father's info - flat fields as backend expects
        submitData.append('fatherFirstName', formData.father?.name?.firstName || '');
        submitData.append('fatherMiddleName', formData.father?.name?.middleName || '');
        submitData.append('fatherLastName', formData.father?.name?.lastName || '');
        submitData.append('fatherNationality', formData.father?.citizenship || 'Filipino');

        // Mother's info - flat fields as backend expects
        submitData.append('motherFirstName', formData.mother?.maidenName?.firstName || '');
        submitData.append('motherMiddleName', formData.mother?.maidenName?.middleName || '');
        submitData.append('motherMaidenLastName', formData.mother?.maidenName?.lastName || '');
        submitData.append('motherNationality', formData.mother?.citizenship || 'Filipino');
      } else {
        // For updates (profile-update), send nested structure
        submitData.append('updateType', 'birth_certificate');

        // Flatten nested objects for FormData
        const flattenObject = (obj, prefix = '') => {
          const flattened = {};
          for (const key in obj) {
            const value = obj[key];
            // Map 'yourInfo' back to 'child' for backend compatibility
            const newKey = prefix ? `${prefix}.${key}` : (key === 'yourInfo' ? 'child' : key);

            if (value instanceof Object && !Array.isArray(value) && !(value instanceof File)) {
              Object.assign(flattened, flattenObject(value, newKey));
            } else if (value !== '' && value !== null && value !== undefined) {
              flattened[newKey] = value;
            }
          }
          return flattened;
        };

        const flatData = flattenObject(formData);

        // Append all data to FormData
        for (const [key, value] of Object.entries(flatData)) {
          submitData.append(key, value);
        }
      }

      // Append file if new one selected, otherwise send existing document URL
      if (documentFile) {
        submitData.append('birthCertificate', documentFile);
      } else if (existingData?.documentUrl) {
        // Send existing document URL if no new file uploaded
        submitData.append('documentUrl', existingData.documentUrl);
      }

      // Choose endpoint based on whether this is an update or initial submission
      const endpoint = isUpdate
        ? `${API_URL}/api/profile-update/submit`
        : `${API_URL}/api/profile-verification/submit`;

      const response = await axios.post(endpoint, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(isUpdate
          ? 'Update request submitted for admin review!'
          : 'PSA verification submitted successfully!'
        );
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section header component
  const SectionHeader = ({ title, icon: Icon, section, color = 'primary' }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${color === 'primary' ? 'bg-emerald-50 hover:bg-emerald-100' :
          color === 'pink' ? 'bg-pink-50 hover:bg-pink-100' :
            color === 'purple' ? 'bg-purple-50 hover:bg-purple-100' :
              color === 'indigo' ? 'bg-indigo-50 hover:bg-indigo-100' :
                color === 'rose' ? 'bg-rose-50 hover:bg-rose-100' :
                  color === 'teal' ? 'bg-teal-50 hover:bg-teal-100' :
                    'bg-gray-50 hover:bg-gray-100'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color === 'primary' ? 'text-primary' :
            color === 'pink' ? 'text-pink-600' :
              color === 'purple' ? 'text-purple-600' :
                color === 'indigo' ? 'text-indigo-600' :
                  color === 'rose' ? 'text-rose-600' :
                    color === 'teal' ? 'text-teal-600' :
                      'text-gray-600'
          }`} />
        <span className={`font-semibold ${color === 'primary' ? 'text-emerald-800' :
            color === 'pink' ? 'text-pink-800' :
              color === 'purple' ? 'text-purple-800' :
                color === 'indigo' ? 'text-indigo-800' :
                  color === 'rose' ? 'text-rose-800' :
                    color === 'teal' ? 'text-teal-800' :
                      'text-gray-800'
          }`}>{title}</span>
      </div>
      {sections[section] ? (
        <ChevronUp className={`w-5 h-5 ${color === 'primary' ? 'text-primary' :
            color === 'pink' ? 'text-pink-600' :
              color === 'purple' ? 'text-purple-600' :
                color === 'indigo' ? 'text-indigo-600' :
                  color === 'rose' ? 'text-rose-600' :
                    color === 'teal' ? 'text-teal-600' :
                      'text-gray-600'
          }`} />
      ) : (
        <ChevronDown className={`w-5 h-5 ${color === 'primary' ? 'text-primary' :
            color === 'pink' ? 'text-pink-600' :
              color === 'purple' ? 'text-purple-600' :
                color === 'indigo' ? 'text-indigo-600' :
                  color === 'rose' ? 'text-rose-600' :
                    color === 'teal' ? 'text-teal-600' :
                      'text-gray-600'
          }`} />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          PSA Birth Certificate Information
        </h2>
        <p className="text-emerald-100 text-sm mt-1">
          {isUpdate
            ? 'Update your birth certificate information. Changes will require admin approval.'
            : 'Complete all required fields based on your PSA Birth Certificate.'}
        </p>
      </div>

      {isUpdate && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Updates will be submitted for admin review before being applied.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Certificate Details Section */}
        <div className="space-y-4">
          <SectionHeader title="Certificate Details" icon={FileSignature} section="certificate" />
          {sections.certificate && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
              <InputField label="Certificate Number" name="certificateNumber" value={formData.certificateNumber} onChange={handleInputChange} required placeholder="e.g., 2020-123456" />
              <InputField label="Registry Number" name="registryNumber" value={formData.registryNumber} onChange={handleInputChange} required placeholder="e.g., 2020-00123" />
              <InputField label="Date Issued" name="dateIssued" value={formData.dateIssued} onChange={handleInputChange} type="date" required />
              <InputField label="Place Issued" name="placeIssued" value={formData.placeIssued} onChange={handleInputChange} placeholder="PSA Office location" />
              <InputField label="Province" name="province" value={formData.province} onChange={handleInputChange} placeholder="Province of registration" />
              <InputField label="City/Municipality" name="cityMunicipality" value={formData.cityMunicipality} onChange={handleInputChange} placeholder="City/Municipality of registration" />
            </div>
          )}
        </div>

        {/* Your Information Section (the registered person - was Child's Information) */}
        <div className="space-y-4">
          <SectionHeader title="Your Information (As Registered)" icon={User} section="yourInfo" color="pink" />
          {sections.yourInfo && (
            <div className="p-4 border rounded-lg space-y-4">
              <p className="text-sm text-gray-500 italic">This section contains your information as it appears on your birth certificate.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="First Name" name="yourInfo.firstName" value={getNestedValue(formData, 'yourInfo.firstName')} onChange={handleInputChange} required />
                <InputField label="Middle Name" name="yourInfo.middleName" value={getNestedValue(formData, 'yourInfo.middleName')} onChange={handleInputChange} />
                <InputField label="Last Name" name="yourInfo.lastName" value={getNestedValue(formData, 'yourInfo.lastName')} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField
                  label="Sex"
                  name="yourInfo.sex"
                  value={getNestedValue(formData, 'yourInfo.sex')}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                  required
                />
                <InputField label="Date of Birth" name="yourInfo.dateOfBirth" value={getNestedValue(formData, 'yourInfo.dateOfBirth')} onChange={handleInputChange} type="date" required />
                <InputField
                  label="Type of Birth"
                  name="yourInfo.typeOfBirth"
                  value={getNestedValue(formData, 'yourInfo.typeOfBirth')}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Single', label: 'Single' },
                    { value: 'Twin', label: 'Twin' },
                    { value: 'Triplet', label: 'Triplet' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <InputField label="Birth Order" name="yourInfo.birthOrder" value={getNestedValue(formData, 'yourInfo.birthOrder')} onChange={handleInputChange} placeholder="e.g., 1st, 2nd" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Hospital/Clinic/Institution" name="yourInfo.placeOfBirth.hospital" value={getNestedValue(formData, 'yourInfo.placeOfBirth.hospital')} onChange={handleInputChange} />
                <InputField label="City/Municipality of Birth" name="yourInfo.placeOfBirth.cityMunicipality" value={getNestedValue(formData, 'yourInfo.placeOfBirth.cityMunicipality')} onChange={handleInputChange} />
                <InputField label="Province of Birth" name="yourInfo.placeOfBirth.province" value={getNestedValue(formData, 'yourInfo.placeOfBirth.province')} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Birth Weight (grams)" name="yourInfo.birthWeight" value={getNestedValue(formData, 'yourInfo.birthWeight')} onChange={handleInputChange} type="number" placeholder="e.g., 3000" />
              </div>
            </div>
          )}
        </div>

        {/* Mother's Information Section */}
        <div className="space-y-4">
          <SectionHeader title="Mother's Information" icon={User} section="mother" color="purple" />
          {sections.mother && (
            <div className="p-4 border rounded-lg space-y-4">
              <p className="text-sm text-gray-600 font-medium">Maiden Name</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="First Name" name="mother.maidenName.firstName" value={getNestedValue(formData, 'mother.maidenName.firstName')} onChange={handleInputChange} required />
                <InputField label="Middle Name" name="mother.maidenName.middleName" value={getNestedValue(formData, 'mother.maidenName.middleName')} onChange={handleInputChange} />
                <InputField label="Last Name" name="mother.maidenName.lastName" value={getNestedValue(formData, 'mother.maidenName.lastName')} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField label="Citizenship" name="mother.citizenship" value={getNestedValue(formData, 'mother.citizenship')} onChange={handleInputChange} placeholder="e.g., Filipino" />
                <InputField label="Religion" name="mother.religion" value={getNestedValue(formData, 'mother.religion')} onChange={handleInputChange} />
                <InputField label="Occupation" name="mother.occupation" value={getNestedValue(formData, 'mother.occupation')} onChange={handleInputChange} />
                <InputField label="Age at Your Birth" name="mother.ageAtBirth" value={getNestedValue(formData, 'mother.ageAtBirth')} onChange={handleInputChange} type="number" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Residence at Time of Birth</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <InputField label="House No." name="mother.residence.houseNo" value={getNestedValue(formData, 'mother.residence.houseNo')} onChange={handleInputChange} />
                <InputField label="Street" name="mother.residence.street" value={getNestedValue(formData, 'mother.residence.street')} onChange={handleInputChange} />
                <InputField label="Barangay" name="mother.residence.barangay" value={getNestedValue(formData, 'mother.residence.barangay')} onChange={handleInputChange} />
                <InputField label="City/Municipality" name="mother.residence.cityMunicipality" value={getNestedValue(formData, 'mother.residence.cityMunicipality')} onChange={handleInputChange} />
                <InputField label="Province" name="mother.residence.province" value={getNestedValue(formData, 'mother.residence.province')} onChange={handleInputChange} />
                <InputField label="Country" name="mother.residence.country" value={getNestedValue(formData, 'mother.residence.country')} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Total Children Born Alive" name="mother.totalChildrenBornAlive" value={getNestedValue(formData, 'mother.totalChildrenBornAlive')} onChange={handleInputChange} type="number" />
                <InputField label="Children Still Living" name="mother.childrenStillLiving" value={getNestedValue(formData, 'mother.childrenStillLiving')} onChange={handleInputChange} type="number" />
                <InputField label="Children Now Dead" name="mother.childrenNowDead" value={getNestedValue(formData, 'mother.childrenNowDead')} onChange={handleInputChange} type="number" />
              </div>
            </div>
          )}
        </div>

        {/* Father's Information Section */}
        <div className="space-y-4">
          <SectionHeader title="Father's Information" icon={Users} section="father" color="indigo" />
          {sections.father && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="First Name" name="father.name.firstName" value={getNestedValue(formData, 'father.name.firstName')} onChange={handleInputChange} required />
                <InputField label="Middle Name" name="father.name.middleName" value={getNestedValue(formData, 'father.name.middleName')} onChange={handleInputChange} />
                <InputField label="Last Name" name="father.name.lastName" value={getNestedValue(formData, 'father.name.lastName')} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField label="Citizenship" name="father.citizenship" value={getNestedValue(formData, 'father.citizenship')} onChange={handleInputChange} placeholder="e.g., Filipino" />
                <InputField label="Religion" name="father.religion" value={getNestedValue(formData, 'father.religion')} onChange={handleInputChange} />
                <InputField label="Occupation" name="father.occupation" value={getNestedValue(formData, 'father.occupation')} onChange={handleInputChange} />
                <InputField label="Age at Your Birth" name="father.ageAtBirth" value={getNestedValue(formData, 'father.ageAtBirth')} onChange={handleInputChange} type="number" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Residence at Time of Birth</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <InputField label="House No." name="father.residence.houseNo" value={getNestedValue(formData, 'father.residence.houseNo')} onChange={handleInputChange} />
                <InputField label="Street" name="father.residence.street" value={getNestedValue(formData, 'father.residence.street')} onChange={handleInputChange} />
                <InputField label="Barangay" name="father.residence.barangay" value={getNestedValue(formData, 'father.residence.barangay')} onChange={handleInputChange} />
                <InputField label="City/Municipality" name="father.residence.cityMunicipality" value={getNestedValue(formData, 'father.residence.cityMunicipality')} onChange={handleInputChange} />
                <InputField label="Province" name="father.residence.province" value={getNestedValue(formData, 'father.residence.province')} onChange={handleInputChange} />
                <InputField label="Country" name="father.residence.country" value={getNestedValue(formData, 'father.residence.country')} onChange={handleInputChange} />
              </div>
            </div>
          )}
        </div>

        {/* Parents Marriage Section */}
        <div className="space-y-4">
          <SectionHeader title="Parents' Marriage (if applicable)" icon={Heart} section="marriage" color="rose" />
          {sections.marriage && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Date of Marriage" name="parentsMarriage.dateOfMarriage" value={getNestedValue(formData, 'parentsMarriage.dateOfMarriage')} onChange={handleInputChange} type="date" />
                <InputField label="City/Municipality" name="parentsMarriage.placeOfMarriage.cityMunicipality" value={getNestedValue(formData, 'parentsMarriage.placeOfMarriage.cityMunicipality')} onChange={handleInputChange} />
                <InputField label="Province" name="parentsMarriage.placeOfMarriage.province" value={getNestedValue(formData, 'parentsMarriage.placeOfMarriage.province')} onChange={handleInputChange} />
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            rows={3}
            placeholder="Any additional remarks or annotations on the certificate..."
          />
        </div>

        {/* Document Upload Section */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload PSA Birth Certificate <span className="text-red-500">*</span>
          </h3>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {filePreview ? (
                filePreview === 'pdf' ? (
                  <div className="flex items-center gap-2">
                    <FileText className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {documentFile?.name || 'PDF Document Uploaded'}
                      </p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-28 object-contain rounded"
                    />
                    <p className="text-xs text-gray-500 text-center mt-2">Click to change</p>
                  </div>
                )
              ) : (
                <>
                  <Upload className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or PDF (Max 10MB)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                {isUpdate ? 'Submit for Review' : 'Submit for Verification'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PSABirthCertificateForm;
