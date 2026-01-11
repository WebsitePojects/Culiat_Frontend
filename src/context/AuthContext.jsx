import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Document prices for checking payment requirements
const DOCUMENT_PRICES = {
  indigency: 0,
  residency: 50,
  clearance: 100,
  business_permit: 500,
  business_clearance: 200,
  good_moral: 75,
  barangay_id: 150,
  liquor_permit: 300,
  missionary: 50,
  rehab: 50,
  ctc: 50,
  building_permit: 500,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // PSA Profile completion warning modal state
  const [showPsaWarningModal, setShowPsaWarningModal] = useState(false);
  const [psaWarningData, setPsaWarningData] = useState(null);

  // Approved document notification modal state
  const [showApprovedDocModal, setShowApprovedDocModal] = useState(false);
  const [approvedDocRequests, setApprovedDocRequests] = useState([]);

  // Check for approved document requests on login
  const checkApprovedDocumentRequests = async () => {
    console.log('🔔 [ApprovedDocModal] Starting check for approved document requests...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔔 [ApprovedDocModal] No token found, skipping check');
        return;
      }

      console.log('🔔 [ApprovedDocModal] Fetching document requests from API...');
      const response = await axios.get(`${API_URL}/api/document-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const requests = response.data.data || [];
      console.log('🔔 [ApprovedDocModal] Total requests fetched:', requests.length);
      console.log('🔔 [ApprovedDocModal] All requests:', requests.map(r => ({
        id: r._id,
        type: r.documentType,
        status: r.status,
        paymentStatus: r.paymentStatus
      })));
      
      // Filter for approved requests that need payment (not free and not paid/waived)
      const pendingPaymentRequests = requests.filter(req => {
        const price = DOCUMENT_PRICES[req.documentType] || 0;
        const shouldInclude = (
          req.status === 'approved' &&
          req.paymentStatus === 'unpaid' &&
          price > 0
        );
        console.log(`🔔 [ApprovedDocModal] Request ${req._id}: status=${req.status}, paymentStatus=${req.paymentStatus}, price=${price}, include=${shouldInclude}`);
        return shouldInclude;
      });

      console.log('🔔 [ApprovedDocModal] Filtered pending payment requests:', pendingPaymentRequests.length);

      if (pendingPaymentRequests.length > 0) {
        console.log('🔔 [ApprovedDocModal] Setting approved doc requests state...');
        setApprovedDocRequests(pendingPaymentRequests);
        // Small delay to ensure PSA modal can show first if needed
        console.log('🔔 [ApprovedDocModal] Will show modal in 500ms...');
        setTimeout(() => {
          console.log('🔔 [ApprovedDocModal] Now showing modal!');
          setShowApprovedDocModal(true);
        }, 500);
      } else {
        console.log('🔔 [ApprovedDocModal] No pending payment requests, not showing modal');
      }
    } catch (error) {
      console.error('🔔 [ApprovedDocModal] Error checking approved documents:', error);
    }
  };

  // Close approved document modal
  const closeApprovedDocModal = useCallback(() => {
    setShowApprovedDocModal(false);
  }, []);

  // Check if PSA warning modal should be shown
  const checkPsaCompletionWarning = (userData) => {
    console.log('PSA Warning check - userData:', userData?.psaCompletion);
    
    // Only for residents
    if (userData?.roleCode !== 74934 && userData?.role !== 'Resident') return;
    
    const psaCompletion = userData?.psaCompletion;
    const profileVerification = userData?.profileVerification;
    
    // Don't show if profile is complete
    if (psaCompletion?.isComplete) return;
    
    // Don't show if verification is pending
    if (profileVerification?.status === 'pending') return;
    
    // Don't show if no deadline set - critical check to prevent broken modal
    if (!psaCompletion?.deadline) {
      console.log('PSA Warning: No deadline set, skipping modal');
      return;
    }
    
    const daysLeft = psaCompletion?.daysLeft;
    
    // Additional validation - ensure daysLeft is a valid number
    if (typeof daysLeft !== 'number' || isNaN(daysLeft)) {
      console.log('PSA Warning: Invalid daysLeft value, skipping modal');
      return;
    }
    
    // ALWAYS show modal on every login if PSA profile is not complete
    setPsaWarningData({
      daysLeft,
      deadline: psaCompletion.deadline,
      verificationStatus: profileVerification?.status,
      rejectionReason: profileVerification?.rejectionReason,
    });
    setShowPsaWarningModal(true);
    console.log('PSA Warning modal triggered!');
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid by fetching user data
          const response = await axios.get(`${API_URL}/api/auth/me`);
          const currentUser = response.data.data;
          
          // Preserve token from localStorage, use all other data from server
          const oldData = JSON.parse(userData);
          const updatedUser = {
            ...currentUser,  // Use fresh data from server as base
            token: oldData.token || token,  // Preserve the token
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      const { data } = response.data;
      
      // Save token and set authorization header
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Immediately fetch complete user profile
      try {
        const meResponse = await axios.get(`${API_URL}/api/auth/me`);
        const completeUser = meResponse.data.data;
        
        // Combine complete user data with token
        const fullUserData = {
          ...completeUser,
          token: data.token,
        };
        
        localStorage.setItem('user', JSON.stringify(fullUserData));
        setUser(fullUserData);
        
        // Check terms acceptance status for Residents
        if (fullUserData.roleName === 'Resident') {
          try {
            const termsResponse = await axios.get(`${API_URL}/api/terms/status`);
            const hasAccepted = termsResponse.data.data.hasAccepted;
            
            // Store terms acceptance status
            localStorage.setItem('termsAccepted', hasAccepted ? 'true' : 'false');
            
            // If not accepted, clear the policy data to force showing popup
            if (!hasAccepted) {
              localStorage.removeItem('policyData');
            }
          } catch (termsError) {
            // Clear policy data to be safe
            localStorage.removeItem('policyData');
          }
        }
        
        // Check for PSA profile completion warning
        checkPsaCompletionWarning(fullUserData);
        
        // Check for approved document requests needing payment (for Residents only)
        console.log('🔔 [Login] Checking if should call checkApprovedDocumentRequests...');
        console.log('🔔 [Login] fullUserData.roleName:', fullUserData.roleName);
        console.log('🔔 [Login] fullUserData.role:', fullUserData.role);
        console.log('🔔 [Login] fullUserData.roleCode:', fullUserData.roleCode);
        
        if (fullUserData.roleName === 'Resident' || fullUserData.role === 'Resident' || fullUserData.roleCode === 74934) {
          console.log('🔔 [Login] User is a Resident, calling checkApprovedDocumentRequests...');
          checkApprovedDocumentRequests();
        } else {
          console.log('🔔 [Login] User is NOT a Resident, skipping checkApprovedDocumentRequests');
        }
        
        return { success: true, user: fullUserData };
      } catch (meError) {
        // Fallback to basic user data if /me fails
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, user: data };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      // Check if userData is FormData (for file upload registration)
      const isFormData = userData instanceof FormData;
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};
      
      const response = await axios.post(`${API_URL}/api/auth/register`, userData, config);
      const { data } = response.data;
      
      // For pending registration, don't log in automatically
      if (data.registrationStatus === 'pending') {
        return { success: true, pending: true, data };
      }
      
      // For approved/auto-approved registrations
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('documentRequestForm'); // Clear saved form data
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    // Clear PSA warning state
    setShowPsaWarningModal(false);
    setPsaWarningData(null);
    // Clear approved document modal state
    setShowApprovedDocModal(false);
    setApprovedDocRequests([]);
  };

  // Close PSA warning modal
  const closePsaWarningModal = () => {
    setShowPsaWarningModal(false);
  };

  // Check if user is Admin or SuperAdmin
  const isAdmin = () => {
    if (!user) return false;
    // Check role name or role code
    return user.role === 'Admin' || user.role === 'SuperAdmin' || user.roleCode === 74933 || user.roleCode === 74932;
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAdmin: isAdmin(),
    isSuperAdmin: user?.role === 'SuperAdmin' || user?.roleCode === 74932,
    isResident: user?.role === 'Resident' || user?.roleCode === 74934,
    // PSA Profile completion
    showPsaWarningModal,
    psaWarningData,
    closePsaWarningModal,
    checkPsaCompletionWarning,
    // Approved document notifications
    showApprovedDocModal,
    approvedDocRequests,
    closeApprovedDocModal,
    checkApprovedDocumentRequests,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
