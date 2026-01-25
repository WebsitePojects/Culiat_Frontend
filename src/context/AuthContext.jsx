import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Session timeout - 30 minutes in milliseconds (non-negotiable)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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
  
  // Session timeout refs and state
  const sessionTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // PSA Profile completion warning modal state
  const [showPsaWarningModal, setShowPsaWarningModal] = useState(false);
  const [psaWarningData, setPsaWarningData] = useState(null);
  const [pendingPsaModal, setPendingPsaModal] = useState(false); // Flag to show PSA modal after approved doc modal closes

  // Approved document notification modal state
  const [showApprovedDocModal, setShowApprovedDocModal] = useState(false);
  const [approvedDocRequests, setApprovedDocRequests] = useState([]);

  // Session timeout logout function
  const logoutDueToInactivity = useCallback(() => {
    console.log('⏰ Session timeout: Logging out due to 30 minutes of inactivity');
    setSessionExpired(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('documentRequestForm');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    // Clear modal states
    setShowPsaWarningModal(false);
    setPsaWarningData(null);
    setShowApprovedDocModal(false);
    setApprovedDocRequests([]);
  }, []);

  // Reset session timeout on activity
  const resetSessionTimeout = useCallback(() => {
    if (!user) return;
    
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    // Set new timeout for 30 minutes
    sessionTimeoutRef.current = setTimeout(() => {
      logoutDueToInactivity();
    }, SESSION_TIMEOUT);
  }, [user, logoutDueToInactivity]);

  // Track user activity for session timeout
  useEffect(() => {
    if (!user) {
      // Clear timeout if no user
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      return;
    }

    // Activity events to track
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttled activity handler (only update every 60 seconds to avoid excessive updates)
    let lastUpdate = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) { // Only reset every 60 seconds
        lastUpdate = now;
        resetSessionTimeout();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timeout setup
    resetSessionTimeout();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [user, resetSessionTimeout]);

  // Close approved document modal
  const closeApprovedDocModal = useCallback(() => {
    setShowApprovedDocModal(false);
    // If PSA modal is pending, show it now
    if (pendingPsaModal) {
      console.log('🔔 [ApprovedDocModal] Closed, now showing PSA modal...');
      setTimeout(() => {
        setShowPsaWarningModal(true);
        setPendingPsaModal(false);
      }, 300); // Small delay for smooth transition
    }
  }, [pendingPsaModal]);

  // Check if PSA warning modal should be shown
  const checkPsaCompletionWarning = (userData, hasApprovedDocs = false) => {
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
    
    // Set PSA warning data
    setPsaWarningData({
      daysLeft,
      deadline: psaCompletion.deadline,
      verificationStatus: profileVerification?.status,
      rejectionReason: profileVerification?.rejectionReason,
    });
    
    // If there are approved documents, mark PSA modal as pending and show it after
    if (hasApprovedDocs) {
      console.log('PSA Warning: Has approved docs, will show PSA modal after approved doc modal closes');
      setPendingPsaModal(true);
    } else {
      // Show PSA modal immediately if no approved docs
      console.log('PSA Warning: No approved docs, showing PSA modal immediately');
      setShowPsaWarningModal(true);
    }
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
        
        // For Residents: Check approved documents first, then PSA warning
        let hasApprovedDocs = false;
        if (fullUserData.roleName === 'Resident' || fullUserData.role === 'Resident' || fullUserData.roleCode === 74934) {
          console.log('🔔 [Login] User is a Resident, checking for approved documents...');
          try {
            const response = await axios.get(`${API_URL}/api/document-requests/my-requests`, {
              headers: { Authorization: `Bearer ${fullUserData.token}` }
            });
            const requests = response.data.data || [];
            const pendingPaymentRequests = requests.filter(req => {
              const price = DOCUMENT_PRICES[req.documentType] || 0;
              return req.status === 'approved' && req.paymentStatus === 'unpaid' && price > 0;
            });
            
            if (pendingPaymentRequests.length > 0) {
              hasApprovedDocs = true;
              setApprovedDocRequests(pendingPaymentRequests);
              // Show approved doc modal immediately
              console.log('🔔 [Login] Found approved docs, showing modal immediately');
              setShowApprovedDocModal(true);
            }
          } catch (error) {
            console.error('🔔 [Login] Error checking approved documents:', error);
          }
        }
        
        // Check for PSA profile completion warning (will be queued if there are approved docs)
        checkPsaCompletionWarning(fullUserData, hasApprovedDocs);
        
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
    // Clear session timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
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
    // Clear session expired state
    setSessionExpired(false);
  };

  // Clear session expired state (for use after redirect to login)
  const clearSessionExpired = () => {
    setSessionExpired(false);
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
    // Session management
    sessionExpired,
    clearSessionExpired,
    // PSA Profile completion
    showPsaWarningModal,
    psaWarningData,
    closePsaWarningModal,
    checkPsaCompletionWarning,
    // Approved document notifications
    showApprovedDocModal,
    approvedDocRequests,
    closeApprovedDocModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
