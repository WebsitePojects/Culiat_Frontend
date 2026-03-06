import { Link } from "react-router-dom";
import { Wrench, ShieldAlert } from "lucide-react";

const ServicesMaintenance = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Wrench className="w-8 h-8 text-amber-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Services Under Maintenance
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          The online services request page is temporarily unavailable.
          Access is currently limited to Admin and SuperAdmin accounts only.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm font-medium mb-6">
          <ShieldAlert className="w-4 h-4" />
          Restricted Access Enabled
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/services-info"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            View Services Information
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesMaintenance;
