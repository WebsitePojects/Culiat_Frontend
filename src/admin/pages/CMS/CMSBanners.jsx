import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  X,
  Image,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw,
  Upload,
  Search,
  Download,
  Layers,
  ExternalLink,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CMSBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tempUploadedUrl, setTempUploadedUrl] = useState(null); // Track temp uploads for cleanup
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaType: "image",
    mediaUrl: "",
    thumbnailUrl: "",
    ctaButton: {
      enabled: false,
      text: "Learn More",
      link: "#",
    },
    textPosition: "center",
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/banners/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setBanners(response.data.data);
      }
      if (isRefresh) toast.success("Banners refreshed");
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("ctaButton.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        ctaButton: {
          ...prev.ctaButton,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const token = localStorage.getItem("token");
      const resourceType = file.type.startsWith("video/") ? "video" : "image";

      // Upload to backend which then uploads to Cloudinary
      const response = await axios.post(
        `${API_URL}/api/banners/upload`,
        uploadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const uploadedUrl = response.data.url;
        setFormData((prev) => ({
          ...prev,
          mediaUrl: uploadedUrl,
          mediaType: resourceType,
        }));
        setTempUploadedUrl(uploadedUrl); // Track for cleanup if abandoned
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const deleteTemporaryUpload = async (url) => {
    if (!url) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/banners/upload/temp`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { url },
      });
    } catch (error) {
      console.error("Error deleting temporary upload:", error);
    }
  };

  const handleCloseModal = async () => {
    // Delete temp upload if user abandons the form
    if (tempUploadedUrl && !editingBanner) {
      await deleteTemporaryUpload(tempUploadedUrl);
    }
    setShowModal(false);
    setTempUploadedUrl(null);
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setTempUploadedUrl(null);
    setFormData({
      title: "",
      description: "",
      mediaType: "image",
      mediaUrl: "",
      thumbnailUrl: "",
      ctaButton: {
        enabled: false,
        text: "Learn More",
        link: "#",
      },
      textPosition: "center",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTempUploadedUrl(null); // No temp tracking when editing existing
    setFormData({
      title: banner.title,
      description: banner.description || "",
      mediaType: banner.mediaType,
      mediaUrl: banner.mediaUrl,
      thumbnailUrl: banner.thumbnailUrl || "",
      ctaButton: banner.ctaButton || {
        enabled: false,
        text: "Learn More",
        link: "#",
      },
      textPosition: banner.textPosition || "center",
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mediaUrl) {
      toast.error("Please provide a media file");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare data, ensuring title is at least an empty string
      const submitData = {
        ...formData,
        title: formData.title || "",
      };

      if (editingBanner) {
        await axios.put(
          `${API_URL}/api/banners/${editingBanner._id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Banner updated successfully");
      } else {
        await axios.post(
          `${API_URL}/api/banners`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Banner created successfully");
      }

      setShowModal(false);
      setTempUploadedUrl(null); // Clear temp tracking on success
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error(error.response?.data?.message || "Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/banners/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBanners();
      toast.success("Banner status updated");
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/banners/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Banner deleted successfully");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  const moveBanner = async (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const newBanners = [...banners];
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    setBanners(newBanners);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/banners/reorder`,
        { bannerIds: newBanners.map((b) => b._id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Banner order updated");
    } catch (error) {
      console.error("Error reordering banners:", error);
      toast.error("Failed to save new order");
      fetchBanners();
    }
  };

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      const matchesSearch =
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && banner.isActive) ||
        (filterStatus === "inactive" && !banner.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [banners, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: banners.length,
    active: banners.filter((b) => b.isActive).length,
    inactive: banners.filter((b) => !b.isActive).length,
    videos: banners.filter((b) => b.mediaType === "video").length,
  }), [banners]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-1">
      {/* ==================== PREMIUM HEADER ==================== */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Homepage Carousel
              </h1>
            </div>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Manage banners and slides displayed on the homepage carousel
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() => fetchBanners(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium text-emerald-900 bg-white rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-lg shadow-white/25"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Add Banner</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
          {[
            { label: "Total", count: stats.total, filterValue: "all", gradient: "from-emerald-500 to-emerald-600" },
            { label: "Active", count: stats.active, filterValue: "active", gradient: "from-green-500 to-green-600" },
            { label: "Inactive", count: stats.inactive, filterValue: "inactive", gradient: "from-gray-500 to-gray-600" },
            { label: "Videos", count: stats.videos, filterValue: null, gradient: "from-purple-500 to-purple-600" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 ${stat.filterValue ? "cursor-pointer" : ""} group ${filterStatus === stat.filterValue ? "ring-2 ring-white/30" : ""}`}
              onClick={() => stat.filterValue && setFilterStatus(stat.filterValue)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs sm:text-sm">{stat.label}</span>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== SEARCH & FILTER BAR ==================== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* ==================== BANNERS LIST ==================== */}
      {filteredBanners.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {searchTerm || filterStatus !== "all" ? "No Banners Found" : "No Banners Yet"}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 mb-4 text-sm">
            {searchTerm || filterStatus !== "all" ? "Try adjusting your search or filters" : "Add your first banner to get started"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              <Plus size={18} />
              Add Banner
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBanners.map((banner, index) => (
            <div
              key={banner._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Order Controls */}
                <div className="hidden sm:flex flex-col gap-1">
                  <button
                    onClick={() => moveBanner(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <span className="text-xs text-center text-gray-400 font-medium">{index + 1}</span>
                  <button
                    onClick={() => moveBanner(index, "down")}
                    disabled={index === banners.length - 1}
                    className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="w-full sm:w-36 md:w-40 h-24 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {banner.mediaType === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                      <Video className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={banner.mediaUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{banner.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {banner.description || "No description"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        banner.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {banner.mediaType === "video" ? "Video" : "Image"}
                    </span>
                    {banner.ctaButton?.enabled && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ExternalLink size={12} />
                        CTA
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
                  {/* Mobile Order Controls */}
                  <div className="flex sm:hidden gap-1 mr-2">
                    <button
                      onClick={() => moveBanner(index, "up")}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      onClick={() => moveBanner(index, "down")}
                      disabled={index === banners.length - 1}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggle(banner._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      banner.isActive
                        ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title={banner.isActive ? "Deactivate" : "Activate"}
                  >
                    {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(banner);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== UPLOAD LOADING OVERLAY ==================== */}
      {uploading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Uploading...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we upload your file</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE/EDIT MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Enter banner title (optional)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Enter banner description (optional)"
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Media <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center relative">
                  {formData.mediaUrl ? (
                    <div className="relative">
                      {formData.mediaType === "video" ? (
                        <video
                          src={formData.mediaUrl}
                          className="max-h-40 mx-auto rounded-lg"
                          controls
                        />
                      ) : (
                        <img
                          src={formData.mediaUrl}
                          alt="Preview"
                          className="max-h-40 mx-auto rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, mediaUrl: "" }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">
                        {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        PNG, JPG, WebP, GIF, MP4, WebM (max 10MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                    </div>
                  )}
                </div>
                {/* Or use URL */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Or paste URL directly
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      name="mediaUrl"
                      value={formData.mediaUrl}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    <select
                      name="mediaType"
                      value={formData.mediaType}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Text Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Position
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "left", icon: AlignLeft },
                    { value: "center", icon: AlignCenter },
                    { value: "right", icon: AlignRight },
                  ].map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, textPosition: value }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors text-sm ${
                        formData.textPosition === value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="capitalize hidden sm:inline">{value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between py-3 border-t dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Active Status</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Banner will be visible on the homepage</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.mediaUrl}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {submitting ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE MODAL ==================== */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Banner</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSBanners;
