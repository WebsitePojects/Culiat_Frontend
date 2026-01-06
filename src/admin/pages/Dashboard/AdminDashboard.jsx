import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Users,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  UserPlus,
  BarChart3,
  FolderOpen,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MapPin,
  Heart,
  Briefcase,
  User,
  Eye,
  FileSpreadsheet,
  Megaphone,
  LayoutDashboard,
  Calendar,
  Activity,
  Download,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Reusable StatCard Component with Dropdown
const StatCard = ({ 
  title, 
  value, 
  change, 
  trend = "up", 
  icon: Icon, 
  color = "blue",
  onClick,
  dropdown,
  dropdownValue,
  onDropdownChange,
  dropdownOptions = [],
  subtitle,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-200 dark:shadow-blue-900/30",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/30",
    yellow: "from-amber-500 to-amber-600 shadow-amber-200 dark:shadow-amber-900/30",
    red: "from-red-500 to-red-600 shadow-red-200 dark:shadow-red-900/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-200 dark:shadow-purple-900/30",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200 dark:shadow-indigo-900/30",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-200 dark:shadow-cyan-900/30",
    pink: "from-pink-500 to-pink-600 shadow-pink-200 dark:shadow-pink-900/30",
  };

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-emerald-400" : "text-red-400";

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClasses[color]} p-3 sm:p-4 md:p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/20"></div>
        <div className="absolute -right-8 -bottom-8 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white/10"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Icon and Dropdown */}
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          
          {dropdown && dropdownOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-white/90 bg-white/20 rounded-md sm:rounded-lg hover:bg-white/30 transition-colors"
              >
                <span className="max-w-[40px] sm:max-w-[60px] truncate">{dropdownValue || "All"}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
              {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 sm:w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-48 overflow-y-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDropdownChange("all");
                      setIsOpen(false);
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    All Areas
                  </button>
                  {dropdownOptions.map((option) => (
                    <button
                      key={option}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDropdownChange(option);
                        setIsOpen(false);
                      }}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-0.5 sm:mb-1">
          {loading ? (
            <div className="h-6 sm:h-8 w-16 sm:w-20 bg-white/20 animate-pulse rounded"></div>
          ) : (
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
        </div>

        {/* Title */}
        <p className="text-[10px] sm:text-xs md:text-sm text-white/80 font-medium mb-1 sm:mb-2">{title}</p>

        {/* Change/Subtitle */}
        {(change !== undefined || subtitle) && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {change !== undefined && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <TrendIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${trendColor}`} />
                <span className={`text-[10px] sm:text-xs font-semibold ${trendColor}`}>
                  {change >= 0 ? "+" : ""}{change}%
                </span>
              </div>
            )}
            {subtitle && (
              <span className="text-[9px] sm:text-xs text-white/60">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Demographics Card Component
const DemographicsCard = ({ title, data, icon: Icon, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5 sm:gap-2">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 sm:h-6 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ label, value, total, color = "blue" }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    cyan: "bg-cyan-500",
  };

  return (
    <div className="space-y-0.5 sm:space-y-1">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[80px] sm:max-w-[120px]">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500">{percentage}% of total</p>
    </div>
  );
};

// Data Table Component (Desktop) / Cards (Mobile)
const DataTable = ({ title, columns, data, loading, emptyMessage, onViewAll }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 sm:gap-1"
          >
            View All <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 sm:h-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage || "No data available"}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-2 sm:p-3 space-y-2 sm:space-y-3">
            {data.map((row, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{col.label}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium capitalize ${statusStyles[status] || statusStyles.pending}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedArea, setSelectedArea] = useState("all");

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [areas, setAreas] = useState([]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [dashboardRes, demographicsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/dashboard`, {
          params: { timeRange, area: selectedArea },
          headers,
        }),
        axios.get(`${API_URL}/api/analytics/demographics`, {
          params: { area: selectedArea },
          headers,
        }),
      ]);

      if (dashboardRes.data.success) {
        setDashboardData(dashboardRes.data.data);
        setAreas(dashboardRes.data.data.areas || []);
      }

      if (demographicsRes.data.success) {
        setDemographics(demographicsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedArea]);

  const handleRefresh = () => fetchDashboardData(true);

  // Export to Excel with multiple sheets for Crystal Reports
  const handleExportToExcel = () => {
    if (!dashboardData || !demographics) {
      alert("No data available to export. Please wait for data to load.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const exportDate = new Date().toLocaleDateString();
    const exportTime = new Date().toLocaleTimeString();

    // Sheet 1: Overview Summary
    const overviewData = [
      ["BARANGAY CULIAT - DASHBOARD REPORT"],
      [`Generated: ${exportDate} ${exportTime}`],
      [`Time Range: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`],
      [`Selected Area: ${selectedArea === "all" ? "All Areas" : selectedArea}`],
      [],
      ["OVERVIEW STATISTICS"],
      ["Metric", "Value", "Change (%)"],
      ["Total Residents", dashboardData?.overview?.totalResidents || 0, dashboardData?.overview?.residentChange || 0],
      ["New Residents (Period)", dashboardData?.overview?.newResidentsThisPeriod || 0, "-"],
      ["Pending Registrations", dashboardData?.overview?.pendingRegistrations || 0, "-"],
      ["Total Document Requests", dashboardData?.overview?.totalDocRequests || 0, dashboardData?.overview?.docRequestChange || 0],
      ["Pending Requests", dashboardData?.overview?.pendingRequests || 0, "-"],
      ["Approved Requests", dashboardData?.overview?.approvedRequests || 0, "-"],
      ["Completed Requests", dashboardData?.overview?.completedRequests || 0, "-"],
      ["Rejected Requests", dashboardData?.overview?.rejectedRequests || 0, "-"],
      ["Completion Rate (%)", dashboardData?.overview?.completionRate || 0, "-"],
      ["Total Reports", dashboardData?.overview?.totalReports || 0, dashboardData?.overview?.reportChange || 0],
      ["Pending Reports", dashboardData?.overview?.pendingReports || 0, "-"],
      ["Resolved Reports", dashboardData?.overview?.resolvedReports || 0, "-"],
      ["Terms Accepted", dashboardData?.overview?.totalTermsAccepted || 0, "-"],
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    overviewSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

    // Sheet 2: Gender Distribution
    const genderData = [
      ["GENDER DISTRIBUTION"],
      [`Generated: ${exportDate}`],
      [],
      ["Gender", "Count", "Percentage"],
      ["Male", demographics?.gender?.male || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.gender?.male || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Female", demographics?.gender?.female || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.gender?.female || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Other", demographics?.gender?.other || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.gender?.other || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Not Specified", demographics?.gender?.notSpecified || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.gender?.notSpecified || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      [],
      ["Total", demographics?.summary?.totalUsers || 0, "100%"],
    ];
    const genderSheet = XLSX.utils.aoa_to_sheet(genderData);
    genderSheet["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, genderSheet, "Gender");

    // Sheet 3: Civil Status Distribution
    const civilStatusData = [
      ["CIVIL STATUS DISTRIBUTION"],
      [`Generated: ${exportDate}`],
      [],
      ["Civil Status", "Count", "Percentage"],
      ["Single", demographics?.civilStatus?.single || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.civilStatus?.single || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Married", demographics?.civilStatus?.married || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.civilStatus?.married || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Widowed", demographics?.civilStatus?.widowed || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.civilStatus?.widowed || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Separated", demographics?.civilStatus?.separated || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.civilStatus?.separated || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Divorced", demographics?.civilStatus?.divorced || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.civilStatus?.divorced || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Not Specified", demographics?.civilStatus?.notSpecified || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.civilStatus?.notSpecified || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      [],
      ["Total", demographics?.summary?.totalUsers || 0, "100%"],
    ];
    const civilStatusSheet = XLSX.utils.aoa_to_sheet(civilStatusData);
    civilStatusSheet["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, civilStatusSheet, "Civil Status");

    // Sheet 4: Age Distribution
    const ageData = [
      ["AGE DISTRIBUTION"],
      [`Generated: ${exportDate}`],
      [],
      ["Age Range", "Count", "Percentage"],
      ...(demographics?.ageRanges ? Object.entries(demographics.ageRanges).map(([range, count]) => [
        range === "notSpecified" ? "Not Specified" : `${range} years`,
        count,
        demographics?.summary?.totalUsers > 0 ? (count / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"
      ]) : []),
      [],
      ["Total", demographics?.summary?.totalUsers || 0, "100%"],
    ];
    const ageSheet = XLSX.utils.aoa_to_sheet(ageData);
    ageSheet["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, ageSheet, "Age Distribution");

    // Sheet 5: Area Distribution
    const areaData = [
      ["AREA (PUROK) DISTRIBUTION"],
      [`Generated: ${exportDate}`],
      [],
      ["Area/Purok", "Resident Count", "Percentage"],
      ...(demographics?.areaDistribution || []).map(item => [
        item.area || "Unspecified",
        item.count,
        demographics?.summary?.totalUsers > 0 ? (item.count / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"
      ]),
      [],
      ["Total", demographics?.summary?.totalUsers || 0, "100%"],
    ];
    const areaSheet = XLSX.utils.aoa_to_sheet(areaData);
    areaSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, areaSheet, "Area Distribution");

    // Sheet 6: Top Occupations
    const occupationData = [
      ["TOP OCCUPATIONS"],
      [`Generated: ${exportDate}`],
      [],
      ["Occupation", "Count", "Percentage"],
      ...(demographics?.topOccupations || []).map(item => [
        item.occupation,
        item.count,
        demographics?.summary?.totalUsers > 0 ? (item.count / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"
      ]),
    ];
    const occupationSheet = XLSX.utils.aoa_to_sheet(occupationData);
    occupationSheet["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, occupationSheet, "Occupations");

    // Sheet 7: Religion Distribution
    const religionData = [
      ["RELIGION DISTRIBUTION"],
      [`Generated: ${exportDate}`],
      [],
      ["Religion", "Count", "Percentage"],
      ...(demographics?.religionDistribution || []).map(item => [
        item.religion,
        item.count,
        demographics?.summary?.totalUsers > 0 ? (item.count / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"
      ]),
    ];
    const religionSheet = XLSX.utils.aoa_to_sheet(religionData);
    religionSheet["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, religionSheet, "Religion");

    // Sheet 8: Registration Trends
    const trendsData = [
      ["REGISTRATION TRENDS"],
      [`Generated: ${exportDate}`],
      [],
      ["Month", "Year", "New Registrations"],
      ...(demographics?.registrationTrends || []).map(item => [
        item.month,
        item.year,
        item.count
      ]),
      [],
      ["Total (Period)", "", (demographics?.registrationTrends || []).reduce((sum, t) => sum + t.count, 0)],
    ];
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    trendsSheet["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, trendsSheet, "Reg Trends");

    // Sheet 9: Voter Statistics
    const voterData = [
      ["VOTER STATISTICS"],
      [`Generated: ${exportDate}`],
      [],
      ["Category", "Count", "Percentage"],
      ["Registered Voters", demographics?.summary?.votersRegistered || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.summary?.votersRegistered || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      ["Non-Voters", demographics?.summary?.nonVoters || (demographics?.summary?.totalUsers - demographics?.summary?.votersRegistered) || 0, demographics?.summary?.totalUsers > 0 ? (((demographics?.summary?.totalUsers - demographics?.summary?.votersRegistered) || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
      [],
      ["Total Users", demographics?.summary?.totalUsers || 0, "100%"],
      [],
      ["SPECIAL CATEGORIES"],
      ["Senior Citizens (60+)", demographics?.summary?.seniorCitizens || 0, demographics?.summary?.totalUsers > 0 ? ((demographics?.summary?.seniorCitizens || 0) / demographics.summary.totalUsers * 100).toFixed(1) + "%" : "0%"],
    ];
    const voterSheet = XLSX.utils.aoa_to_sheet(voterData);
    voterSheet["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, voterSheet, "Voters & Seniors");

    // Sheet 10: Recent Document Requests
    const recentDocsData = [
      ["RECENT DOCUMENT REQUESTS"],
      [`Generated: ${exportDate}`],
      [],
      ["Applicant", "Document Type", "Status", "Date"],
      ...(dashboardData?.recentActivity?.documentRequests || []).map(req => [
        req.applicant,
        req.type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "N/A",
        req.status,
        new Date(req.date).toLocaleDateString()
      ]),
    ];
    const recentDocsSheet = XLSX.utils.aoa_to_sheet(recentDocsData);
    recentDocsSheet["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, recentDocsSheet, "Recent Docs");

    // Sheet 11: Recent Reports
    const recentReportsData = [
      ["RECENT REPORTS"],
      [`Generated: ${exportDate}`],
      [],
      ["Title", "Category", "Status", "Reported By"],
      ...(dashboardData?.recentActivity?.reports || []).map(rep => [
        rep.title,
        rep.category?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A",
        rep.status,
        rep.reportedBy
      ]),
    ];
    const recentReportsSheet = XLSX.utils.aoa_to_sheet(recentReportsData);
    recentReportsSheet["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, recentReportsSheet, "Recent Reports");

    // Generate filename with date
    const filename = `Barangay_Culiat_Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const quickActions = [
    { name: "Announcements", icon: Megaphone, path: "/admin/announcements", color: "blue", description: "Manage announcements" },
    { name: "View Reports", icon: FileText, path: "/admin/reports", color: "green", description: "Manage reports" },
    { name: "Pending Users", icon: UserPlus, path: "/admin/pending-registrations", color: "yellow", description: "Review registrations" },
    { name: "All Users", icon: Users, path: "/admin/users", color: "purple", description: "Manage users" },
    { name: "Analytics", icon: BarChart3, path: "/admin/analytics", color: "indigo", description: "View insights" },
    { name: "Documents", icon: FolderOpen, path: "/admin/documents", color: "cyan", description: "Document requests" },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
      green: { bg: "bg-emerald-100 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
      yellow: { bg: "bg-amber-100 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
      purple: { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400" },
      cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400" },
    };
    return colorMap[color] || colorMap.blue;
  };

  // Document request columns
  const documentColumns = [
    { key: "applicant", label: "Applicant" },
    { key: "type", label: "Document Type", render: (val) => val?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "N/A" },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    { key: "date", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
  ];

  const reportColumns = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category", render: (val) => val?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A" },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    { key: "reportedBy", label: "Reported By" },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1">
      {/* Premium Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-3 sm:p-4 md:p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-white/70">
                Comprehensive analytics and resident management
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
            >
              <option value="week" className="text-gray-900">This Week</option>
              <option value="month" className="text-gray-900">This Month</option>
              <option value="quarter" className="text-gray-900">This Quarter</option>
              <option value="year" className="text-gray-900">This Year</option>
              <option value="all" className="text-gray-900">All Time</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportToExcel}
              disabled={loading || !dashboardData}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-emerald-500/80 backdrop-blur-sm border border-emerald-400/50 rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-white bg-blue-500/80 backdrop-blur-sm border border-blue-400/50 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 md:p-4">
        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center p-1.5 sm:p-2 md:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md group"
              >
                <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl ${colors.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${colors.text}`} />
                </div>
                <span className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-900 dark:text-white text-center leading-tight">
                  {action.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stats Grid - Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard
          title="Total Residents"
          value={dashboardData?.overview?.totalResidents || 0}
          change={dashboardData?.overview?.residentChange}
          trend={dashboardData?.overview?.residentChange >= 0 ? "up" : "down"}
          icon={Users}
          color="blue"
          dropdown
          dropdownValue={selectedArea === "all" ? "All Areas" : selectedArea}
          onDropdownChange={setSelectedArea}
          dropdownOptions={areas}
          subtitle="registered users"
          loading={loading}
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Document Requests"
          value={dashboardData?.overview?.totalDocRequests || 0}
          change={dashboardData?.overview?.docRequestChange}
          trend={dashboardData?.overview?.docRequestChange >= 0 ? "up" : "down"}
          icon={FileText}
          color="cyan"
          subtitle="this period"
          loading={loading}
          onClick={() => navigate("/admin/documents")}
        />

        <StatCard
          title="Pending Requests"
          value={dashboardData?.overview?.pendingRequests || 0}
          icon={Clock}
          color="yellow"
          subtitle="awaiting action"
          loading={loading}
          onClick={() => navigate("/admin/documents")}
        />

        <StatCard
          title="Completion Rate"
          value={`${dashboardData?.overview?.completionRate || 0}%`}
          icon={CheckCircle}
          color="green"
          subtitle="documents processed"
          loading={loading}
          onClick={() => navigate("/admin/analytics")}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard
          title="Pending Registrations"
          value={dashboardData?.overview?.pendingRegistrations || 0}
          icon={UserPlus}
          color="purple"
          loading={loading}
          onClick={() => navigate("/admin/pending-registrations")}
        />

        <StatCard
          title="Total Reports"
          value={dashboardData?.overview?.totalReports || 0}
          change={dashboardData?.overview?.reportChange}
          trend={dashboardData?.overview?.reportChange >= 0 ? "up" : "down"}
          icon={AlertCircle}
          color="red"
          loading={loading}
          onClick={() => navigate("/admin/reports")}
        />

        <StatCard
          title="Resolved Reports"
          value={dashboardData?.overview?.resolvedReports || 0}
          icon={CheckCircle}
          color="green"
          loading={loading}
          onClick={() => navigate("/admin/reports")}
        />

        <StatCard
          title="Terms Accepted"
          value={dashboardData?.overview?.totalTermsAccepted || 0}
          icon={FileText}
          color="indigo"
          loading={loading}
          onClick={() => navigate("/admin/terms-acceptances")}
        />
      </div>

      {/* Demographics Section */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Resident Demographics
          </h2>
          <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {selectedArea === "all" ? "All Areas" : `Area: ${selectedArea}`}
          </span>
        </div>

        {/* Demographics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <DemographicsCard
            title="Gender Distribution"
            icon={Users}
            loading={loading}
            data={demographics?.gender || { male: 0, female: 0, other: 0 }}
          />

          <DemographicsCard
            title="Civil Status"
            icon={Heart}
            loading={loading}
            data={demographics?.civilStatus || { single: 0, married: 0, widowed: 0, separated: 0 }}
          />

          <DemographicsCard
            title="Summary"
            icon={BarChart3}
            loading={loading}
            data={{
              "Total Users": demographics?.summary?.totalUsers || 0,
              "Senior Citizens": demographics?.summary?.seniorCitizens || 0,
              "Registered Voters": demographics?.summary?.votersRegistered || 0,
            }}
          />

          <DemographicsCard
            title="Age Groups"
            icon={Users}
            loading={loading}
            data={{
              "Youth (18-24)": demographics?.ageRanges?.["18-24"] || 0,
              "Adults (25-44)": (demographics?.ageRanges?.["25-34"] || 0) + (demographics?.ageRanges?.["35-44"] || 0),
              "Seniors (65+)": demographics?.ageRanges?.["65+"] || 0,
            }}
          />
        </div>
      </div>

      {/* Age Distribution Progress Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 md:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          Age Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {demographics?.ageRanges && Object.entries(demographics.ageRanges)
            .filter(([key]) => key !== 'notSpecified')
            .map(([range, count], idx) => {
              const colors = ["blue", "cyan", "green", "purple", "pink", "yellow"];
              return (
                <ProgressBar
                  key={range}
                  label={`${range} years`}
                  value={count}
                  total={demographics?.summary?.totalUsers || 1}
                  color={colors[idx % colors.length]}
                />
              );
            })}
        </div>
      </div>

      {/* Area Distribution */}
      {demographics?.areaDistribution && demographics.areaDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 md:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
            Residents by Area (Purok)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
            {demographics.areaDistribution.slice(0, 12).map((item) => (
              <button
                key={item.area}
                onClick={() => setSelectedArea(item.area)}
                className={`p-2 sm:p-2.5 md:p-3 rounded-lg border transition-all ${
                  selectedArea === item.area
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">{item.count.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">{item.area || "Unspecified"}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <DataTable
          title="Recent Document Requests"
          columns={documentColumns}
          data={dashboardData?.recentActivity?.documentRequests || []}
          loading={loading}
          emptyMessage="No recent document requests"
          onViewAll={() => navigate("/admin/documents")}
        />

        <DataTable
          title="Recent Reports"
          columns={reportColumns}
          data={dashboardData?.recentActivity?.reports || []}
          loading={loading}
          emptyMessage="No recent reports"
          onViewAll={() => navigate("/admin/reports")}
        />
      </div>

      {/* Top Occupations & Religions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {demographics?.topOccupations && demographics.topOccupations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 md:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              Top Occupations
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {demographics.topOccupations.slice(0, 5).map((item, idx) => (
                <ProgressBar
                  key={item.occupation}
                  label={item.occupation}
                  value={item.count}
                  total={demographics?.summary?.totalUsers || 1}
                  color={["blue", "cyan", "green", "purple", "pink"][idx % 5]}
                />
              ))}
            </div>
          </div>
        )}

        {demographics?.religionDistribution && demographics.religionDistribution.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 md:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              Religion Distribution
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {demographics.religionDistribution.slice(0, 5).map((item, idx) => (
                <ProgressBar
                  key={item.religion}
                  label={item.religion}
                  value={item.count}
                  total={demographics?.summary?.totalUsers || 1}
                  color={["purple", "blue", "cyan", "green", "pink"][idx % 5]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Registration Trends Mini Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 md:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          Registration Trends (Last 6 Months)
        </h3>
        {loading ? (
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-24 sm:h-28 md:h-32">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="h-3 sm:h-4 w-4 sm:w-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                <div className="w-full h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-t-md"></div>
                <div className="h-2.5 sm:h-3 w-6 sm:w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        ) : demographics?.registrationTrends && demographics.registrationTrends.length > 0 ? (
          <div className="flex items-end justify-between gap-1 sm:gap-2" style={{ height: "100px" }}>
            {demographics.registrationTrends.map((item, idx) => {
              const maxCount = Math.max(...demographics.registrationTrends.map(t => t.count), 1);
              const heightPx = maxCount > 0 ? Math.max((item.count / maxCount) * 70, 8) : 8;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-900 dark:text-white mb-0.5 sm:mb-1">{item.count}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500 min-h-[8px]"
                    style={{ height: `${heightPx}px` }}
                  ></div>
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 sm:h-28 md:h-32 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-50" />
              <p className="text-[10px] sm:text-xs md:text-sm">No registration data available</p>
              <p className="text-[9px] sm:text-[10px] md:text-xs">Data will appear as users register</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center py-2 sm:py-3 md:py-4">
        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 dark:text-gray-500">
          Last updated: {new Date().toLocaleString()} • Data refreshes automatically
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
