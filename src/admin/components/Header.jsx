import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu, Sun, Moon, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TabSearch from "./TabSearch";

const Header = ({ toggleSidebar, toggleMobileMenu, isSidebarOpen }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Refs for click outside detection
  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/notifications/recent`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 },
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/notifications/${notification.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }

    // Navigate to the relevant page
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === "registration") {
      navigate("/admin/pending-registrations");
    } else if (notification.type === "document") {
      navigate("/admin/documents");
    } else if (notification.type === "feedback") {
      navigate("/admin/feedback");
    } else if (notification.type === "report") {
      navigate("/admin/reports");
    }
    
    setShowNotifications(false);
  };

  return (
    <header className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-1.5 sm:p-2 text-gray-500 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden p-2 text-gray-500 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 lg:block transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Tab Search */}
        <div className="hidden md:block">
          <TabSearch />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 text-gray-500 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle theme"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsDropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                fetchNotifications();
              }
            }}
            className="relative p-1.5 sm:p-2 text-gray-500 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex h-2 w-2">
                <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 bottom-3 sm:bottom-auto sm:top-full z-50 sm:w-80 md:w-96 sm:mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-[70vh] sm:max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-top-2 duration-200">
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="sm:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>
              <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="inline-block w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-2 sm:mb-3">
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        notif.unread ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div
                          className={`flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 mt-1.5 sm:mt-2 rounded-full ${
                            notif.unread ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2.5 sm:p-3 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => {
                    navigate("/admin/notifications");
                    setShowNotifications(false);
                  }}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Profile menu"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user ? `${user.firstName} ${user.lastName}` : "Admin"
              )}&background=3b82f6&color=fff`}
              alt="Profile"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm"
            />
            <span className="hidden text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 md:block max-w-[100px] truncate">
              {user ? `${user.firstName}` : "Admin"}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfile && (
            <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 bottom-3 sm:bottom-auto sm:top-full z-50 sm:w-56 sm:mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-top-2 duration-200">
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user ? `${user.firstName} ${user.lastName}` : "Admin"
                    )}&background=3b82f6&color=fff`}
                    alt="Profile"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user ? `${user.firstName} ${user.lastName}` : "Admin User"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || "admin@barangay.com"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-1.5 sm:p-2">
                <button
                  onClick={() => {
                    navigate("/admin/profile");
                    setShowProfile(false);
                  }}
                  className="flex items-center w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-2.5" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 rounded-lg sm:rounded-xl hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-2.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
