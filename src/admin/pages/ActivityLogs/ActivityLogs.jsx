import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Users,
  FileText,
  Settings,
  Layout,
  Shield,
  MessageSquare,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";
import { useAuth } from "../../../context/AuthContext";

// ── Category derivation (client-side fallback for old logs without category) ──
const ACTION_CATEGORY_MAP = [
  { keywords: ["LOGIN", "LOGOUT", "REGISTER", "USER", "VERIFICATION", "PROFILE UPDATE"], category: "users" },
  { keywords: ["DOCUMENT"], category: "documents" },
  { keywords: ["ANNOUNCEMENT", "ACHIEVEMENT", "OFFICIAL", "SERVICE", "BANNER", "FAQ", "COMMITTEE", "BARANGAY INFO", "PAGE CONTENT", "NEWS", "PEOPLE"], category: "content" },
  { keywords: ["REPORT"], category: "reports" },
  { keywords: ["CONTACT", "FEEDBACK", "MESSAGE"], category: "feedback" },
  { keywords: ["SETTING", "MAINTENANCE", "ANALYTICS", "NOTIFICATION", "ACTIVITY LOG", "EXPORT", "PAYMENT"], category: "system" },
];

function deriveCategory(action = "") {
  const upper = action.toUpperCase();
  for (const { keywords, category } of ACTION_CATEGORY_MAP) {
    if (keywords.some((k) => upper.includes(k))) return category;
  }
  return null;
}

const ActivityLogs = () => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [exporting, setExporting] = useState(false);
  const logsPerPage = 20;
  const pollingRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const isSuperAdminOrSystemAdmin =
    user?.roleCode === 74931 ||
    user?.roleCode === 74932 ||
    user?.role === "SystemAdmin" ||
    user?.role === "SuperAdmin" ||
    (Array.isArray(user?.roleNames) &&
      (user.roleNames.includes("SystemAdmin") ||
        user.roleNames.includes("SuperAdmin")));

  const categories = [
    { value: "all", label: "All Categories", icon: ClipboardList },
    { value: "users", label: "Users", icon: Users },
    { value: "documents", label: "Documents", icon: FileText },
    { value: "content", label: "Content", icon: Layout },
    { value: "reports", label: "Reports", icon: BarChart3 },
    { value: "feedback", label: "Feedback", icon: MessageSquare },
    { value: "system", label: "System", icon: Settings },
  ];

  const actionFilters = [
    { value: "all", label: "All Actions" },
    { value: "CREATE", label: "Create" },
    { value: "UPDATE", label: "Update" },
    { value: "DELETE", label: "Delete" },
    { value: "APPROVE", label: "Approve" },
    { value: "REJECT", label: "Reject" },
    { value: "EXPORT", label: "Export" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
  ];

  // Build query params shared by fetch and export
  const buildParams = useCallback((overrides = {}) => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: logsPerPage,
      ...overrides,
    });
    if (selectedCategory !== "all") params.append("category", selectedCategory);
    if (selectedAction !== "all") params.append("action", selectedAction);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (searchQuery) params.append("search", searchQuery);
    return params;
  }, [currentPage, selectedCategory, selectedAction, dateFrom, dateTo, searchQuery]);

  const fetchActivityLogs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/logs?${buildParams().toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const raw = response.data.data.logs || [];
        // Backfill missing category from action string
        const shaped = raw.map((log) => ({
          ...log,
          category: log.category || deriveCategory(log.action),
        }));
        setLogs(shaped);
        setTotalPages(response.data.data.totalPages || 1);
        setTotalLogs(response.data.data.total || 0);
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching activity logs:", error);
        showError("Failed to load activity logs");
      }
      if (!silent) {
        setLogs([]);
        setTotalPages(1);
        setTotalLogs(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [buildParams, API_URL]);

  // Initial + filter-change fetch
  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  // Real-time polling every 15 seconds (silent refresh)
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchActivityLogs(true); // silent = true (no loading spinner)
    }, 15000);
    return () => clearInterval(pollingRef.current);
  }, [fetchActivityLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchActivityLogs();
    showSuccess("Activity logs refreshed");
  };

  // Export as XLSX matching AdminDashboard template
  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem("token");
      // Fetch all matching logs (up to 10000)
      const params = buildParams({ page: 1, limit: 10000 });
      const response = await axios.get(
        `${API_URL}/api/logs?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) throw new Error("Failed to fetch logs");

      const raw = response.data.data.logs || [];
      const rows = raw.map((log) => ({
        ...log,
        category: log.category || deriveCategory(log.action),
      }));

      if (rows.length === 0) {
        showError("No logs to export with current filters.");
        return;
      }

      const now = new Date();
      const dateLabel = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const timeLabel = now.toLocaleTimeString("en-US");

      // Compute dynamic column widths from content
      const computeWidth = (values, minW = 10, maxW = 60) => {
        const max = Math.max(...values.map((v) => String(v ?? "").length));
        return Math.min(maxW, Math.max(minW, max));
      };

      const timestamps = rows.map((r) =>
        r.timestamp ? new Date(r.timestamp).toLocaleString("en-US") : ""
      );
      const userNames = rows.map((r) => r.user?.name || "System");
      const roles = rows.map((r) => r.performedByRole || "");
      const actions = rows.map((r) => r.action || "");
      const cats = rows.map((r) => r.category || "");
      const descs = rows.map((r) => r.description || "");

      const bodyRows = rows.map((row, i) => [
        i + 1,
        row.timestamp ? new Date(row.timestamp).toLocaleString("en-US") : "",
        row.user?.name || "System",
        row.user?.username || "",
        row.performedByRole || "",
        row.action || "",
        row.category || "",
        row.description || "",
      ]);

      const exportAoA = [
        ["BARANGAY CULIAT - ACTIVITY LOGS REPORT"],
        [`Generated: ${dateLabel} ${timeLabel}`],
        [`Total Records: ${rows.length}`],
        [`Filters: ${selectedCategory !== "all" ? `Category: ${selectedCategory}` : "All Categories"} | ${selectedAction !== "all" ? `Action: ${selectedAction}` : "All Actions"}${dateFrom ? ` | From: ${dateFrom}` : ""}${dateTo ? ` | To: ${dateTo}` : ""}${searchQuery ? ` | Search: "${searchQuery}"` : ""}`],
        [""],
        ["#", "Timestamp", "Name", "Username", "Role", "Action", "Category", "Description"],
        ...bodyRows,
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportAoA);

      // Auto-adjust column widths (min/max bounded)
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: Math.max(22, computeWidth(timestamps, 22, 28)) },
        { wch: Math.max(20, computeWidth(userNames, 20, 32)) },
        { wch: Math.max(16, computeWidth(rows.map(r => r.user?.username || ""), 16, 24)) },
        { wch: Math.max(14, computeWidth(roles, 14, 22)) },
        { wch: Math.max(20, computeWidth(actions, 20, 36)) },
        { wch: Math.max(12, computeWidth(cats, 12, 18)) },
        { wch: Math.max(40, Math.min(80, computeWidth(descs, 40, 80))) },
      ];

      worksheet["!autofilter"] = { ref: "A6:H6" };
      worksheet["!freeze"] = { xSplit: 0, ySplit: 6 };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
      XLSX.writeFile(
        workbook,
        `Barangay_Culiat_Activity_Logs_${now.toISOString().split("T")[0]}.xlsx`
      );

      showSuccess(`Activity logs exported successfully (${rows.length} records).`);
    } catch (error) {
      console.error("Error exporting logs:", error);
      showError("Failed to export activity logs");
    } finally {
      setExporting(false);
    }
  };

  const getActionIcon = (action = "") => {
    const upper = action.toUpperCase();
    if (upper.includes("CREATE") || upper.includes("ADD")) return <Plus className="w-3.5 h-3.5" />;
    if (upper.includes("UPDATE") || upper.includes("EDIT")) return <Edit className="w-3.5 h-3.5" />;
    if (upper.includes("DELETE") || upper.includes("REMOVE")) return <Trash2 className="w-3.5 h-3.5" />;
    if (upper.includes("APPROVE")) return <CheckCircle className="w-3.5 h-3.5" />;
    if (upper.includes("EXPORT") || upper.includes("VIEW")) return <Eye className="w-3.5 h-3.5" />;
    if (upper.includes("LOGIN") || upper.includes("LOGOUT")) return <Shield className="w-3.5 h-3.5" />;
    return <ClipboardList className="w-3.5 h-3.5" />;
  };

  const getActionColor = (action = "") => {
    const upper = action.toUpperCase();
    if (upper.includes("CREATE") || upper.includes("ADD") || upper.includes("APPROVE")) return "text-green-700 bg-green-100";
    if (upper.includes("UPDATE") || upper.includes("EDIT") || upper.includes("TOGGLE")) return "text-blue-700 bg-blue-100";
    if (upper.includes("DELETE") || upper.includes("REMOVE") || upper.includes("REJECT")) return "text-red-700 bg-red-100";
    if (upper.includes("EXPORT")) return "text-indigo-700 bg-indigo-100";
    if (upper.includes("LOGIN")) return "text-purple-700 bg-purple-100";
    if (upper.includes("LOGOUT")) return "text-gray-600 bg-gray-100";
    return "text-gray-600 bg-gray-100";
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === (category || "").toLowerCase());
    return cat?.icon || ClipboardList;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const createCount = logs.filter((l) => l.action?.toUpperCase().includes("CREATE")).length;
  const updateCount = logs.filter((l) => l.action?.toUpperCase().includes("UPDATE")).length;
  const deleteCount = logs.filter((l) => l.action?.toUpperCase().includes("DELETE")).length;
  const loginCount = logs.filter((l) => l.action?.toUpperCase().includes("LOGIN")).length;

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-3 sm:p-4 md:p-6">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Activity Logs
                  </h1>
                  {/* Live indicator */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/30 text-green-200 border border-green-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-200">
                  Track all admin actions · Auto-updates every 15 seconds
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium rounded-lg sm:rounded-xl transition-all border border-white/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Refresh</span>
              </button>
              {isSuperAdminOrSystemAdmin && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-60 text-white font-medium rounded-lg sm:rounded-xl transition-all shadow-lg"
                >
                  <Download className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${exporting ? "animate-bounce" : ""}`} />
                  <span className="hidden xs:inline">{exporting ? "Exporting..." : "Export Excel"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/10">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{totalLogs}</p>
              <p className="text-[10px] sm:text-xs text-blue-200">Total Logs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/10">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{createCount}</p>
              <p className="text-[10px] sm:text-xs text-green-300">Create</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/10">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{updateCount}</p>
              <p className="text-[10px] sm:text-xs text-blue-300">Update</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/10">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{deleteCount + loginCount}</p>
              <p className="text-[10px] sm:text-xs text-red-300">Delete / Login</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by user, action, description..."
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </form>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
            >
              {actionFilters.map((act) => (
                <option key={act.value} value={act.value}>{act.label}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 sm:pl-10 pr-2 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              title="Date from"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 sm:pl-10 pr-2 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              title="Date to"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500 dark:text-gray-400">
            <ClipboardList className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium">No activity logs found</p>
            <p className="text-xs sm:text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => {
                const CategoryIcon = getCategoryIcon(log.category);
                return (
                  <div key={log._id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {log.user?.name || log.performedByRole || "System"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="max-w-[100px] truncate">{log.action}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {log.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <CategoryIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {log.category || "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Timestamp
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => {
                    const CategoryIcon = getCategoryIcon(log.category);
                    return (
                      <tr
                        key={log._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {log.user?.name || "System"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {log.performedByRole || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                            <span className="max-w-[160px] truncate">{log.action}</span>
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                            <CategoryIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="capitalize">{log.category || "—"}</span>
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-sm">
                          <span className="line-clamp-2">{log.description}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                {totalLogs === 0 ? 0 : (currentPage - 1) * logsPerPage + 1} to{" "}
                {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
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
    </div>
  );
};

export default ActivityLogs;
