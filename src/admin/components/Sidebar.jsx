import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Megaphone,
  Settings,
  BarChart3,
  FolderOpen,
  Calendar,
  Bell,
  X,
  UserCheck,
  FileCheck,
  History,
  Trophy,
  Layout,
  ChevronDown,
  ChevronRight,
  Info,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, isMobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [cmsOpen, setCmsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: Home },
    { name: "Users", path: "/admin/users", icon: Users },
    {
      name: "Pending Registrations",
      path: "/admin/pending-registrations",
      icon: UserCheck,
    },
    {
      name: "Registration History",
      path: "/admin/registration-history",
      icon: History,
    },
    { name: "Reports", path: "/admin/reports", icon: FileText },
    { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { name: "Achievements", path: "/admin/achievements", icon: Trophy },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Documents", path: "/admin/documents", icon: FolderOpen },
    { name: "Calendar", path: "/admin/calendar", icon: Calendar },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    {
      name: "Terms Acceptances",
      path: "/admin/terms-acceptances",
      icon: FileCheck,
    },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const cmsItems = [
    { name: "About Us", path: "/admin/cms/about-us", icon: Info },
    { name: "Services", path: "/admin/cms/services", icon: Briefcase },
  ];

  const isActive = (path) => location.pathname === path;
  const isCMSActive = cmsItems.some((item) => location.pathname === item.path);

  React.useEffect(() => {
    if (isCMSActive) {
      setCmsOpen(true);
    }
  }, [isCMSActive]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 transition-all duration-300 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          isOpen ? "w-64" : "w-20"
        } hidden lg:flex lg:flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          {isOpen ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-white rounded-lg shadow-md">
                <span className="text-xl font-bold">BC</span>
              </div>
              <span className="text-xl font-bold text-white">
                Barangay Culiat
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-white rounded-lg shadow-md">
              <span className="text-xl font-bold">BC</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:translate-x-1"
                } ${!isOpen ? "justify-center" : ""}`}
                title={!isOpen ? item.name : ""}
              >
                <Icon className="flex-shrink-0 w-5 h-5" />
                {isOpen && (
                  <span className="ml-3 transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}

          {/* CMS Section */}
          {isOpen ? (
            <div className="pt-2">
              <button
                onClick={() => setCmsOpen(!cmsOpen)}
                className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isCMSActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:translate-x-1"
                }`}
              >
                <div className="flex items-center">
                  <Layout className="flex-shrink-0 w-5 h-5" />
                  <span className="ml-3">CMS</span>
                </div>
                <div className="transition-transform duration-200">
                  {cmsOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
              {cmsOpen && (
                <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {cmsItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:translate-x-1"
                        }`}
                      >
                        <Icon className="flex-shrink-0 w-4 h-4" />
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/admin/cms/about-us"
              className={`flex items-center justify-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isCMSActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              title="CMS"
            >
              <Layout className="flex-shrink-0 w-5 h-5" />
            </Link>
          )}
        </nav>

        {/* User Profile Section */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user ? `${user.firstName} ${user.lastName}` : "Admin"
                )}&background=3b82f6&color=fff`}
                alt="Profile"
                className="w-10 h-10 rounded-full ring-2 ring-blue-500"
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Admin User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user?.username || user?.email || "admin"}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transition-transform duration-300 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:hidden shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo with Close Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-white rounded-lg shadow-md">
              <span className="text-xl font-bold">BC</span>
            </div>
            <span className="text-xl font-bold text-white">
              Barangay Culiat
            </span>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-1 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="flex-shrink-0 w-5 h-5" />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}

          {/* CMS Section */}
          <div className="pt-2">
            <button
              onClick={() => setCmsOpen(!cmsOpen)}
              className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isCMSActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Layout className="flex-shrink-0 w-5 h-5" />
                <span className="ml-3">CMS</span>
              </div>
              <div className="transition-transform duration-200">
                {cmsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>
            {cmsOpen && (
              <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {cmsItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="flex-shrink-0 w-4 h-4" />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user ? `${user.firstName} ${user.lastName}` : "Admin"
              )}&background=3b82f6&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-full ring-2 ring-blue-500"
            />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {user ? `${user.firstName} ${user.lastName}` : "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{user?.username || user?.email || "admin"}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                {user?.role || "Admin"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
