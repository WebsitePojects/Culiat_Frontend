import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FileText,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  ArrowUpDown,
  X,
  MapPin,
  User,
  Mail,
  Calendar as CalendarIcon,
  AlertTriangle,
  Image,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Flag,
  MessageSquare,
  ExternalLink,
  Inbox,
  TrendingUp,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const AdminReports = () => {
  const { notifyReportResolved, showSuccess, showInfo, showError } =
    useNotifications();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedReports, setSelectedReports] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Image gallery states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const transformedReports = response.data.data.map((report) => ({
          id: report._id,
          title: report.title,
          resident: report.reportedBy
            ? `${report.reportedBy.firstName} ${report.reportedBy.lastName}`
            : "Unknown",
          residentEmail: report.reportedBy?.email || "",
          date: new Date(report.createdAt).toISOString().split("T")[0],
          createdAt: report.createdAt,
          status: report.status,
          category: report.category,
          priority: report.priority,
          description: report.description,
          location: report.location || "Not specified",
          images: report.images || [],
        }));
        setReports(transformedReports);
        if (isRefresh) showSuccess("Reports refreshed");
      }
    } catch (error) {
      showError("Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, categoryFilter, priorityFilter, sortBy, sortOrder, reports]);

  const applyFilters = () => {
    let filtered = [...reports];

    if (filter !== "all") {
      filtered = filtered.filter((report) => report.status === filter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((report) => report.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((report) => report.priority === priorityFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title?.toLowerCase().includes(searchLower) ||
          report.resident?.toLowerCase().includes(searchLower) ||
          report.category?.toLowerCase().includes(searchLower) ||
          report.description?.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "date":
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority];
          bVal = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    setFilteredReports(filtered);
  };

  // Image gallery handlers
  const openImageGallery = useCallback((index) => {
    setCurrentImageIndex(index);
    setImageGalleryOpen(true);
  }, []);

  const closeImageGallery = useCallback(() => {
    setImageGalleryOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    if (selectedReport?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === selectedReport.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [selectedReport]);

  const prevImage = useCallback(() => {
    if (selectedReport?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedReport.images.length - 1 : prev - 1
      );
    }
  }, [selectedReport]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageGalleryOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeImageGallery();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageGalleryOpen, nextImage, prevImage, closeImageGallery]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        icon: Clock,
        label: "Pending",
        dotColor: "bg-amber-500",
      },
      "in-progress": {
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        icon: AlertCircle,
        label: "In Progress",
        dotColor: "bg-blue-500",
      },
      resolved: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        icon: CheckCircle,
        label: "Resolved",
        dotColor: "bg-emerald-500",
      },
      rejected: {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        icon: XCircle,
        label: "Rejected",
        dotColor: "bg-red-500",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: "🔴",
        label: "Urgent",
      },
      high: {
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        icon: "🟠",
        label: "High",
      },
      medium: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: "🟡",
        label: "Medium",
      },
      low: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: "🟢",
        label: "Low",
      },
    };
    return configs[priority] || configs.medium;
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r.id));
    }
  };

  const handleSelectReport = (id) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter((rid) => rid !== id));
    } else {
      setSelectedReports([...selectedReports, id]);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "Title", "Resident", "Email", "Category", "Priority",
      "Status", "Date", "Location", "Description", "Images"
    ];

    const rows = filteredReports.map((report) => [
      report.id,
      report.title,
      report.resident,
      report.residentEmail,
      report.category,
      report.priority,
      report.status,
      report.date,
      report.location,
      report.description,
      report.images?.length || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reports_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Reports exported successfully");
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedReports.map((id) =>
          axios.put(
            `${API_URL}/api/reports/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      
      const count = selectedReports.length;
      showSuccess(`${count} report${count > 1 ? "s" : ""} updated to ${status.replace("-", " ")}`);
      setSelectedReports([]);
      fetchReports();
    } catch (error) {
      showError("Failed to update reports");
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setCurrentImageIndex(0);
    setViewModalOpen(true);
  };

  const handleStatusUpdate = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setStatusUpdateModal(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/reports/${selectedReport.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess(`Report status updated to ${newStatus.replace("-", " ")}`);
      if (newStatus === "resolved") {
        notifyReportResolved(selectedReport.title);
      }
      setStatusUpdateModal(false);
      fetchReports();
    } catch (error) {
      showError("Failed to update status");
    }
  };

  const handleDeleteReport = (report) => {
    setSelectedReport(report);
    setDeleteModalOpen(true);
  };

  const confirmDeleteReport = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/reports/${selectedReport.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess("Report deleted successfully");
      setDeleteModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      showError("Failed to delete report");
    }
  };

  const categories = ["Infrastructure", "Sanitation", "Public Safety", "Other"];
  const priorities = ["urgent", "high", "medium", "low"];

  const statusCounts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    "in-progress": reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="space-y-6 p-1">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "20px 20px"
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Reports Management
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg">
              Monitor, manage and resolve resident reports efficiently.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredReports.length === 0}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-8">
          {[
            { label: "Total Reports", count: statusCounts.all, icon: Inbox, gradient: "from-blue-600 to-blue-700" },
            { label: "Pending", count: statusCounts.pending, icon: Clock, gradient: "from-amber-500 to-orange-500" },
            { label: "In Progress", count: statusCounts["in-progress"], icon: TrendingUp, gradient: "from-cyan-500 to-blue-500" },
            { label: "Resolved", count: statusCounts.resolved, icon: CheckCircle, gradient: "from-emerald-500 to-green-500" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setFilter(idx === 0 ? "all" : idx === 1 ? "pending" : idx === 2 ? "in-progress" : "resolved")}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] md:text-xs text-blue-200 uppercase tracking-wider">{stat.label}</p>
                    <p className="mt-0.5 md:mt-1 text-lg md:text-2xl font-bold text-white">{stat.count}</p>
                  </div>
                  <div className={`p-1.5 md:p-2 rounded-md md:rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedReports.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md:rounded-xl animate-in slide-in-from-top-2 duration-200 gap-2 sm:gap-0">
          <span className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-300">
            {selectedReports.length} report{selectedReports.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-1.5 md:gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleBulkStatusUpdate("in-progress")}
              className="flex-1 sm:flex-none px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium bg-blue-600 text-white rounded-md md:rounded-lg hover:bg-blue-700 transition-colors"
            >
              In Progress
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("resolved")}
              className="flex-1 sm:flex-none px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium bg-emerald-600 text-white rounded-md md:rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Resolved
            </button>
            <button
              onClick={() => setSelectedReports([])}
              className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md md:rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-3 md:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 md:left-3.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-200 dark:border-slate-600 rounded-lg md:rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 md:gap-1 p-0.5 md:p-1 bg-gray-100 dark:bg-slate-700 rounded-md md:rounded-lg overflow-x-auto">
              {["all", "pending", "in-progress", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    filter === status
                      ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {status === "all" ? "All" : status === "in-progress" ? "Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-md md:rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-md md:rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-blue-600">{filteredReports.length}</span> of {reports.length} reports
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">Loading reports...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 bg-white dark:bg-slate-800 rounded-lg md:rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 md:mb-4">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-1">No reports found</h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
            {reports.length === 0 ? "There are no reports yet" : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* Reports Grid */}
      {!loading && filteredReports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {filteredReports.map((report) => {
            const statusConfig = getStatusConfig(report.status);
            const priorityConfig = getPriorityConfig(report.priority);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={report.id}
                className={`group relative bg-white dark:bg-slate-800 rounded-lg md:rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 cursor-pointer ${
                  selectedReports.includes(report.id)
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
                onClick={() => handleViewReport(report)}
              >
                {/* Selection Checkbox */}
                <div
                  className="absolute top-3 md:top-4 left-3 md:left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Image Preview */}
                {report.images?.length > 0 && (
                  <div className="relative h-28 sm:h-32 md:h-40 overflow-hidden rounded-t-lg md:rounded-t-xl">
                    <img
                      src={report.images[0]}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {report.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1">
                        <Image className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">+{report.images.length - 1}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

                <div className="p-3 md:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        #{report.id.slice(-8)}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-full ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2.5 md:mb-3">
                    {report.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2.5 md:mb-3">
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                      <span className="truncate">{report.resident}</span>
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                      <span className="truncate">{report.location}</span>
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2.5 md:pt-3 border-t border-gray-100 dark:border-slate-700">
                    <div className={`flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border ${statusConfig.color}`}>
                      <StatusIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="text-[10px] md:text-xs font-medium">{statusConfig.label}</span>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-400">{formatDate(report.date)}</span>
                  </div>
                </div>

                {/* Quick Actions - visible on hover (desktop) or tap */}
                <div
                  className="absolute top-3 md:top-4 right-3 md:right-4 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStatusUpdate(report)}
                    className="p-1 md:p-1.5 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-md md:rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    title="Update Status"
                  >
                    <Flag className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report)}
                    className="p-1 md:p-1.5 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 rounded-md md:rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Report Modal */}
      {viewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-md">
          <div
            className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              {selectedReport.images?.length > 0 ? (
                <div className="relative h-40 md:h-64 overflow-hidden">
                  <img
                    src={selectedReport.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                  
                  {/* Image Gallery Trigger */}
                  {selectedReport.images.length > 0 && (
                    <button
                      onClick={() => openImageGallery(0)}
                      className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      View {selectedReport.images.length} photo{selectedReport.images.length > 1 ? "s" : ""}
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-20 bg-gradient-to-br from-blue-500 to-blue-600"></div>
              )}

              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-12rem)] md:max-h-[calc(90vh-16rem)]">
              {/* Title & Badges */}
              <div className="flex flex-col md:flex-row md:flex-wrap items-start gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="flex-1 min-w-0 w-full md:w-auto">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Report ID: #{selectedReport.id}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityConfig(selectedReport.priority).color}`}>
                    {selectedReport.priority.toUpperCase()}
                  </span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusConfig(selectedReport.status).color}`}>
                    {React.createElement(getStatusConfig(selectedReport.status).icon, { className: "w-3 h-3" })}
                    {getStatusConfig(selectedReport.status).label.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl">
                  <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md md:rounded-lg">
                    <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Reported By</p>
                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">{selectedReport.resident}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl">
                  <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md md:rounded-lg">
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">{selectedReport.residentEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl">
                  <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/30 rounded-md md:rounded-lg">
                    <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedReport.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl">
                  <div className="p-1.5 md:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md md:rounded-lg">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">{selectedReport.location}</p>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 md:mb-2">Category</h4>
                <span className="inline-flex items-center px-2.5 md:px-3 py-1 md:py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs md:text-sm font-medium rounded-md md:rounded-lg">
                  {selectedReport.category}
                </span>
              </div>

              {/* Description */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 md:mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl">
                  {selectedReport.description}
                </p>
              </div>

              {/* Image Gallery Thumbnails */}
              {selectedReport.images?.length > 0 && (
                <div>
                  <h4 className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 md:mb-3">
                    Attachments ({selectedReport.images.length})
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                    {selectedReport.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => openImageGallery(idx)}
                        className="relative group aspect-square rounded-lg overflow-hidden"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <button
                onClick={() => handleDeleteReport(selectedReport)}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg md:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors order-2 sm:order-1"
              >
                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Delete Report</span>
                <span className="sm:hidden">Delete</span>
              </button>
              <div className="flex items-center gap-2 md:gap-3 order-1 sm:order-2">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg md:rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    handleStatusUpdate(selectedReport);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg md:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Update Status</span>
                  <span className="sm:hidden">Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && selectedReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg md:rounded-xl">
                  <Flag className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Update Status</h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Change the status of this report</p>
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                {[
                  { value: "pending", label: "Pending", desc: "Report is awaiting review" },
                  { value: "in-progress", label: "In Progress", desc: "Report is being addressed" },
                  { value: "resolved", label: "Resolved", desc: "Issue has been resolved" },
                  { value: "rejected", label: "Rejected", desc: "Report was rejected" },
                ].map((status) => {
                  const config = getStatusConfig(status.value);
                  return (
                    <label
                      key={status.value}
                      className={`flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all ${
                        newStatus === status.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={newStatus === status.value}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${config.dotColor}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">{status.label}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{status.desc}</p>
                      </div>
                      {newStatus === status.value && (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setStatusUpdateModal(false)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg md:rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg md:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="p-5 md:p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 md:mb-2">
                Delete Report?
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                Are you sure you want to delete "{selectedReport.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg md:rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteReport}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-red-600 rounded-lg md:rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Gallery */}
      {imageGalleryOpen && selectedReport?.images?.length > 0 && (
        <div
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
          onClick={closeImageGallery}
        >
          {/* Close Button */}
          <button
            onClick={closeImageGallery}
            className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full">
            {currentImageIndex + 1} / {selectedReport.images.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-16">
            <img
              src={selectedReport.images[currentImageIndex]}
              alt=""
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Navigation */}
          {selectedReport.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          {selectedReport.images.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedReport.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden transition-all ${
                    idx === currentImageIndex
                      ? "ring-2 ring-white scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
