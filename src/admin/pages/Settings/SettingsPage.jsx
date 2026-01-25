import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Settings as SettingsIcon,
  Save,
  Shield,
  RefreshCw,
  Bell,
  BellOff,
  Lock,
  Users,
  FileText,
  MessageSquare,
  Clock,
  HardDrive,
  Activity,
  Wrench,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const SettingsPage = () => {
  const { showSuccess, showError, showPromise } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    system: {},
  });
  const [hasChanges, setHasChanges] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data;
      setSettings(data);
      
      // Ensure all system settings have proper boolean values
      const systemSettings = data.system || {};
      setFormData({
        system: {
          maintenanceMode: systemSettings.maintenanceMode ?? false,
          maintenanceMessage: systemSettings.maintenanceMessage || "System is currently under maintenance. Please try again later.",
          emailNotificationsEnabled: systemSettings.emailNotificationsEnabled ?? true,
          registrationEnabled: systemSettings.registrationEnabled ?? true,
          documentRequestEnabled: systemSettings.documentRequestEnabled ?? true,
          reportingEnabled: systemSettings.reportingEnabled ?? true,
          profileUpdateEnabled: systemSettings.profileUpdateEnabled ?? true,
          autoApproveResidents: systemSettings.autoApproveResidents ?? false,
          sessionTimeout: systemSettings.sessionTimeout || 30,
          maxLoginAttempts: systemSettings.maxLoginAttempts || 5,
          maxFileSize: systemSettings.maxFileSize || 5,
          allowedFileTypes: systemSettings.allowedFileTypes || ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
        },
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      showError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async (section = null) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const dataToSave = section ? { [section]: formData[section] } : formData;
      const endpoint = section
        ? `${API_URL}/api/settings/${section}`
        : `${API_URL}/api/settings`;

      const promise = axios.put(endpoint, dataToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await showPromise(promise, {
        loading: "Saving settings...",
        success: "Settings saved successfully!",
        error: "Failed to save settings",
      });

      await fetchSettings();
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      system: settings.system || {},
    });
    setHasChanges(false);
    showSuccess("Changes discarded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-3 sm:p-4 md:p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px"
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  System Settings
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-200">
                  Configure your barangay management system
                </p>
              </div>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleReset}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg sm:rounded-xl transition-all border border-white/20"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Discard</span>
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg sm:rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  {saving ? "Saving..." : "Save All"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Settings Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                System Settings
              </h2>
              <p className="text-sm text-gray-500">Configure core system behavior and controls</p>
            </div>
          </div>

          {/* Email Notifications - Primary Control */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 md:p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${formData.system.emailNotificationsEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  {formData.system.emailNotificationsEnabled ? (
                    <Bell className="w-6 h-6 text-green-600" />
                  ) : (
                    <BellOff className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Master control for all system email notifications. When disabled, no emails will be sent for registrations, document requests, or any system events.
                  </p>
                  <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm font-medium ${
                    formData.system.emailNotificationsEnabled 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {formData.system.emailNotificationsEnabled ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Emails are being sent
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        All emails disabled
                      </>
                    )}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={formData.system.emailNotificationsEnabled === true}
                  onChange={(e) =>
                      handleInputChange(
                        "system",
                        "emailNotificationsEnabled",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className={`rounded-xl p-4 md:p-6 border-2 ${
              formData.system.maintenanceMode 
                ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700' 
                : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${formData.system.maintenanceMode ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    <Wrench className={`w-6 h-6 ${formData.system.maintenanceMode ? 'text-amber-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      Maintenance Mode
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      When enabled, the public site will show a maintenance message. Admin access remains available.
                    </p>
                    {formData.system.maintenanceMode && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        Site is in maintenance mode
                      </div>
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.system.maintenanceMode === true}
                    onChange={(e) =>
                      handleInputChange(
                        "system",
                        "maintenanceMode",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* Feature Controls Grid */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Feature Controls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Registration */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.system.registrationEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Users className={`w-5 h-5 ${formData.system.registrationEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">User Registration</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow new user sign-ups</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.registrationEnabled === true}
                      onChange={(e) => handleInputChange("system", "registrationEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Document Requests */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.system.documentRequestEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <FileText className={`w-5 h-5 ${formData.system.documentRequestEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Document Requests</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enable document submissions</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.documentRequestEnabled === true}
                      onChange={(e) => handleInputChange("system", "documentRequestEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Report Submissions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.system.reportingEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <MessageSquare className={`w-5 h-5 ${formData.system.reportingEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Report Submissions</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow residents to submit reports</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.reportingEnabled === true}
                      onChange={(e) => handleInputChange("system", "reportingEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Profile Updates */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.system.profileUpdateEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Users className={`w-5 h-5 ${formData.system.profileUpdateEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Profile Updates</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow residents to update profiles</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.profileUpdateEnabled === true}
                      onChange={(e) => handleInputChange("system", "profileUpdateEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Auto-Approve Residents */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.system.autoApproveResidents ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <CheckCircle className={`w-5 h-5 ${formData.system.autoApproveResidents ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto-Approve Residents</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Skip manual approval for new users</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.autoApproveResidents === true}
                      onChange={(e) => handleInputChange("system", "autoApproveResidents", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Important: Changes to system settings take effect immediately
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Disabling email notifications will stop all automated emails. Enable only when the system is ready for production use.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => handleSave("system")}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save System Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
