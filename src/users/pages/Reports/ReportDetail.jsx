import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reportAPI } from "../../services/api";
import { motion } from "framer-motion";
import {
   ArrowLeft,
   Clock,
   MapPin,
   AlertCircle,
   Filter,
   User,
   MessageSquare,
   CheckCircle,
   XCircle,
   Loader,
} from "lucide-react";

const ReportDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [report, setReport] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      fetchReport();
   }, [id]);

   const fetchReport = async () => {
      try {
         setLoading(true);
         console.log("Fetching report with ID:", id);
         const response = await reportAPI.getById(id);
         console.log("Report detail response:", response.data);
         
         if (response.data.success) {
            setReport(response.data.data);
         } else {
            setError(response.data.message || "Report not found");
         }
      } catch (error) {
         console.error("Error fetching report:", error);
         setError(error.response?.data?.message || "Failed to load report");
      } finally {
         setLoading(false);
      }
   };

   const getStatusStyles = (status) => {
      const styles = {
         pending: "bg-orange-100 text-orange-700 border-orange-200",
         "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
         resolved: "bg-green-100 text-green-700 border-green-200",
         rejected: "bg-red-100 text-red-700 border-red-200",
      };
      return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
   };

   const getPriorityStyles = (priority) => {
      const styles = {
         low: "text-gray-600",
         medium: "text-yellow-600",
         high: "text-orange-600",
         urgent: "text-red-600 font-semibold",
      };
      return styles[priority] || "text-gray-600";
   };

   if (loading) {
      return (
         <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: "var(--color-neutral)" }}
         >
            <div className="text-center">
               <Loader className="w-16 h-16 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
               <p className="text-[var(--color-text-secondary)]">Loading report...</p>
            </div>
         </div>
      );
   }

   if (error || !report) {
      return (
         <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: "var(--color-neutral)" }}
         >
            <div className="text-center max-w-md mx-auto px-4">
               <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-[var(--color-text-color)] mb-2">
                  Report Not Found
               </h2>
               <p className="text-[var(--color-text-secondary)] mb-6">{error}</p>
               <button
                  onClick={() => navigate("/reports")}
                  className="px-6 py-3 rounded-lg font-medium shadow-lg"
                  style={{
                     background: "linear-gradient(to right, var(--color-secondary), var(--color-secondary-glow))",
                     color: "var(--color-text-color-light)",
                  }}
               >
                  Back to Reports
               </button>
            </div>
         </div>
      );
   }

   return (
      <div
         className="min-h-screen"
         style={{ backgroundColor: "var(--color-neutral)" }}
      >
         {/* Header */}
         <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative text-white overflow-hidden"
            style={{
               background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-glow) 100%)",
            }}
         >
            <div className="relative max-w-6xl mx-auto px-6 py-16">
               <button
                  onClick={() => navigate("/reports")}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6"
               >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Reports</span>
               </button>

               <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                  {report.title}
               </h1>

               <div className="flex flex-wrap gap-4 items-center">
                  <span
                     className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusStyles(
                        report.status
                     )}`}
                  >
                     {report.status}
                  </span>
                  <span className={`flex items-center gap-2 capitalize ${getPriorityStyles(report.priority)}`}>
                     <AlertCircle className="w-5 h-5" />
                     {report.priority} Priority
                  </span>
               </div>
            </div>
         </motion.section>

         {/* Content */}
         <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Main Content */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div className="bg-[var(--color-light)] rounded-lg shadow-md border border-[var(--color-neutral-active)] p-6">
                     <h2 className="text-xl font-bold text-[var(--color-text-color)] mb-4">
                        Description
                     </h2>
                     <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {report.description}
                     </p>
                  </div>

                  {/* Comments Section (if available) */}
                  {report.comments && report.comments.length > 0 && (
                     <div className="bg-[var(--color-light)] rounded-lg shadow-md border border-[var(--color-neutral-active)] p-6">
                        <h2 className="text-xl font-bold text-[var(--color-text-color)] mb-4 flex items-center gap-2">
                           <MessageSquare className="w-5 h-5" />
                           Comments ({report.comments.length})
                        </h2>
                        <div className="space-y-4">
                           {report.comments.map((comment, index) => (
                              <div
                                 key={index}
                                 className="border-l-4 border-[var(--color-primary)] pl-4 py-2"
                              >
                                 <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    <span className="font-semibold text-[var(--color-text-color)]">
                                       {comment.user?.firstName} {comment.user?.lastName}
                                    </span>
                                    <span className="text-sm text-[var(--color-text-secondary)]">
                                       {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                 </div>
                                 <p className="text-[var(--color-text-secondary)]">
                                    {comment.text}
                                 </p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               {/* Sidebar */}
               <div className="space-y-6">
                  {/* Details Card */}
                  <div className="bg-[var(--color-light)] rounded-lg shadow-md border border-[var(--color-neutral-active)] p-6">
                     <h3 className="text-lg font-bold text-[var(--color-text-color)] mb-4">
                        Report Details
                     </h3>
                     <div className="space-y-4">
                        <div>
                           <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                              <Filter className="w-4 h-4" />
                              <span>Category</span>
                           </div>
                           <p className="text-[var(--color-text-color)] font-medium capitalize">
                              {report.category}
                           </p>
                        </div>

                        <div>
                           <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                              <MapPin className="w-4 h-4" />
                              <span>Location</span>
                           </div>
                           <p className="text-[var(--color-text-color)] font-medium">
                              {report.location || "Not specified"}
                           </p>
                        </div>

                        <div>
                           <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                              <Clock className="w-4 h-4" />
                              <span>Submitted</span>
                           </div>
                           <p className="text-[var(--color-text-color)] font-medium">
                              {new Date(report.createdAt).toLocaleString()}
                           </p>
                        </div>

                        {report.assignedTo && (
                           <div>
                              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1">
                                 <User className="w-4 h-4" />
                                 <span>Assigned To</span>
                              </div>
                              <p className="text-[var(--color-text-color)] font-medium">
                                 {report.assignedTo.firstName} {report.assignedTo.lastName}
                              </p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Status History (if available) */}
                  {report.updatedAt && report.updatedAt !== report.createdAt && (
                     <div className="bg-[var(--color-light)] rounded-lg shadow-md border border-[var(--color-neutral-active)] p-6">
                        <h3 className="text-lg font-bold text-[var(--color-text-color)] mb-4">
                           Last Updated
                        </h3>
                        <p className="text-[var(--color-text-secondary)]">
                           {new Date(report.updatedAt).toLocaleString()}
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ReportDetail;
