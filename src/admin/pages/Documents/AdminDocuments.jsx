import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  X,
  AlertCircle,
  Home,
  IdCard,
  Briefcase,
  FilePlus2,
  CreditCard,
  Loader2,
  Ban,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const AdminDocuments = () => {
  const { showPromise } =
    useNotifications();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [generating, setGenerating] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);
  
  // New states like PendingRegistrations
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', or null
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Document type display names (security: don't expose DB field names)
  const DOCUMENT_TYPE_LABELS = {
    indigency: "Certificate of Indigency",
    residency: "Certificate of Residency",
    clearance: "Barangay Clearance",
    business_permit: "Business Permit",
    business_clearance: "Business Clearance",
    good_moral: "Certificate of Good Moral",
    barangay_id: "Barangay ID",
    liquor_permit: "Liquor Permit",
    missionary: "Missionary Certificate",
    rehab: "Rehabilitation Certificate",
    ctc: "Community Tax Certificate",
    building_permit: "Building Permit",
  };

  // Format document type for display
  const formatDocumentType = (type) => {
    if (!type) return "Document";
    return DOCUMENT_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Document prices
  const DOCUMENT_PRICES = {
    indigency: 0,
    residency: 50,
    clearance: 100,
    business_permit: 500,
    business_clearance: 200,
    good_moral: 75,
    barangay_id: 150,
    liquor_permit: 300,
    missionary: 50,
    rehab: 50,
    ctc: 50,
    building_permit: 500,
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, requests]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/document-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filter !== "all") {
      filtered = filtered.filter((r) => r.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.applicant?.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          r.applicant?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          r.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredRequests(filtered);
  };

  const handleAction = async (requestId, action, reason = "") => {
    try {
      setUpdating(true);
      setError("");
      const token = localStorage.getItem("token");

      const request = requests.find((r) => r._id === requestId);
      const documentType = formatDocumentType(request?.documentType);

      const promise = axios.patch(
        `${API_URL}/api/document-requests/${requestId}/status`,
        {
          status: action,
          reason: reason || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await showPromise(promise, {
        loading: `${
          action === "approved" ? "Approving" : "Rejecting"
        } ${documentType}...`,
        success: `${documentType} ${action === "approved" ? "approved" : "rejected"} successfully!`,
        error: `Failed to ${action === "approved" ? "approve" : "reject"} ${documentType}`,
      });

      // Removed duplicate notifications - showPromise already handles it

      setShowModal(false);
      setSelectedRequest(null);
      setActionReason("");
      setActionType(null);
      await fetchRequests();
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setUpdating(false);
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    setActionReason("");
    setActionType(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      pending_payment:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      pending_payment: CreditCard,
      paid: CheckCircle,
      completed: CheckCircle,
      rejected: XCircle,
    };
    return icons[status] || Clock;
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [];
    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.street) parts.push(address.street);
    if (address.subdivision) parts.push(address.subdivision);
    if (address.barangay) parts.push(`Brgy. ${address.barangay}`);
    if (address.city) parts.push(address.city);
    return parts.join(", ") || "N/A";
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  // Handle document generation - downloads DOCX blob directly
  const handleGenerateDocument = async (requestId) => {
    try {
      setGenerating(true);
      setError("");
      const token = localStorage.getItem("token");

      const request = requests.find((r) => r._id === requestId);
      const documentType = request?.documentType || "Document";

      // Check if request is approved or completed
      if (request?.status !== "approved" && request?.status !== "completed") {
        setError("Document can only be generated for approved requests");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/documents/generate/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create download link for the blob
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${documentType}_${
        request?.lastName || "certificate"
      }.docx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success notification
      setSuccess(`${documentType} document generated and downloaded!`);
      setTimeout(() => setSuccess(""), 5000);

      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Document generation error:", error);
      setError(error.response?.data?.message || "Failed to generate document");
    } finally {
      setGenerating(false);
    }
  };

  // Handle manual payment confirmation (for walk-in payments)
  const handleConfirmPayment = async (requestId) => {
    try {
      setProcessingPayment(requestId);
      setError("");
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/payments/confirm/${requestId}`,
        { paymentMethod: "walk-in" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Payment confirmed successfully!");
      setTimeout(() => setSuccess(""), 5000);
      await fetchRequests();
    } catch (error) {
      console.error("Payment confirmation error:", error);
      setError(error.response?.data?.message || "Failed to confirm payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle payment waiver
  const handleWaivePayment = async (
    requestId,
    reason = "Fee waived by admin"
  ) => {
    try {
      setProcessingPayment(requestId);
      setError("");
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/payments/waive/${requestId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Payment fee waived successfully!");
      setTimeout(() => setSuccess(""), 5000);
      await fetchRequests();
    } catch (error) {
      console.error("Payment waiver error:", error);
      setError(error.response?.data?.message || "Failed to waive payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      unpaid:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      waived: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return colors[paymentStatus] || colors.unpaid;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Document Requests
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Review and process document requests from residents. Manage approvals, payments, and document generation.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
          {[
            { label: "Total Pending", count: statusCounts.pending, icon: Clock, iconColor: "text-yellow-300", iconBg: "bg-yellow-500/20" },
            { label: "Approved", count: statusCounts.approved, icon: CheckCircle, iconColor: "text-blue-300", iconBg: "bg-blue-500/20" },
            { label: "Completed", count: statusCounts.completed, icon: FileText, iconColor: "text-green-300", iconBg: "bg-green-500/20" },
            { label: "Rejected", count: statusCounts.rejected, icon: XCircle, iconColor: "text-red-300", iconBg: "bg-red-500/20" },
          ].map((stat, idx) => (
            <div
              key={idx}
              onClick={() => setFilter(stat.label === "Total Pending" ? "pending" : stat.label.toLowerCase())}
              className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stat.count}</p>
                  <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 text-xs sm:text-sm">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, document type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="approved">Approved ({statusCounts.approved})</option>
            <option value="completed">Completed ({statusCounts.completed})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
            <option value="all">All ({statusCounts.all})</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading document requests...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRequests.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? "No Results Found" : "No Document Requests"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm 
              ? `No requests match "${searchTerm}"`
              : "There are currently no document requests to display."
            }
          </p>
        </div>
      )}

      {/* Requests List - Card Grid like PendingRegistrations */}
      {!loading && filteredRequests.length > 0 && (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            {paginatedRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              const statusColors = {
                pending: 'from-yellow-500 to-orange-500',
                approved: 'from-blue-500 to-blue-600',
                completed: 'from-green-500 to-emerald-500',
                rejected: 'from-red-500 to-rose-500',
              };
              
              return (
                <motion.div
                  key={request._id}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Status Color Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${statusColors[request.status] || statusColors.pending}`}></div>
                  
                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                            {formatDocumentType(request.documentType)}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {request.firstName} {request.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.status === "approved" && (
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getPaymentStatusColor(request.paymentStatus)}`}>
                            {request.paymentStatus === "waived" ? "Waived" : request.paymentStatus?.charAt(0).toUpperCase() + request.paymentStatus?.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{request.applicant?.email || request.emailAddress || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span>{request.contactNumber || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{formatAddress(request.address)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold rounded-full">
                          {DOCUMENT_PRICES[request.documentType] === 0 ? "FREE" : `₱${DOCUMENT_PRICES[request.documentType] || 0}`}
                        </span>
                      </div>
                    </div>

                    {/* Purpose Preview */}
                    {request.purposeOfRequest && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 italic">
                        "{request.purposeOfRequest}"
                      </p>
                    )}

                    {/* View Details Button Only */}
                    <button
                      onClick={() => viewDetails(request)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
                </span>{" "}
                of <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredRequests.length}</span> requests
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))
                }
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Premium Details Modal - Like PendingRegistrations */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => {
              setShowModal(false);
              setSelectedRequest(null);
              setActionType(null);
              setActionReason("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Premium Gradient */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "24px 24px"
                  }}></div>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-white truncate">
                        {formatDocumentType(selectedRequest.documentType)}
                      </h2>
                      <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 flex-wrap">
                        <span className="text-blue-200 text-xs sm:text-sm truncate">
                          {selectedRequest.firstName} {selectedRequest.lastName}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${
                          selectedRequest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          selectedRequest.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                          selectedRequest.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                      setActionType(null);
                      setActionReason("");
                    }}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                {/* Document Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Document Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">Document Type</label>
                      <p className="text-blue-900 dark:text-blue-100 font-medium">
                        {formatDocumentType(selectedRequest.documentType)}
                      </p>
                    </div>
                    <div>
                      <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">Request Date</label>
                      <p className="text-blue-900 dark:text-blue-100">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">Document Fee</label>
                      <p className="text-blue-900 dark:text-blue-100 font-semibold">
                        {DOCUMENT_PRICES[selectedRequest.documentType] === 0 ? "FREE" : `₱${DOCUMENT_PRICES[selectedRequest.documentType] || 0}`}
                      </p>
                    </div>
                    {selectedRequest.purposeOfRequest && (
                      <div className="col-span-2 sm:col-span-3">
                        <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">Purpose</label>
                        <p className="text-blue-900 dark:text-blue-100">{selectedRequest.purposeOfRequest}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information - for approved requests */}
                {selectedRequest.status === "approved" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Payment Information
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <label className="text-yellow-600 dark:text-yellow-300 font-medium text-[10px] sm:text-xs">Payment Status</label>
                        <p className={`font-semibold ${
                          selectedRequest.paymentStatus === 'paid' ? 'text-green-600' :
                          selectedRequest.paymentStatus === 'waived' ? 'text-purple-600' :
                          'text-orange-600'
                        }`}>
                          {selectedRequest.paymentStatus === "waived" ? "Fee Waived" : 
                           selectedRequest.paymentStatus?.charAt(0).toUpperCase() + selectedRequest.paymentStatus?.slice(1)}
                        </p>
                      </div>
                      {selectedRequest.paymentReference && (
                        <div>
                          <label className="text-yellow-600 dark:text-yellow-300 font-medium text-[10px] sm:text-xs">Reference</label>
                          <p className="text-yellow-900 dark:text-yellow-100 font-mono text-[10px] sm:text-xs">{selectedRequest.paymentReference}</p>
                        </div>
                      )}
                      {selectedRequest.paidAt && (
                        <div>
                          <label className="text-yellow-600 dark:text-yellow-300 font-medium text-[10px] sm:text-xs">Paid At</label>
                          <p className="text-yellow-900 dark:text-yellow-100">{new Date(selectedRequest.paidAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Actions - in modal */}
                    {selectedRequest.paymentStatus === "unpaid" && DOCUMENT_PRICES[selectedRequest.documentType] > 0 && (
                      <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-700 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleConfirmPayment(selectedRequest._id)}
                          disabled={processingPayment === selectedRequest._id}
                          className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingPayment === selectedRequest._id ? (
                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                          )}
                          Confirm Payment
                        </button>
                        <button
                          onClick={() => handleWaivePayment(selectedRequest._id)}
                          disabled={processingPayment === selectedRequest._id}
                          className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                          Waive Fee
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="col-span-2 sm:col-span-3">
                      <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Full Name</label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {selectedRequest.firstName} {selectedRequest.middleName} {selectedRequest.lastName}
                      </p>
                    </div>
                    {selectedRequest.dateOfBirth && (
                      <div>
                        <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Date of Birth</label>
                        <p className="text-gray-900 dark:text-gray-100">{new Date(selectedRequest.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedRequest.placeOfBirth && (
                      <div>
                        <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Place of Birth</label>
                        <p className="text-gray-900 dark:text-gray-100">{selectedRequest.placeOfBirth}</p>
                      </div>
                    )}
                    {selectedRequest.gender && (
                      <div>
                        <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Gender</label>
                        <p className="text-gray-900 dark:text-gray-100 capitalize">{selectedRequest.gender}</p>
                      </div>
                    )}
                    {selectedRequest.civilStatus && (
                      <div>
                        <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Civil Status</label>
                        <p className="text-gray-900 dark:text-gray-100 capitalize">{selectedRequest.civilStatus.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    {selectedRequest.nationality && (
                      <div>
                        <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Nationality</label>
                        <p className="text-gray-900 dark:text-gray-100">{selectedRequest.nationality}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Email</label>
                      <p className="text-gray-900 dark:text-gray-100 truncate">{selectedRequest.applicant?.email || selectedRequest.emailAddress || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Phone</label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedRequest.contactNumber || "N/A"}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Address</label>
                      <p className="text-gray-900 dark:text-gray-100">{formatAddress(selectedRequest.address)}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedRequest.emergencyContact?.fullName && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Name</label>
                        <p className="text-orange-900 dark:text-orange-100">{selectedRequest.emergencyContact.fullName}</p>
                      </div>
                      <div>
                        <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Relationship</label>
                        <p className="text-orange-900 dark:text-orange-100">{selectedRequest.emergencyContact.relationship || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Contact</label>
                        <p className="text-orange-900 dark:text-orange-100">{selectedRequest.emergencyContact.contactNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Information */}
                {selectedRequest.businessInfo?.businessName && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                      <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Business Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <label className="text-indigo-600 dark:text-indigo-300 font-medium text-[10px] sm:text-xs">Business Name</label>
                        <p className="text-indigo-900 dark:text-indigo-100">{selectedRequest.businessInfo.businessName}</p>
                      </div>
                      <div>
                        <label className="text-indigo-600 dark:text-indigo-300 font-medium text-[10px] sm:text-xs">Nature of Business</label>
                        <p className="text-indigo-900 dark:text-indigo-100">{selectedRequest.businessInfo.natureOfBusiness || "N/A"}</p>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="text-indigo-600 dark:text-indigo-300 font-medium text-[10px] sm:text-xs">Business Address</label>
                        <p className="text-indigo-900 dark:text-indigo-100">{formatAddress(selectedRequest.businessInfo.businessAddress)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Rejection Reason
                    </h4>
                    <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                {/* Pending Status - Show Approve/Reject Buttons */}
                {selectedRequest.status === "pending" && actionType === null && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => setActionType("approve")}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="sm:hidden">Approve</span>
                      <span className="hidden sm:inline">Approve Request</span>
                    </button>
                    <button
                      onClick={() => setActionType("reject")}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all shadow-lg"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="sm:hidden">Reject</span>
                      <span className="hidden sm:inline">Reject Request</span>
                    </button>
                  </div>
                )}

                {/* Approve Confirmation */}
                {actionType === "approve" && (
                  <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-green-800 dark:text-green-200 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Are you sure you want to approve this document request? The resident will be notified and may proceed with payment if required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => handleAction(selectedRequest._id, "approved")}
                        disabled={updating}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating ? "Processing..." : "Confirm Approval"}
                      </button>
                      <button
                        onClick={() => setActionType(null)}
                        disabled={updating}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject with Reason */}
                {actionType === "reject" && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                      Reason for Rejection *
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      rows={3}
                      className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
                      placeholder="Please provide a clear reason for rejecting this request..."
                    />
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2.5 sm:mt-3">
                      <button
                        onClick={() => {
                          if (!actionReason.trim()) {
                            setError("Please provide a reason for rejection");
                            return;
                          }
                          handleAction(selectedRequest._id, "rejected", actionReason);
                        }}
                        disabled={updating}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating ? "Processing..." : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => {
                          setActionType(null);
                          setActionReason("");
                        }}
                        disabled={updating}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Approved/Completed Status - Show Generate Document */}
                {(selectedRequest.status === "approved" || selectedRequest.status === "completed") && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedRequest(null);
                        setActionType(null);
                      }}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors"
                    >
                      Close
                    </button>
                    {(selectedRequest.paymentStatus === "paid" || selectedRequest.paymentStatus === "waived" || DOCUMENT_PRICES[selectedRequest.documentType] === 0) && (
                      <button
                        onClick={() => handleGenerateDocument(selectedRequest._id)}
                        disabled={generating}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all shadow-lg disabled:opacity-50"
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        <span className="sm:hidden">Generate</span>
                        <span className="hidden sm:inline">Generate Document</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Rejected Status - Just Close */}
                {selectedRequest.status === "rejected" && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                      setActionType(null);
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDocuments;
