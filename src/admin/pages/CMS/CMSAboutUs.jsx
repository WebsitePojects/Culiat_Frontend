import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, MapPin, Phone, Users, Globe, RefreshCw, Building, Target, History, Mail } from "lucide-react";
import { motion } from "framer-motion";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
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
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                About Us Management
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Manage all About Us page content dynamically
            </p>
          </div>

          <button
            onClick={fetchBarangayInfo}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
          {[
            { label: "Population", value: formData.demographics.totalPopulation.toLocaleString(), icon: Users, iconColor: "text-blue-300", iconBg: "bg-blue-500/20" },
            { label: "Households", value: formData.demographics.totalHouseholds.toLocaleString(), icon: Building, iconColor: "text-green-300", iconBg: "bg-green-500/20" },
            { label: "Projects", value: formData.demographics.ongoingPublicProjects.toLocaleString(), icon: Target, iconColor: "text-yellow-300", iconBg: "bg-yellow-500/20" },
            { label: "Area (ha)", value: formData.demographics.barangayArea.toLocaleString(), icon: MapPin, iconColor: "text-purple-300", iconBg: "bg-purple-500/20" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-lg md:text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
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
        </motion.div>

        {/* Mission & Vision */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
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
        </motion.div>

        {/* History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
            </div>
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
        </motion.div>

        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
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
        </motion.div>

        {/* Demographics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
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
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6"
        >
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-gray-200">Note:</strong> All changes will be reflected immediately on the About Us page after saving.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
        </motion.div>
      </form>
    </div>
  );
};

export default CMSAboutUs;
