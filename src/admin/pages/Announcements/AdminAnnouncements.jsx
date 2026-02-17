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
  FileText,
  Calendar as CalendarIcon,
  Tag,
  Search,
  Download,
  RefreshCw,
  Filter,
  Megaphone,
  Archive,
  ArchiveRestore,
  MapPin,
  Clock,
  TrendingUp,
  Inbox,
  Image,
  ArrowUpDown,
  AlertTriangle,
  Flag,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Play,
  Youtube,
  Users,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";
import { extractYouTubeVideoId, isValidYouTubeUrl } from "../../../utils/youtubeHelpers";

const AdminAnnouncements = () => {
  const { showSuccess, showError, showPromise } = useNotifications();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Image gallery states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hashtags state
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [hashtagSearch, setHashtagSearch] = useState("");
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const [committees, setCommittees] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    status: "published",
    committeeRef: "",
    location: "Barangay Culiat",
    eventDate: "",
    images: [], // Changed to array for multiple images
    hashtags: [], // Hashtags for the announcement
    youtubeVideoUrl: "", // YouTube video URL
  });

  // Image preview states for multiple images
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const categories = [
    "General",
    "Event",
    "Emergency",
    "Update",
    "Health Program",
    "Community Activity",
    "Education & Training",
    "Social Services",
    "Sports & Recreation",
    "Safety & Security",
  ];

  useEffect(() => {
    fetchAnnouncements();
    fetchHashtags();
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/committees`);
      if (response.data.success) {
        setCommittees(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching committees:", error);
      setCommittees([]);
    }
  };

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

  const fetchAnnouncements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/announcements/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAnnouncements(response.data.data || []);
        if (isRefresh) showSuccess("Announcements refreshed");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      showError("Failed to fetch announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, categoryFilter, sortBy, sortOrder, announcements]);

  const applyFilters = () => {
    let filtered = [...announcements];

    // Filter by status
    if (filter === "archived") {
      filtered = filtered.filter((a) => a.status === "archived");
    } else if (filter !== "all") {
      filtered = filtered.filter((a) => a.status === filter);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchLower) ||
          a.content?.toLowerCase().includes(searchLower) ||
          a.category?.toLowerCase().includes(searchLower) ||
          a.location?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "date":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "views":
          aVal = a.views || 0;
          bVal = b.views || 0;
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    setFilteredAnnouncements(filtered);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "General",
      status: "published",
      committeeRef: "",
      location: "Barangay Culiat",
      eventDate: "",
      images: [],
      hashtags: [],
      youtubeVideoUrl: "",
    });
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setHashtagSearch("");
    setShowHashtagDropdown(false);
    setIsEditMode(false);
    setSelectedAnnouncement(null);
    setError("");
  };

  const handleCreateClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category || "General",
      status: announcement.status || "published",
      committeeRef:
        announcement.committeeRef?._id || announcement.committeeRef || "",
      location: announcement.location || "Barangay Culiat",
      eventDate: announcement.eventDate ? new Date(announcement.eventDate).toISOString().split('T')[0] : "",
      images: [],
      hashtags: announcement.hashtags || [],
      youtubeVideoUrl: announcement.youtubeVideoUrl || "",
    });
    // Set existing images from announcement (support both images array and legacy image field)
    const existingImgs = announcement.images?.length > 0
      ? announcement.images
      : (announcement.image ? [announcement.image] : []);
    setExistingImages(existingImgs);
    setImagePreviews([]);
    setImagesToRemove([]);
    setHashtagSearch("");
    setShowHashtagDropdown(false);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Calculate remaining slots (max 6 total)
    const currentTotal = existingImages.length + formData.images.length;
    const remainingSlots = 6 - currentTotal;

    if (remainingSlots <= 0) {
      showError("Maximum 6 images allowed");
      return;
    }

    // Take only as many files as we have slots for
    const filesToAdd = files.slice(0, remainingSlots);

    // Add new files to formData
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }));

    // Generate previews for new files
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = '';
  };

  const handleRemoveNewImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setImagesToRemove(prev => [...prev, imageUrl]);
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
      submitData.append("content", formData.content);
      submitData.append("category", formData.category);
      submitData.append("status", formData.status);
      submitData.append("committeeRef", formData.committeeRef || "");
      submitData.append("location", formData.location);
      if (formData.eventDate) {
        submitData.append("eventDate", formData.eventDate);
      }

      // Append YouTube video URL if provided
      if (formData.youtubeVideoUrl) {
        submitData.append("youtubeVideoUrl", formData.youtubeVideoUrl);
      }

      // Append hashtags
      if (formData.hashtags.length > 0) {
        submitData.append("hashtags", JSON.stringify(formData.hashtags));
      }

      // Append multiple images
      formData.images.forEach(image => {
        submitData.append("images", image);
      });

      // Append images to remove (for edit mode)
      if (isEditMode && imagesToRemove.length > 0) {
        submitData.append("removeImages", JSON.stringify(imagesToRemove));
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditMode) {
        await axios.put(
          `${API_URL}/api/announcements/${selectedAnnouncement._id}`,
          submitData,
          config
        );
        showSuccess("Announcement updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/announcements`, submitData, config);
        showSuccess("Announcement created successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save announcement");
      showError("Failed to save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/announcements/${selectedAnnouncement._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("Announcement deleted successfully!");
      setShowDeleteModal(false);
      fetchAnnouncements();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete announcement");
    }
  };

  const handleStatusUpdate = (announcement) => {
    setSelectedAnnouncement(announcement);
    setNewStatus(announcement.status);
    setStatusUpdateModal(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/announcements/${selectedAnnouncement._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccess(`Announcement ${newStatus === 'published' ? 'published' : newStatus === 'archived' ? 'archived' : 'saved as draft'} successfully!`);

      setStatusUpdateModal(false);
      fetchAnnouncements();
    } catch (error) {
      showError("Failed to update status");
    }
  };

  const handleArchiveToggle = async (announcement) => {
    try {
      const token = localStorage.getItem("token");
      const promise = axios.put(
        `${API_URL}/api/announcements/${announcement._id}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await showPromise(promise, {
        loading: announcement.status === 'archived' ? 'Unarchiving...' : 'Archiving...',
        success: announcement.status === 'archived' ? 'Announcement unarchived!' : 'Announcement archived!',
        error: 'Failed to update announcement'
      });

      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedAnnouncements.length === filteredAnnouncements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(filteredAnnouncements.map((a) => a._id));
    }
  };

  const handleSelectAnnouncement = (id) => {
    if (selectedAnnouncements.includes(id)) {
      setSelectedAnnouncements(selectedAnnouncements.filter((aid) => aid !== id));
    } else {
      setSelectedAnnouncements([...selectedAnnouncements, id]);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Title", "Category", "Status", "Location", "Date", "Views"];
    const rows = filteredAnnouncements.map((a) => [
      a._id,
      a.title,
      a.category,
      a.status,
      a.location,
      new Date(a.createdAt).toLocaleDateString(),
      a.views || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `announcements_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Announcements exported successfully");
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        icon: Clock,
        label: "Draft",
        dotColor: "bg-gray-500",
      },
      published: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        icon: CheckCircle,
        label: "Published",
        dotColor: "bg-emerald-500",
      },
      archived: {
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        icon: Archive,
        label: "Archived",
        dotColor: "bg-amber-500",
      },
    };
    return configs[status] || configs.draft;
  };

  const getCategoryColor = (category) => {
    const colors = {
      General: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Event: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Emergency: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      Update: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "Health Program": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "Community Activity": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      "Education & Training": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      "Social Services": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      "Sports & Recreation": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "Safety & Security": "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    };
    return colors[category] || colors.General;
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

  const getCommitteeName = (committeeRef) => {
    if (!committeeRef) return "";
    if (typeof committeeRef === "object") {
      return committeeRef.name || committeeRef.nameEnglish || "";
    }
    const committee = committees.find((c) => c._id === committeeRef);
    return committee?.name || committee?.nameEnglish || "";
  };

  // Image gallery handlers
  const openImageGallery = useCallback((index) => {
    setCurrentImageIndex(index);
    setImageGalleryOpen(true);
  }, []);

  const closeImageGallery = useCallback(() => {
    setImageGalleryOpen(false);
  }, []);

  // Get all images for current selected announcement (support both images array and legacy image field)
  const getAnnouncementImages = useCallback(() => {
    if (!selectedAnnouncement) return [];
    if (selectedAnnouncement.images?.length > 0) {
      return selectedAnnouncement.images;
    }
    if (selectedAnnouncement.image) {
      return [selectedAnnouncement.image];
    }
    return [];
  }, [selectedAnnouncement]);

  const nextImage = useCallback(() => {
    const images = getAnnouncementImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  }, [getAnnouncementImages]);

  const prevImage = useCallback(() => {
    const images = getAnnouncementImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  }, [getAnnouncementImages]);

  // Keyboard navigation for image gallery
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

  const statusCounts = useMemo(() => ({
    all: announcements.length,
    published: announcements.filter((a) => a.status === "published").length,
    draft: announcements.filter((a) => a.status === "draft").length,
    archived: announcements.filter((a) => a.status === "archived").length,
  }), [announcements]);

  return (
    <div className="space-y-4 sm:space-y-6 p-1">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Announcements
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Create, manage and publish barangay announcements. Keep residents informed about events, programs, and important notices.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchAnnouncements(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredAnnouncements.length === 0}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Export</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
          {[
            { label: "Total", count: statusCounts.all, icon: Inbox, gradient: "from-blue-500 to-blue-600", filterValue: "all" },
            { label: "Published", count: statusCounts.published, icon: CheckCircle, gradient: "from-emerald-500 to-green-500", filterValue: "published" },
            { label: "Drafts", count: statusCounts.draft, icon: Clock, gradient: "from-gray-500 to-slate-500", filterValue: "draft" },
            { label: "Archived", count: statusCounts.archived, icon: Archive, gradient: "from-amber-500 to-orange-500", filterValue: "archived" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group ${filter === stat.filterValue ? 'ring-2 ring-white/30' : ''}`}
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

      {/* Bulk Actions Bar */}
      {selectedAnnouncements.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {selectedAnnouncements.length} announcement{selectedAnnouncements.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAnnouncements([])}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-slate-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-x-auto">
              {["all", "published", "draft", "archived"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap ${filter === status
                      ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredAnnouncements.length} of {announcements.length}
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
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
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading announcements...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAnnouncements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 sm:py-16 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1">No announcements found</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-center px-4">
            {announcements.length === 0 ? "Create your first announcement to get started" : "Try adjusting your filters"}
          </p>
          {announcements.length === 0 && (
            <button
              onClick={handleCreateClick}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Announcement
            </button>
          )}
        </div>
      )}

      {/* Announcements Grid */}
      {!loading && filteredAnnouncements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredAnnouncements.map((announcement) => {
            const statusConfig = getStatusConfig(announcement.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={announcement._id}
                className={`group relative bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 cursor-pointer ${selectedAnnouncements.includes(announcement._id)
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
                onClick={() => handleViewAnnouncement(announcement)}
              >
                {/* Selection Checkbox */}
                <div
                  className="absolute top-4 left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedAnnouncements.includes(announcement._id)}
                    onChange={() => handleSelectAnnouncement(announcement._id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Image Preview */}
                {(announcement.images?.length > 0 || announcement.image) && (
                  <div className="relative h-32 sm:h-40 overflow-hidden rounded-t-lg sm:rounded-t-xl">
                    <img
                      src={announcement.images?.[0] || announcement.image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    {/* Show image count badge if multiple images */}
                    {(announcement.images?.length > 1) && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                        <Image className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs text-white font-medium">+{announcement.images.length - 1}</span>
                      </div>
                    )}
                  </div>
                )}

                {(!announcement.images?.length && !announcement.image) && (
                  <div className="relative h-24 sm:h-32 overflow-hidden rounded-t-lg sm:rounded-t-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                    <Megaphone className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
                  </div>
                )}

                <div className="p-3 sm:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center mt-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${getCategoryColor(announcement.category)}`}>
                        <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        {announcement.category}
                      </span>
                      {getCommitteeName(announcement.committeeRef) && (
                        <span className="inline-flex items-center mt-1 ml-1.5 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          {getCommitteeName(announcement.committeeRef)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3">
                    {announcement.content}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    {announcement.location && (
                      <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="truncate">{announcement.location}</span>
                      </span>
                    )}
                    {announcement.views > 0 && (
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {announcement.views}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-slate-700">
                    <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border ${statusConfig.color}`}>
                      <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="text-[10px] sm:text-xs font-medium">{statusConfig.label}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400">{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div
                  className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEditClick(announcement)}
                    className="p-1.5 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchiveToggle(announcement)}
                    className="p-1.5 bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 rounded-lg shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    title={announcement.status === 'archived' ? 'Unarchive' : 'Archive'}
                  >
                    {announcement.status === 'archived' ? (
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(announcement)}
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

      {/* View Announcement Modal */}
      {viewModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative">
              {(selectedAnnouncement.images?.length > 0 || selectedAnnouncement.image) ? (
                <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
                  <img
                    src={selectedAnnouncement.images?.[0] || selectedAnnouncement.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                  {/* Image Gallery Trigger */}
                  <button
                    onClick={() => openImageGallery(0)}
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      {getAnnouncementImages().length > 1
                        ? `${getAnnouncementImages().length} Photos`
                        : 'View Full Image'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="h-20 sm:h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Megaphone className="w-10 h-10 sm:w-16 sm:h-16 text-white/30" />
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
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-10rem)] sm:max-h-[calc(90vh-16rem)]">
              {/* Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedAnnouncement.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${getCategoryColor(selectedAnnouncement.category)}`}>
                    {selectedAnnouncement.category}
                  </span>
                  <span className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full border ${getStatusConfig(selectedAnnouncement.status).color}`}>
                    {React.createElement(getStatusConfig(selectedAnnouncement.status).icon, { className: "w-2.5 h-2.5 sm:w-3 sm:h-3" })}
                    {getStatusConfig(selectedAnnouncement.status).label}
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
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Date Created</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-md sm:rounded-lg">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{selectedAnnouncement.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                  <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md sm:rounded-lg">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Views</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{selectedAnnouncement.views || 0}</p>
                  </div>
                </div>

                {selectedAnnouncement.publishedBy && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                    <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md sm:rounded-lg">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Published By</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{selectedAnnouncement.publishedBy.firstName} {selectedAnnouncement.publishedBy.lastName}</p>
                    </div>
                  </div>
                )}

                {getCommitteeName(selectedAnnouncement.committeeRef) && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                    <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-md sm:rounded-lg">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Committee</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getCommitteeName(selectedAnnouncement.committeeRef)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">Content</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>

              {/* Image Gallery Thumbnails */}
              {getAnnouncementImages().length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                    Attachments ({getAnnouncementImages().length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getAnnouncementImages().map((img, idx) => (
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

              {/* YouTube Video Display */}
              {selectedAnnouncement.youtubeVideoUrl && selectedAnnouncement.youtubeVideoId && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    Video
                  </h4>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedAnnouncement.youtubeVideoId}`}
                      title="YouTube video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <button
                onClick={() => handleDeleteClick(selectedAnnouncement)}
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
                    handleEditClick(selectedAnnouncement);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  <Edit className="w-4 h-4" />
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
                      {isEditMode ? "Edit Announcement" : "New Announcement"}
                    </h2>
                    <p className={`text-xs sm:text-sm ${isEditMode ? 'text-blue-200' : 'text-emerald-200'}`}>
                      {isEditMode ? "Update announcement details" : "Create a new announcement"}
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
                  placeholder="Enter announcement title"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Committee <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  value={formData.committeeRef}
                  onChange={(e) => setFormData({ ...formData, committeeRef: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Committee Linked</option>
                  {committees.map((committee) => (
                    <option key={committee._id} value={committee._id}>
                      {committee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Barangay Hall"
                    className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Event Date <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  placeholder="Enter announcement content..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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

              {/* YouTube Video URL Section */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" />
                  YouTube Video URL <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.youtubeVideoUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeVideoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Add a YouTube video to your announcement. Paste the video URL here.
                </p>

                {/* YouTube Video Preview */}
                {formData.youtubeVideoUrl && extractYouTubeVideoId(formData.youtubeVideoUrl) && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-red-200 dark:border-red-800">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${extractYouTubeVideoId(formData.youtubeVideoUrl)}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {formData.youtubeVideoUrl && !extractYouTubeVideoId(formData.youtubeVideoUrl) && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Invalid YouTube URL. Please check the format.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Images <span className="text-gray-400">(Up to 6 images)</span>
                </label>

                {/* Image Upload Area */}
                <div className="space-y-3">
                  {/* Existing Images (in edit mode) */}
                  {existingImages.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Images:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {existingImages.map((img, idx) => (
                          <div key={`existing-${idx}`} className="relative group aspect-square">
                            <img
                              src={img}
                              alt={`Existing ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(img)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">New Images:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {imagePreviews.map((preview, idx) => (
                          <div key={`preview-${idx}`} className="relative group aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-blue-300 dark:border-blue-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(idx)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button - Show if less than 6 total images */}
                  {(existingImages.length + formData.images.length) < 6 && (
                    <label className="flex flex-col items-center justify-center px-4 py-6 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg border-2 border-gray-300 dark:border-gray-600 border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                      <span className="text-xs sm:text-sm font-medium">Click to upload images</span>
                      <span className="text-xs text-gray-400 mt-1">
                        {6 - existingImages.length - formData.images.length} slots remaining
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {(existingImages.length + formData.images.length) >= 6 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
                      Maximum of 6 images reached
                    </p>
                  )}
                </div>
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
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed rounded-lg sm:rounded-xl transition-colors shadow-lg shadow-emerald-600/25"
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

      {/* Status Update Modal */}
      {statusUpdateModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Flag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Change the status of this announcement</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { value: "draft", label: "Draft", desc: "Not visible to public" },
                  { value: "published", label: "Published", desc: "Visible to all residents" },
                  { value: "archived", label: "Archived", desc: "Hidden and stored for records" },
                ].map((status) => {
                  const config = getStatusConfig(status.value);
                  return (
                    <label
                      key={status.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${newStatus === status.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                        }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={newStatus === status.value}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full ${config.dotColor}`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{status.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{status.desc}</p>
                      </div>
                      {newStatus === status.value && (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStatusUpdateModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                Delete Announcement?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
                Are you sure you want to delete "<strong className="break-words">{selectedAnnouncement.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Gallery */}
      {imageGalleryOpen && selectedAnnouncement && getAnnouncementImages().length > 0 && (
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
            {currentImageIndex + 1} / {getAnnouncementImages().length}
          </div>

          {/* Main Image */}
          <div
            className="relative w-full h-full flex items-center justify-center p-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getAnnouncementImages()[currentImageIndex]}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Navigation Buttons */}
          {getAnnouncementImages().length > 1 && (
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
          {getAnnouncementImages().length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {getAnnouncementImages().map((img, idx) => (
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
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
