import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";

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
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <section className="py-16 px-6 bg-neutral" id="home-services">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            permits. Each document includes a QR code for verification and
            authenticity.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-10 flex items-start gap-3">
          <div className="bg-blue-600 text-white rounded-full p-1 px-3 flex items-center justify-center mt-0.5">
            <span className="font-bold text-sm">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">
              Authentication Required
            </h4>
            <p className="text-sm text-gray-700">
              To access these online services, you must log in or register as a
              verified user. Provide valid identification for verification
              before making a request.
            </p>
          </div>
        </div>

        {/* Service Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {services.map((service) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <motion.div
                key={service._id}
                variants={item}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 150, damping: 12 },
                }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 p-6 cursor-pointer group transition-all"
              >
                <motion.div
                  whileHover={{
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.4, ease: "easeInOut" },
                  }}
                  className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  <Icon size={24} />
                </motion.div>

                <h3 className="font-semibold text-gray-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 leading-snug">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
