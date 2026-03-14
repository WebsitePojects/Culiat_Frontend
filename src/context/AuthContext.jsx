import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Session timeout - 30 minutes in milliseconds (non-negotiable)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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

  const hasRoleCode = useCallback((targetCode) => {
    if (!user) return false;
    const roles = Array.isArray(user.roles) ? user.roles : [];
    return user.roleCode === targetCode || roles.includes(targetCode);
  }, [user]);

  const hasRoleName = useCallback((targetName) => {
    if (!user) return false;
    const roleNames = Array.isArray(user.roleNames) ? user.roleNames : [];
    return user.role === targetName || user.roleName === targetName || roleNames.includes(targetName);
  }, [user]);
  
  // Session timeout refs and state
  const sessionTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [sessionExpired, setSessionExpired] = useState(false);

  // Session timeout logout function
  const logoutDueToInactivity = useCallback(() => {
    console.log('⏰ Session timeout: Logging out due to 30 minutes of inactivity');
    setSessionExpired(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('documentRequestForm');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
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

  const login = async (username, password, isAdminLogin = false) => {
    try {
      // Use different endpoint based on login type
      const endpoint = isAdminLogin ? '/api/auth/admin-login' : '/api/auth/login';
      const response = await axios.post(`${API_URL}${endpoint}`, {
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
        
        const residentRoleCodes = Array.isArray(fullUserData.roles) ? fullUserData.roles : [];
        const residentRoleNames = Array.isArray(fullUserData.roleNames) ? fullUserData.roleNames : [];
        const hasResidentRole =
          fullUserData.roleCode === 74934 ||
          fullUserData.role === 'Resident' ||
          fullUserData.roleName === 'Resident' ||
          residentRoleCodes.includes(74934) ||
          residentRoleNames.includes('Resident');

        // Check terms acceptance status for Residents (resident portal only)
        if (!isAdminLogin && hasResidentRole) {
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

  const googleLogin = async (idToken) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google-login`, {
        idToken,
      });

      const { data } = response.data;

      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      try {
        const meResponse = await axios.get(`${API_URL}/api/auth/me`);
        const completeUser = meResponse.data.data;

        const fullUserData = {
          ...completeUser,
          token: data.token,
        };

        localStorage.setItem('user', JSON.stringify(fullUserData));
        setUser(fullUserData);

        return { success: true, user: fullUserData, isNewGoogleUser: !!data.isNewGoogleUser };
      } catch (meError) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, user: data, isNewGoogleUser: !!data.isNewGoogleUser };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed',
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

  const getReregistrationPrefill = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/reregister/${userId}/prefill`);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load re-registration data',
      };
    }
  };

  const reregister = async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/reregister/${userId}`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { data } = response.data;
      if (data?.registrationStatus === 'pending') {
        return { success: true, pending: true, data };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Re-registration failed',
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
    // Clear session expired state
    setSessionExpired(false);
  };

  // Clear session expired state (for use after redirect to login)
  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  // Check if user is Admin or SuperAdmin
  const isAdmin = () => {
    if (!user) return false;
    return hasRoleName('Admin') || hasRoleName('SuperAdmin') || hasRoleName('SystemAdmin') || hasRoleCode(74933) || hasRoleCode(74932) || hasRoleCode(74931);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    googleLogin,
    register,
    getReregistrationPrefill,
    reregister,
    logout,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    isSystemAdmin: hasRoleName('SystemAdmin') || hasRoleCode(74931),
    isSuperAdmin: hasRoleName('SuperAdmin') || hasRoleCode(74932),
    isResident: hasRoleName('Resident') || hasRoleCode(74934),
    // Session management
    sessionExpired,
    clearSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
