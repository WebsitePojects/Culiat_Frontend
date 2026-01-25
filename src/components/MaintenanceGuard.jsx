import { useAuth } from "../context/AuthContext";
import MaintenancePage from "./MaintenancePage";

/**
 * MaintenanceGuard Component
 * 
 * This component checks if maintenance mode is active and whether the user
 * should be allowed to bypass it.
 * 
 * Bypass conditions (any one allows bypass):
 * 1. User is SuperAdmin (role 74932) or Admin (role 74933)
 * 2. User has entered the bypass keyword (stored in localStorage)
 * 3. User is on the bypass page route
 * 4. VITE_MAINTENANCE_MODE env is set to 'false'
 * 
 * HOW TO USE:
 * - Set VITE_MAINTENANCE_MODE=true in .env.development to enable maintenance
 * - Admins/SuperAdmins automatically bypass when logged in
 * - Regular users can enter bypass keyword at /bypass route
 * - Set VITE_MAINTENANCE_MODE=false to disable maintenance for everyone
 * 
 * @param {Object} props
 * @param {boolean} props.isMaintenanceMode - Whether maintenance mode is active from env
 * @param {boolean} props.maintenanceBypassActive - Whether bypass keyword was entered or on bypass page
 * @param {React.ReactNode} props.children - Child components to render if not in maintenance
 */
const MaintenanceGuard = ({ isMaintenanceMode, maintenanceBypassActive, children }) => {
  const { user, isAuthenticated } = useAuth();

  // Admin/SuperAdmin role codes
  const ADMIN_ROLES = [74932, 74933]; // SuperAdmin and Admin

  // Check if user is an admin (can always bypass maintenance)
  const isAdmin = isAuthenticated && user && ADMIN_ROLES.includes(user.role || user.roleCode);

  // Determine if we should show maintenance page
  // Show maintenance page ONLY if:
  // 1. Maintenance mode is enabled via env
  // 2. User is NOT an admin
  // 3. Bypass is NOT active (keyword entered or on bypass page)
  const shouldShowMaintenance = isMaintenanceMode && !isAdmin && !maintenanceBypassActive;

  if (shouldShowMaintenance) {
    return <MaintenancePage />;
  }

  return children;
};

export default MaintenanceGuard;
