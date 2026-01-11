import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Trophy, Calendar, Award, Handshake, Filter, Search, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const categories = ["All", "Awards", "Recognitions", "Partnerships"];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/achievements`);
      setAchievements(response.data.data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get proper image URL (Cloudinary or local)
  const getImageUrl = (achievement) => {
    if (!achievement?.image || achievement.image === "no-photo.jpg") return null;
    return achievement.image.includes("http")
      ? achievement.image
      : `${API_URL}/uploads/achievements/${achievement.image}`;
  };

  const filteredAchievements = useMemo(() => {
    let filtered = activeCategory === "All" 
      ? achievements 
      : achievements.filter(a => a.category === activeCategory);
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.title?.toLowerCase().includes(searchLower) ||
        a.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [achievements, activeCategory, searchTerm]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Awards": return <Trophy className="w-5 h-5" />;
      case "Recognitions": return <Award className="w-5 h-5" />;
      case "Partnerships": return <Handshake className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryConfig = (category) => {
    const configs = {
      Awards: { color: "bg-amber-100 text-amber-800", gradient: "from-amber-500 to-orange-500" },
      Recognitions: { color: "bg-blue-100 text-blue-800", gradient: "from-blue-500 to-cyan-500" },
      Partnerships: { color: "bg-emerald-100 text-emerald-800", gradient: "from-emerald-500 to-green-500" },
    };
    return configs[category] || configs.Awards;
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
       opacity: 1,
       transition: {
          staggerChildren: 0.1,
       },
    },
 };

  return (
    <div
       className="min-h-screen pt-16 sm:pt-0"
       style={{ backgroundColor: "var(--color-neutral)" }}
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] text-white overflow-hidden"
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
              <Trophy className="w-8 h-8 md:w-10 md:h-10" />
           </motion.div>

           {/* Title */}
           <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 max-w-3xl mx-auto"
           >
              Our Achievements
           </motion.h1>

           {/* Description */}
           <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mx-auto"
           >
              Celebrating the milestones, awards, and partnerships that make Barangay Culiat proud.
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

      {/* Premium Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="max-w-6xl mx-auto px-4 mb-8 pt-8"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search achievements..."
                className="w-full pl-12 pr-10 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === category
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredAchievements.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{achievements.length}</span> achievements
            </span>
            {(searchTerm || activeCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {filteredAchievements.map((achievement) => {
              const imageUrl = getImageUrl(achievement);
              const categoryConfig = getCategoryConfig(achievement.category);
              
              return (
                <motion.div
                  key={achievement._id}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
                >
                  <div className="h-56 bg-gray-100 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={achievement.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <Trophy size={64} className="text-blue-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className={`absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 ${categoryConfig.color}`}>
                      {getCategoryIcon(achievement.category)}
                      {achievement.category}
                    </div>
                    {/* View Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900 shadow-lg">
                        <ZoomIn className="w-4 h-4" />
                        View Details
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-gray-500 text-xs mb-3">
                      <Calendar size={14} className="mr-1.5" />
                      {new Date(achievement.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {achievement.description || "No description available"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!loading && filteredAchievements.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-blue-400 w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search or filters" : "We haven't added any achievements in this category yet."}
            </p>
            {(searchTerm || activeCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* View Achievement Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div className="relative">
                {getImageUrl(selectedAchievement) ? (
                  <div className="relative h-48 md:h-72 overflow-hidden">
                    <img
                      src={getImageUrl(selectedAchievement)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                    
                    {/* View Full Image Button */}
                    <button
                      onClick={() => setImageGalleryOpen(true)}
                      className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors shadow-lg"
                    >
                      <ZoomIn className="w-4 h-4" />
                      View Full Image
                    </button>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-white/30" />
                  </div>
                )}

                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-18rem)]">
                {/* Category Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${getCategoryConfig(selectedAchievement.category).color}`}>
                  {getCategoryIcon(selectedAchievement.category)}
                  {selectedAchievement.category}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {selectedAchievement.title}
                </h2>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedAchievement.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                {/* Description */}
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedAchievement.description || "No description available for this achievement."}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
        {imageGalleryOpen && selectedAchievement && getImageUrl(selectedAchievement) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
            onClick={() => setImageGalleryOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setImageGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Title */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full max-w-xs md:max-w-md truncate">
              {selectedAchievement.title}
            </div>

            {/* Main Image */}
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full flex items-center justify-center p-8 md:p-16"
            >
              <img
                src={getImageUrl(selectedAchievement)}
                alt=""
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Achievements;
