import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Bell,
  FileText,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Filter,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Flag,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminNotifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    pendingDocuments: 0,
    pendingRegistrations: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchNotifications();
    fetchCounts();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/notifications/recent?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/notifications/counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCounts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
    fetchCounts();
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => n.unread)
      : notifications.filter((n) => !n.unread);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "document_request":
        return FileText;
      case "user_registration":
        return UserPlus;
      case "report":
        return Flag;
      case "announcement":
        return Megaphone;
      default:
        return Info;
    }
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
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Notifications
                </h1>
              </div>
              <p className="text-[11px] sm:text-sm text-blue-200/80">
                Stay updated with system alerts and user activities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-white/10 border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/25"
              >
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            </div>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {counts.total}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Pending Total
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
                    {counts.pendingDocuments}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Documents
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {counts.pendingRegistrations}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Registrations
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {counts.pendingReports}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200/70">
                    Reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-2.5 sm:p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm rounded-lg font-medium transition-colors ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm rounded-lg font-medium transition-colors ${
              filter === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2 sm:space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700">
            <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-blue-500 mb-3 animate-spin" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700">
            <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications found"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg sm:rounded-xl shadow hover:shadow-md transition-all border-l-4 ${
                  notification.unread
                    ? "border-l-blue-500"
                    : "border-l-transparent"
                }`}
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start gap-2.5 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                            <span className="truncate">{notification.title}</span>
                            {notification.unread && (
                              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </h3>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3">
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="w-3 h-3" />
                              {notification.time}
                            </span>
                            {notification.link && (
                              <a
                                href={notification.link}
                                className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View →
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {notification.unread && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Summary */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Recent Activity Summary
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    Document Requests
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Pending
                  </p>
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                {counts.pendingDocuments}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    New Registrations
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Pending Approval
                  </p>
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                {counts.pendingRegistrations}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    Reports
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Requiring attention
                  </p>
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                {counts.pendingReports}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
