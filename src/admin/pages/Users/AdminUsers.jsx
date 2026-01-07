import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Users,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  AlertCircle,
  Phone,
  Eye
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";

// Role codes mapping
const ROLE_CODES = {
  "SuperAdmin": 74932,
  "Super Admin": 74932,
  "Admin": 74933,
  "Resident": 74934
};

const getRoleCode = (roleName) => {
  return ROLE_CODES[roleName] || ROLE_CODES["Resident"];
};

const AdminUsers = () => {
  const { showSuccess, showError, showPromise } = useNotifications();
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "+63",
    roleName: "Resident"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch current user and all users
  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers =
    filter === "all"
      ? users
      : users.filter((user) => {
          if (filter === "admin") {
            return user.roleName === "SuperAdmin" || user.roleName === "Admin";
          } else if (filter === "resident") {
            return user.roleName === "Resident";
          }
          return false;
        });

  const getRoleColor = (roleName) => {
    if (roleName === "SuperAdmin") {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else if (roleName === "Admin") {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    } else if (roleName === "Resident") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatRoleName = (roleName) => {
    if (roleName === "SuperAdmin") return "Super Admin";
    return roleName || "Unknown";
  };

  const getStatusName = (status) => {
    switch (status) {
      case "approved":
        return "Active";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const adminCount = users.filter(u => u.roleName === "SuperAdmin" || u.roleName === "Admin").length;
  const residentCount = users.filter(u => u.roleName === "Resident").length;

  // Open edit modal
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber || "",
      roleName: user.roleName
    });
    setShowEditModal(true);
    setError("");
  };

  // Open delete modal
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setError("");
  };

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Must be +639XXXXXXXXX (13 characters total)
    const phoneRegex = /^\+639\d{9}$/;
    return phoneRegex.test(phone);
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      setIsCheckingUsername(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/auth/check-username/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsernameAvailable(response.data.available);
    } catch (error) {
      // If endpoint doesn't exist, check manually
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      setUsernameAvailable(!exists);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    if (showCreateModal && formData.username) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(formData.username);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username, showCreateModal]);

  // Handle phone number input with formatting
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    
    // Always keep +63 prefix
    if (!value.startsWith("+63")) {
      value = "+63";
    }
    
    // Remove any non-digit characters after +63
    const digitsOnly = value.slice(3).replace(/\D/g, "");
    
    // Enforce first digit must be 9
    if (digitsOnly.length > 0 && digitsOnly[0] !== "9") {
      return; // Don't update if first digit is not 9
    }
    
    // Limit to 10 digits after +63
    const limitedDigits = digitsOnly.slice(0, 10);
    
    setFormData({ ...formData, phoneNumber: "+63" + limitedDigits });
    
    // Validate phone number
    if (limitedDigits.length === 10 && limitedDigits[0] === "9") {
      setValidationErrors(prev => ({ ...prev, phoneNumber: "" }));
    } else if (limitedDigits.length > 0) {
      setValidationErrors(prev => ({ 
        ...prev, 
        phoneNumber: "Phone must be +639XXXXXXXXX (10 digits starting with 9)" 
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (usernameAvailable === false) {
      errors.username = "Username is already taken";
    }
    
    if (formData.phoneNumber && formData.phoneNumber !== "+63") {
      if (!validatePhoneNumber(formData.phoneNumber)) {
        errors.phoneNumber = "Phone must be +639XXXXXXXXX format";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create modal
  const handleCreateClick = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phoneNumber: "+63",
      roleName: "Resident"
    });
    setShowCreateModal(true);
    setError("");
    setValidationErrors({});
    setUsernameAvailable(null);
  };

  // Update user
  const handleUpdateUser = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      
      // Convert roleName to role code
      const updateData = {
        ...formData,
        role: getRoleCode(formData.roleName)
      };
      
      const promise = axios.put(
        `${API_URL}/api/auth/users/${selectedUser._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await showPromise(promise, {
        loading: 'Updating user...',
        success: `User ${formData.firstName} ${formData.lastName} updated successfully!`,
        error: 'Failed to update user'
      });
      
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      
      const promise = axios.delete(`${API_URL}/api/auth/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await showPromise(promise, {
        loading: 'Deleting user...',
        success: `User ${selectedUser.firstName} ${selectedUser.lastName} deleted successfully!`,
        error: 'Failed to delete user'
      });
      
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Create user
  const handleCreateUser = async () => {
    // Validate form first
    if (!validateForm()) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");
      
      // Prepare data, remove +63 prefix if phone is only +63
      const createData = {
        ...formData,
        phoneNumber: formData.phoneNumber === "+63" ? "" : formData.phoneNumber,
        role: getRoleCode(formData.roleName),
        password: "TempPassword123!"
      };
      
      const promise = axios.post(
        `${API_URL}/api/auth/users`,
        createData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await showPromise(promise, {
        loading: 'Creating user...',
        success: `User ${formData.firstName} ${formData.lastName} created successfully!`,
        error: 'Failed to create user'
      });
      
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create user");
    }
  };

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
                <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Manage Users
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              View and manage all registered users, assign roles, and control access permissions.
            </p>
          </div>

          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Create User
          </button>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
          {[
            { label: "Total Users", count: users.length, gradient: "from-blue-500 to-blue-600" },
            { label: "Admins", count: adminCount, gradient: "from-purple-500 to-purple-600" },
            { label: "Residents", count: residentCount, gradient: "from-green-500 to-green-600" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300`}></div>
              <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-xl md:text-2xl font-bold text-white">{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 text-xs sm:text-sm">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
          All ({users.length})
        </button>
        <button
          onClick={() => setFilter("admin")}
          className={`flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium transition-colors ${
            filter === "admin"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
          Admins ({adminCount})
        </button>
        <button
          onClick={() => setFilter("resident")}
          className={`flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium transition-colors ${
            filter === "resident"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
          Residents ({residentCount})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 sm:mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {filter === "all" ? "No users found" : `No ${filter}s found`}
          </p>
        </div>
      )}

      {/* Users Grid/Table */}
      {!loading && filteredUsers.length > 0 && (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden grid gap-3">
            {filteredUsers.map((user) => {
              const StatusIcon = getStatusIcon(user.registrationStatus);
              const isCurrentUser = currentUser && currentUser._id === user._id;
              return (
                <div
                  key={user._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${
                    isCurrentUser ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="p-4">
                    {/* User Info Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={isCurrentUser}
                          className={`p-2 rounded-lg transition-colors ${
                            isCurrentUser
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tags Row */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleColor(user.roleName)}`}>
                        <Shield className="w-2.5 h-2.5 mr-1" />
                        {formatRoleName(user.roleName)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(user.registrationStatus)}`}>
                        <StatusIcon className="w-2.5 h-2.5 mr-1" />
                        {getStatusName(user.registrationStatus)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      User
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredUsers.map((user) => {
                    const StatusIcon = getStatusIcon(user.registrationStatus);
                    const isCurrentUser = currentUser && currentUser._id === user._id;
                    return (
                      <tr 
                        key={user._id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {user.firstName} {user.lastName}
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              {user.email}
                            </div>
                            {user.phoneNumber && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.phoneNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                              user.roleName
                            )}`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {formatRoleName(user.roleName)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              user.registrationStatus
                            )}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusName(user.registrationStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              disabled={isCurrentUser}
                              className={`p-2 rounded-lg transition-colors ${
                                isCurrentUser
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              }`}
                              title={isCurrentUser ? "Cannot delete yourself" : "Delete user"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal - Premium Design */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                    {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-white truncate">
                      Edit User
                    </h2>
                    <p className="text-blue-200 text-xs sm:text-sm truncate">
                      {selectedUser?.firstName} {selectedUser?.lastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Account Information
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Role Section */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Contact & Role
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Resident">Resident</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Premium Design */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 overflow-hidden">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }}></div>
              </div>
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white">Delete User</h2>
                  <p className="text-red-200 text-xs sm:text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                  {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">@{selectedUser?.username}</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">
                  <strong>Warning:</strong> You are about to permanently delete this user account. All associated data will be removed from the system.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 mt-3 sm:mt-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg sm:rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-red-600/25"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal - Premium Design */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-slate-900 via-green-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">Create New User</h2>
                    <p className="text-green-200 text-xs sm:text-sm">Add a new user to the system</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Password Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">Default Password</p>
                    <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      Password will be set to <strong>TempPassword123!</strong> - User should change this on first login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (e.target.value.trim()) {
                          setValidationErrors(prev => ({ ...prev, firstName: "" }));
                        }
                      }}
                      className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 ${
                        validationErrors.firstName 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-green-200 dark:border-green-700 focus:ring-green-500"
                      }`}
                    />
                    {validationErrors.firstName && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (e.target.value.trim()) {
                          setValidationErrors(prev => ({ ...prev, lastName: "" }));
                        }
                      }}
                      className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 ${
                        validationErrors.lastName 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-green-200 dark:border-green-700 focus:ring-green-500"
                      }`}
                    />
                    {validationErrors.lastName && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Account Information
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (validateEmail(e.target.value)) {
                          setValidationErrors(prev => ({ ...prev, email: "" }));
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value && !validateEmail(e.target.value)) {
                          setValidationErrors(prev => ({ ...prev, email: "Invalid email format" }));
                        }
                      }}
                      className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 ${
                        validationErrors.email 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      }`}
                      placeholder="user@example.com"
                    />
                    {validationErrors.email && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Username *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({ ...formData, username: e.target.value });
                          setValidationErrors(prev => ({ ...prev, username: "" }));
                        }}
                        className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 ${
                          validationErrors.username 
                            ? "border-red-500 focus:ring-red-500" 
                            : usernameAvailable === true
                            ? "border-green-500 focus:ring-green-500"
                            : usernameAvailable === false
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                        }`}
                        placeholder="username123"
                      />
                      {isCheckingUsername && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!isCheckingUsername && usernameAvailable === true && formData.username.length >= 3 && (
                        <CheckCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                      )}
                      {!isCheckingUsername && usernameAvailable === false && (
                        <XCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                      )}
                    </div>
                    {validationErrors.username && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{validationErrors.username}</p>
                    )}
                    {!validationErrors.username && usernameAvailable === true && (
                      <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">Username is available</p>
                    )}
                    {!validationErrors.username && usernameAvailable === false && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">Username is already taken</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Role Section */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Contact & Role
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 ${
                        validationErrors.phoneNumber 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                      }`}
                      placeholder="+639XXXXXXXXX"
                      maxLength={13}
                    />
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">
                      Format: +639XXXXXXXXX (10 digits starting with 9)
                    </p>
                    {validationErrors.phoneNumber && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{validationErrors.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Resident">Resident</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-green-600/25"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
