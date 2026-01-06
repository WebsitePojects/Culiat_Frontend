import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  Mail,
  Phone,
  History,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
} from "lucide-react";

const RegistrationHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [filter, searchTerm, dateRange, registrations]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter for approved and rejected registrations only
      const processedRegs = response.data.data.filter(
        (user) =>
          user.registrationStatus === "approved" ||
          user.registrationStatus === "rejected"
      );

      setRegistrations(processedRegs);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((reg) => reg.registrationStatus === filter);
    }

    // Filter by search term (handle spaces properly)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (reg) =>
          reg.firstName?.toLowerCase().includes(searchLower) ||
          reg.lastName?.toLowerCase().includes(searchLower) ||
          reg.email?.toLowerCase().includes(searchLower) ||
          reg.username?.toLowerCase().includes(searchLower) ||
          `${reg.firstName} ${reg.lastName}`.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(
        (reg) => new Date(reg.createdAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (reg) =>
          new Date(reg.createdAt) <= new Date(dateRange.end + "T23:59:59")
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRegistrations(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Username",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Registration Date",
      "Reason",
    ];

    const rows = filteredRegistrations.map((reg) => [
      `${reg.firstName} ${reg.lastName}`,
      reg.username,
      reg.email,
      reg.phoneNumber || "N/A",
      reg.roleName,
      reg.registrationStatus,
      new Date(reg.createdAt).toLocaleDateString(),
      reg.rejectionReason || reg.approvalReason || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `registration_history_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    return status === "approved"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const getStatusIcon = (status) => {
    return status === "approved" ? CheckCircle : XCircle;
  };

  const approvedCount = registrations.filter(
    (r) => r.registrationStatus === "approved"
  ).length;
  const rejectedCount = registrations.filter(
    (r) => r.registrationStatus === "rejected"
  ).length;

  // Pagination calculations
  const totalRecords = filteredRegistrations.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, dateRange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/10 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <History className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Registration History
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-200 mt-0.5 sm:mt-1">
                  View all approved and rejected user registrations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRegistrations}
                className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredRegistrations.length === 0}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => setFilter("all")}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filter === "all"
                  ? "bg-white/20 ring-2 ring-white/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-200">Total Processed</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5">
                    {registrations.length}
                  </p>
                </div>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-300 opacity-80" />
              </div>
            </button>

            <button
              onClick={() => setFilter("approved")}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filter === "approved"
                  ? "bg-green-500/30 ring-2 ring-green-400/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-green-200">Approved</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-300 mt-0.5">
                    {approvedCount}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-300 opacity-80" />
              </div>
            </button>

            <button
              onClick={() => setFilter("rejected")}
              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
                filter === "rejected"
                  ? "bg-red-500/30 ring-2 ring-red-400/50"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-red-200">Rejected</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-300 mt-0.5">
                    {rejectedCount}
                  </p>
                </div>
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-300 opacity-80" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(filter !== "all" || searchTerm || dateRange.start || dateRange.end) && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              Showing {filteredRegistrations.length} of {registrations.length} registrations
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setSearchTerm("");
                setDateRange({ start: "", end: "" });
              }}
              className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Loading history...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRegistrations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {registrations.length === 0
              ? "No registration history found"
              : "No registrations match your filters"}
          </p>
        </div>
      )}

      {/* Registrations List */}
      {!loading && filteredRegistrations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedRegistrations.map((reg) => {
              const StatusIcon = getStatusIcon(reg.registrationStatus);
              return (
                <div
                  key={reg._id}
                  className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {reg.firstName?.[0]}
                          {reg.lastName?.[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {reg.firstName} {reg.lastName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{reg.username}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${getStatusColor(
                        reg.registrationStatus
                      )}`}
                    >
                      <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {reg.registrationStatus.charAt(0).toUpperCase() +
                        reg.registrationStatus.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                      <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{reg.email}</span>
                    </div>
                    {reg.phoneNumber && (
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{reg.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {reg.roleName}
                      </span>
                    </div>
                    {(reg.rejectionReason || reg.approvalReason) && (
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg line-clamp-2">
                        {reg.rejectionReason || reg.approvalReason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    User
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Contact
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Reason/Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {paginatedRegistrations.map((reg) => {
                  const StatusIcon = getStatusIcon(reg.registrationStatus);
                  return (
                    <tr
                      key={reg._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-9 w-9 lg:h-10 lg:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs lg:text-sm">
                              {reg.firstName?.[0]}
                              {reg.lastName?.[0]}
                            </span>
                          </div>
                          <div className="ml-3 lg:ml-4">
                            <div className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                              {reg.firstName} {reg.lastName}
                            </div>
                            <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                              @{reg.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs lg:text-sm text-gray-900 dark:text-white">
                            <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400 mr-1.5 lg:mr-2 flex-shrink-0" />
                            <span className="truncate max-w-[150px] lg:max-w-[200px]">{reg.email}</span>
                          </div>
                          {reg.phoneNumber && (
                            <div className="flex items-center text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                              <Phone className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-400 mr-1.5 lg:mr-2 flex-shrink-0" />
                              {reg.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] lg:text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {reg.roleName}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${getStatusColor(
                            reg.registrationStatus
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {reg.registrationStatus.charAt(0).toUpperCase() +
                            reg.registrationStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400 mr-1.5 lg:mr-2" />
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 max-w-[150px] lg:max-w-xs truncate" title={reg.rejectionReason || reg.approvalReason || "No reason provided"}>
                          {reg.rejectionReason ||
                            reg.approvalReason ||
                            "No reason provided"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
              {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationHistory;
