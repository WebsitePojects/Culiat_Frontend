import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Megaphone,
  Settings,
  BarChart3,
  FolderOpen,
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
  UserCircle,
  LogOut,
  User,
  ClipboardList,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, isMobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State for collapsible sections
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [contentManagementOpen, setContentManagementOpen] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);
  
  // State for collapsed sidebar hover submenu
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0 });
  const hoverTimeoutRef = useRef(null);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Grouped menu structure - Reorganized with Documents under User Management
  const menuGroups = [
    {
      id: "main",
      items: [{ name: "Dashboard", path: "/admin/dashboard", icon: Home }],
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      collapsible: true,
      isOpen: userManagementOpen,
      setOpen: setUserManagementOpen,
      items: [
        { name: "All Users", path: "/admin/users", icon: Users },
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
        {
          name: "Terms Acceptances",
          path: "/admin/terms-acceptances",
          icon: FileCheck,
        },
        { name: "Document Requests", path: "/admin/documents", icon: FolderOpen }, // Moved here
      ],
    },
    {
      id: "content-management",
      label: "Content Management",
      icon: Layout,
      collapsible: true,
      isOpen: contentManagementOpen,
      setOpen: setContentManagementOpen,
      items: [
        {
          name: "Announcements",
          path: "/admin/announcements",
          icon: Megaphone,
        },
        { name: "Achievements", path: "/admin/achievements", icon: Trophy },
        { name: "Officials", path: "/admin/officials", icon: UserCircle },
        { name: "About Us", path: "/admin/cms/about-us", icon: Info },
        { name: "Services", path: "/admin/cms/services", icon: Briefcase },
      ],
    },
    {
      id: "operations",
      items: [
        { name: "Reports", path: "/admin/reports", icon: FileText },
        { name: "Document History", path: "/admin/document-history", icon: ClipboardList }, // Document request tracking
        { name: "Document Payments", path: "/admin/document-payments", icon: DollarSign }, // Income from document fees
        { name: "Feedback", path: "/admin/feedback", icon: MessageSquare }, // Website feedback
        { name: "Notifications", path: "/admin/notifications", icon: Bell },
      ],
    },
    {
      id: "system",
      label: "System",
      icon: Settings,
      collapsible: true,
      isOpen: systemOpen,
      setOpen: setSystemOpen,
      items: [
        { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
        { name: "Settings", path: "/admin/settings", icon: Settings },
      ],
    },
  ];

  // Bottom sticky items
  const bottomItems = [
    { name: "Profile", path: "/admin/profile", icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  const isGroupActive = (items) => {
    return items.some((item) => location.pathname === item.path);
  };

  // Auto-open groups containing active items
  React.useEffect(() => {
    menuGroups.forEach((group) => {
      if (group.collapsible && group.items && isGroupActive(group.items)) {
        group.setOpen(true);
      }
    });
  }, [location.pathname]);

  const renderMenuItem = (item, isSubItem = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={isMobileOpen ? closeMobileMenu : undefined}
        className={`flex items-center px-3 ${
          isSubItem ? "py-2 pl-10" : "py-3"
        } text-sm font-medium rounded-lg transition-all duration-200 ${
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:translate-x-1"
        } ${!isOpen && !isMobileOpen ? "justify-center" : ""}`}
        title={!isOpen && !isMobileOpen ? item.name : ""}
      >
        <Icon
          className={`flex-shrink-0 ${isSubItem ? "w-4 h-4" : "w-5 h-5"}`}
        />
        {(isOpen || isMobileOpen) && (
          <span className="ml-3 transition-opacity duration-200">
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  const renderGroup = (group) => {
    if (!group.collapsible) {
      // Regular items without grouping
      return (
        <div key={group.id} className={group.id !== "main" ? "pt-2" : ""}>
          {group.items.map((item) => renderMenuItem(item))}
        </div>
      );
    }

    // Collapsible group
    const Icon = group.icon;
    const groupActive = isGroupActive(group.items);

    if (!isOpen && !isMobileOpen) {
      // Collapsed sidebar - show icon with hover submenu for sub-tabs
      return (
        <div
          key={group.id}
          className="relative pt-2"
          onMouseEnter={(e) => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            const rect = e.currentTarget.getBoundingClientRect();
            setSubmenuPosition({ top: rect.top });
            setHoveredGroup(group.id);
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredGroup(null);
            }, 150);
          }}
        >
          <button
            className={`w-full flex items-center justify-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              groupActive
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
            title={group.label}
          >
            <Icon className="flex-shrink-0 w-5 h-5" />
          </button>
          
          {/* Hover submenu for collapsed sidebar */}
          {hoveredGroup === group.id && (
            <div
              className="fixed z-[100] w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-in slide-in-from-left-2 duration-200"
              style={{ left: '88px', top: `${submenuPosition.top}px` }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredGroup(null);
                }, 150);
              }}
            >
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 mb-1">
                {group.label}
              </div>
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 mx-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ItemIcon className="flex-shrink-0 w-4 h-4 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={group.id} className="pt-2">
        <button
          onClick={() => group.setOpen(!group.isOpen)}
          className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            groupActive
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:translate-x-1"
          }`}
        >
          <div className="flex items-center">
            <Icon className="flex-shrink-0 w-5 h-5" />
            <span className="ml-3">{group.label}</span>
          </div>
          <div className="transition-transform duration-200">
            {group.isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </button>
        {group.isOpen && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {group.items.map((item) => renderMenuItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
        {isOpen || isMobileOpen ? (
          <div className="flex items-center space-x-2">
            <img
              src="/images/logo/brgy-culiat-logo.png"
              alt="Barangay Culiat Logo"
              className="w-10 h-10 rounded-lg shadow-md bg-white p-0.5"
            />
            <span className="text-xl font-bold text-white">
              Barangay Culiat
            </span>
          </div>
        ) : (
          <img
            src="/images/logo/brgy-culiat-logo.png"
            alt="Barangay Culiat Logo"
            className="w-10 h-10 rounded-lg shadow-md bg-white p-0.5"
          />
        )}
        {isMobileOpen && (
          <button
            onClick={closeMobileMenu}
            className="ml-auto p-1 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation - flex-1 for growing, with overflow */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {menuGroups.map((group) => renderGroup(group))}
      </nav>

      {/* Sticky Bottom Section - Profile & Logout */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mt-auto">
        {/* Profile Link */}
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobileOpen ? closeMobileMenu : undefined}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              } ${!isOpen && !isMobileOpen ? "justify-center" : ""}`}
              title={!isOpen && !isMobileOpen ? item.name : ""}
            >
              <Icon className="flex-shrink-0 w-5 h-5" />
              {(isOpen || isMobileOpen) && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          );
        })}

        {/* User Info (only when expanded) */}
        {(isOpen || isMobileOpen) && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user ? `${user.firstName} ${user.lastName}` : "Admin"
                )}&background=3b82f6&color=fff`}
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-blue-500"
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Admin User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 ${
            !isOpen && !isMobileOpen ? "justify-center" : ""
          }`}
          title={!isOpen && !isMobileOpen ? "Logout" : ""}
        >
          <LogOut className="flex-shrink-0 w-5 h-5" />
          {(isOpen || isMobileOpen) && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 transition-all duration-300 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          isOpen ? "w-64" : "w-20"
        } hidden lg:flex lg:flex-col shadow-lg`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transition-transform duration-300 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:hidden shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
