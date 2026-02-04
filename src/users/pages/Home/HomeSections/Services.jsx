import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Home,
  BadgeCheck,
  Building2,
  HandCoins,
  Hammer,
  AlertCircle,
  HeartHandshake,
  Shield,
  Heart,
  X,
  Info,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Icon mapping
const iconMap = {
  FileText,
  Home,
  BadgeCheck,
  Building2,
  HandCoins,
  Hammer,
  AlertCircle,
  HeartHandshake,
  Shield,
  Heart,
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services/active`);
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  if (loading) {
    return (
      <section className="py-16 px-6 bg-neutral" id="home-services">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 px-6 bg-neutral"
      id="home-services"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-4xl font-bold text-text-color mb-4">
            Online Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Residents can easily access a variety of official certificates and
            permits. Click on any service to learn more.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-10 flex items-start gap-3">
          <div className="bg-emerald-600 text-white rounded-full p-1 px-3 flex items-center justify-center mt-0.5">
            <span className="font-bold text-sm">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-800 mb-1">
              Authentication Required
            </h4>
            <p className="text-sm text-gray-700">
              To access these online services, you must log in or register as a
              verified user. Provide valid identification for verification
              before making a request.
            </p>
          </div>
        </div>

        {/* Service Cards - Icon + Title Only */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {services.map((service) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <motion.button
                key={service._id}
                variants={item}
                onClick={() => openServiceModal(service)}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 200, damping: 15 },
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 p-5 cursor-pointer group transition-all text-center"
              >
                <motion.div
                  whileHover={{
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3, ease: "easeInOut" },
                  }}
                  className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all"
                >
                  <Icon size={26} />
                </motion.div>

                <h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                  {service.title}
                </h3>
              </motion.button>
            );
          })}
        </motion.div>

        {/* View All Services Link */}
        <div className="text-center mt-10">
          <Link
            to="/services-info"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group"
          >
            View All Services & How to Request
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeServiceModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 relative">
                <button
                  onClick={closeServiceModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {React.createElement(iconMap[selectedService.icon] || FileText, {
                      size: 28,
                      className: "text-white"
                    })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedService.title}
                    </h3>
                    <p className="text-emerald-100 text-sm">Online Service</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">About this service</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedService.description}
                    </p>
                  </div>
                </div>

                {/* Requirements if available */}
                {selectedService.requirements && selectedService.requirements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedService.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={closeServiceModal}
                  className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
