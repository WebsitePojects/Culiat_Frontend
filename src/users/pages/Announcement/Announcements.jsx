import React, { useState, useEffect, useMemo } from "react";
import { CalendarDays, MapPin, Filter, Megaphone, Loader2, Search, RefreshCw, Inbox, Clock, CheckCircle, ArrowUpDown, X, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Announcement = () => {
   const [activeFilter, setActiveFilter] = useState("All");
   const [announcements, setAnnouncements] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [sortOrder, setSortOrder] = useState("desc");

   useEffect(() => {
      fetchAnnouncements();
   }, []);

   const fetchAnnouncements = async (isRefresh = false) => {
      try {
         if (isRefresh) {
            setRefreshing(true);
         } else {
            setLoading(true);
         }
         const response = await axios.get(`${API_URL}/api/announcements`);
         if (response.data.success) {
            setAnnouncements(response.data.data);
         }
      } catch (err) {
         console.error("Error fetching announcements:", err);
         setError("Failed to load announcements");
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   // Filter announcements less than 1 year old (already done on backend, but also filter client-side for safety)
   const recentAnnouncements = useMemo(() => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return announcements.filter(a => new Date(a.createdAt) >= oneYearAgo);
   }, [announcements]);

   // Filter by category - use useMemo to avoid recalculating on every render
   const filteredAnnouncements = useMemo(() => {
      let filtered = recentAnnouncements;

      // Filter by category
      if (activeFilter !== "All") {
         filtered = filtered.filter((a) => a.category === activeFilter);
      }

      // Filter by search term
      if (searchTerm.trim()) {
         const search = searchTerm.toLowerCase();
         filtered = filtered.filter((a) =>
            a.title?.toLowerCase().includes(search) ||
            a.content?.toLowerCase().includes(search) ||
            a.location?.toLowerCase().includes(search)
         );
      }

      // Sort by date
      filtered = [...filtered].sort((a, b) => {
         const dateA = new Date(a.createdAt);
         const dateB = new Date(b.createdAt);
         return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });

      return filtered;
   }, [activeFilter, recentAnnouncements, searchTerm, sortOrder]);

   // Animation variants - optimized for instant filter switching
   const fadeUp = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
   };

   const staggerContainer = {
      hidden: { opacity: 1 },
      show: {
         opacity: 1,
         transition: {
            staggerChildren: 0.05,
         },
      },
   };

   const cardVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      show: {
         opacity: 1,
         scale: 1,
         transition: { duration: 0.2 }
      },
      exit: {
         opacity: 0,
         scale: 0.95,
         transition: { duration: 0.15 }
      }
   };

   // Format date for display
   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: 'long',
         day: 'numeric',
         year: 'numeric'
      });
   };

   // Get available categories from announcements
   const availableCategories = useMemo(() => {
      const cats = new Set(recentAnnouncements.map(a => a.category));
      return ["All", ...Array.from(cats)];
   }, [recentAnnouncements]);

   return (
      <div
         className="min-h-screen"
         style={{ backgroundColor: "var(--color-neutral)" }}
      >
         {/* Hero Section */}
         <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative text-white overflow-hidden"
            style={{
               background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-glow) 100%)",
            }}
         >
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
               <div
                  className="absolute inset-0"
                  style={{
                     backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                     backgroundSize: "40px 40px",
                  }}
               ></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-28 text-center">
               {/* Animated Icon Badge */}
               <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6"
               >
                  <Megaphone className="w-8 h-8 md:w-10 md:h-10" />
               </motion.div>

               {/* Title */}
               <motion.h1
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 max-w-3xl mx-auto"
               >
                  Barangay Announcements
               </motion.h1>

               {/* Description */}
               <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mx-auto"
               >
                  Stay updated with our latest barangay events, programs, and
                  notices. Your community, your stories.
               </motion.p>
            </div>

            {/* Wave Divider */}
            <div
               className="absolute bottom-0 left-0 w-full overflow-hidden leading-none"
               style={{ transform: "rotate(180deg)" }}
            >
               <svg
                  className="relative block w-full h-12 md:h-20"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
               >
                  <path
                     d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                     fill="var(--color-neutral)"
                  ></path>
               </svg>
            </div>
         </motion.section>

         {/* Search & Filter Bar */}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="max-w-6xl mx-auto px-4 pt-8 pb-6"
         >
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 md:p-5">
               <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
                     <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search announcements..."
                        className="w-full pl-9 md:pl-12 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                     />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                     <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-xs md:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                     >
                        <ArrowUpDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                     </button>

                     <button
                        onClick={() => fetchAnnouncements(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50 text-xs md:text-sm"
                     >
                        <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${refreshing ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                     </button>
                  </div>
               </div>

               {/* Category Filter Pills */}
               <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mr-2">
                     <Filter className="w-4 h-4" />
                     <span className="text-xs md:text-sm font-medium">Category:</span>
                  </div>
                  {availableCategories.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-150 ${activeFilter === cat
                           ? "bg-emerald-600 text-white shadow-md"
                           : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                           }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>

               {/* Active Filters & Results Count */}
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                     {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] md:text-sm">
                           Search: "{searchTerm.slice(0, 15)}{searchTerm.length > 15 ? '...' : ''}"
                           <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-gray-900">
                              <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                           </button>
                        </span>
                     )}
                     {activeFilter !== "All" && (
                        <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-sm">
                           {activeFilter}
                           <button onClick={() => setActiveFilter("All")} className="ml-1 hover:text-emerald-900">
                              <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                           </button>
                        </span>
                     )}
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">
                     Showing <span className="font-semibold text-emerald-600">{filteredAnnouncements.length}</span> of {recentAnnouncements.length} announcements
                  </span>
               </div>
            </div>
         </motion.div>

         {/* Loading State */}
         {loading && (
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
               <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-200 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin" />
               </div>
               <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-500">Loading announcements...</p>
            </div>
         )}

         {/* Error State */}
         {error && !loading && (
            <div className="max-w-6xl mx-auto px-4 py-10 text-center">
               <p className="text-red-500">{error}</p>
               <button
                  onClick={fetchAnnouncements}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
               >
                  Try Again
               </button>
            </div>
         )}

         {/* Announcements Grid */}
         {!loading && !error && (
            <AnimatePresence mode="popLayout">
               <motion.div
                  key={activeFilter}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
               >
                  {filteredAnnouncements.length > 0 ? (
                     filteredAnnouncements.map((item) => (
                        <motion.div
                           key={item._id}
                           variants={cardVariants}
                           layout
                           whileHover={{ y: -8, transition: { duration: 0.2 } }}
                           className="bg-white shadow-lg flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                        >
                           <Link
                              to={`/announcements/${item.slug && item.slug.trim() !== '' ? item.slug : item._id}`}
                              className="flex flex-col h-full"
                           >
                              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200">
                                 {(item.images?.length > 0 || item.image) ? (
                                    <>
                                       <img
                                          src={item.images?.[0] || item.image}
                                          alt={item.title}
                                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                          loading="lazy"
                                       />
                                       {/* Multiple images badge */}
                                       {item.images?.length > 1 && (
                                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                                             <Image className="w-3.5 h-3.5 text-white" />
                                             <span className="text-xs text-white font-medium">+{item.images.length - 1}</span>
                                          </div>
                                       )}
                                    </>
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                       <Megaphone className="w-16 h-16 text-emerald-400" />
                                    </div>
                                 )}
                                 {/* Category Badge Overlay */}
                                 <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-xs font-semibold text-emerald-600 rounded-full shadow-md uppercase tracking-wide">
                                       {item.category}
                                    </span>
                                 </div>
                              </div>

                              <div className="p-6 flex flex-col justify-between flex-1">
                                 <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors">
                                       {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                                       {item.content}
                                    </p>
                                 </div>

                                 <div className="space-y-3">
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                       <span className="flex items-center gap-1.5">
                                          <CalendarDays className="w-4 h-4 text-emerald-600" />
                                          <span className="text-xs">{formatDate(item.eventDate || item.createdAt)}</span>
                                       </span>
                                       {item.location && (
                                          <span className="flex items-center gap-1.5">
                                             <MapPin className="w-4 h-4 text-emerald-600" />
                                             <span className="text-xs line-clamp-1">
                                                {item.location}
                                             </span>
                                          </span>
                                       )}
                                    </div>
                                    <div className="pt-2 flex items-center gap-2 text-emerald-600 font-medium text-sm group">
                                       <span>Read more</span>
                                       <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        </motion.div>
                     ))
                  ) : (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-10 text-gray-500"
                     >
                        <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg">No announcements available for this category.</p>
                     </motion.div>
                  )}
               </motion.div>
            </AnimatePresence>
         )}

         {/* Footer */}
         <div className="text-center text-sm text-gray-500 mt-12 pb-16">
            <p>
               For more details, visit the Barangay Hall or follow our official
               social media pages.
            </p>
         </div>
      </div>
   );
};

export default Announcement;
