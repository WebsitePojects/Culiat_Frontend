import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { reportAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
   ClipboardList,
   Plus,
   Filter,
   ArrowLeft,
   Clock,
   MapPin,
   AlertCircle,
   X,
   User,
   Image,
   ChevronLeft,
   ChevronRight,
   ZoomIn,
   Search,
   Calendar,
   CheckCircle,
   XCircle,
   RefreshCw,
   MessageSquare,
   Inbox,
   TrendingUp,
   ArrowUpDown,
   Eye,
   FileText,
} from "lucide-react";

const ReportsV2 = () => {
   const { user, isAdmin } = useAuth();
   const navigate = useNavigate();
   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [filter, setFilter] = useState({ status: "", category: "" });
   const [searchTerm, setSearchTerm] = useState("");
   const [sortOrder, setSortOrder] = useState("desc");
   const [selectedReport, setSelectedReport] = useState(null);
   const [modalOpen, setModalOpen] = useState(false);
   const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   useEffect(() => {
      fetchReports();
   }, []);

   const fetchReports = async (isRefresh = false) => {
      try {
         if (isRefresh) {
            setRefreshing(true);
         } else {
            setLoading(true);
         }
         const response = isAdmin
            ? await reportAPI.getAll()
            : await reportAPI.getMyReports();

         if (response.data.success) {
            setReports(response.data.data || []);
         } else {
            setReports([]);
         }
      } catch (error) {
         setReports([]);
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   const getStatusConfig = (status) => {
      const configs = {
         pending: {
            color: "bg-amber-100 text-amber-800 border-amber-200",
            icon: Clock,
            label: "Pending",
            gradient: "from-amber-500 to-orange-500",
         },
         "in-progress": {
            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
            icon: TrendingUp,
            label: "In Progress",
            gradient: "from-emerald-500 to-teal-500",
         },
         resolved: {
            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
            icon: CheckCircle,
            label: "Resolved",
            gradient: "from-emerald-500 to-green-500",
         },
         rejected: {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
            label: "Rejected",
            gradient: "from-red-500 to-rose-500",
         },
      };
      return configs[status] || configs.pending;
   };

   const getPriorityConfig = (priority) => {
      const configs = {
         urgent: { color: "text-red-600 bg-red-50", label: "Urgent", dot: "bg-red-500" },
         high: { color: "text-orange-600 bg-orange-50", label: "High", dot: "bg-orange-500" },
         medium: { color: "text-yellow-600 bg-yellow-50", label: "Medium", dot: "bg-yellow-500" },
         low: { color: "text-green-600 bg-green-50", label: "Low", dot: "bg-green-500" },
      };
      return configs[priority] || configs.medium;
   };

   const filteredReports = reports
      .filter((report) => {
         if (filter.status && report.status !== filter.status) return false;
         if (filter.category && report.category !== filter.category) return false;
         if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            return (
               report.title?.toLowerCase().includes(search) ||
               report.description?.toLowerCase().includes(search) ||
               report.location?.toLowerCase().includes(search)
            );
         }
         return true;
      })
      .sort((a, b) => {
         const dateA = new Date(a.createdAt);
         const dateB = new Date(b.createdAt);
         return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });

   // Image gallery navigation
   const openImageGallery = useCallback((index) => {
      setCurrentImageIndex(index);
      setImageGalleryOpen(true);
   }, []);

   const closeImageGallery = useCallback(() => {
      setImageGalleryOpen(false);
   }, []);

   const nextImage = useCallback(() => {
      if (selectedReport?.images) {
         setCurrentImageIndex((prev) =>
            prev === selectedReport.images.length - 1 ? 0 : prev + 1
         );
      }
   }, [selectedReport]);

   const prevImage = useCallback(() => {
      if (selectedReport?.images) {
         setCurrentImageIndex((prev) =>
            prev === 0 ? selectedReport.images.length - 1 : prev - 1
         );
      }
   }, [selectedReport]);

   // Keyboard navigation
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (!imageGalleryOpen) return;
         if (e.key === "ArrowRight") nextImage();
         if (e.key === "ArrowLeft") prevImage();
         if (e.key === "Escape") closeImageGallery();
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, [imageGalleryOpen, nextImage, prevImage, closeImageGallery]);

   const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
   };

   const statusCounts = {
      all: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      "in-progress": reports.filter((r) => r.status === "in-progress").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
         {/* Premium Hero Header */}
         <div className="relative overflow-hidden">
            <div
               className="absolute inset-0"
               style={{
                  background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-glow) 100%)",
               }}
            />
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            {/* Decorative Orbs */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

            <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
               {/* Header Content */
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                     >
                        <div className="flex items-center gap-3 mb-4">
                           <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                              <ClipboardList className="w-7 h-7 text-white" />
                           </div>
                           <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                              {reports.length} Total Reports
                           </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                           {isAdmin ? "All Reports" : "My Reports"}
                        </h1>
                        <p className="text-white/80 text-lg max-w-lg">
                           {isAdmin
                              ? "Review and manage community reports from residents."
                              : "Track your submitted reports and their resolution status."}
                        </p>
                     </motion.div>

                     {!isAdmin && (
                        <motion.button
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ duration: 0.5, delay: 0.2 }}
                           onClick={() => navigate("/reports/newReport")}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className="flex items-center gap-3 px-6 py-4 bg-white text-primary rounded-xl font-semibold shadow-xl shadow-black/10 hover:shadow-2xl transition-all group"
                        >
                           <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}>
                              <Plus className="w-5 h-5 text-white" />
                           </div>
                           <span>New Report</span>
                        </motion.button>
                     )}
                  </div>
               }
               {/* Stats Cards */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
               >
                  {[
                     { key: "", label: "All Reports", count: statusCounts.all, icon: Inbox, gradient: "from-emerald-600 to-emerald-700" },
                     { key: "pending", label: "Pending", count: statusCounts.pending, icon: Clock, gradient: "from-amber-500 to-orange-500" },
                     { key: "in-progress", label: "In Progress", count: statusCounts["in-progress"], icon: TrendingUp, gradient: "from-teal-500 to-emerald-500" },
                     { key: "resolved", label: "Resolved", count: statusCounts.resolved, icon: CheckCircle, gradient: "from-emerald-500 to-green-500" },
                  ].map((stat, idx) => {
                     const Icon = stat.icon;
                     const isActive = filter.status === stat.key;
                     return (
                        <button
                           key={idx}
                           onClick={() => setFilter({ ...filter, status: stat.key })}
                           className={`relative overflow-hidden p-4 rounded-xl text-left transition-all ${isActive
                              ? "bg-white shadow-xl ring-2 ring-white/50"
                              : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
                              }`}
                        >
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className={`text-xs uppercase tracking-wider mb-1 ${isActive ? "text-primary" : "text-emerald-200"}`}>
                                    {stat.label}
                                 </p>
                                 <p className={`text-2xl font-bold ${isActive ? "text-primary-dark" : "text-white"}`}>
                                    {stat.count}
                                 </p>
                              </div>
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                                 <Icon className="w-5 h-5 text-white" />
                              </div>
                           </div>
                        </button>
                     );
                  })}
               </motion.div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
               <svg
                  className="relative block w-full h-16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
               >
                  <path
                     d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                     className="fill-slate-50"
                  />
               </svg>
            </div>
         </div>

         {/* Main Content */}
         <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Search & Filter Bar */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-5 mb-8"
            >
               <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search reports by title, description, or location..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                     />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                     <select
                        value={filter.category}
                        onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                     >
                        <option value="">All Categories</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="safety">Safety</option>
                        <option value="health">Health</option>
                        <option value="sanitation">Sanitation</option>
                        <option value="other">Other</option>
                     </select>

                     <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                     >
                        <ArrowUpDown className="w-4 h-4" />
                        {sortOrder === "desc" ? "Newest" : "Oldest"}
                     </button>

                     <button
                        onClick={() => fetchReports(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-primary rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                     >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                     </button>
                  </div>
               </div>

               {/* Active Filters & Results Count */}
               <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                     {filter.status && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                           Status: {filter.status}
                           <button onClick={() => setFilter({ ...filter, status: "" })} className="ml-1 hover:text-emerald-900">
                              <X className="w-3 h-3" />
                           </button>
                        </span>
                     )}
                     {filter.category && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                           Category: {filter.category}
                           <button onClick={() => setFilter({ ...filter, category: "" })} className="ml-1 hover:text-purple-900">
                              <X className="w-3 h-3" />
                           </button>
                        </span>
                     )}
                     {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                           Search: "{searchTerm}"
                           <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-gray-900">
                              <X className="w-3 h-3" />
                           </button>
                        </span>
                     )}
                  </div>
                  <span className="text-sm text-gray-500">
                     Showing {filteredReports.length} of {reports.length} reports
                  </span>
               </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
               <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                     <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-pulse" />
                     <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                  <p className="mt-4 text-gray-500">Loading your reports...</p>
               </div>
            )}

            {/* Empty State */}
            {!loading && filteredReports.length === 0 && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100"
               >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                     <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                     {filter.status || filter.category || searchTerm
                        ? "Try adjusting your filters to see more results."
                        : "You haven't submitted any reports yet."}
                  </p>
                  {!isAdmin && !filter.status && !filter.category && !searchTerm && (
                     <button
                        onClick={() => navigate("/reports/newReport")}
                        className="px-6 py-3 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        style={{ background: "linear-gradient(135deg, #002366 0%, #334b9f 100%)" }}
                     >
                        Submit Your First Report
                     </button>
                  )}
               </motion.div>
            )}

            {/* Reports Grid */}
            {!loading && filteredReports.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports.map((report, index) => {
                     const statusConfig = getStatusConfig(report.status);
                     const priorityConfig = getPriorityConfig(report.priority);
                     const StatusIcon = statusConfig.icon;

                     return (
                        <motion.div
                           key={report._id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3, delay: index * 0.05 }}
                           onClick={() => {
                              setSelectedReport(report);
                              setCurrentImageIndex(0);
                              setModalOpen(true);
                           }}
                           className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer overflow-hidden"
                        >
                           {/* Image Preview or Placeholder */}
                           <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                              {report.images?.length > 0 ? (
                                 <>
                                    <img
                                       src={report.images[0]}
                                       alt=""
                                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    {report.images.length > 1 && (
                                       <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                                          <Image className="w-3.5 h-3.5 text-white" />
                                          <span className="text-xs text-white font-medium">+{report.images.length - 1}</span>
                                       </div>
                                    )}
                                 </>
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <ClipboardList className="w-20 h-20 text-blue-400" />
                                 </div>
                              )}
                           </div>

                           <div className="p-5">
                              {/* Status & Priority */}
                              <div className="flex items-center justify-between gap-3 mb-3">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig.label}
                                 </span>
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${priorityConfig.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                                    {priorityConfig.label}
                                 </span>
                              </div>

                              {/* Title */}
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                 {report.title}
                              </h3>

                              {/* Description */}
                              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                 {report.description}
                              </p>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                 <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(report.createdAt)}
                                 </span>
                                 <span className="flex items-center gap-1 capitalize">
                                    <Filter className="w-3.5 h-3.5" />
                                    {report.category}
                                 </span>
                              </div>

                              {/* Location */}
                              {report.location && (
                                 <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate">{report.location}</span>
                                 </div>
                              )}
                           </div>

                           {/* Hover Overlay */}
                           <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/30 rounded-2xl pointer-events-none transition-colors" />
                        </motion.div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Report Detail Modal */}
         <AnimatePresence>
            {modalOpen && selectedReport && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setModalOpen(false)}
               >
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     onClick={(e) => e.stopPropagation()}
                     className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                  >
                     {/* Modal Header with Image */}
                     <div className="relative">
                        {selectedReport.images?.length > 0 ? (
                           <div className="relative h-64 overflow-hidden">
                              <img
                                 src={selectedReport.images[0]}
                                 alt=""
                                 className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                              {/* View Gallery Button */}
                              <button
                                 onClick={() => openImageGallery(0)}
                                 className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-900 hover:bg-white transition-colors shadow-lg"
                              >
                                 <Image className="w-4 h-4" />
                                 {selectedReport.images.length} Photo{selectedReport.images.length > 1 ? "s" : ""}
                              </button>
                           </div>
                        ) : (
                           <div
                              className="h-32"
                              style={{
                                 background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-glow) 100%)",
                              }}
                           />
                        )}

                        <button
                           onClick={() => setModalOpen(false)}
                           className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
                        >
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     {/* Modal Content */}
                     <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
                        {/* Title & Badges */}
                        <div className="flex flex-wrap items-start gap-3 mb-6">
                           <div className="flex-1 min-w-0">
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                 {selectedReport.title}
                              </h2>
                              <p className="text-sm text-gray-500">
                                 Submitted {formatDate(selectedReport.createdAt)}
                              </p>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusConfig(selectedReport.status).color}`}>
                                 {React.createElement(getStatusConfig(selectedReport.status).icon, { className: "w-3.5 h-3.5" })}
                                 {getStatusConfig(selectedReport.status).label}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${getPriorityConfig(selectedReport.priority).color}`}>
                                 {getPriorityConfig(selectedReport.priority).label} Priority
                              </span>
                           </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                           <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                           <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {selectedReport.description}
                           </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                 <Filter className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Category</p>
                                 <p className="text-sm font-medium text-gray-900 capitalize">{selectedReport.category}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-green-100 rounded-lg">
                                 <MapPin className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Location</p>
                                 <p className="text-sm font-medium text-gray-900">{selectedReport.location || "Not specified"}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                 <Calendar className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Date Submitted</p>
                                 <p className="text-sm font-medium text-gray-900">
                                    {new Date(selectedReport.createdAt).toLocaleDateString("en-US", {
                                       weekday: "short",
                                       month: "short",
                                       day: "numeric",
                                       year: "numeric",
                                    })}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                 <AlertCircle className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Priority Level</p>
                                 <p className="text-sm font-medium text-gray-900 capitalize">{selectedReport.priority}</p>
                              </div>
                           </div>
                        </div>

                        {/* Image Gallery Thumbnails */}
                        {selectedReport.images?.length > 0 && (
                           <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                 Attachments ({selectedReport.images.length})
                              </h4>
                              <div className="grid grid-cols-4 gap-2">
                                 {selectedReport.images.map((img, idx) => (
                                    <button
                                       key={idx}
                                       onClick={() => openImageGallery(idx)}
                                       className="relative group aspect-square rounded-xl overflow-hidden"
                                    >
                                       <img src={img} alt="" className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                       </div>
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Admin Note / Assigned To */}
                        {selectedReport.assignedTo && (
                           <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                 <User className="w-4 h-4" />
                                 <span className="text-sm font-semibold">Assigned To</span>
                              </div>
                              <p className="text-emerald-900 font-medium">
                                 {selectedReport.assignedTo.firstName} {selectedReport.assignedTo.lastName}
                              </p>
                           </div>
                        )}
                     </div>

                     {/* Modal Footer */}
                     <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                        <button
                           onClick={() => setModalOpen(false)}
                           className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                        >
                           Close
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Full Screen Image Gallery */}
         <AnimatePresence>
            {imageGalleryOpen && selectedReport?.images && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
                  onClick={closeImageGallery}
               >
                  {/* Close Button */}
                  <button
                     onClick={closeImageGallery}
                     className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                     <X className="w-6 h-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full">
                     {currentImageIndex + 1} / {selectedReport.images.length}
                  </div>

                  {/* Main Image */}
                  <motion.div
                     key={currentImageIndex}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     className="relative w-full h-full flex items-center justify-center p-16"
                     onClick={(e) => e.stopPropagation()}
                  >
                     <img
                        src={selectedReport.images[currentImageIndex]}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                     />
                  </motion.div>

                  {/* Navigation Buttons */}
                  {selectedReport.images.length > 1 && (
                     <>
                        <button
                           onClick={(e) => { e.stopPropagation(); prevImage(); }}
                           className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                        >
                           <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                           onClick={(e) => { e.stopPropagation(); nextImage(); }}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                        >
                           <ChevronRight className="w-6 h-6" />
                        </button>
                     </>
                  )}

                  {/* Thumbnail Strip */}
                  {selectedReport.images.length > 1 && (
                     <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                     >
                        {selectedReport.images.map((img, idx) => (
                           <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-14 h-14 rounded-lg overflow-hidden transition-all ${idx === currentImageIndex
                                 ? "ring-2 ring-white scale-110"
                                 : "opacity-60 hover:opacity-100"
                                 }`}
                           >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                           </button>
                        ))}
                     </div>
                  )}

                  {/* Keyboard Hint */}
                  <div className="absolute bottom-6 right-6 text-white/50 text-xs">
                     ← → Navigate • ESC Close
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default ReportsV2;
