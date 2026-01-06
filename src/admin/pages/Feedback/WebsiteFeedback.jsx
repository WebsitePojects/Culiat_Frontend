import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Mail,
  Clock,
  Shield,
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const WebsiteFeedback = () => {
  const { showSuccess, showError } = useNotifications();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    avgRating: 0,
    blockedIPs: 0,
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const feedbacksPerPage = 15;

  // Modal states for spam, block IP, and delete
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [showBlockIPModal, setShowBlockIPModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [actionIP, setActionIP] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New", color: "text-blue-600 bg-blue-100" },
    { value: "read", label: "Read", color: "text-gray-600 bg-gray-100" },
    { value: "responded", label: "Responded", color: "text-green-600 bg-green-100" },
    { value: "spam", label: "Spam", color: "text-red-600 bg-red-100" },
  ];

  const ratings = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "⭐⭐⭐⭐⭐ (5)" },
    { value: "4", label: "⭐⭐⭐⭐ (4)" },
    { value: "3", label: "⭐⭐⭐ (3)" },
    { value: "2", label: "⭐⭐ (2)" },
    { value: "1", label: "⭐ (1)" },
  ];

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [currentPage, selectedStatus, selectedRating, dateFrom, dateTo]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: currentPage,
        limit: feedbacksPerPage,
      });

      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedRating !== "all") params.append("rating", selectedRating);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(
        `${API_URL}/api/contact-messages?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setFeedbacks(response.data.data.feedbacks || []);
        setTotalPages(response.data.data.totalPages || 1);
        setTotalFeedbacks(response.data.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      showError("Failed to load feedback messages");
      setFeedbacks([]);
      setTotalPages(1);
      setTotalFeedbacks(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/contact-messages/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStats({
          total: response.data.data.total || 0,
          new: response.data.data.new || 0,
          avgRating: response.data.data.avgRating || 0,
          blockedIPs: response.data.data.blockedIPs || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/contact-messages/${id}/status`,
        { status: "read" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("Feedback marked as read");
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error updating feedback:", error);
      showError("Failed to update feedback status");
    }
  };

  const openSpamModal = (feedback) => {
    setActionFeedback(feedback);
    setShowSpamModal(true);
  };

  const confirmMarkAsSpam = async () => {
    if (!actionFeedback) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/contact-messages/${actionFeedback._id}/spam`,
        { isSpam: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("Feedback marked as spam");
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error updating feedback:", error);
      showError("Failed to mark as spam");
    } finally {
      setActionLoading(false);
      setShowSpamModal(false);
      setActionFeedback(null);
    }
  };

  const openBlockIPModal = (ip, feedback = null) => {
    setActionIP(ip);
    setActionFeedback(feedback);
    setShowBlockIPModal(true);
  };

  const confirmBlockIP = async () => {
    if (!actionIP) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/contact-messages/block-ip`,
        { ipAddress: actionIP },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess(`IP ${actionIP} has been blocked`);
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error blocking IP:", error);
      showError("Failed to block IP address");
    } finally {
      setActionLoading(false);
      setShowBlockIPModal(false);
      setActionIP(null);
      setActionFeedback(null);
    }
  };

  const openDeleteModal = (feedback) => {
    setActionFeedback(feedback);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!actionFeedback) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/contact-messages/${actionFeedback._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Feedback deleted successfully");
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showError("Failed to delete feedback");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setActionFeedback(null);
    }
  };

  const handleViewDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
    if (feedback.status === "new") {
      handleMarkAsRead(feedback._id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const statusConfig = statuses.find((s) => s.value === status);
    return statusConfig?.color || "text-gray-600 bg-gray-100";
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentIcon = (rating) => {
    if (rating >= 4) return <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
    if (rating <= 2) return <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />;
    return <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 md:p-8">
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
                <div className="p-2 sm:p-2.5 bg-purple-500/20 rounded-lg sm:rounded-xl">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Website Feedback
                </h1>
              </div>
              <p className="text-[11px] sm:text-sm text-purple-200/80">
                Manage feedback from home page contact form
              </p>
            </div>
            <button
              onClick={() => fetchFeedbacks()}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-white/10 border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {stats.total || totalFeedbacks}
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-200/70">
                    Total Feedback
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
                    {stats.new}
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-200/70">
                    New Messages
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "0.0"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-200/70">
                    Avg. Rating
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg">
                  <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {stats.blockedIPs}
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-200/70">
                    Blocked IPs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or message..."
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={selectedRating}
            onChange={(e) => {
              setSelectedRating(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {ratings.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500 dark:text-gray-400 p-4">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base md:text-lg font-medium text-center">No feedback found</p>
            <p className="text-xs sm:text-sm text-center">Feedback from the contact form will appear here</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className={`p-3 sm:p-4 ${
                    feedback.status === "new" ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          feedback.isRegistered
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <User
                          className={`w-4 h-4 ${
                            feedback.isRegistered
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {feedback.name || "Anonymous"}
                        </p>
                        {feedback.email && (
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                            {feedback.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                      {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(feedback.rating)}
                    {getSentimentIcon(feedback.rating)}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                    {feedback.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(feedback.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetail(feedback)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openSpamModal(feedback)}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(feedback)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop List View */}
            <div className="hidden md:block divide-y divide-gray-200 dark:divide-gray-700">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    feedback.status === "new" ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          feedback.isRegistered
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <User
                          className={`w-5 h-5 ${
                            feedback.isRegistered
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {feedback.name || "Anonymous"}
                        </span>
                        {feedback.isRegistered && (
                          <span className="px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 rounded">
                            Registered
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                          {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                        </span>
                      </div>

                      {feedback.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {feedback.email}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(feedback.rating)}
                        {getSentimentIcon(feedback.rating)}
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {feedback.message}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(feedback.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {feedback.ipAddress}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetail(feedback)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openSpamModal(feedback)}
                        className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                        title="Mark as Spam"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openBlockIPModal(feedback.ipAddress, feedback)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Block IP"
                        disabled={blockedIPs.includes(feedback.ipAddress)}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(feedback)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                Showing {(currentPage - 1) * feedbacksPerPage + 1} to{" "}
                {Math.min(currentPage * feedbacksPerPage, totalFeedbacks)} of {totalFeedbacks}
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Feedback Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    selectedFeedback.isRegistered
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <User
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      selectedFeedback.isRegistered
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {selectedFeedback.name || "Anonymous"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {selectedFeedback.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {renderStars(selectedFeedback.rating)}
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  ({selectedFeedback.rating}/5)
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">IP Address</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono text-[10px] sm:text-xs">
                    {selectedFeedback.ipAddress}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">User Type</p>
                  <p className="font-medium text-gray-900 dark:text-white text-[10px] sm:text-xs md:text-sm">
                    {selectedFeedback.isRegistered ? "Registered User" : "Anonymous"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    openSpamModal(selectedFeedback);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/30 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Mark Spam
                </button>
                <button
                  onClick={() => {
                    openBlockIPModal(selectedFeedback.ipAddress, selectedFeedback);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Block IP
                </button>
                <button
                  onClick={() => {
                    openDeleteModal(selectedFeedback);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Spam Modal */}
      {showSpamModal && actionFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !actionLoading && setShowSpamModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                Mark as Spam?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                This will mark the feedback from <span className="font-medium text-gray-900 dark:text-white">{actionFeedback.name || "Anonymous"}</span> as spam.
              </p>
              
              {/* Preview card */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {actionFeedback.email || "No email"}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {actionFeedback.message}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowSpamModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkAsSpam}
                  disabled={actionLoading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-orange-600/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  Mark as Spam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block IP Modal */}
      {showBlockIPModal && actionIP && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !actionLoading && setShowBlockIPModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Ban className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                Block IP Address?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                This will permanently block the IP address from submitting any feedback.
              </p>
              
              {/* IP Address display */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm sm:text-base font-mono font-semibold text-red-700 dark:text-red-300">
                    {actionIP}
                  </span>
                </div>
                {actionFeedback && (
                  <p className="text-[10px] sm:text-xs text-red-600/70 dark:text-red-400/70 mt-2">
                    Associated with: {actionFeedback.name || "Anonymous"}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 sm:p-3 mb-4 sm:mb-6">
                <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  This action cannot be easily undone
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowBlockIPModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBlockIP}
                  disabled={actionLoading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  Block IP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && actionFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !actionLoading && setShowDeleteModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                Delete Feedback?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                This action cannot be undone. The feedback will be permanently removed.
              </p>
              
              {/* Preview card */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      {actionFeedback.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${star <= actionFeedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {actionFeedback.message}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {formatDate(actionFeedback.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteFeedback;
