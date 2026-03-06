import { useAuth } from "../context/AuthContext";
import ServicesMaintenance from "../users/pages/Services/ServicesMaintenance";

const ServicesMaintenanceGuard = ({ children }) => {
  const { loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return <ServicesMaintenance />;
  }

  return children;
};

export default ServicesMaintenanceGuard;
