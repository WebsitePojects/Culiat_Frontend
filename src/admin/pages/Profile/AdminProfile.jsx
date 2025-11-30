import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Lock,
  Edit2,
  Save,
  X,
  Shield,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

const AdminProfile = () => {
  const { showSuccess, showError, showPromise } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Edit states
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPurpose, setVerificationPurpose] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/profile/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const requestVerificationCode = async (purpose, newValue) => {
    try {
      setVerificationLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/profile/request-verification`,
        { purpose, newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCodeSent(true);
      setCountdown(600); // 10 minutes
      showSuccess("Verification code sent to your email");
    } catch (error) {
      console.error("Error requesting verification code:", error);
      showError(
        error.response?.data?.message || "Failed to send verification code"
      );
      throw error;
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSaveWithVerification = async (purpose) => {
    const newValue = editValues[purpose];

    if (!newValue || (typeof newValue === "object" && !newValue.firstName)) {
      showError("Please enter a valid value");
      return;
    }

    setVerificationPurpose(purpose);
    setShowVerificationModal(true);
    setVerificationCode("");
    setCodeSent(false);

    // Auto-request code
    try {
      await requestVerificationCode(purpose, newValue);
    } catch (error) {
      setShowVerificationModal(false);
    }
  };

  const handleVerifyAndUpdate = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setVerificationLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        purpose: verificationPurpose,
        code: verificationCode,
        newValue: editValues[verificationPurpose],
      };

      // Add current password for password changes
      if (verificationPurpose === "password") {
        payload.currentPassword = editValues.currentPassword;
      }

      const response = await axios.post(
        `${API_URL}/api/profile/verify-and-update`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccess(response.data.message);
      setShowVerificationModal(false);
      setEditingField(null);
      setEditValues({});
      setVerificationCode("");
      await fetchProfile();
    } catch (error) {
      console.error("Error verifying and updating:", error);
      showError(error.response?.data?.message || "Verification failed");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleBasicInfoUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/profile/basic`,
        editValues,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccess("Profile updated successfully");
      setEditingField(null);
      setEditValues({});
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(error.response?.data?.message || "Failed to update profile");
    }
  };

  const VerificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Email Verification Required
          </h3>
          <button
            onClick={() => setShowVerificationModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A 6-digit verification code has been sent to your email. Please
            enter it below to confirm the change.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {countdown > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Code expires in {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, "0")}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() =>
                requestVerificationCode(
                  verificationPurpose,
                  editValues[verificationPurpose]
                )
              }
              disabled={verificationLoading || countdown > 540}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {verificationLoading ? (
                <Loader className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Resend Code"
              )}
            </button>
            <button
              onClick={handleVerifyAndUpdate}
              disabled={verificationLoading || verificationCode.length !== 6}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {verificationLoading ? (
                <Loader className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Verify & Update"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Failed to load profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            Admin Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-blue-100">@{profile.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">
                  {profile.roleCode === 74932 ? "Super Admin" : "Admin"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "personal"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "security"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Security Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "personal" && (
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {editingField === "name" ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={editValues.name?.firstName || ""}
                        onChange={(e) =>
                          setEditValues({
                            name: {
                              ...editValues.name,
                              firstName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Middle Name (Optional)"
                        value={editValues.name?.middleName || ""}
                        onChange={(e) =>
                          setEditValues({
                            name: {
                              ...editValues.name,
                              middleName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={editValues.name?.lastName || ""}
                        onChange={(e) =>
                          setEditValues({
                            name: {
                              ...editValues.name,
                              lastName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveWithVerification("name")}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 inline mr-1" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                        >
                          <X className="w-4 h-4 inline mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white">
                        {profile.firstName} {profile.middleName || ""}{" "}
                        {profile.lastName}
                      </p>
                      <button
                        onClick={() =>
                          handleEditClick("name", {
                            firstName: profile.firstName,
                            middleName: profile.middleName || "",
                            lastName: profile.lastName,
                          })
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Username
                  </label>
                  {editingField === "username" ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editValues.username || ""}
                        onChange={(e) =>
                          setEditValues({ username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveWithVerification("username")}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 inline mr-1" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                        >
                          <X className="w-4 h-4 inline mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white">
                        {profile.username}
                      </p>
                      <button
                        onClick={() =>
                          handleEditClick("username", profile.username)
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  {editingField === "email" ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={editValues.email || ""}
                        onChange={(e) =>
                          setEditValues({ email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveWithVerification("email")}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 inline mr-1" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                        >
                          <X className="w-4 h-4 inline mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white">
                        {profile.email}
                      </p>
                      <button
                        onClick={() => handleEditClick("email", profile.email)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  {editingField === "phone" ? (
                    <div className="space-y-3">
                      <input
                        type="tel"
                        value={editValues.phone || ""}
                        onChange={(e) =>
                          setEditValues({ phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveWithVerification("phone")}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 inline mr-1" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                        >
                          <X className="w-4 h-4 inline mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white">
                        {profile.phoneNumber || "Not set"}
                      </p>
                      <button
                        onClick={() =>
                          handleEditClick("phone", profile.phoneNumber || "")
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile.address?.houseNumber &&
                    `${profile.address.houseNumber}, `}
                  {profile.address?.street && `${profile.address.street}, `}
                  {profile.address?.subdivision &&
                    `${profile.address.subdivision}, `}
                  Barangay {profile.address?.barangay}, {profile.address?.city}
                </p>
              </div>

              {/* Account Created */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Account Created
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>

                {editingField === "password" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={editValues.currentPassword || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={editValues.password || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={editValues.confirmPassword || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    {editValues.password &&
                      editValues.confirmPassword &&
                      editValues.password !== editValues.confirmPassword && (
                        <p className="text-sm text-red-600">
                          Passwords do not match
                        </p>
                      )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveWithVerification("password")}
                        disabled={
                          !editValues.currentPassword ||
                          !editValues.password ||
                          editValues.password !== editValues.confirmPassword
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline mr-1" /> Change Password
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                      >
                        <X className="w-4 h-4 inline mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingField("password")}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Lock className="w-4 h-4 inline mr-1" /> Change Password
                  </button>
                )}
              </div>

              {/* Security Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Security Notice
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      All account changes require email verification to ensure
                      security. A verification code will be sent to your email
                      address when you attempt to update sensitive information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && <VerificationModal />}
    </div>
  );
};

export default AdminProfile;
