import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DollarSign,
  Search,
  Calendar,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  FileText,
  PieChart,
  BarChart3,
  Eye,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const DocumentPayments = () => {
  const { showSuccess, showError } = useNotifications();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    topDocument: "",
  });
  const [documentBreakdown, setDocumentBreakdown] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const recordsPerPage = 15;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const documentTypes = [
    { value: "all", label: "All Document Types" },
    { value: "clearance", label: "Barangay Clearance", fee: 100 },
    { value: "residency", label: "Certificate of Residency", fee: 50 },
    { value: "indigency", label: "Certificate of Indigency", fee: 0 },
    { value: "business_permit", label: "Business Permit", fee: 500 },
    { value: "business_clearance", label: "Business Clearance", fee: 200 },
    { value: "good_moral", label: "Good Moral Certificate", fee: 75 },
    { value: "barangay_id", label: "Barangay ID", fee: 150 },
    { value: "ctc", label: "Community Tax Certificate", fee: 50 },
    { value: "liquor_permit", label: "Liquor Permit", fee: 300 },
  ];

  useEffect(() => {
    fetchPayments();
  }, [currentPage, selectedDocType, dateFrom, dateTo]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: currentPage,
        limit: recordsPerPage,
      });

      if (selectedDocType !== "all")
        params.append("documentType", selectedDocType);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(
        `${API_URL}/api/document-requests/payments?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPayments(response.data.data.payments || []);
        setTotalPages(response.data.data.totalPages || 1);
        setTotalRecords(response.data.data.total || 0);
        setSummary(
          response.data.data.summary || {
            totalRevenue: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            topDocument: "",
          }
        );
        setDocumentBreakdown(response.data.data.breakdown || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      showError("Failed to load payment records");
      setPayments([]);
      setTotalPages(1);
      setTotalRecords(0);
      setSummary({
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        topDocument: "",
      });
      setDocumentBreakdown([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments();
  };

  const handleRefresh = () => {
    fetchPayments();
    showSuccess("Payment records refreshed");
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (selectedDocType !== "all")
        params.append("documentType", selectedDocType);

      const response = await axios.get(
        `${API_URL}/api/documents/payments/export?${params.toString()}`,
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
        `document-payments-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      showError("Failed to export report");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-600" />
            Document Payment Income
          </h1>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Track income from document service fees and payments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-green-600 mt-0.5 sm:mt-1 truncate">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-md sm:rounded-lg flex-shrink-0 ml-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                Transactions
              </p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-blue-600 mt-0.5 sm:mt-1">
                {summary.totalTransactions}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md sm:rounded-lg flex-shrink-0 ml-2">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg. Transaction
              </p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-purple-600 mt-0.5 sm:mt-1 truncate">
                {formatCurrency(summary.averageTransaction)}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-md sm:rounded-lg flex-shrink-0 ml-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                Top Document
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-orange-600 mt-0.5 sm:mt-1 truncate">
                {summary.topDocument || "N/A"}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 md:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-md sm:rounded-lg flex-shrink-0 ml-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Document Type */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
          <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Revenue by Document Type
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {documentBreakdown.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3 md:p-4 text-center"
            >
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.type}
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mt-0.5 sm:mt-1">
                {formatCurrency(item.revenue)}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400">{item.count} transactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by receipt or ref #..."
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </form>

          {/* Document Type Filter */}
          <select
            value={selectedDocType}
            onChange={(e) => {
              setSelectedDocType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {documentTypes.map((doc) => (
              <option key={doc.value} value={doc.value}>
                {doc.label}
              </option>
            ))}
          </select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="From"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-green-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500 dark:text-gray-400 p-4">
            <Receipt className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base md:text-lg font-medium text-center">No payment records found</p>
            <p className="text-xs sm:text-sm text-center">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs sm:text-sm font-mono font-medium text-green-600 dark:text-green-400">
                        {payment.receiptNumber}
                      </p>
                      <p className="text-[10px] sm:text-xs font-mono text-gray-500">
                        Ref: {payment.referenceNumber}
                      </p>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="space-y-1 mb-2">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {payment.documentName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Payer: {payment.payer?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {payment.paymentMethod}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewDetail(payment)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Receipt #
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document Ref
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payer
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span className="text-xs lg:text-sm font-mono font-medium text-green-600 dark:text-green-400">
                          {payment.receiptNumber}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span className="text-xs lg:text-sm font-mono text-gray-600 dark:text-gray-300">
                          {payment.referenceNumber}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                        {payment.documentName}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                        {payment.payer?.name}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-green-600 text-right">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetail(payment)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                {totalRecords}
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
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

      {/* Receipt Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 p-4 sm:p-6">
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-3 sm:pb-4 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Official Receipt
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Barangay Culiat</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Receipt Number
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold font-mono text-green-600">
                  {selectedPayment.receiptNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Document Reference
                  </p>
                  <p className="font-medium font-mono text-gray-900 dark:text-white text-[10px] sm:text-xs">
                    {selectedPayment.referenceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Document Type
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {selectedPayment.documentName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Payer</p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {selectedPayment.payer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Payment Method
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {selectedPayment.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Payment Date
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {formatDate(selectedPayment.paymentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Received By
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {selectedPayment.receivedBy?.name}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                    Amount Paid
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPayments;
