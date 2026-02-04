import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../../context/AuthContext";
import { AlertTriangle, Shield, X } from "lucide-react";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if resident is trying to access admin portal
  useEffect(() => {
    if (user && user.role === 74934) { // Resident role code
      setShowAccessDenied(true);
      
      // Log unauthorized access attempt
      console.warn('[SECURITY] Unauthorized admin access attempt by resident user:', {
        userId: user._id,
        username: user.username,
        timestamp: new Date().toISOString(),
        route: window.location.pathname
      });
      
      // Redirect after 5 seconds
      const timer = setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Show access denied screen for residents
  if (showAccessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You do not have permission to access the admin portal. This is a restricted area for administrators only.
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Security Notice
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This unauthorized access attempt has been logged and will be monitored. All admin access attempts are tracked for security purposes.
            </p>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Redirecting you to login page in 5 seconds...
          </p>
          
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area - with margin for sidebar */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          toggleMobileMenu={toggleMobileMenu}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container px-3 py-4 sm:px-4 md:px-6 md:py-6 lg:py-8 mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 backdrop-blur-sm bg-black/30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
