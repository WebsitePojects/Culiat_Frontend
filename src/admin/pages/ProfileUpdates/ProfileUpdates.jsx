import { useState, useEffect, Fragment } from 'react';
import { 
  FileEdit, Search, Filter, Eye, Check, X, Clock, CheckCircle, 
  XCircle, User, Calendar, ChevronDown, ChevronUp, Download, 
  RefreshCw, AlertCircle, FileText, Phone, Mail, Shield, Info, Image, 
  MessageSquare, ChevronLeft, ChevronRight, ZoomIn, MapPin, Briefcase,
  Heart, Users, IdCard, Home, Hash, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../../../hooks/useNotifications';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileUpdates = () => {
  const { showSuccess, showError } = useNotifications();
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Pagination within modal for changed fields
  const [fieldPage, setFieldPage] = useState(1);
  const fieldsPerPage = 5;
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    updateType: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const updateTypeLabels = {
    personal_info: 'Personal Information',
    birth_certificate: 'PSA Birth Certificate',
    contact_info: 'Contact Information',
    account_info: 'Account Information',
    address: 'Address',
    emergency_contact: 'Emergency Contact',
    spouse_info: 'Spouse Information',
    additional_info: 'Government IDs',
    full_profile: 'Full Profile',
  };

  const updateTypeIcons = {
    personal_info: User,
    birth_certificate: FileText,
    contact_info: Phone,
    account_info: Mail,
    address: Home,
    emergency_contact: Users,
    spouse_info: Heart,
    additional_info: IdCard,
    full_profile: FileEdit,
  };

  // Field name mappings for user-friendly display
  const fieldNameLabels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    middleName: 'Middle Name',
    suffix: 'Suffix',
    dateOfBirth: 'Date of Birth',
    placeOfBirth: 'Place of Birth',
    gender: 'Gender',
    civilStatus: 'Civil Status',
    nationality: 'Nationality',
    religion: 'Religion',
    occupation: 'Occupation',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    'address.houseNumber': 'House/Unit Number',
    'address.street': 'Street',
    'address.subdivision': 'Subdivision/Village',
    'address.barangay': 'Barangay',
    'address.city': 'City/Municipality',
    'address.province': 'Province',
    'address.zipCode': 'ZIP Code',
    'emergencyContact.fullName': 'Emergency Contact Name',
    'emergencyContact.relationship': 'Relationship',
    'emergencyContact.contactNumber': 'Contact Number',
    'emergencyContact.address.houseNumber': 'House Number',
    'emergencyContact.address.street': 'Street',
    'emergencyContact.address.subdivision': 'Subdivision',
    'spouseInfo.name': 'Spouse Name',
    'spouseInfo.occupation': 'Spouse Occupation',
    'spouseInfo.contactNumber': 'Spouse Contact',
    tinNumber: 'TIN Number',
    sssGsisNumber: 'SSS/GSIS Number',
    precinctNumber: 'Precinct Number',
    'birthCertificate.certificateNumber': 'Certificate Number',
    'birthCertificate.registryNumber': 'Registry Number',
    'birthCertificate.dateIssued': 'Date Issued',
    'birthCertificate.placeOfRegistration': 'Place of Registration',
    'birthCertificate.childInfo.firstName': 'First Name',
    'birthCertificate.childInfo.middleName': 'Middle Name',
    'birthCertificate.childInfo.lastName': 'Last Name',
    'birthCertificate.childInfo.sex': 'Sex',
    'birthCertificate.childInfo.dateOfBirth': 'Date of Birth',
    'birthCertificate.childInfo.placeOfBirth.hospital': 'Hospital',
    'birthCertificate.childInfo.placeOfBirth.city': 'City',
    'birthCertificate.childInfo.placeOfBirth.province': 'Province',
    'birthCertificate.motherInfo.maidenName.firstName': 'Mother\'s First Name',
    'birthCertificate.motherInfo.maidenName.middleName': 'Mother\'s Middle Name',
    'birthCertificate.motherInfo.maidenName.lastName': 'Mother\'s Maiden Last Name',
    'birthCertificate.motherInfo.citizenship': 'Mother\'s Citizenship',
    'birthCertificate.motherInfo.religion': 'Mother\'s Religion',
    'birthCertificate.motherInfo.occupation': 'Mother\'s Occupation',
    'birthCertificate.fatherInfo.fullName.firstName': 'Father\'s First Name',
    'birthCertificate.fatherInfo.fullName.middleName': 'Father\'s Middle Name',
    'birthCertificate.fatherInfo.fullName.lastName': 'Father\'s Last Name',
    'birthCertificate.fatherInfo.citizenship': 'Father\'s Citizenship',
    'birthCertificate.fatherInfo.religion': 'Father\'s Religion',
    'birthCertificate.fatherInfo.occupation': 'Father\'s Occupation',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.updateType) params.append('updateType', filters.updateType);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      console.log('[ProfileUpdates] Fetching with params:', Object.fromEntries(params));

      const response = await axios.get(`${API_URL}/api/profile-update/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      console.log('[ProfileUpdates] Response:', {
        success: response.data.success,
        dataLength: response.data.data?.length,
        data: response.data.data,
        stats: response.data.stats,
        pagination: response.data.pagination
      });

      if (response.data.success) {
        setUpdates(response.data.data);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('[ProfileUpdates] Error fetching updates:', err);
      console.error('[ProfileUpdates] Error response:', err.response?.data);
      showError('Failed to fetch profile updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [filters.status, filters.updateType, filters.page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchUpdates();
  };

  const fetchUpdateDetail = async (id) => {
    try {
      console.log('[ProfileUpdates] Fetching detail for:', id);
      const response = await axios.get(`${API_URL}/api/profile-update/admin/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('[ProfileUpdates] Detail response:', {
        success: response.data.success,
        data: response.data.data
      });
      if (response.data.success) {
        setSelectedUpdate(response.data.data);
        setFieldPage(1);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('[ProfileUpdates] Error fetching update detail:', err);
      console.error('[ProfileUpdates] Error response:', err.response?.data);
      showError('Failed to fetch update details');
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/profile-update/admin/${id}/approve`,
        { reviewNotes: '' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        showSuccess('Profile update approved and applied successfully!');
        setShowDetailModal(false);
        fetchUpdates();
      }
    } catch (err) {
      console.error('Error approving update:', err);
      showError(err.response?.data?.message || 'Failed to approve update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/profile-update/admin/${selectedUpdate._id}/reject`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        showSuccess('Profile update rejected');
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectionReason('');
        fetchUpdates();
      }
    } catch (err) {
      console.error('Error rejecting update:', err);
      showError(err.response?.data?.message || 'Failed to reject update');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get user-friendly field name
  const getFieldLabel = (fieldPath) => {
    return fieldNameLabels[fieldPath] || fieldPath.split('.').pop().replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Format field value for display
  const formatFieldValue = (value, fieldPath) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not provided</span>;
    }
    
    // Handle dates
    if (fieldPath.toLowerCase().includes('date') || fieldPath.toLowerCase().includes('issued')) {
      return formatDateOnly(value);
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Handle objects (shouldn't happen with changedFields but just in case)
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return Object.values(value).filter(v => v).join(', ');
    }
    
    return String(value);
  };

  // Group changed fields by category for better display
  const groupChangedFields = (fields) => {
    if (!fields || fields.length === 0) return {};
    
    // Filter out verificationConfig - it's internal system data
    const filteredFields = fields.filter(field => 
      !field.fieldPath.toLowerCase().includes('verificationconfig')
    );
    
    if (filteredFields.length === 0) return {};
    
    const groups = {
      'Personal Information': [],
      'Contact Information': [],
      'Address': [],
      'Emergency Contact': [],
      'Spouse Information': [],
      'Government IDs': [],
      'PSA Birth Certificate': [],
    };
    
    filteredFields.forEach(field => {
      const path = field.fieldPath;
      if (path.startsWith('birthCertificate')) {
        groups['PSA Birth Certificate'].push(field);
      } else if (path.startsWith('address.')) {
        groups['Address'].push(field);
      } else if (path.startsWith('emergencyContact')) {
        groups['Emergency Contact'].push(field);
      } else if (path.startsWith('spouseInfo')) {
        groups['Spouse Information'].push(field);
      } else if (['tinNumber', 'sssGsisNumber', 'precinctNumber'].includes(path)) {
        groups['Government IDs'].push(field);
      } else if (['email', 'phoneNumber'].includes(path)) {
        groups['Contact Information'].push(field);
      } else if (['firstName', 'lastName', 'middleName', 'suffix', 'dateOfBirth', 'placeOfBirth', 'gender', 'civilStatus', 'nationality', 'religion', 'occupation'].includes(path)) {
        groups['Personal Information'].push(field);
      } else {
        // Skip unknown fields instead of adding to 'Other'
      }
    });
    
    // Remove empty groups
    return Object.fromEntries(Object.entries(groups).filter(([_, v]) => v.length > 0));
  };

  // Open image gallery
  const openImageGallery = (images, index = 0) => {
    setCurrentImageIndex(index);
    setShowImageModal(images);
  };

  // Stats Cards
  const StatsCard = ({ label, value, color, icon: Icon }) => (
    <div className={`${color} rounded-xl p-4 flex items-center gap-4`}>
      <div className="p-3 bg-white/30 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-white/80 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  // Paginated fields
  const getPaginatedFields = () => {
    const allFields = selectedUpdate?.changedFields || [];
    const startIndex = (fieldPage - 1) * fieldsPerPage;
    const endIndex = startIndex + fieldsPerPage;
    return {
      fields: allFields.slice(startIndex, endIndex),
      totalPages: Math.ceil(allFields.length / fieldsPerPage),
      totalFields: allFields.length,
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/10 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <FileEdit className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Profile Updates
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-200 mt-0.5 sm:mt-1">
                  Review and manage resident profile update requests
                </p>
              </div>
            </div>
            <button
              onClick={fetchUpdates}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'pending', page: 1 }))}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filters.status === 'pending'
                  ? "bg-yellow-500/30 ring-2 ring-yellow-400/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-yellow-200">Pending</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-300 mt-0.5">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-300 opacity-80" />
              </div>
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'approved', page: 1 }))}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filters.status === 'approved'
                  ? "bg-green-500/30 ring-2 ring-green-400/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-green-200">Approved</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-300 mt-0.5">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-300 opacity-80" />
              </div>
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'rejected', page: 1 }))}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filters.status === 'rejected'
                  ? "bg-red-500/30 ring-2 ring-red-400/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-red-200">Rejected</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-300 mt-0.5">
                    {stats.rejected}
                  </p>
                </div>
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-300 opacity-80" />
              </div>
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, status: '', page: 1 }))}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filters.status === ''
                  ? "bg-white/20 ring-2 ring-white/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-blue-200">Total</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5">
                    {stats.total}
                  </p>
                </div>
                <FileEdit className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-300 opacity-80" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Update Type
            </label>
            <select
              value={filters.updateType}
              onChange={(e) => setFilters(prev => ({ ...prev, updateType: e.target.value, page: 1 }))}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="account_info">Account Info</option>
              <option value="personal_info">Personal Info</option>
              <option value="birth_certificate">PSA Birth Certificate</option>
              <option value="address">Address</option>
              <option value="additional_info">Government IDs</option>
              <option value="spouse_info">Spouse Info</option>
              <option value="emergency_contact">Emergency Contact</option>
              <option value="full_profile">Full Profile</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Filter
            </button>
          </div>
        </form>

        {/* Active Filters */}
        {(filters.status || filters.updateType || filters.search) && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              Showing {pagination.total} results
            </p>
            <button
              onClick={() => {
                setFilters({ status: '', updateType: '', search: '', page: 1, limit: 10 });
                fetchUpdates();
              }}
              className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Updates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <FileEdit className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto" />
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">No profile updates found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {updates.map((update) => {
                const StatusIcon = statusIcons[update.status];
                const TypeIcon = updateTypeIcons[update.updateType] || FileEdit;
                const user = update.user || update.userDetails?.[0];
                return (
                  <div
                    key={update._id}
                    onClick={() => fetchUpdateDetail(update._id)}
                    className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 border ${statusColors[update.status]}`}>
                        <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] sm:text-xs">
                          <TypeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {updateTypeLabels[update.updateType] || update.updateType}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {(update.changedFields?.filter(f => !f.fieldPath?.toLowerCase().includes('verificationconfig'))?.length) || 0} changes
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {formatDate(update.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resident</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update Type</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Changes</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {updates.map((update) => {
                    const StatusIcon = statusIcons[update.status];
                    const TypeIcon = updateTypeIcons[update.updateType] || FileEdit;
                    const user = update.user || update.userDetails?.[0];
                    return (
                      <tr
                        key={update._id}
                        onClick={() => fetchUpdateDetail(update._id)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 lg:px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] lg:text-xs font-medium">
                            <TypeIcon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            {updateTypeLabels[update.updateType] || update.updateType}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                            {(update.changedFields?.filter(f => !f.fieldPath?.toLowerCase().includes('verificationconfig'))?.length) || 0} field{((update.changedFields?.filter(f => !f.fieldPath?.toLowerCase().includes('verificationconfig'))?.length) || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium border ${statusColors[update.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(update.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  Showing {((pagination.page - 1) * filters.limit) + 1} to {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {showDetailModal && selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div
            className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              <div className="h-20 sm:h-24 md:h-32 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
                {/* Dot Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                />
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                {(() => {
                  const StatusIcon = statusIcons[selectedUpdate.status];
                  return (
                    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/90 backdrop-blur-sm ${
                      selectedUpdate.status === 'pending' ? 'text-yellow-700' :
                      selectedUpdate.status === 'approved' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      {selectedUpdate.status.charAt(0).toUpperCase() + selectedUpdate.status.slice(1)}
                    </span>
                  );
                })()}
              </div>
              
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {/* Update Type Badge */}
              <div className="absolute -bottom-5 sm:-bottom-6 left-3 sm:left-6">
                {(() => {
                  const TypeIcon = updateTypeIcons[selectedUpdate.updateType] || FileEdit;
                  return (
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TypeIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Update Type</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                          {updateTypeLabels[selectedUpdate.updateType] || selectedUpdate.updateType}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6 pt-8 sm:pt-10 md:pt-12 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
              
              {/* Resident Information */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Resident</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedUpdate.user?.firstName} {selectedUpdate.user?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedUpdate.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                      {selectedUpdate.user?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedUpdate.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason for Update */}
              {selectedUpdate.updateReason && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    Reason for Update
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-amber-700 dark:text-amber-400 bg-white/50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                    {selectedUpdate.updateReason}
                  </p>
                </div>
              )}

              {/* Proof Documents */}
              {selectedUpdate.documents?.length > 0 && (
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 bg-blue-50/30 dark:bg-blue-900/10">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    Proof Documents ({selectedUpdate.documents.length})
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    Review these documents to verify the resident's update request
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {selectedUpdate.documents.map((doc, idx) => {
                      const isImage = doc.originalName?.match(/\.(jpg|jpeg|png|gif)$/i) || doc.url?.match(/\.(jpg|jpeg|png|gif)$/i);
                      const imageUrl = doc.url?.startsWith('http') ? doc.url : `${API_URL}/${doc.url}`;
                      return (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group">
                          {isImage ? (
                            <button
                              onClick={() => openImageGallery(selectedUpdate.documents.map(d => d.url?.startsWith('http') ? d.url : `${API_URL}/${d.url}`), idx)}
                              className="w-full h-20 sm:h-24 md:h-28 bg-gray-100 dark:bg-gray-700 relative"
                            >
                              <img 
                                src={imageUrl} 
                                alt={doc.originalName} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ) : (
                            <div className="h-20 sm:h-24 md:h-28 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div className="p-1.5 sm:p-2">
                            <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white truncate">
                              {doc.originalName || 'Document'}
                            </p>
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 mt-0.5 sm:mt-1"
                            >
                              <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Changed Fields - User Friendly Display */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    What's Being Updated
                  </h3>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {(selectedUpdate.changedFields?.filter(f => !f.fieldPath?.toLowerCase().includes('verificationconfig'))?.length) || 0} change{((selectedUpdate.changedFields?.filter(f => !f.fieldPath?.toLowerCase().includes('verificationconfig'))?.length) || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {selectedUpdate.changedFields?.filter(f => !f.fieldPath?.toLowerCase().includes('verificationconfig'))?.length > 0 ? (
                  <>
                    {/* Grouped Display */}
                    {Object.entries(groupChangedFields(selectedUpdate.changedFields)).map(([groupName, fields]) => (
                      <div key={groupName} className="mb-3 sm:mb-4 last:mb-0">
                        <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                          {groupName}
                        </h4>
                        <div className="space-y-2">
                          {fields.map((change, idx) => (
                            <div 
                              key={idx} 
                              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-600"
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="flex-1">
                                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {getFieldLabel(change.fieldPath)}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    {/* Old Value */}
                                    <div className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-2 sm:p-3">
                                      <p className="text-[8px] sm:text-[10px] text-red-500 uppercase tracking-wider mb-0.5 sm:mb-1">Previous</p>
                                      <p className="text-[10px] sm:text-xs md:text-sm text-red-700 dark:text-red-400 font-medium break-words">
                                        {formatFieldValue(change.oldValue, change.fieldPath)}
                                      </p>
                                    </div>
                                    
                                    {/* Arrow */}
                                    <div className="hidden sm:flex items-center justify-center">
                                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    </div>
                                    <div className="flex sm:hidden items-center justify-center">
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    {/* New Value */}
                                    <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-2 sm:p-3">
                                      <p className="text-[8px] sm:text-[10px] text-green-500 uppercase tracking-wider mb-0.5 sm:mb-1">New</p>
                                      <p className="text-[10px] sm:text-xs md:text-sm text-green-700 dark:text-green-400 font-medium break-words">
                                        {formatFieldValue(change.newValue, change.fieldPath)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Pagination for many fields */}
                    {selectedUpdate.changedFields.length > fieldsPerPage && (
                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          Showing {((fieldPage - 1) * fieldsPerPage) + 1} to {Math.min(fieldPage * fieldsPerPage, selectedUpdate.changedFields.length)} of {selectedUpdate.changedFields.length}
                        </p>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => setFieldPage(p => Math.max(1, p - 1))}
                            disabled={fieldPage === 1}
                            className="p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <span className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                            Page {fieldPage}
                          </span>
                          <button
                            onClick={() => setFieldPage(p => Math.min(Math.ceil(selectedUpdate.changedFields.length / fieldsPerPage), p + 1))}
                            disabled={fieldPage >= Math.ceil(selectedUpdate.changedFields.length / fieldsPerPage)}
                            className="p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No field changes detected</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedUpdate.status === 'rejected' && selectedUpdate.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Rejection Reason
                  </h4>
                  <p className="text-[10px] sm:text-xs md:text-sm text-red-700 dark:text-red-400">{selectedUpdate.rejectionReason}</p>
                  {selectedUpdate.reviewedAt && (
                    <p className="text-[10px] sm:text-xs text-red-500 dark:text-red-400/70 mt-2">
                      Rejected on {formatDate(selectedUpdate.reviewedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Approval Info (if approved) */}
              {selectedUpdate.status === 'approved' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Update Approved & Applied
                  </h4>
                  <p className="text-[10px] sm:text-xs md:text-sm text-green-700 dark:text-green-400">
                    This update has been approved and applied to the resident's profile.
                  </p>
                  {selectedUpdate.reviewedAt && (
                    <p className="text-[10px] sm:text-xs text-green-500 dark:text-green-400/70 mt-2">
                      Approved on {formatDate(selectedUpdate.reviewedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer - Action Buttons */}
            {selectedUpdate.status === 'pending' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Review the changes above before approving or rejecting
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-red-600 rounded-lg sm:rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedUpdate._id)}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg sm:rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/25"
                  >
                    {actionLoading ? (
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden sm:inline">Approve & Apply</span>
                    <span className="sm:hidden">Approve</span>
                  </button>
                </div>
              </div>
            )}

            {/* Close button for non-pending */}
            {selectedUpdate.status !== 'pending' && (
              <div className="flex justify-end p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== REJECT MODAL - PREMIUM DESIGN ==================== */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }}></div>
              </div>
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white">Reject Update</h2>
                  <p className="text-red-200 text-xs sm:text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-xs md:text-sm text-red-800 dark:text-red-300">
                  <strong>Note:</strong> Please provide a clear reason for rejecting this update request. The resident will be notified via email.
                </p>
              </div>
              
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="e.g., Documents provided are not clear enough, please resubmit with better quality images..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg sm:rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-red-600/25"
              >
                {actionLoading ? (
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== IMAGE PREVIEW MODAL ==================== */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-2 sm:p-4 bg-black/95"
          onClick={() => setShowImageModal(null)}
        >
          <button
            onClick={() => setShowImageModal(null)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Navigation for multiple images */}
          {Array.isArray(showImageModal) && showImageModal.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev > 0 ? prev - 1 : showImageModal.length - 1);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev < showImageModal.length - 1 ? prev + 1 : 0);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </button>
            </>
          )}
          
          {/* Image container */}
          <div className="flex-1 flex items-center justify-center max-w-5xl w-full overflow-hidden">
            <img 
              src={Array.isArray(showImageModal) ? showImageModal[currentImageIndex] : showImageModal}
              alt="Document Preview"
              className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Image counter - fixed at bottom, separate from image */}
          {Array.isArray(showImageModal) && showImageModal.length > 1 && (
            <div className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm md:text-base font-medium">
              {currentImageIndex + 1} / {showImageModal.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileUpdates;
