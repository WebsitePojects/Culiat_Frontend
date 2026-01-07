import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  MapPin,
  X,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Download,
  Inbox,
  History,
} from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileVerifications = () => {
  const { showSuccess, showError } = useNotifications();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch pending count
  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile-verification/admin/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingCount(response.data.data?.count || 0);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  }, []);

  // Fetch verifications
  const fetchVerifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const endpoint = activeTab === 'pending' 
        ? '/api/profile-verification/admin/pending'
        : '/api/profile-verification/admin/history';
      
      console.log('[ProfileVerifications] Fetching:', { endpoint, activeTab, currentPage });
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { page: currentPage, limit: 10 },
      });

      console.log('[ProfileVerifications] Response:', {
        success: response.data.success,
        dataLength: response.data.data?.length,
        data: response.data.data,
        pagination: response.data.pagination
      });

      setVerifications(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
      
      if (isRefresh) {
        showSuccess('Verifications refreshed');
      }
    } catch (error) {
      console.error('[ProfileVerifications] Error fetching verifications:', error);
      console.error('[ProfileVerifications] Error response:', error.response?.data);
      showError('Failed to fetch verifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, currentPage, showSuccess, showError]);

  useEffect(() => {
    fetchVerifications();
    fetchPendingCount();
  }, [activeTab, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter verifications by search term
  const filteredVerifications = verifications.filter(v => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      v.user?.firstName?.toLowerCase().includes(search) ||
      v.user?.lastName?.toLowerCase().includes(search) ||
      v.user?.email?.toLowerCase().includes(search) ||
      v.submittedData?.certificateNumber?.toLowerCase().includes(search)
    );
  });

  // View verification details
  const handleViewDetails = async (verification) => {
    try {
      console.log('[ProfileVerifications] Fetching details for:', verification._id);
      const response = await axios.get(
        `${API_URL}/api/profile-verification/admin/${verification._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log('[ProfileVerifications] Details response:', response.data);
      setSelectedVerification(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('[ProfileVerifications] Error fetching verification details:', error);
      console.error('[ProfileVerifications] Error response:', error.response?.data);
      showError('Failed to load verification details');
    }
  };

  // Approve verification
  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    setIsProcessing(true);
    try {
      await axios.put(
        `${API_URL}/api/profile-verification/admin/${selectedVerification._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      showSuccess('Verification approved successfully');
      setShowDetailModal(false);
      setSelectedVerification(null);
      fetchVerifications();
      fetchPendingCount();
    } catch (error) {
      console.error('Error approving verification:', error);
      showError(error.response?.data?.message || 'Failed to approve');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open reject modal
  const handleOpenRejectModal = () => {
    setShowRejectModal(true);
  };

  // Reject verification
  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }
    
    setIsProcessing(true);
    try {
      await axios.put(
        `${API_URL}/api/profile-verification/admin/${selectedVerification._id}/reject`,
        { rejectionReason: rejectionReason.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      showSuccess('Verification rejected');
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedVerification(null);
      setRejectionReason('');
      fetchVerifications();
      fetchPendingCount();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      showError(error.response?.data?.message || 'Failed to reject');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date - full date with year (yyyy-mm-dd or readable format)
  const formatDate = (date, includeTime = true) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    if (includeTime) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    // Return yyyy-mm-dd format for date-only fields
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date as yyyy-mm-dd
  const formatDateYMD = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    };
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    };
    const Icon = icons[status] || Clock;
    
    return (
      <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium ${styles[status] || styles.pending}`}>
        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10">
          {/* Header Top */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-lg sm:rounded-xl">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  PSA Profile Verifications
                </h1>
              </div>
              <p className="text-[11px] sm:text-sm text-blue-200/80">
                Review and verify resident birth certificate submissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] sm:text-xs font-medium border border-amber-500/30">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {pendingCount} Pending
                </span>
              )}
              <button
                onClick={() => fetchVerifications(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-white/10 border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {pendingCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {activeTab === 'history' ? verifications.filter(v => v.status === 'approved').length : '-'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Approved
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {activeTab === 'history' ? verifications.filter(v => v.status === 'rejected').length : '-'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Rejected
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {totalItems}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or certificate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Tab Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
              className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-1.5" />
              Pending
            </button>
            <button
              onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
              className={`flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <History className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-1.5" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-600 mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loading verifications...</p>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Inbox className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-gray-800 dark:text-white mb-1 sm:mb-2">
              {searchTerm ? 'No results found' : activeTab === 'pending' ? 'No pending verifications' : 'No verification history'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-md mx-auto px-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : activeTab === 'pending' 
                  ? 'All verification requests have been processed' 
                  : 'Processed verifications will appear here'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resident
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Certificate No.
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredVerifications.map((v) => (
                    <tr
                      key={v._id}
                      onClick={() => handleViewDetails(v)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {v.user?.firstName?.charAt(0)}{v.user?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white">
                              {v.user?.firstName} {v.user?.lastName}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{v.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          {v.submittedData?.certificateNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(v.createdAt)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        {getStatusBadge(v.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {filteredVerifications.map((v) => (
                <div
                  key={v._id}
                  onClick={() => handleViewDetails(v)}
                  className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-[10px] sm:text-sm">
                        {v.user?.firstName?.charAt(0)}{v.user?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm">
                          {v.user?.firstName} {v.user?.lastName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{v.user?.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(v.status)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Cert: </span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {v.submittedData?.certificateNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2">
                    Submitted {formatDate(v.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{filteredVerifications.length}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 min-w-[70px] sm:min-w-[100px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal - Mobile Bottom Sheet */}
      {showDetailModal && selectedVerification && (
        <div 
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Gradient Background */}
            <div className="relative">
              <div className="h-14 sm:h-16 md:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"></div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-2.5 sm:top-3 md:top-4 right-2.5 sm:right-3 md:right-4 p-1.5 sm:p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="absolute -bottom-5 sm:-bottom-6 left-3 sm:left-4 md:left-6 p-2.5 sm:p-3 bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl shadow-lg">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Modal Title Section */}
            <div className="pt-8 sm:pt-10 md:pt-12 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                    Verification Details
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm mt-0.5">
                    Review PSA birth certificate submission
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {getStatusBadge(selectedVerification.status)}
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                    Submitted {formatDate(selectedVerification.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 max-h-[calc(95vh-14rem)] sm:max-h-[calc(90vh-16rem)] overflow-y-auto">
              {/* Rejection Reason Alert */}
              {selectedVerification.rejectionReason && (
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-red-700 dark:text-red-400">Rejection Reason</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-red-600 dark:text-red-300 mt-0.5 sm:mt-1">{selectedVerification.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid - Mobile Optimized */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
                {/* Resident Name */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded sm:rounded-md md:rounded-lg flex-shrink-0">
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Resident</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedVerification.user?.firstName} {selectedVerification.user?.lastName}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/30 rounded sm:rounded-md md:rounded-lg flex-shrink-0">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedVerification.user?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-green-100 dark:bg-green-900/30 rounded sm:rounded-md md:rounded-lg flex-shrink-0">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateYMD(selectedVerification.userDataSnapshot?.dateOfBirth)}
                    </p>
                  </div>
                </div>

                {/* Place of Birth */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-orange-100 dark:bg-orange-900/30 rounded sm:rounded-md md:rounded-lg flex-shrink-0">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Place of Birth</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedVerification.userDataSnapshot?.placeOfBirth || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* PSA Certificate Details Section */}
              <div className="mb-3 sm:mb-4">
                <h4 className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 md:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  PSA Certificate Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 p-2.5 sm:p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl">
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium">Certificate No.</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-blue-900 dark:text-blue-100 font-mono">
                      {selectedVerification.submittedData?.certificateNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium">Registry No.</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-blue-900 dark:text-blue-100 font-mono">
                      {selectedVerification.submittedData?.registryNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium">Date Issued</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {formatDateYMD(selectedVerification.submittedData?.dateIssued)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium">Place of Registration</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                      {selectedVerification.submittedData?.placeOfRegistration || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parents Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                {/* Father's Info */}
                <div className="p-2.5 sm:p-3 md:p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg sm:rounded-xl">
                  <h4 className="text-[10px] sm:text-xs md:text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1.5 sm:mb-2 md:mb-3 flex items-center gap-1.5 sm:gap-2">
                    👨 Father's Information
                  </h4>
                  <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                    <div>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400">Full Name</p>
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-indigo-900 dark:text-indigo-100">
                        {[
                          selectedVerification.submittedData?.fatherFirstName,
                          selectedVerification.submittedData?.fatherMiddleName,
                          selectedVerification.submittedData?.fatherLastName
                        ].filter(Boolean).join(' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400">Nationality</p>
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-indigo-900 dark:text-indigo-100">
                        {selectedVerification.submittedData?.fatherNationality || 'Filipino'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mother's Info */}
                <div className="p-2.5 sm:p-3 md:p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg sm:rounded-xl">
                  <h4 className="text-[10px] sm:text-xs md:text-sm font-semibold text-pink-900 dark:text-pink-100 mb-1.5 sm:mb-2 md:mb-3 flex items-center gap-1.5 sm:gap-2">
                    👩 Mother's Maiden Information
                  </h4>
                  <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                    <div>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-pink-600 dark:text-pink-400">Full Name</p>
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-pink-900 dark:text-pink-100">
                        {[
                          selectedVerification.submittedData?.motherFirstName,
                          selectedVerification.submittedData?.motherMiddleName,
                          selectedVerification.submittedData?.motherMaidenLastName
                        ].filter(Boolean).join(' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-pink-600 dark:text-pink-400">Nationality</p>
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-pink-900 dark:text-pink-100">
                        {selectedVerification.submittedData?.motherNationality || 'Filipino'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              {selectedVerification.submittedData?.documentUrl && (
                <div>
                  <h4 className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 md:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Uploaded Birth Certificate
                  </h4>
                  <div className="p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                    {selectedVerification.submittedData.documentUrl.toLowerCase().includes('.pdf') ? (
                      <a
                        href={selectedVerification.submittedData.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium text-[10px] sm:text-xs md:text-sm"
                      >
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        View PDF Document
                        <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                      </a>
                    ) : (
                      <a
                        href={selectedVerification.submittedData.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={selectedVerification.submittedData.documentUrl}
                          alt="Birth Certificate"
                          className="max-h-40 sm:max-h-48 md:max-h-72 rounded-lg object-contain mx-auto border border-gray-200 dark:border-gray-600 hover:opacity-90 transition-opacity"
                        />
                        <p className="text-center text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1.5 sm:mt-2">Click to view full size</p>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedVerification.status === 'pending' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl sm:rounded-b-2xl">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg sm:rounded-xl transition-colors font-medium text-[10px] sm:text-xs md:text-sm order-3 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenRejectModal}
                  disabled={isProcessing}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg sm:rounded-xl transition-colors font-medium flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 disabled:opacity-50 text-[10px] sm:text-xs md:text-sm order-2"
                >
                  <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg sm:rounded-xl transition-colors font-medium flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 disabled:opacity-50 text-[10px] sm:text-xs md:text-sm shadow-lg shadow-green-600/25 order-1 sm:order-3"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  )}
                  Approve
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end p-3 sm:p-4 md:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl sm:rounded-b-2xl">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg sm:rounded-xl transition-colors font-medium text-[10px] sm:text-xs md:text-sm"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal - Mobile Bottom Sheet */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowRejectModal(false)}
        >
          <div 
            className="relative w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] sm:max-h-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white">
                  Rejection Reason
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Please provide a reason for rejecting this verification. The resident will receive this feedback via email.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., The certificate number does not match the uploaded document..."
                rows={4}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white text-[10px] sm:text-xs md:text-sm resize-none"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg sm:rounded-xl transition-colors font-medium text-[10px] sm:text-xs md:text-sm order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isProcessing}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg sm:rounded-xl transition-colors font-medium flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 text-[10px] sm:text-xs md:text-sm order-1 sm:order-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileVerifications;
