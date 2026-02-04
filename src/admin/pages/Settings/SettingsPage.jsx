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
  Briefcase,
  IdCard,
  Home,
  UserCheck,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const SettingsPage = () => {
  const { showSuccess, showError, showPromise } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    system: {
      residentOnlyServices: [],
    },
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
          residentOnlyServices: Array.isArray(systemSettings.residentOnlyServices) 
            ? systemSettings.residentOnlyServices 
            : [],
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

  const handleServiceRestrictionToggle = (serviceValue) => {
    setFormData((prev) => {
      const currentServices = prev.system.residentOnlyServices || [];
      const isCurrentlyRestricted = currentServices.includes(serviceValue);
      
      return {
        ...prev,
        system: {
          ...prev.system,
          residentOnlyServices: isCurrentlyRestricted
            ? currentServices.filter(s => s !== serviceValue)
            : [...currentServices, serviceValue]
        }
      };
    });
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
      system: {
        ...settings.system,
        residentOnlyServices: settings.system?.residentOnlyServices || [],
      },
    });
    setHasChanges(false);
    showSuccess("Changes discarded");
  };

  // Service types available in the system
  const availableServices = [
    { value: "clearance", label: "Barangay Clearance", icon: Shield },
    { value: "residency", label: "Certificate of Residency", icon: FileText },
    { value: "indigency", label: "Certificate of Indigency", icon: FileText },
    { value: "business_permit", label: "Business Permit", icon: Briefcase },
    { value: "business_clearance", label: "Business Clearance", icon: Briefcase },
    { value: "good_moral", label: "Good Moral Certificate", icon: FileText },
    { value: "barangay_id", label: "Barangay ID", icon: IdCard },
    { value: "ctc", label: "Community Tax Certificate", icon: FileText },
    { value: "liquor_permit", label: "Liquor Permit", icon: FileText },
  ];

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

            {/* Service Restrictions for Non-Residents */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Resident-Only Service Restrictions
              </h3>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Non-Resident Access Control
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Check services that should be restricted to Barangay Culiat residents only. 
                      Non-residents will not be able to request these services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableServices.map((service) => {
                  const Icon = service.icon;
                  const isRestricted = (formData.system?.residentOnlyServices || []).includes(service.value);
                  
                  return (
                    <div
                      key={service.value}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        isRestricted
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                          : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isRestricted 
                            ? 'bg-red-100 dark:bg-red-900/40' 
                            : 'bg-green-100 dark:bg-green-900/40'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isRestricted 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.label}
                          </h4>
                          <p className={`text-xs ${
                            isRestricted 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isRestricted ? (
                              <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Residents Only
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                All Users
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRestricted}
                          onChange={() => handleServiceRestrictionToggle(service.value)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer transition-colors peer-focus:ring-4 ${
                          isRestricted 
                            ? 'bg-red-500 peer-focus:ring-red-300 dark:peer-focus:ring-red-800' 
                            : 'bg-green-500 peer-focus:ring-green-300 dark:peer-focus:ring-green-800'
                        } after:content-[''] after:absolute after:top-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          isRestricted ? 'after:left-[26px]' : 'after:left-[2px]'
                        }`}></div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> Restricted services will display a notice to non-residents explaining they need to be Barangay Culiat residents to access these services.
                </p>
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
