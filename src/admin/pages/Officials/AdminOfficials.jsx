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
    contactNumber: "",
    bio: "",
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
      contactNumber: "",
      bio: "",
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
        contactNumber: official.contactNumber || "",
        bio: official.bio || "",
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barangay Officials</h1>
          <p className="text-gray-600 mt-1">
            Manage barangay officials and their information
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Official
        </button>
      </div>

      {/* Officials Grid */}
      {officials.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Officials Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first barangay official
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add First Official
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {officials.map((official) => (
            <div
              key={official._id}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                !official.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Photo */}
              <div className="h-48 bg-gray-100 relative">
                {official.photo ? (
                  <img
                    src={official.photo}
                    alt={`${official.firstName} ${official.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                {/* Status Badge */}
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    official.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {official.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {official.firstName} {official.middleName ? `${official.middleName[0]}.` : ""} {official.lastName}
                </h3>
                <p className="text-sm text-red-600 font-medium">
                  {getPositionLabel(official.position)}
                </p>
                {official.committee && (
                  <p className="text-xs text-gray-500 mt-1">
                    Committee: {official.committee}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleToggleActive(official._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm rounded-lg border hover:bg-gray-50"
                    title={official.isActive ? "Deactivate" : "Activate"}
                  >
                    {official.isActive ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => openModal(official)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm rounded-lg border hover:bg-gray-50 text-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(official._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm rounded-lg border hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingOfficial ? "Edit Official" : "Add New Official"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500"
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
                      <Upload size={24} className="mx-auto text-gray-400" />
                      <span className="text-xs text-gray-500">Upload Photo</span>
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
                <p className="text-xs text-gray-500 mt-2">
                  Click to upload (JPG, PNG, max 5MB)
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) =>
                      setFormData({ ...formData, middleName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Position & Committee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Committee
                  </label>
                  <input
                    type="text"
                    value={formData.committee}
                    onChange={(e) =>
                      setFormData({ ...formData, committee: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Health & Sanitation"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 09171234567"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description about the official"
                />
              </div>

              {/* Display Order & Active Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingOfficial ? "Update Official" : "Create Official"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Officials marked as "Active" will be displayed
          on the About Us page. Photos are uploaded to cloud storage for optimal
          performance.
        </p>
      </div>
    </div>
  );
};

export default AdminOfficials;
