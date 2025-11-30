import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CMSAboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    barangayName: "",
    description: "",
    mission: "",
    vision: "",
    history: "",
  });

  useEffect(() => {
    fetchBarangayInfo();
  }, []);

  const fetchBarangayInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/barangay-info`);
      if (response.data.success) {
        const data = response.data.data;
        setFormData({
          barangayName: data.barangayName || "",
          description: data.description || "",
          mission: data.mission || "",
          vision: data.vision || "",
          history: data.history || "",
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Barangay information not found. Please create it first.");
      } else {
        toast.error("Failed to fetch barangay information");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.put(
        `${API_URL}/api/barangay-info`,
        formData,
        config
      );

      if (response.data.success) {
        toast.success("About Us section updated successfully");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // If barangay info doesn't exist, create it
        try {
          const token = localStorage.getItem("token");
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
          await axios.post(`${API_URL}/api/barangay-info`, formData, config);
          toast.success("About Us section created successfully");
        } catch (createError) {
          toast.error("Failed to create barangay information");
          console.error(createError);
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to update");
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      fetchBarangayInfo();
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS - About Us</h1>
          <p className="text-gray-600 mt-1">Manage About Us page content</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={20} />
          Reset
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hero Section
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay Name
              </label>
              <input
                type="text"
                value={formData.barangayName}
                onChange={(e) =>
                  setFormData({ ...formData, barangayName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Barangay Culiat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description shown in the hero section"
              />
              <p className="text-xs text-gray-500 mt-1">
                This appears below "About Us" title in the hero section
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mission & Vision
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vision Statement
              </label>
              <textarea
                rows={4}
                value={formData.vision}
                onChange={(e) =>
                  setFormData({ ...formData, vision: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the barangay's vision statement"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: "Sa Barangay Culiat, serbisyo ay tapat..."
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission Statement
              </label>
              <textarea
                rows={5}
                value={formData.mission}
                onChange={(e) =>
                  setFormData({ ...formData, mission: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the barangay's mission statement"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: "Ang Barangay Culiat ay sasalamin sa programa..."
              </p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            History Section
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              History Content
            </label>
            <textarea
              rows={8}
              value={formData.history}
              onChange={(e) =>
                setFormData({ ...formData, history: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the complete history of the barangay. You can use line breaks to separate paragraphs."
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Use double line breaks to separate paragraphs. The content
              will be automatically formatted on the page.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Changes will be reflected immediately on the
          About Us page after saving. Visit the page to see your updates.
        </p>
      </div>
    </div>
  );
};

export default CMSAboutUs;
