import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, superAdminOnly = false, systemAdminOnly = false, adminRestricted = false, approvedResidentOnly = false }) => {
  const { user, loading, isAdmin, isSuperAdmin, isSystemAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Store the current path to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if user is not admin but trying to access admin routes
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Redirect to 404 if user is not superadmin/systemadmin but trying to access superadmin-only routes
  // SystemAdmin is a superset of SuperAdmin so it always passes
  if (superAdminOnly && !isSuperAdmin && !isSystemAdmin) {
    return <Navigate to="/404" replace />;
  }

  if (systemAdminOnly && !isSystemAdmin) {
    return <Navigate to="/404" replace />;
  }

  if (adminRestricted && (user?.role === 'Admin' || user?.roleCode === 74933)) {
    return <Navigate to="/admin/pending-registrations" replace />;
  }

  if (approvedResidentOnly) {
    const roleCodes = Array.isArray(user?.roles) ? user.roles : [];
    const roleNames = Array.isArray(user?.roleNames) ? user.roleNames : [];
    const isResident =
      user?.roleCode === 74934 ||
      user?.role === 'Resident' ||
      user?.roleName === 'Resident' ||
      roleCodes.includes(74934) ||
      roleNames.includes('Resident');

    if (isResident && user?.registrationStatus !== 'approved') {
      return <Navigate to="/registration-pending?status=pending&reason=documents" replace />;
    }
  }

  return children;
};

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
    color: '#666',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (styleSheet) {
  try {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  } catch (e) {
    // Keyframes already exist
  }
}

export default PrivateRoute;
