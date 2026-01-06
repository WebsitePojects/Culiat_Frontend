import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Printer,
  Receipt,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const DocumentRequestHistory = () => {
  const { showSuccess, showError } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDocType, setSelectedDocType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const requestsPerPage = 15;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const documentTypes = [
    { value: "all", label: "All Document Types" },
    { value: "clearance", label: "Barangay Clearance" },
    { value: "residency", label: "Certificate of Residency" },
    { value: "indigency", label: "Certificate of Indigency" },
    { value: "business_permit", label: "Business Permit" },
    { value: "business_clearance", label: "Business Clearance" },
    { value: "good_moral", label: "Good Moral Certificate" },
    { value: "barangay_id", label: "Barangay ID" },
    { value: "ctc", label: "Community Tax Certificate (Cedula)" },
    { value: "liquor_permit", label: "Liquor Permit" },
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    {
      value: "pending",
      label: "Pending",
      color: "text-yellow-600 bg-yellow-100",
      icon: Clock,
    },
    {
      value: "processing",
      label: "Processing",
      color: "text-blue-600 bg-blue-100",
      icon: AlertCircle,
    },
    {
      value: "approved",
      label: "Approved",
      color: "text-green-600 bg-green-100",
      icon: CheckCircle,
    },
    {
      value: "ready",
      label: "Ready for Pickup",
      color: "text-purple-600 bg-purple-100",
      icon: Printer,
    },
    {
      value: "released",
      label: "Released",
      color: "text-teal-600 bg-teal-100",
      icon: Receipt,
    },
    {
      value: "rejected",
      label: "Rejected",
      color: "text-red-600 bg-red-100",
      icon: XCircle,
    },
  ];

  useEffect(() => {
    fetchDocumentRequests();
  }, [currentPage, selectedStatus, selectedDocType, dateFrom, dateTo]);

  const fetchDocumentRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: currentPage,
        limit: requestsPerPage,
      });

      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedDocType !== "all")
        params.append("documentType", selectedDocType);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (searchQuery) params.append("search", searchQuery);

      // Fetch history and stats in parallel
      const [historyResponse, statsResponse] = await Promise.all([
        axios.get(
          `${API_URL}/api/document-requests/history?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API_URL}/api/document-requests/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (historyResponse.data.success) {
        // Transform backend data to match frontend expected format
        const transformedRequests = (
          historyResponse.data.data.requests || []
        ).map((req) => ({
          _id: req._id,
          referenceNumber: req.referenceNumber,
          documentType: req.documentType,
          documentName: req.documentName,
          requester: {
            name:
              req.applicant?.name ||
              `${req.applicant?.firstName || ""} ${
                req.applicant?.lastName || ""
              }`.trim() ||
              "Unknown",
            email: req.applicant?.email || "",
            phone: req.applicant?.phone || "",
          },
          purpose: req.purpose || "General Purpose",
          status: req.status,
          fee: req.fees || 0,
          isPaid: req.paymentStatus === "paid",
          paymentDate: req.paidAt || null,
          processedBy: req.processedBy,
          processedAt: req.processedAt,
          remarks: req.remarks || "",
          createdAt: req.createdAt,
          updatedAt: req.updatedAt,
        }));

        setRequests(transformedRequests);
        setTotalPages(historyResponse.data.data.totalPages || 1);
        setTotalRequests(historyResponse.data.data.total || 0);
      }

      if (statsResponse.data.success) {
        setStats({
          total: statsResponse.data.data.total || 0,
          approved:
            (statsResponse.data.data.approved || 0) +
            (statsResponse.data.data.completed || 0),
          pending: statsResponse.data.data.pending || 0,
          rejected: statsResponse.data.data.rejected || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching document requests:", error);
      showError("Failed to load document requests");
      setRequests([]);
      setTotalPages(1);
      setTotalRequests(0);
      setStats({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocumentRequests();
  };

  const handleRefresh = () => {
    fetchDocumentRequests();
    showSuccess("Document requests refreshed");
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedDocType !== "all")
        params.append("documentType", selectedDocType);

      const response = await axios.get(
        `${API_URL}/api/documents/history/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `document-request-history-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess("Document request history exported successfully");
    } catch (error) {
      console.error("Error exporting:", error);
      showError("Failed to export document request history");
    }
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusConfig = (status) => {
    return statuses.find((s) => s.value === status) || statuses[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-4 md:p-6">
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
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Document Request History
                </h1>
              </div>
              <p className="text-[11px] sm:text-sm text-blue-200/80">
                Track all document request approvals and service transactions
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-white/10 border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {stats.total}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Total Requests
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
                    {stats.approved}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Approved
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {stats.pending}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Pending
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
                    {stats.rejected}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Rejected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reference #, name..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>

          {/* Document Type Filter */}
          <select
            value={selectedDocType}
            onChange={(e) => {
              setSelectedDocType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
          >
            {documentTypes.map((doc) => (
              <option key={doc.value} value={doc.value}>
                {doc.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium">No document requests found</p>
            <p className="text-xs sm:text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon || Clock;
                return (
                  <div key={request._id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs sm:text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
                          {request.referenceNumber}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                          {request.documentName}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {request.requester?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(request.fee)}
                        </span>
                        {request.isPaid && (
                          <span className="ml-1.5 text-[10px] text-green-600">Paid</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(request.createdAt)}
                        </span>
                        <button
                          onClick={() => handleViewDetail(request)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference #
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Requested
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requests.map((request) => {
                    const statusConfig = getStatusConfig(request.status);
                    const StatusIcon = statusConfig.icon || Clock;
                    return (
                      <tr
                        key={request._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
                            {request.referenceNumber}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {request.documentName}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.requester?.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(request.fee)}
                            </span>
                            {request.isPaid && (
                              <span className="text-xs text-green-600">
                                Paid
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetail(request)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * requestsPerPage + 1} to{" "}
                {Math.min(currentPage * requestsPerPage, totalRequests)} of{" "}
                {totalRequests} requests
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Request Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Reference Number */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Reference Number
                </p>
                <p className="text-lg sm:text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {selectedRequest.referenceNumber}
                </p>
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Document Type
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {selectedRequest.documentName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Purpose
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {selectedRequest.purpose}
                  </p>
                </div>
              </div>

              {/* Requester Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Requester Information
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {selectedRequest.requester?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Contact
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {selectedRequest.requester?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        getStatusConfig(selectedRequest.status).color
                      }`}
                    >
                      {getStatusConfig(selectedRequest.status).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Fee
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(selectedRequest.fee)}
                      {selectedRequest.isPaid && (
                        <span className="ml-2 text-[10px] sm:text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded">
                          Paid
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Timeline
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requested:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedRequest.createdAt)}
                    </span>
                  </div>
                  {selectedRequest.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processed:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(selectedRequest.processedAt)}
                      </span>
                    </div>
                  )}
                  {selectedRequest.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(selectedRequest.paymentDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Processed By */}
              {selectedRequest.processedBy && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Processed By
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {selectedRequest.processedBy.name}
                  </p>
                </div>
              )}

              {/* Remarks */}
              {selectedRequest.remarks && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Remarks
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {selectedRequest.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentRequestHistory;
