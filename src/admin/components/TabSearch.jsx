import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  History,
  FileCheck,
  FolderOpen,
  Layout,
  Megaphone,
  Trophy,
  UserCircle,
  Info,
  Briefcase,
  FileText,
  ClipboardList,
  DollarSign,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  User,
} from "lucide-react";

const TabSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // All searchable tabs
  const allTabs = [
    { name: "Dashboard", path: "/admin/dashboard", icon: Home, category: "Main" },
    { name: "All Users", path: "/admin/users", icon: Users, category: "User Management" },
    { name: "Pending Registrations", path: "/admin/pending-registrations", icon: UserCheck, category: "User Management" },
    { name: "Registration History", path: "/admin/registration-history", icon: History, category: "User Management" },
    { name: "Terms Acceptances", path: "/admin/terms-acceptances", icon: FileCheck, category: "User Management" },
    { name: "Document Requests", path: "/admin/documents", icon: FolderOpen, category: "User Management" },
    { name: "Announcements", path: "/admin/announcements", icon: Megaphone, category: "Content Management" },
    { name: "Achievements", path: "/admin/achievements", icon: Trophy, category: "Content Management" },
    { name: "Officials", path: "/admin/officials", icon: UserCircle, category: "Content Management" },
    { name: "About Us", path: "/admin/cms/about-us", icon: Info, category: "Content Management" },
    { name: "Services", path: "/admin/cms/services", icon: Briefcase, category: "Content Management" },
    { name: "Reports", path: "/admin/reports", icon: FileText, category: "Operations" },
    { name: "Document History", path: "/admin/document-history", icon: ClipboardList, category: "Operations" },
    { name: "Document Payments", path: "/admin/document-payments", icon: DollarSign, category: "Operations" },
    { name: "Website Feedback", path: "/admin/feedback", icon: MessageSquare, category: "Operations" },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, category: "Operations" },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3, category: "System" },
    { name: "Settings", path: "/admin/settings", icon: Settings, category: "System" },
    { name: "Profile", path: "/admin/profile", icon: User, category: "Account" },
  ];

  // Filter tabs based on search query
  const filteredTabs = searchQuery.trim()
    ? allTabs.filter(
        (tab) =>
          tab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tab.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || filteredTabs.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredTabs.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredTabs.length) % filteredTabs.length);
          break;
        case "Enter":
          e.preventDefault();
          if (filteredTabs[selectedIndex]) {
            handleNavigate(filteredTabs[selectedIndex].path);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchQuery("");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredTabs, selectedIndex]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  // Group filtered tabs by category
  const groupedTabs = filteredTabs.reduce((acc, tab) => {
    if (!acc[tab.category]) {
      acc[tab.category] = [];
    }
    acc[tab.category].push(tab);
    return acc;
  }, {});

  let currentIndex = 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search tabs... (Ctrl+K)"
          className="w-64 py-2 pl-10 pr-8 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:bg-gray-600 transition-all"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {filteredTabs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tabs found for "{searchQuery}"</p>
            </div>
          ) : (
            Object.entries(groupedTabs).map(([category, tabs]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  {category}
                </div>
                {tabs.map((tab) => {
                  const tabIndex = currentIndex++;
                  const Icon = tab.icon;
                  const isSelected = tabIndex === selectedIndex;

                  return (
                    <button
                      key={tab.path}
                      onClick={() => handleNavigate(tab.path)}
                      onMouseEnter={() => setSelectedIndex(tabIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`} />
                      <span className="flex-1 text-sm font-medium">{tab.name}</span>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                    </button>
                  );
                })}
              </div>
            ))
          )}

          {/* Keyboard shortcuts hint */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Enter</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabSearch;
