import { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, Heart, Users, IdCard, Shield,
  FileText, Clock, CheckCircle, XCircle, AlertTriangle, Upload, Loader2, Edit, History,
  Save, X, ChevronDown, ChevronUp, Info, Image, Plus, Trash2
} from 'lucide-react';
import PSABirthCertificateForm from '../../../components/profile/PSABirthCertificateForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Editable Input component - MOVED OUTSIDE to prevent re-creation on every render
const EditableInput = memo(({ label, name, value, type = 'text', options = null, disabled = false, onChange }) => {
  if (options) {
    return (
      <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
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
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
      />
    </div>
  );
});

// Verification requirements configuration for each section
const VERIFICATION_CONFIG = {
  account: {
    title: 'Account Information Update',
    description: 'Changes to email or phone number require identity verification.',
    requiresReason: true,
    reasonLabel: 'Reason for Update',
    reasonPlaceholder: 'e.g., Lost access to old email, Changed phone number, etc.',
    reasonOptions: [
      'Lost access to old email',
      'Changed email provider',
      'Security concern with old email',
      'Lost/changed phone number',
      'Phone number no longer active',
    ],
    documents: {
      required: true,
      maxFiles: 1,
      label: 'Valid Government ID',
      description: 'Upload a valid government-issued ID (e.g., National ID, Driver\'s License, Passport, Voter\'s ID) to verify your identity.',
      acceptedTypes: 'ID Card, Passport, Driver\'s License',
    },
    adminNote: 'Admin may call your registered phone number to verify this request.',
  },
  personal: {
    title: 'Personal Information Update',
    description: 'Changes to personal details require supporting documentation.',
    requiresReason: true,
    reasonLabel: 'Reason for Update',
    reasonPlaceholder: 'e.g., Correction of birth date, Change of civil status, etc.',
    reasonOptions: [
      'Correction of incorrect data',
      'Change of civil status (married)',
      'Change of civil status (widowed)',
      'Change of civil status (annulled/divorced)',
      'Change of occupation',
      'Change of religion',
    ],
    documents: {
      required: true,
      maxFiles: 2,
      label: 'Supporting Document',
      description: 'Upload supporting document based on what you\'re updating:\n• Civil Status: Marriage Certificate, Death Certificate, or Annulment Papers\n• Occupation: Employment Certificate or Business Permit\n• Other: Valid ID or PSA Document',
      acceptedTypes: 'Certificate, ID, Official Document',
    },
    adminNote: 'Ensure documents clearly show the updated information.',
  },
  address: {
    title: 'Address Update',
    description: 'Address changes require proof of residence.',
    requiresReason: true,
    reasonLabel: 'Reason for Update',
    reasonPlaceholder: 'e.g., Moved to new residence, Correction of address, etc.',
    reasonOptions: [
      'Moved to new residence',
      'Correction of incorrect address',
      'Address details incomplete',
    ],
    documents: {
      required: true,
      maxFiles: 2,
      label: 'Proof of Residence',
      description: 'Upload proof of residence:\n• Recent Utility Bill (electric, water, internet) with your name\n• Barangay Certificate of Residency\n• Lease Agreement or Land Title',
      acceptedTypes: 'Utility Bill, Barangay Certificate, Lease Agreement',
    },
    adminNote: 'Document must show the new address and be dated within the last 3 months.',
  },
  additional: {
    title: 'Government IDs Update',
    description: 'TIN, SSS/GSIS, and Precinct number updates require official documentation.',
    requiresReason: false,
    documents: {
      required: true,
      maxFiles: 3,
      label: 'Government ID Documents',
      description: 'Upload the relevant ID or document for each number you\'re updating:\n• TIN: TIN ID Card or BIR Form 1902/2316\n• SSS/GSIS: SSS/GSIS ID or E1 Form/Membership Form\n• Precinct: Voter\'s ID or COMELEC Certificate',
      acceptedTypes: 'TIN ID, SSS ID, GSIS ID, Voter\'s ID, BIR/COMELEC Document',
    },
    adminNote: 'Each number being updated must have corresponding proof document.',
  },
  spouse: {
    title: 'Spouse Information Update',
    description: 'Spouse information requires marriage documentation.',
    requiresReason: true,
    reasonLabel: 'Reason for Update',
    reasonPlaceholder: 'e.g., Recently married, Correction of spouse details, etc.',
    reasonOptions: [
      'Recently married',
      'Correction of spouse details',
      'Spouse changed name',
      'Spouse information incomplete',
    ],
    documents: {
      required: true,
      maxFiles: 2,
      label: 'Marriage Certificate',
      description: 'Upload your PSA Marriage Certificate or certified true copy from the local civil registrar.',
      acceptedTypes: 'PSA Marriage Certificate, LCR Certified Copy',
    },
    adminNote: 'Marriage certificate must be PSA-issued or LCR-certified.',
  },
  emergency: {
    title: 'Emergency Contact Update',
    description: 'Emergency contact changes require relationship verification.',
    requiresReason: true,
    reasonLabel: 'Reason for Update',
    reasonPlaceholder: 'e.g., Previous contact no longer available, Changed emergency contact, etc.',
    reasonOptions: [
      'Previous contact no longer available',
      'Changed to closer relative',
      'Contact person moved',
      'Correction of contact details',
    ],
    documents: {
      required: false,
      maxFiles: 1,
      label: 'Relationship Proof (Optional)',
      description: 'Optionally upload proof of relationship:\n• Birth Certificate (if family)\n• Valid ID of emergency contact\n• Any document showing relationship',
      acceptedTypes: 'ID, Birth Certificate, Any relationship proof',
    },
    adminNote: 'Admin may contact the emergency contact person for verification.',
  },
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'psa' | 'updates'
  const [psaStatus, setPsaStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Edit mode states for Overview sections
  const [editSection, setEditSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updateReason, setUpdateReason] = useState('');
  const [proofDocuments, setProofDocuments] = useState([]); // Array for multiple files
  const [proofPreviews, setProofPreviews] = useState([]); // Array for previews
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  // Check if user is a resident (needs PSA completion)
  const isResident = user?.roleCode === 74934 || user?.role === 'Resident';

  // Fetch PSA completion status
  useEffect(() => {
    const fetchPsaStatus = async () => {
      if (!isResident) {
        setIsLoadingStatus(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/profile-verification/status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('=== PSA Status API Response ===');
        console.log('Full response:', response.data);
        console.log('PSA Status Data:', response.data.data);
        console.log('Birth Certificate:', response.data.data?.birthCertificate);
        console.log('Mother Data:', response.data.data?.birthCertificate?.mother);
        console.log('Father Data:', response.data.data?.birthCertificate?.father);
        console.log('Verification Status:', response.data.data?.verificationStatus);
        setPsaStatus(response.data.data);
      } catch (error) {
        console.error('Error fetching PSA status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchPsaStatus();
  }, [isResident]);

  // Fetch update history
  useEffect(() => {
    const fetchUpdateHistory = async () => {
      if (!isResident || activeTab !== 'updates') return;
      
      setLoadingHistory(true);
      try {
        const response = await axios.get(`${API_URL}/api/profile-update/my-updates`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setUpdateHistory(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching update history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchUpdateHistory();
  }, [isResident, activeTab]);

  // Handle PSA form submission from PSABirthCertificateForm component
  const handlePsaSubmitSuccess = async () => {
    // Refresh PSA status
    try {
      const statusResponse = await axios.get(`${API_URL}/api/profile-verification/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPsaStatus(statusResponse.data.data);
      
      // Refresh user data
      const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser({ ...meResponse.data.data, token: localStorage.getItem('token') });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Cancel a pending update
  const handleCancelUpdate = async (updateId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/profile-update/cancel/${updateId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        toast.success('Update request cancelled');
        setUpdateHistory(prev => prev.filter(u => u._id !== updateId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel update');
    }
  };

  // Start editing a section
  const handleStartEdit = useCallback((section) => {
    let initialData = {};
    
    switch (section) {
      case 'account':
        initialData = {
          email: user?.email || '',
          phoneNumber: user?.phoneNumber || '',
        };
        break;
      case 'personal':
        initialData = {
          dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
          placeOfBirth: user?.placeOfBirth || '',
          gender: user?.gender || '',
          civilStatus: user?.civilStatus || '',
          nationality: user?.nationality || '',
          occupation: user?.occupation || '',
          religion: user?.religion || '',
        };
        break;
      case 'address':
        initialData = {
          houseNumber: user?.address?.houseNumber || '',
          street: user?.address?.street || '',
          subdivision: user?.address?.subdivision || '',
        };
        break;
      case 'additional':
        initialData = {
          tinNumber: user?.tinNumber || '',
          sssGsisNumber: user?.sssGsisNumber || '',
          precinctNumber: user?.precinctNumber || '',
        };
        break;
      case 'spouse':
        initialData = {
          name: user?.spouseInfo?.name || '',
          occupation: user?.spouseInfo?.occupation || '',
          contactNumber: user?.spouseInfo?.contactNumber || '',
        };
        break;
      case 'emergency':
        initialData = {
          fullName: user?.emergencyContact?.fullName || '',
          relationship: user?.emergencyContact?.relationship || '',
          contactNumber: user?.emergencyContact?.contactNumber || '',
          address: {
            houseNumber: user?.emergencyContact?.address?.houseNumber || '',
            street: user?.emergencyContact?.address?.street || '',
            subdivision: user?.emergencyContact?.address?.subdivision || '',
          }
        };
        break;
    }
    
    setEditFormData(initialData);
    setEditSection(section);
    setUpdateReason('');
    setProofDocuments([]);
    setProofPreviews([]);
  }, [user]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditSection(null);
    setEditFormData({});
    setUpdateReason('');
    setProofDocuments([]);
    setProofPreviews([]);
  }, []);

  // Handle input change for edit form
  const handleEditInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Handle proof document upload (supports multiple files)
  const handleProofUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const config = VERIFICATION_CONFIG[editSection];
    const maxFiles = config?.documents?.maxFiles || 1;
    
    if (proofDocuments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} file(s) allowed for this update`);
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const validFiles = [];
    const newPreviews = [];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only JPG, PNG, PDF allowed`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 10MB`);
        continue;
      }
      validFiles.push(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofPreviews(prev => [...prev, { type: 'image', url: reader.result, name: file.name }]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({ type: 'pdf', name: file.name });
      }
    }
    
    if (validFiles.length > 0) {
      setProofDocuments(prev => [...prev, ...validFiles]);
      if (newPreviews.length > 0) {
        setProofPreviews(prev => [...prev, ...newPreviews]);
      }
    }
  }, [editSection, proofDocuments.length]);

  // Remove a proof document
  const handleRemoveProof = useCallback((index) => {
    setProofDocuments(prev => prev.filter((_, i) => i !== index));
    setProofPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Submit profile update with proof
  const handleSubmitUpdate = useCallback(async () => {
    const config = VERIFICATION_CONFIG[editSection];
    
    // Validate reason if required
    if (config?.requiresReason && !updateReason) {
      toast.error('Please select a reason for this update');
      return;
    }
    
    // Validate documents if required
    if (config?.documents?.required && proofDocuments.length === 0) {
      toast.error(`Please upload ${config.documents.label.toLowerCase()} to validate your update`);
      return;
    }
    
    setIsSubmittingUpdate(true);
    
    try {
      const formData = new FormData();
      
      // Determine update type based on section
      const updateTypeMap = {
        account: 'account_info',
        personal: 'personal_info',
        address: 'address',
        additional: 'additional_info',
        spouse: 'spouse_info',
        emergency: 'emergency_contact',
      };
      
      formData.append('updateType', updateTypeMap[editSection]);
      
      // Append reason
      if (updateReason) {
        formData.append('updateReason', updateReason);
      }
      
      // Append edited data
      if (editSection === 'address') {
        Object.keys(editFormData).forEach(key => {
          formData.append(`address.${key}`, editFormData[key]);
        });
      } else if (editSection === 'spouse') {
        Object.keys(editFormData).forEach(key => {
          formData.append(`spouseInfo.${key}`, editFormData[key]);
        });
      } else if (editSection === 'emergency') {
        formData.append('emergencyContact.fullName', editFormData.fullName);
        formData.append('emergencyContact.relationship', editFormData.relationship);
        formData.append('emergencyContact.contactNumber', editFormData.contactNumber);
        if (editFormData.address) {
          Object.keys(editFormData.address).forEach(key => {
            formData.append(`emergencyContact.address.${key}`, editFormData.address[key]);
          });
        }
      } else {
        Object.keys(editFormData).forEach(key => {
          formData.append(key, editFormData[key]);
        });
      }
      
      // Append all proof documents
      proofDocuments.forEach((doc, index) => {
        formData.append('proofDocuments', doc);
      });
      
      // Also append verification metadata
      formData.append('verificationConfig', JSON.stringify({
        sectionTitle: config?.title,
        documentsRequired: config?.documents?.label,
        adminNote: config?.adminNote,
      }));
      
      const response = await axios.post(
        `${API_URL}/api/profile-update/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Update request submitted for admin review!');
        handleCancelEdit();
        // Refresh update history if on that tab
        if (activeTab === 'updates') {
          const historyResponse = await axios.get(`${API_URL}/api/profile-update/my-updates`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (historyResponse.data.success) {
            setUpdateHistory(historyResponse.data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting update:', error);
      toast.error(error.response?.data?.message || 'Failed to submit update');
    } finally {
      setIsSubmittingUpdate(false);
    }
  }, [editSection, updateReason, proofDocuments, editFormData, activeTab, handleCancelEdit]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Memoized change handlers for form inputs
  const handleReasonChange = useCallback((e) => {
    setUpdateReason(e.target.value);
  }, []);

  // Edit Form Footer with comprehensive verification requirements
  const EditFormFooter = useCallback(() => {
    const config = VERIFICATION_CONFIG[editSection];
    if (!config) return null;
    
    const maxFiles = config.documents?.maxFiles || 1;
    const canAddMore = proofDocuments.length < maxFiles;
    
    return (
      <div className="border-t mt-6 pt-6 space-y-5">
        {/* Verification Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {config.title}
          </h4>
          <p className="text-blue-600 text-sm mt-1">{config.description}</p>
          {config.adminNote && (
            <p className="text-blue-700 text-xs mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {config.adminNote}
            </p>
          )}
        </div>

        {/* Reason for Update */}
        {config.requiresReason && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {config.reasonLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={updateReason}
              onChange={handleReasonChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select a reason...</option>
              {config.reasonOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        {/* Document Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              <Upload className="w-4 h-4 inline mr-1" />
              {config.documents.label}
              {config.documents.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <span className="text-xs text-gray-500">
              {proofDocuments.length}/{maxFiles} file(s)
            </span>
          </div>
          
          <p className="text-xs text-gray-500 whitespace-pre-line">
            {config.documents.description}
          </p>
          
          {/* Uploaded Files Preview */}
          {proofPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {proofPreviews.map((preview, index) => (
                <div key={index} className="relative group border rounded-lg p-2 bg-gray-50">
                  {preview.type === 'image' ? (
                    <img src={preview.url} alt={preview.name} className="w-full h-20 object-cover rounded" />
                  ) : (
                    <div className="w-full h-20 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                  )}
                  <p className="text-xs text-gray-600 truncate mt-1">{preview.name}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveProof(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button */}
          {canAddMore && (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="text-center">
                {proofDocuments.length > 0 ? (
                  <>
                    <Plus className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-500">Add another document</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload document</p>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF (Max 10MB each)</p>
                <p className="text-xs text-blue-500 mt-1">{config.documents.acceptedTypes}</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleProofUpload}
                multiple={maxFiles > 1}
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitUpdate}
            disabled={isSubmittingUpdate || (config.documents.required && proofDocuments.length === 0) || (config.requiresReason && !updateReason)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingUpdate ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit for Review
              </>
            )}
          </button>
        </div>
      </div>
    );
  }, [editSection, updateReason, proofDocuments, proofPreviews, isSubmittingUpdate, handleReasonChange, handleProofUpload, handleRemoveProof, handleCancelEdit, handleSubmitUpdate]);

  // Section Header with Edit button
  const SectionHeader = ({ title, icon: Icon, iconColor = 'text-blue-600', section }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {title}
      </h2>
      {isResident && editSection !== section && (
        <button
          onClick={() => handleStartEdit(section)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      )}
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  // Render verification status badge
  const renderVerificationStatus = () => {
    if (!psaStatus) return null;

    const statusConfig = {
      none: { 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: AlertTriangle, 
        text: 'Not Submitted',
        description: 'Complete your PSA profile to access all services'
      },
      pending: { 
        color: 'bg-amber-50 text-amber-700 border-amber-200', 
        icon: Clock, 
        text: 'Pending Review',
        description: 'Your submission is being reviewed by an administrator'
      },
      approved: { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: CheckCircle, 
        text: 'Verified',
        description: 'Your PSA profile has been verified'
      },
      rejected: { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        icon: XCircle, 
        text: 'Rejected',
        description: psaStatus.rejectionReason || 'Please review and resubmit'
      },
    };

    const config = statusConfig[psaStatus.verificationStatus] || statusConfig.none;
    const StatusIcon = config.icon;

    return (
      <div className={`rounded-lg border p-4 ${config.color}`}>
        <div className="flex items-start gap-3">
          <StatusIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{config.text}</p>
            <p className="text-sm opacity-80 mt-1">{config.description}</p>
            {psaStatus.deadline && !psaStatus.isComplete && psaStatus.verificationStatus !== 'approved' && (
              <p className="text-sm mt-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Deadline: {formatDate(psaStatus.deadline)} 
                {psaStatus.daysLeft !== null && ` (${psaStatus.daysLeft} days left)`}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {user.firstName} {user.middleName} {user.lastName}{user.suffix ? ` ${user.suffix}` : ''}
              </h1>
              <p className="text-gray-600">@{user.username}</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mt-2">
                {user.role || 'Resident'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs for Residents */}
        {isResident && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b">
              <nav className="flex -mb-px overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile Overview
                </button>
                <button
                  onClick={() => setActiveTab('psa')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'psa'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  PSA Birth Certificate
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'updates'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Update History
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* PSA Tab Content */}
        {isResident && activeTab === 'psa' && (
          <div className="space-y-6">
            {/* Status Card */}
            {isLoadingStatus ? (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading status...</span>
              </div>
            ) : (
              renderVerificationStatus()
            )}

            {/* PSA Form - Use new comprehensive form if not approved and not pending */}
            {psaStatus?.verificationStatus !== 'approved' && psaStatus?.verificationStatus !== 'pending' && (
              <PSABirthCertificateForm 
                existingData={user?.birthCertificate}
                onSuccess={handlePsaSubmitSuccess}
              />
            )}

            {/* Show submitted data if pending */}
            {psaStatus?.verificationStatus === 'pending' && psaStatus?.birthCertificate && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Submitted PSA Information (Under Review)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <div>
                    <p className="text-sm text-gray-500">Certificate Number</p>
                    <p className="font-medium">{psaStatus.birthCertificate.certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registry Number</p>
                    <p className="font-medium">{psaStatus.birthCertificate.registryNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Issued</p>
                    <p className="font-medium">{formatDate(psaStatus.birthCertificate.dateIssued)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Place of Registration</p>
                    <p className="font-medium">{psaStatus.birthCertificate.placeOfRegistration}</p>
                  </div>
                </div>
                <p className="text-amber-600 text-sm mt-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Your submission is currently being reviewed by an administrator.
                </p>
              </div>
            )}

            {/* Show verified message if approved - no update form needed */}
            {psaStatus?.verificationStatus === 'approved' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Fully Verified</h2>
                  <p className="text-gray-600 mb-4">
                    Your PSA Birth Certificate has been successfully verified. Your profile information from the birth certificate is now displayed in your Profile Overview.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Profile Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Update History Tab Content */}
        {isResident && activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Profile Update History
              </h2>
              
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading history...</span>
                </div>
              ) : updateHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No update requests found</p>
                  <p className="text-gray-400 text-sm mt-1">Your profile update history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updateHistory.map((update) => (
                    <div 
                      key={update._id} 
                      className={`border rounded-lg p-4 ${
                        update.status === 'pending' ? 'border-amber-200 bg-amber-50' :
                        update.status === 'approved' ? 'border-green-200 bg-green-50' :
                        'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              update.status === 'pending' ? 'bg-amber-200 text-amber-800' :
                              update.status === 'approved' ? 'bg-green-200 text-green-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {update.updateType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {(update.changedFields?.filter(c => !c.fieldPath.toLowerCase().includes('verificationconfig'))?.length) || 0} fields changed
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {formatDate(update.createdAt)}
                          </p>
                          {update.status === 'rejected' && update.rejectionReason && (
                            <p className="text-red-600 text-sm mt-2">
                              <XCircle className="w-4 h-4 inline mr-1" />
                              {update.rejectionReason}
                            </p>
                          )}
                          {update.status === 'approved' && update.reviewedAt && (
                            <p className="text-green-600 text-xs mt-1">
                              Approved: {formatDate(update.reviewedAt)}
                            </p>
                          )}
                        </div>
                        {update.status === 'pending' && (
                          <button
                            onClick={() => handleCancelUpdate(update._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      
                      {/* Show changed fields */}
                      {update.changedFields && update.changedFields.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Changed Fields:</p>
                          <div className="space-y-2">
                            {update.changedFields
                              .filter(change => !change.fieldPath.toLowerCase().includes('verificationconfig'))
                              .slice(0, 5)
                              .map((change, idx) => {
                                // Friendly field name mapping
                                const fieldLabels = {
                                  firstName: 'First Name',
                                  lastName: 'Last Name',
                                  middleName: 'Middle Name',
                                  suffix: 'Suffix',
                                  email: 'Email',
                                  phoneNumber: 'Phone Number',
                                  dateOfBirth: 'Date of Birth',
                                  placeOfBirth: 'Place of Birth',
                                  gender: 'Gender',
                                  civilStatus: 'Civil Status',
                                  nationality: 'Nationality',
                                  religion: 'Religion',
                                  occupation: 'Occupation',
                                  'address.houseNumber': 'House Number',
                                  'address.street': 'Street',
                                  'address.subdivision': 'Subdivision',
                                  'address.barangay': 'Barangay',
                                  'address.city': 'City',
                                  'address.province': 'Province',
                                  'address.zipCode': 'ZIP Code',
                                  'spouseInfo.name': 'Spouse Name',
                                  'spouseInfo.occupation': 'Spouse Occupation',
                                  'spouseInfo.contactNumber': 'Spouse Contact',
                                  'emergencyContact.fullName': 'Emergency Contact Name',
                                  'emergencyContact.relationship': 'Relationship',
                                  'emergencyContact.contactNumber': 'Contact Number',
                                  tinNumber: 'TIN Number',
                                  sssGsisNumber: 'SSS/GSIS Number',
                                  precinctNumber: 'Precinct Number',
                                };
                                const label = fieldLabels[change.fieldPath] || 
                                  change.fieldPath.split('.').pop().replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                                return (
                                  <div key={idx} className="text-xs">
                                    <span className="font-medium text-gray-700">{label}: </span>
                                    <span className="text-red-600 line-through">{String(change.oldValue || 'empty')}</span>
                                    <span className="mx-1">→</span>
                                    <span className="text-green-600">{String(change.newValue || 'empty')}</span>
                                  </div>
                                );
                              })}
                            {update.changedFields.filter(c => !c.fieldPath.toLowerCase().includes('verificationconfig')).length > 5 && (
                              <p className="text-xs text-gray-500">
                                +{update.changedFields.filter(c => !c.fieldPath.toLowerCase().includes('verificationconfig')).length - 5} more changes
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Overview Tab Content */}
        {(!isResident || activeTab === 'overview') && (
          <div className="space-y-6">
            {/* Edit Mode Notice */}
            {editSection && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">You are editing your profile.</span>
                </div>
                <p className="text-amber-600 text-sm mt-1">
                  All changes require admin approval. Please upload a valid proof document (ID, certificate, etc.) to validate your update.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SectionHeader title="Account Information" icon={Shield} section="account" />
                
                {editSection === 'account' ? (
                  <div className="space-y-4">
                    <EditableInput label="Email" name="email" value={editFormData.email} type="email" onChange={handleEditInputChange} />
                    <EditableInput label="Phone Number" name="phoneNumber" value={editFormData.phoneNumber} onChange={handleEditInputChange} />
                    <EditFormFooter />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Username</p>
                        <p className="font-medium text-gray-800">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-800">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-800">{user.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SectionHeader title="Personal Information" icon={IdCard} section="personal" />
                
                {editSection === 'personal' ? (
                  <div className="space-y-4">
                    <EditableInput label="Date of Birth" name="dateOfBirth" value={editFormData.dateOfBirth} type="date" onChange={handleEditInputChange} />
                    <EditableInput label="Place of Birth" name="placeOfBirth" value={editFormData.placeOfBirth} onChange={handleEditInputChange} />
                    <div className="grid grid-cols-2 gap-4">
                      <EditableInput 
                        label="Gender" 
                        name="gender" 
                        value={editFormData.gender}
                        onChange={handleEditInputChange}
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                        ]}
                      />
                      <EditableInput 
                        label="Civil Status" 
                        name="civilStatus" 
                        value={editFormData.civilStatus}
                        onChange={handleEditInputChange}
                        options={[
                          { value: 'Single', label: 'Single' },
                          { value: 'Married', label: 'Married' },
                          { value: 'Widowed', label: 'Widowed' },
                          { value: 'Separated', label: 'Separated' },
                          { value: 'Divorced', label: 'Divorced' },
                        ]}
                      />
                    </div>
                    <EditableInput label="Nationality" name="nationality" value={editFormData.nationality} onChange={handleEditInputChange} />
                    <EditableInput label="Occupation" name="occupation" value={editFormData.occupation} onChange={handleEditInputChange} />
                    <EditableInput label="Religion" name="religion" value={editFormData.religion} onChange={handleEditInputChange} />
                    <EditFormFooter />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Place of Birth</p>
                      <p className="font-medium text-gray-800">{user.placeOfBirth || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium text-gray-800">{user.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Civil Status</p>
                        <p className="font-medium text-gray-800">{user.civilStatus || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-medium text-gray-800">{user.nationality || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {user.occupation || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Religion</p>
                      <p className="font-medium text-gray-800">{user.religion || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SectionHeader title="Address" icon={MapPin} section="address" />
                
                {editSection === 'address' ? (
                  <div className="space-y-4">
                    <EditableInput label="House Number" name="houseNumber" value={editFormData.houseNumber} onChange={handleEditInputChange} />
                    <EditableInput label="Street" name="street" value={editFormData.street} onChange={handleEditInputChange} />
                    <EditableInput label="Subdivision" name="subdivision" value={editFormData.subdivision} onChange={handleEditInputChange} />
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                      <p>Barangay Culiat, Quezon City</p>
                      <p>Metro Manila, 1128, Philippines</p>
                    </div>
                    <EditFormFooter />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-800">
                      {user.address?.houseNumber} {user.address?.street}
                    </p>
                    {user.address?.subdivision && (
                      <p className="text-gray-700">{user.address.subdivision}</p>
                    )}
                    <p className="text-gray-600">Barangay Culiat, Quezon City</p>
                    <p className="text-gray-600">Metro Manila, 1128, Philippines</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SectionHeader title="Additional Information" icon={FileText} iconColor="text-purple-600" section="additional" />
                
                {editSection === 'additional' ? (
                  <div className="space-y-4">
                    <EditableInput label="TIN Number" name="tinNumber" value={editFormData.tinNumber} onChange={handleEditInputChange} />
                    <EditableInput label="SSS/GSIS Number" name="sssGsisNumber" value={editFormData.sssGsisNumber} onChange={handleEditInputChange} />
                    <EditableInput label="Precinct Number" name="precinctNumber" value={editFormData.precinctNumber} onChange={handleEditInputChange} />
                    <EditFormFooter />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">TIN Number</p>
                      <p className="font-medium text-gray-800">{user.tinNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SSS/GSIS Number</p>
                      <p className="font-medium text-gray-800">{user.sssGsisNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precinct Number</p>
                      <p className="font-medium text-gray-800">{user.precinctNumber || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Spouse Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SectionHeader title="Spouse Information" icon={Heart} iconColor="text-pink-600" section="spouse" />
                
                {editSection === 'spouse' ? (
                  <div className="space-y-4">
                    <EditableInput label="Spouse Name" name="name" value={editFormData.name} onChange={handleEditInputChange} />
                    <EditableInput label="Spouse Occupation" name="occupation" value={editFormData.occupation} onChange={handleEditInputChange} />
                    <EditableInput label="Spouse Contact Number" name="contactNumber" value={editFormData.contactNumber} onChange={handleEditInputChange} />
                    <EditFormFooter />
                  </div>
                ) : user.spouseInfo && user.spouseInfo.name ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-800">{user.spouseInfo.name}</p>
                    </div>
                    {user.spouseInfo.occupation && (
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p className="font-medium text-gray-800">{user.spouseInfo.occupation}</p>
                      </div>
                    )}
                    {user.spouseInfo.contactNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-medium text-gray-800">{user.spouseInfo.contactNumber}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No spouse information provided</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <SectionHeader title="Emergency Contact" icon={Users} iconColor="text-orange-600" section="emergency" />
                
                {editSection === 'emergency' ? (
                  <div className="space-y-4">
                    <EditableInput label="Full Name" name="fullName" value={editFormData.fullName} onChange={handleEditInputChange} />
                    <EditableInput label="Relationship" name="relationship" value={editFormData.relationship} onChange={handleEditInputChange} />
                    <EditableInput label="Contact Number" name="contactNumber" value={editFormData.contactNumber} onChange={handleEditInputChange} />
                    <p className="text-sm font-medium text-gray-600 mt-2">Address</p>
                    <EditableInput label="House Number" name="address.houseNumber" value={editFormData.address?.houseNumber} onChange={handleEditInputChange} />
                    <EditableInput label="Street" name="address.street" value={editFormData.address?.street} onChange={handleEditInputChange} />
                    <EditableInput label="Subdivision" name="address.subdivision" value={editFormData.address?.subdivision} onChange={handleEditInputChange} />
                    <EditFormFooter />
                  </div>
                ) : user.emergencyContact ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-800">{user.emergencyContact.fullName}</p>
                    </div>
                    {user.emergencyContact.relationship && (
                      <div>
                        <p className="text-sm text-gray-600">Relationship</p>
                        <p className="font-medium text-gray-800">{user.emergencyContact.relationship}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-medium text-gray-800">{user.emergencyContact.contactNumber}</p>
                    </div>
                    {user.emergencyContact.address && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-800">
                          {user.emergencyContact.address.houseNumber} {user.emergencyContact.address.street} {user.emergencyContact.address.subdivision}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No emergency contact provided</p>
                )}
              </div>

              {/* Debug log for PSA data */}
              {console.log('=== PSA Render Check ===', {
                psaStatus,
                hasBirthCertificate: !!psaStatus?.birthCertificate,
                hasMother: !!psaStatus?.birthCertificate?.mother,
                hasFather: !!psaStatus?.birthCertificate?.father,
                verificationStatus: psaStatus?.verificationStatus,
                isApproved: psaStatus?.verificationStatus === 'approved'
              })}

              {/* PSA Birth Certificate - Mother's Information (only if verified) */}
              {psaStatus?.birthCertificate?.mother && psaStatus?.verificationStatus === 'approved' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-600" />
                    Mother's Information
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">From PSA</span>
                  </h3>
                  <div className="space-y-3">
                    {psaStatus.birthCertificate.mother.maidenName && (
                      <div>
                        <p className="text-sm text-gray-600">Maiden Name</p>
                        <p className="font-medium text-gray-800">
                          {psaStatus.birthCertificate.mother.maidenName.firstName} {psaStatus.birthCertificate.mother.maidenName.middleName} {psaStatus.birthCertificate.mother.maidenName.lastName}
                        </p>
                      </div>
                    )}
                    {psaStatus.birthCertificate.mother.citizenship && (
                      <div>
                        <p className="text-sm text-gray-600">Citizenship</p>
                        <p className="font-medium text-gray-800">{psaStatus.birthCertificate.mother.citizenship}</p>
                      </div>
                    )}
                    {psaStatus.birthCertificate.mother.religion && (
                      <div>
                        <p className="text-sm text-gray-600">Religion</p>
                        <p className="font-medium text-gray-800">{psaStatus.birthCertificate.mother.religion}</p>
                      </div>
                    )}
                    {psaStatus.birthCertificate.mother.occupation && (
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p className="font-medium text-gray-800">{psaStatus.birthCertificate.mother.occupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PSA Birth Certificate - Father's Information (only if verified) */}
              {psaStatus?.birthCertificate?.father && psaStatus?.verificationStatus === 'approved' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Father's Information
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">From PSA</span>
                  </h3>
                  <div className="space-y-3">
                    {psaStatus.birthCertificate.father.name && (
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-gray-800">
                          {psaStatus.birthCertificate.father.name.firstName} {psaStatus.birthCertificate.father.name.middleName} {psaStatus.birthCertificate.father.name.lastName}
                        </p>
                      </div>
                    )}
                    {psaStatus.birthCertificate.father.citizenship && (
                      <div>
                        <p className="text-sm text-gray-600">Citizenship</p>
                        <p className="font-medium text-gray-800">{psaStatus.birthCertificate.father.citizenship}</p>
                      </div>
                    )}
                    {psaStatus.birthCertificate.father.religion && (
                      <div>
                        <p className="text-sm text-gray-600">Religion</p>
                        <p className="font-medium text-gray-800">{psaStatus.birthCertificate.father.religion}</p>
                      </div>
                    )}
                    {psaStatus.birthCertificate.father.occupation && (
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p className="font-medium text-gray-800">{psaStatus.birthCertificate.father.occupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PSA Birth Certificate - Parents Marriage (only if verified) */}
              {psaStatus?.birthCertificate?.parentsMarriage?.dateOfMarriage && psaStatus?.verificationStatus === 'approved' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Parents' Marriage
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">From PSA</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Date of Marriage</p>
                      <p className="font-medium text-gray-800">{formatDate(psaStatus.birthCertificate.parentsMarriage.dateOfMarriage)}</p>
                    </div>
                    {psaStatus.birthCertificate.parentsMarriage.placeOfMarriage && (
                      <div>
                        <p className="text-sm text-gray-600">Place of Marriage</p>
                        <p className="font-medium text-gray-800">
                          {psaStatus.birthCertificate.parentsMarriage.placeOfMarriage.cityMunicipality}, {psaStatus.birthCertificate.parentsMarriage.placeOfMarriage.province}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
