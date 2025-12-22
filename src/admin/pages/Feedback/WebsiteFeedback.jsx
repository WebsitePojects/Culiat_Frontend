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

  const handleMarkAsSpam = async (id) => {
    if (!window.confirm("Mark this feedback as spam?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/contact-messages/${id}/spam`,
        { isSpam: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("Feedback marked as spam");
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error updating feedback:", error);
      showError("Failed to mark as spam");
    }
  };

  const handleBlockIP = async (ip) => {
    if (!window.confirm(`Block IP address ${ip}? This will prevent further submissions from this IP.`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/contact-messages/block-ip`,
        { ipAddress: ip },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess(`IP ${ip} has been blocked`);
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error blocking IP:", error);
      showError("Failed to block IP address");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/contact-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Feedback deleted successfully");
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showError("Failed to delete feedback");
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
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentIcon = (rating) => {
    if (rating >= 4) return <ThumbsUp className="w-4 h-4 text-green-600" />;
    if (rating <= 2) return <ThumbsDown className="w-4 h-4 text-red-600" />;
    return <MessageCircle className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-purple-600" />
            Website Feedback
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage feedback from home page contact form
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchFeedbacks()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || totalFeedbacks}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Feedback</p>
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
                {stats.new}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">New Messages</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "0.0"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.blockedIPs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Blocked IPs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or message..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No feedback found</p>
            <p className="text-sm">Feedback from the contact form will appear here</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                        onClick={() => handleMarkAsSpam(feedback._id)}
                        className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                        title="Mark as Spam"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBlockIP(feedback.ipAddress)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Block IP"
                        disabled={blockedIPs.includes(feedback.ipAddress)}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feedback._id)}
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
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * feedbacksPerPage + 1} to{" "}
                {Math.min(currentPage * feedbacksPerPage, totalFeedbacks)} of {totalFeedbacks} messages
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feedback Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedFeedback.isRegistered
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <User
                    className={`w-6 h-6 ${
                      selectedFeedback.isRegistered
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedFeedback.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedFeedback.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {renderStars(selectedFeedback.rating)}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({selectedFeedback.rating}/5)
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">IP Address</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">
                    {selectedFeedback.ipAddress}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">User Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedFeedback.isRegistered ? "Registered User" : "Anonymous"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleBlockIP(selectedFeedback.ipAddress);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Block IP
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedFeedback._id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
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
