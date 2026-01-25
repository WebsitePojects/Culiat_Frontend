import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  Calendar as CalendarIcon,
  Tag,
  Search,
  Download,
  RefreshCw,
  Trophy,
  Award,
  Handshake,
  Inbox,
  Image,
  ArrowUpDown,
  AlertTriangle,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const AdminAchievements = () => {
  const { showSuccess, showError } = useNotifications();
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedAchievements, setSelectedAchievements] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Image gallery states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);

  // Hashtags state
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [hashtagSearch, setHashtagSearch] = useState("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Awards",
    description: "",
    date: new Date().toISOString().split("T")[0],
    images: [],        // New: multiple images (File objects)
    existingImages: [], // New: existing image URLs (for edit mode)
    hashtags: [],      // Hashtags for the achievement
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const categories = ["Awards", "Recognitions", "Partnerships"];

  useEffect(() => {
    fetchAchievements();
    fetchHashtags();
  }, []);

  const fetchHashtags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hashtags`);
      if (response.data.success) {
        const hashtags = response.data.data || [];
        setAvailableHashtags(hashtags);
        
        // If no hashtags exist, automatically seed default ones
        if (hashtags.length === 0) {
          console.log('No hashtags found, seeding default hashtags...');
          await seedHashtags();
        }
      }
    } catch (error) {
      console.error("Error fetching hashtags:", error);
    }
  };

  const seedHashtags = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/hashtags/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        console.log('Default hashtags seeded successfully');
        // Refetch hashtags to update the list
        const hashtagsResponse = await axios.get(`${API_URL}/api/hashtags`);
        if (hashtagsResponse.data.success) {
          setAvailableHashtags(hashtagsResponse.data.data || []);
        }
      }
    } catch (error) {
      console.error("Error seeding hashtags:", error);
    }
  };

  const fetchAchievements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await axios.get(`${API_URL}/api/achievements`);
      setAchievements(response.data.data || []);
      if (isRefresh) showSuccess("Achievements refreshed");
    } catch (error) {
      console.error("Error fetching achievements:", error);
      showError("Failed to fetch achievements");
      setAchievements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, sortBy, sortOrder, achievements]);

  const applyFilters = () => {
    let filtered = [...achievements];

    // Filter by category
    if (filter !== "all") {
      filtered = filtered.filter((a) => a.category === filter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchLower) ||
          a.description?.toLowerCase().includes(searchLower) ||
          a.category?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "date":
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    setFilteredAchievements(filtered);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Awards",
      description: "",
      date: new Date().toISOString().split("T")[0],
      images: [],
      existingImages: [],
      hashtags: [],
    });
    setImagePreview(null);
    setHashtagSearch("");
    setShowHashtagDropdown(false);
    setIsEditMode(false);
    setSelectedAchievement(null);
    setError("");
  };

  const handleCreateClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (achievement) => {
    setSelectedAchievement(achievement);
    
    // Collect all existing images
    const existingImgs = [];
    if (achievement.images && achievement.images.length > 0) {
      existingImgs.push(...achievement.images);
    } else if (achievement.image && achievement.image !== "no-photo.jpg") {
      existingImgs.push(achievement.image);
    }
    
    setFormData({
      title: achievement.title,
      category: achievement.category || "Awards",
      description: achievement.description || "",
      date: achievement.date ? achievement.date.split("T")[0] : new Date().toISOString().split("T")[0],
      images: [],
      existingImages: existingImgs,
      hashtags: achievement.hashtags || [],
    });
    
    setHashtagSearch("");
    setShowHashtagDropdown(false);
    
    // Set preview to first image
    if (existingImgs.length > 0) {
      const firstImg = existingImgs[0];
      const imageUrl = firstImg.includes("http")
        ? firstImg
        : `${API_URL}/uploads/achievements/${firstImg}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewAchievement = (achievement) => {
    setSelectedAchievement(achievement);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowDeleteModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 6;
    const currentCount = formData.images.length + formData.existingImages.length;
    
    if (currentCount + files.length > maxImages) {
      showError(`Maximum ${maxImages} images allowed. You can add ${maxImages - currentCount} more.`);
      return;
    }
    
    // Add new files to existing
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    
    // Update preview to first image if not set
    if (!imagePreview && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const handleRemoveNewImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const handleRemoveExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate submissions
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("date", formData.date);
      
      // Append hashtags
      if (formData.hashtags.length > 0) {
        submitData.append("hashtags", JSON.stringify(formData.hashtags));
      }
      
      // Append all new images
      formData.images.forEach((image) => {
        submitData.append("achievementImages", image);
      });
      
      // If editing, also pass existing images to keep
      if (isEditMode && formData.existingImages.length > 0) {
        submitData.append("existingImages", JSON.stringify(formData.existingImages));
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.put(
          `${API_URL}/api/achievements/${selectedAchievement._id}`,
          submitData,
          config
        );
        showSuccess("Achievement updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/achievements`, submitData, config);
        showSuccess("Achievement created successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchAchievements();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save achievement");
      showError("Failed to save achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/achievements/${selectedAchievement._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("Achievement deleted successfully!");
      setShowDeleteModal(false);
      fetchAchievements();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete achievement");
    }
  };

  const handleSelectAchievement = (id) => {
    if (selectedAchievements.includes(id)) {
      setSelectedAchievements(selectedAchievements.filter((aid) => aid !== id));
    } else {
      setSelectedAchievements([...selectedAchievements, id]);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Title", "Category", "Date", "Description"];
    const rows = filteredAchievements.map((a) => [
      a._id,
      a.title,
      a.category,
      new Date(a.date).toLocaleDateString(),
      a.description || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `achievements_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Achievements exported successfully");
  };

  const getCategoryConfig = (category) => {
    const configs = {
      Awards: {
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        icon: Trophy,
        gradient: "from-amber-500 to-orange-500",
      },
      Recognitions: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: Award,
        gradient: "from-blue-500 to-cyan-500",
      },
      Partnerships: {
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: Handshake,
        gradient: "from-emerald-500 to-green-500",
      },
    };
    return configs[category] || configs.Awards;
  };

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

  // Image gallery handlers
  const openImageGallery = useCallback(() => {
    setImageGalleryOpen(true);
  }, []);

  const closeImageGallery = useCallback(() => {
    setImageGalleryOpen(false);
  }, []);

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageGalleryOpen) return;
      if (e.key === "Escape") closeImageGallery();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageGalleryOpen, closeImageGallery]);

  // Get image URL helper
  const getImageUrl = (achievement) => {
    if (!achievement?.image || achievement.image === "no-photo.jpg") return null;
    return achievement.image.includes("http")
      ? achievement.image
      : `${API_URL}/uploads/achievements/${achievement.image}`;
  };

  const categoryCounts = useMemo(
    () => ({
      all: achievements.length,
      Awards: achievements.filter((a) => a.category === "Awards").length,
      Recognitions: achievements.filter((a) => a.category === "Recognitions").length,
      Partnerships: achievements.filter((a) => a.category === "Partnerships").length,
    }),
    [achievements]
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-1">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Achievements
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Manage awards, recognitions, and partnerships.
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() => fetchAchievements(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredAchievements.length === 0}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Export</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
          {[
            { label: "Total", count: categoryCounts.all, icon: Inbox, gradient: "from-blue-500 to-blue-600", filterValue: "all" },
            { label: "Awards", count: categoryCounts.Awards, icon: Trophy, gradient: "from-amber-500 to-orange-500", filterValue: "Awards" },
            { label: "Recognitions", count: categoryCounts.Recognitions, icon: Award, gradient: "from-cyan-500 to-blue-500", filterValue: "Recognitions" },
            { label: "Partnerships", count: categoryCounts.Partnerships, icon: Handshake, gradient: "from-emerald-500 to-green-500", filterValue: "Partnerships" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group ${filter === stat.filterValue ? "ring-2 ring-white/30" : ""}`}
                onClick={() => setFilter(stat.filterValue)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider">{stat.label}</p>
                    <p className="mt-0.5 sm:mt-1 text-lg sm:text-xl md:text-2xl font-bold text-white">{stat.count}</p>
                  </div>
                  <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-5">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search achievements..."
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-slate-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-x-auto">
              {["all", "Awards", "Recognitions", "Partnerships"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap ${
                    filter === cat
                      ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredAchievements.length} of {achievements.length}
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 sm:py-16">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading achievements...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 sm:py-16 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1">No achievements found</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-center px-4">
            {achievements.length === 0 ? "Add your first achievement to get started" : "Try adjusting your filters"}
          </p>
          {achievements.length === 0 && (
            <button
              onClick={handleCreateClick}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add Achievement
            </button>
          )}
        </div>
      )}

      {/* Achievements Grid */}
      {!loading && filteredAchievements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredAchievements.map((achievement) => {
            const categoryConfig = getCategoryConfig(achievement.category);
            const CategoryIcon = categoryConfig.icon;
            const imageUrl = getImageUrl(achievement);

            return (
              <div
                key={achievement._id}
                className={`group relative bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 cursor-pointer ${
                  selectedAchievements.includes(achievement._id)
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
                onClick={() => handleViewAchievement(achievement)}
              >
                {/* Selection Checkbox */}
                <div
                  className="absolute top-4 left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedAchievements.includes(achievement._id)}
                    onChange={() => handleSelectAchievement(achievement._id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Image Preview */}
                {imageUrl ? (
                  <div className="relative h-32 sm:h-40 overflow-hidden rounded-t-lg sm:rounded-t-xl">
                    <img
                      src={imageUrl}
                      alt={achievement.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="relative h-24 sm:h-32 overflow-hidden rounded-t-lg sm:rounded-t-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                    <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400" />
                  </div>
                )}

                <div className="p-3 sm:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {achievement.title}
                      </h3>
                      <span className={`inline-flex items-center mt-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${categoryConfig.color}`}>
                        <CategoryIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        {achievement.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3">
                    {achievement.description || "No description provided"}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {formatDate(achievement.date)}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div
                  className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEditClick(achievement)}
                    className="p-1.5 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(achievement)}
                    className="p-1.5 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Achievement Modal */}
      {viewModalOpen && selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative">
              {getImageUrl(selectedAchievement) ? (
                <div className="relative h-36 sm:h-48 md:h-64 overflow-hidden">
                  <img
                    src={getImageUrl(selectedAchievement)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                  {/* Image Gallery Trigger */}
                  <button
                    onClick={openImageGallery}
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">View Full</span>
                  </button>
                </div>
              ) : (
                <div className="h-20 sm:h-24 md:h-32 bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Trophy className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 text-white/30" />
                </div>
              )}

              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto max-h-[calc(90vh-12rem)] sm:max-h-[calc(90vh-16rem)]">
              {/* Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedAchievement.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${getCategoryConfig(selectedAchievement.category).color}`}>
                    {selectedAchievement.category}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md sm:rounded-lg">
                    <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {new Date(selectedAchievement.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md sm:rounded-lg">
                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Category</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{selectedAchievement.category}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl whitespace-pre-wrap">
                  {selectedAchievement.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <button
                onClick={() => handleDeleteClick(selectedAchievement)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Delete
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    handleEditClick(selectedAchievement);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Premium Header */}
            <div className={`px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden ${isEditMode ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800' : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800'}`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                    {isEditMode ? <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">
                      {isEditMode ? "Edit Achievement" : "New Achievement"}
                    </h2>
                    <p className={`text-xs sm:text-sm ${isEditMode ? 'text-blue-200' : 'text-emerald-200'}`}>
                      {isEditMode ? "Update achievement details" : "Add a new achievement"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              {error && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-xs sm:text-sm">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter achievement title"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter achievement description..."
                  className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hashtags Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Hashtags <span className="text-gray-400">(Optional)</span>
                </label>
                
                {/* Selected Hashtags */}
                {formData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            hashtags: prev.hashtags.filter((_, i) => i !== idx)
                          }))}
                          className="hover:text-emerald-900 dark:hover:text-emerald-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Hashtag Search/Select */}
                <div className="relative">
                  <input
                    type="text"
                    value={hashtagSearch}
                    onChange={(e) => {
                      setHashtagSearch(e.target.value);
                      setShowHashtagDropdown(true);
                    }}
                    onFocus={() => setShowHashtagDropdown(true)}
                    placeholder="Search or add hashtags..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  
                  {showHashtagDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {/* Filtered hashtags from database */}
                      {availableHashtags
                        .filter(h => 
                          h.name.toLowerCase().includes(hashtagSearch.toLowerCase()) &&
                          !formData.hashtags.includes(h.name)
                        )
                        .slice(0, 10)
                        .map((hashtag) => (
                          <button
                            key={hashtag._id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                hashtags: [...prev.hashtags, hashtag.name]
                              }));
                              setHashtagSearch("");
                              setShowHashtagDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                          >
                            <span className="text-emerald-600 dark:text-emerald-400">#{hashtag.name}</span>
                            <span className="text-xs text-gray-400">{hashtag.category}</span>
                          </button>
                        ))
                      }
                      
                      {/* Option to add custom hashtag */}
                      {hashtagSearch.trim() && !availableHashtags.some(h => 
                        h.name.toLowerCase() === hashtagSearch.toLowerCase().replace(/^#/, '').replace(/\s+/g, '')
                      ) && (
                        <button
                          type="button"
                          onClick={async () => {
                            const cleanTag = hashtagSearch.trim().replace(/^#/, '').replace(/\s+/g, '');
                            if (cleanTag && !formData.hashtags.includes(cleanTag)) {
                              // Add to form
                              setFormData(prev => ({
                                ...prev,
                                hashtags: [...prev.hashtags, cleanTag]
                              }));
                              // Save to database
                              try {
                                const token = localStorage.getItem("token");
                                await axios.post(`${API_URL}/api/hashtags`, 
                                  { name: cleanTag, category: 'Custom' },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                // Refresh hashtags list
                                fetchHashtags();
                              } catch (error) {
                                console.log('Hashtag may already exist or failed to save:', error);
                              }
                            }
                            setHashtagSearch("");
                            setShowHashtagDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-t border-gray-200 dark:border-gray-700"
                        >
                          + Add "#{hashtagSearch.trim().replace(/^#/, '').replace(/\s+/g, '')}"
                        </button>
                      )}
                      
                      {availableHashtags.length === 0 && !hashtagSearch.trim() && (
                        <div className="px-3 py-2 text-xs text-gray-400">
                          Type to search or add hashtags
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setShowHashtagDropdown(false)}
                        className="w-full px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Images <span className="text-gray-400 font-normal">(up to 6)</span>
                </label>
                
                {/* Image count indicator */}
                <div className="text-xs text-gray-500 mb-2">
                  {formData.existingImages.length + formData.images.length} / 6 images
                </div>
                
                {/* Existing Images (Edit Mode) */}
                {formData.existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Current images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.existingImages.map((img, index) => {
                        const imgUrl = img.includes("http") ? img : `${API_URL}/uploads/achievements/${img}`;
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={imgUrl}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* New Images Preview */}
                {formData.images.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">New images to upload:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-emerald-300 dark:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload Button */}
                {formData.existingImages.length + formData.images.length < 6 && (
                  <label className="flex flex-col items-center px-4 py-4 sm:py-6 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-xl border-2 border-gray-300 dark:border-gray-600 border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm">Click to upload images</span>
                    <span className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg sm:rounded-xl transition-colors shadow-lg shadow-blue-600/25"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {isEditMode ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }}></div>
              </div>
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white">Delete Achievement</h2>
                  <p className="text-red-200 text-xs sm:text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 text-center">
                  Are you sure you want to delete "<strong className="break-words">{selectedAchievement.title}</strong>"?
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-red-600/25"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Gallery */}
      {imageGalleryOpen && selectedAchievement && getImageUrl(selectedAchievement) && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
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
            Achievement Image
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
            <img
              src={getImageUrl(selectedAchievement)}
              alt=""
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAchievements;
