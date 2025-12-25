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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Document Request History
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all document request approvals and service transactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Requests
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.approved}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Approved
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pending
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.rejected}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rejected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reference #, name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <FileText className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No document requests found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Requested
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
                            {request.referenceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {request.documentName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
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
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Request Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Reference Number */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reference Number
                </p>
                <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {selectedRequest.referenceNumber}
                </p>
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Document Type
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRequest.documentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Purpose
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRequest.purpose}
                  </p>
                </div>
              </div>

              {/* Requester Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Requester Information
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.requester?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Contact
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.requester?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        getStatusConfig(selectedRequest.status).color
                      }`}
                    >
                      {getStatusConfig(selectedRequest.status).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fee
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(selectedRequest.fee)}
                      {selectedRequest.isPaid && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          Paid
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Timeline
                </p>
                <div className="space-y-2 text-sm">
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
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Processed By
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRequest.processedBy.name}
                  </p>
                </div>
              )}

              {/* Remarks */}
              {selectedRequest.remarks && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remarks
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
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
