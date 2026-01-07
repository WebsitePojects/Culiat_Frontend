import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  User,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const POSITION_OPTIONS = [
  { value: "barangay_captain", label: "Barangay Captain" },
  { value: "barangay_kagawad", label: "Barangay Kagawad" },
  { value: "sk_chairman", label: "SK Chairman" },
  { value: "barangay_secretary", label: "Barangay Secretary" },
  { value: "barangay_treasurer", label: "Barangay Treasurer" },
  { value: "administrative_officer", label: "Administrative Officer" },
  { value: "admin_officer_internal", label: "Administrative Officer Internal" },
  { value: "admin_officer_external", label: "Administrative Officer External" },
  { value: "executive_officer", label: "Executive Officer (EX-O)" },
  { value: "deputy_officer", label: "Deputy Officer" },
  { value: "other", label: "Other" },
];

const getPositionLabel = (value) => {
  const option = POSITION_OPTIONS.find((opt) => opt.value === value);
  return option ? option.label : value;
};

const AdminOfficials = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    position: "barangay_kagawad",
    committee: "",
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/officials`);
      if (response.data.success) {
        setOfficials(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch officials");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      position: "barangay_kagawad",
      committee: "",
      isActive: true,
      displayOrder: officials.length,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingOfficial(null);
  };

  const openModal = (official = null) => {
    if (official) {
      setEditingOfficial(official);
      setFormData({
        firstName: official.firstName || "",
        lastName: official.lastName || "",
        middleName: official.middleName || "",
        position: official.position || "barangay_kagawad",
        committee: official.committee || "",
        isActive: official.isActive ?? true,
        displayOrder: official.displayOrder || 0,
      });
      setPreviewUrl(official.photo || null);
    } else {
      resetForm();
      setFormData((prev) => ({ ...prev, displayOrder: officials.length }));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent duplicate submissions
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      if (selectedFile) {
        submitData.append("officialPhoto", selectedFile);
      }

      let response;
      if (editingOfficial) {
        response = await axios.put(
          `${API_URL}/api/officials/${editingOfficial._id}`,
          submitData,
          config
        );
        toast.success("Official updated successfully");
      } else {
        response = await axios.post(
          `${API_URL}/api/officials`,
          submitData,
          config
        );
        toast.success("Official created successfully");
      }

      fetchOfficials();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save official");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this official?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/officials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Official deleted successfully");
      fetchOfficials();
    } catch (error) {
      toast.error("Failed to delete official");
      console.error(error);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/officials/${id}/toggle-active`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Status updated");
      fetchOfficials();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-lg sm:rounded-xl">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Barangay Officials</h1>
            </div>
            <p className="text-[11px] sm:text-sm text-blue-200/80">
              Manage barangay officials and their information
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 text-xs sm:text-sm font-medium"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Official
          </button>
        </div>
      </div>

      {/* Officials Grid */}
      {officials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 sm:mb-4">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
            No Officials Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Start by adding your first barangay official
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/25 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add First Official
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {officials.map((official) => (
            <div
              key={official._id}
              className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 ${
                !official.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Photo */}
              <div className="h-28 sm:h-36 md:h-48 bg-gray-100 dark:bg-gray-700 relative">
                {official.photo ? (
                  <img
                    src={official.photo}
                    alt={`${official.firstName} ${official.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400" />
                  </div>
                )}
                {/* Status Badge */}
                <div
                  className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
                    official.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {official.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Content */}
              <div className="p-2.5 sm:p-3 md:p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">
                  {official.firstName} {official.middleName ? `${official.middleName[0]}.` : ""} {official.lastName}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-red-600 dark:text-red-400 font-medium truncate">
                  {getPositionLabel(official.position)}
                </p>
                {official.committee && (
                  <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 truncate hidden sm:block">
                    Committee: {official.committee}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => handleToggleActive(official._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    title={official.isActive ? "Deactivate" : "Activate"}
                  >
                    {official.isActive ? (
                      <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openModal(official)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(official._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingOfficial ? "Edit Official" : "Add New Official"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {/* Photo Upload */}
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gray-400 dark:text-gray-500" />
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
                  Click to upload (JPG, PNG, max 5MB)
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    M.I.
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) =>
                      setFormData({ ...formData, middleName: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Position & Committee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Committee
                  </label>
                  <input
                    type="text"
                    value={formData.committee}
                    onChange={(e) =>
                      setFormData({ ...formData, committee: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Health & Sanitation"
                  />
                </div>
              </div>

              {/* Display Order & Active Status */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                    Lower = appears first
                  </p>
                </div>
                <div className="flex items-center pt-5 sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active (visible)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-600/25 text-xs sm:text-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {editingOfficial ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Officials marked as "Active" will be displayed
          on the About Us page.
        </p>
      </div>
    </div>
  );
};

export default AdminOfficials;
