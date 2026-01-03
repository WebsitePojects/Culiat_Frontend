import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, RefreshCw, MapPin, Phone, Users, Globe } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CMSAboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [formData, setFormData] = useState({
    barangayName: "",
    description: "",
    mission: "",
    vision: "",
    history: "",
    address: {
      street: "",
      municipality: "",
      province: "",
      region: "",
      zipCode: "",
    },
    contactInfo: {
      phoneNumber: "",
      email: "",
    },
    demographics: {
      totalPopulation: 0,
      totalHouseholds: 0,
      ongoingPublicProjects: 0,
      barangayArea: 0,
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
    logo: "",
    coverPhoto: "",
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
          address: {
            street: data.address?.street || "",
            municipality: data.address?.municipality || "",
            province: data.address?.province || "",
            region: data.address?.region || "",
            zipCode: data.address?.zipCode || "",
          },
          contactInfo: {
            phoneNumber: data.contactInfo?.phoneNumber || "",
            email: data.contactInfo?.email || "",
          },
          demographics: {
            totalPopulation: data.demographics?.totalPopulation || 0,
            totalHouseholds: data.demographics?.totalHouseholds || 0,
            ongoingPublicProjects:
              data.demographics?.ongoingPublicProjects || 0,
            barangayArea: data.demographics?.barangayArea || 0,
          },
          socialMedia: {
            facebook: data.socialMedia?.facebook || "",
            twitter: data.socialMedia?.twitter || "",
            instagram: data.socialMedia?.instagram || "",
            youtube: data.socialMedia?.youtube || "",
          },
          logo: data.logo || "",
          coverPhoto: data.coverPhoto || "",
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No existing data - show form for initial creation
        setIsNewRecord(true);
        toast("No existing barangay information. Fill in the form to create.", {
          icon: "ℹ️",
          duration: 4000,
        });
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

      let response;
      
      if (isNewRecord) {
        // Create new barangay info
        response = await axios.post(
          `${API_URL}/api/barangay-info`,
          formData,
          config
        );
        setIsNewRecord(false);
        toast.success("Barangay information created successfully");
      } else {
        // Update existing
        response = await axios.put(
          `${API_URL}/api/barangay-info`,
          formData,
          config
        );
        toast.success("About Us section updated successfully");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const token = localStorage.getItem("token");
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
          await axios.post(`${API_URL}/api/barangay-info`, formData, config);
          setIsNewRecord(false);
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
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2.5 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            About Us
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
            Manage all About Us page content dynamically
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          Reset
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            Basic Information
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Barangay Name *
              </label>
              <input
                type="text"
                value={formData.barangayName}
                onChange={(e) =>
                  setFormData({ ...formData, barangayName: e.target.value })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Barangay Culiat"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description shown in the hero section"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Mission & Vision
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vision Statement
              </label>
              <textarea
                rows={4}
                value={formData.vision}
                onChange={(e) =>
                  setFormData({ ...formData, vision: e.target.value })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the barangay's vision statement"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mission Statement
              </label>
              <textarea
                rows={5}
                value={formData.mission}
                onChange={(e) =>
                  setFormData({ ...formData, mission: e.target.value })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the barangay's mission statement"
              />
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            History Section
          </h2>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              History Content
            </label>
            <textarea
              rows={8}
              value={formData.history}
              onChange={(e) =>
                setFormData({ ...formData, history: e.target.value })
              }
              className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the complete history of the barangay."
            />
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tip: Use double line breaks to separate paragraphs.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.contactInfo.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInfo: {
                      ...formData.contactInfo,
                      phoneNumber: e.target.value,
                    },
                  })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+63 XXX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInfo: {
                      ...formData.contactInfo,
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="barangay@example.com"
              />
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            Demographics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Population
              </label>
              <input
                type="number"
                value={formData.demographics.totalPopulation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      totalPopulation: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Households
              </label>
              <input
                type="number"
                value={formData.demographics.totalHouseholds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      totalHouseholds: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Public Projects
              </label>
              <input
                type="number"
                value={formData.demographics.ongoingPublicProjects}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      ongoingPublicProjects: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area (hectares)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.demographics.barangayArea}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      barangayArea: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            Social Media Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialMedia.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      twitter: e.target.value,
                    },
                  })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube
              </label>
              <input
                type="url"
                value={formData.socialMedia.youtube}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      youtube: e.target.value,
                    },
                  })
                }
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Note */}
      <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 sm:p-4">
        <p className="text-[10px] sm:text-xs md:text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> All changes will be reflected immediately on
          the About Us page after saving.
        </p>
      </div>
    </div>
  );
};

export default CMSAboutUs;
