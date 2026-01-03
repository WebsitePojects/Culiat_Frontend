import React, { useState, useEffect } from "react";
import axios from "axios";
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
  DollarSign,
  Ban,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const AdminDocuments = () => {
  const { notifyDocumentCompleted, notifyDocumentRejected, showPromise } =
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
      const documentType = request?.documentType || "Document";

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
          action === "completed" ? "Completing" : "Rejecting"
        } document request...`,
        success: `${documentType} request ${action} successfully!`,
        error: `Failed to ${action} request`,
      });

      if (action === "completed") {
        notifyDocumentCompleted(documentType);
      } else if (action === "rejected") {
        notifyDocumentRejected(documentType, reason);
      }

      setShowModal(false);
      setSelectedRequest(null);
      setActionReason("");
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
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Document Requests
        </h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Review and process document requests
        </p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {[
          { label: "All Requests", count: statusCounts.all, color: "blue" },
          { label: "Pending", count: statusCounts.pending, color: "yellow" },
          { label: "Completed", count: statusCounts.completed, color: "green" },
          { label: "Rejected", count: statusCounts.rejected, color: "red" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl shadow-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
          >
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            <p
              className={`mt-1 sm:mt-2 text-lg sm:text-2xl md:text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}
            >
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg dark:bg-gray-800 p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 sm:pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="approved">
                Approved ({statusCounts.approved || 0})
              </option>
              <option value="completed">
                Completed ({statusCounts.completed})
              </option>
              <option value="rejected">
                Rejected ({statusCounts.rejected})
              </option>
              <option value="all">All Requests ({statusCounts.all})</option>
            </select>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Loading requests...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRequests.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 sm:mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {requests.length === 0
              ? "No requests found"
              : "No requests match your filters"}
          </p>
        </div>
      )}

      {/* Requests List */}
      {!loading && filteredRequests.length > 0 && (
        <div className="grid gap-3 sm:gap-4">
          {filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <div
                key={request._id}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {request.documentType}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(
                              request.status
                            )}`}
                          >
                            <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                          {/* Payment Status Badge - show for approved requests */}
                          {request.status === "approved" && (
                            <span
                              className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getPaymentStatusColor(
                                request.paymentStatus
                              )}`}
                            >
                              <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                              {request.paymentStatus === "waived"
                                ? "Waived"
                                : request.paymentStatus
                                    ?.charAt(0)
                                    .toUpperCase() +
                                  request.paymentStatus?.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {request.firstName} {request.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {request.applicant?.email ||
                            request.emailAddress ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{request.contactNumber || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hidden sm:flex">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {formatAddress(request.address)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {DOCUMENT_PRICES[request.documentType] === 0
                            ? "FREE"
                            : `₱${DOCUMENT_PRICES[request.documentType] || 0}`}
                        </span>
                      </div>
                      {request.dateOfBirth && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hidden sm:flex">
                          <IdCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>
                            Born:{" "}
                            {new Date(request.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.purposeOfRequest && (
                      <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        <strong>Purpose:</strong> {request.purposeOfRequest}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0 sm:ml-4">
                    <button
                      onClick={() => viewDetails(request)}
                      className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg sm:rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>

                    {/* Pending: Show Approve/Reject */}
                    {request.status === "pending" && (
                      <div className="flex gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleAction(request._id, "approved")}
                          disabled={updating}
                          className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                        <button
                          onClick={() => viewDetails(request)}
                          disabled={updating}
                          className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Approved but unpaid: Show payment management buttons */}
                    {request.status === "approved" &&
                      request.paymentStatus === "unpaid" &&
                      DOCUMENT_PRICES[request.documentType] > 0 && (
                        <div className="flex gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleConfirmPayment(request._id)}
                            disabled={processingPayment === request._id}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Confirm walk-in payment"
                          >
                            {processingPayment === request._id ? (
                              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Confirm Paid</span>
                                <span className="sm:hidden">Paid</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleWaivePayment(request._id)}
                            disabled={processingPayment === request._id}
                            className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                            title="Waive payment fee"
                          >
                            <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                            <span className="hidden sm:inline">Waive Fee</span>
                            <span className="sm:hidden">Waive</span>
                          </button>
                        </div>
                      )}

                    {/* Approved/Completed and paid/waived: Show Generate Document */}
                    {(request.status === "approved" ||
                      request.status === "completed") &&
                      (request.paymentStatus === "paid" ||
                        request.paymentStatus === "waived" ||
                        DOCUMENT_PRICES[request.documentType] === 0) && (
                        <button
                          onClick={() => handleGenerateDocument(request._id)}
                          disabled={generating}
                          className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                        >
                          {generating ? (
                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">Generate Document</span>
                          <span className="sm:hidden">Generate</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-4xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Request Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setActionReason("");
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
              {/* Document Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Document Information
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document Type
                    </label>
                    <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 dark:text-white">
                      {selectedRequest.documentType}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <p className="mt-0.5 sm:mt-1">
                      <span
                        className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(
                          selectedRequest.status
                        )}`}
                      >
                        {selectedRequest.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Request Date
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document Fee
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white font-semibold">
                      {DOCUMENT_PRICES[selectedRequest.documentType] === 0
                        ? "FREE"
                        : `₱${
                            DOCUMENT_PRICES[selectedRequest.documentType] || 0
                          }`}
                    </p>
                  </div>
                  {selectedRequest.purposeOfRequest && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purpose
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRequest.purposeOfRequest}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information - show for approved requests */}
              {selectedRequest.status === "approved" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Payment Status
                      </label>
                      <p className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            selectedRequest.paymentStatus
                          )}`}
                        >
                          {selectedRequest.paymentStatus === "waived"
                            ? "Fee Waived"
                            : selectedRequest.paymentStatus
                                ?.charAt(0)
                                .toUpperCase() +
                              selectedRequest.paymentStatus?.slice(1)}
                        </span>
                      </p>
                    </div>
                    {selectedRequest.paymentReference && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment Reference
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white text-xs font-mono">
                          {selectedRequest.paymentReference}
                        </p>
                      </div>
                    )}
                    {selectedRequest.paidAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Paid At
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {new Date(selectedRequest.paidAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRequest.paymentWaivedReason && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Waiver Reason
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRequest.paymentWaivedReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Actions */}
                  {selectedRequest.paymentStatus === "unpaid" &&
                    DOCUMENT_PRICES[selectedRequest.documentType] > 0 && (
                      <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800 flex gap-3">
                        <button
                          onClick={() =>
                            handleConfirmPayment(selectedRequest._id)
                          }
                          disabled={processingPayment === selectedRequest._id}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingPayment === selectedRequest._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Confirm Walk-in Payment
                        </button>
                        <button
                          onClick={() =>
                            handleWaivePayment(selectedRequest._id)
                          }
                          disabled={processingPayment === selectedRequest._id}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Waive Fee
                        </button>
                      </div>
                    )}
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {selectedRequest.firstName} {selectedRequest.middleName}{" "}
                      {selectedRequest.lastName}
                    </p>
                  </div>
                  {selectedRequest.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {new Date(
                          selectedRequest.dateOfBirth
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedRequest.placeOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Place of Birth
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRequest.placeOfBirth}
                      </p>
                    </div>
                  )}
                  {selectedRequest.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gender
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white capitalize">
                        {selectedRequest.gender}
                      </p>
                    </div>
                  )}
                  {selectedRequest.civilStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Civil Status
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white capitalize">
                        {selectedRequest.civilStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                  {selectedRequest.nationality && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nationality
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRequest.nationality}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {selectedRequest.applicant?.email ||
                        selectedRequest.emailAddress ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Number
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {selectedRequest.contactNumber || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {formatAddress(selectedRequest.address)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedRequest.emergencyContact &&
                selectedRequest.emergencyContact.fullName && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRequest.emergencyContact.fullName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Relationship
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRequest.emergencyContact.relationship ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contact Number
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRequest.emergencyContact.contactNumber ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Business Information (if applicable) */}
              {selectedRequest.businessInfo &&
                selectedRequest.businessInfo.businessName && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Name
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRequest.businessInfo.businessName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nature of Business
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRequest.businessInfo.natureOfBusiness ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Address
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {formatAddress(
                            selectedRequest.businessInfo.businessAddress
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {selectedRequest.status === "pending" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes/Reason (Optional for completion, Required for
                    rejection)
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    placeholder="Add notes or rejection reason..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {selectedRequest.status === "pending" ? (
                <>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                      setActionReason("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!actionReason.trim()) {
                        setError("Please provide a reason for rejection");
                        return;
                      }
                      handleAction(
                        selectedRequest._id,
                        "rejected",
                        actionReason
                      );
                    }}
                    disabled={updating}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </button>
                  <button
                    onClick={() =>
                      handleAction(selectedRequest._id, "approved")
                    }
                    disabled={updating}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </button>
                </>
              ) : selectedRequest.status === "approved" ||
                selectedRequest.status === "completed" ? (
                <>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleGenerateDocument(selectedRequest._id)}
                    disabled={generating}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Generate Document
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
