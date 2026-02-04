import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CountingNumber } from "../../../../components/ui/shadcn-io/counting-number/index";
import { Users, MapIcon, House, Hammer } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Stat = () => {
  const [stats, setStats] = useState([
    { number: 0, label: "Total Population", suffix: null, icon: Users },
    { number: 0, label: "Barangay Area", suffix: "km²", icon: MapIcon },
    { number: 0, label: "Number of Households", suffix: null, icon: House },
    { number: 0, label: "Public Projects Ongoing", suffix: null, icon: Hammer },
  ]);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/barangay-info`);
        if (response.data.success && response.data.data.demographics) {
          const demo = response.data.data.demographics;
          setStats([
            { number: demo.totalPopulation || 0, label: "Total Population", suffix: null, icon: Users },
            { number: demo.barangayArea || 0, label: "Barangay Area", suffix: "km²", icon: MapIcon },
            { number: demo.totalHouseholds || 0, label: "Number of Households", suffix: null, icon: House },
            { number: demo.ongoingPublicProjects || 0, label: "Public Projects Ongoing", suffix: null, icon: Hammer },
          ]);
        }
      } catch (error) {
        console.error("Error fetching demographics:", error);
      }
    };
    fetchDemographics();
  }, []);

  return (
    <section
      className="py-12 md:py-16 w-full px-4 bg-gradient-to-b from-gray-50 to-white"
      id="home-stat"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Barangay Demographics
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Key statistics about our community
          </p>
        </motion.div>
        {/* Mobile: Auto-scrolling animation */}
        <div className="lg:hidden overflow-hidden w-full">
          <motion.div 
            className="flex gap-3 sm:gap-4"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* Render stats twice for seamless loop on mobile */}
            {[...stats, ...stats].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    transition: { duration: 0.25, ease: "easeOut" },
                  }}
                  className="bg-light rounded-lg shadow-md p-4 sm:p-6 text-center border border-gray-100 hover:shadow-xl transition-all flex-shrink-0 w-[140px] sm:w-[160px] flex flex-col"
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      rotate: [0, -5, 5, 0],
                      scale: 1.1,
                      transition: { duration: 0.4, ease: "easeInOut" },
                    }}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center"
                  >
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6 text-text-color-light"
                      strokeWidth={3}
                    />
                  </motion.div>

                  {/* Number */}
                  <div className="text-lg sm:text-xl font-bold text-text-color mb-1">
                    <CountingNumber
                      number={stat.number}
                      inView={true}
                      decimalPlaces={stat.number % 1 !== 0 && 1}
                      decimalSeparator="."
                      transition={{ stiffness: 100, damping: 30 }}
                      useThousandsSeparator
                    />
                    <span className="ms-1">{stat?.suffix}</span>
                  </div>

                  {/* Label */}
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Desktop: Static Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    transition: { duration: 0.25, ease: "easeOut" },
                  }}
                  className="bg-light rounded-lg shadow-md p-6 text-center border border-gray-100 hover:shadow-xl transition-all flex flex-col"
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      rotate: [0, -5, 5, 0],
                      scale: 1.1,
                      transition: { duration: 0.4, ease: "easeInOut" },
                    }}
                    className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center"
                  >
                    <Icon
                      className="w-6 h-6 text-text-color-light"
                      strokeWidth={3}
                    />
                  </motion.div>

                  {/* Number */}
                  <div className="text-2xl font-bold text-text-color mb-1">
                    <CountingNumber
                      number={stat.number}
                      inView={true}
                      decimalPlaces={stat.number % 1 !== 0 && 1}
                      decimalSeparator="."
                      transition={{ stiffness: 100, damping: 30 }}
                      useThousandsSeparator
                    />
                    <span className="ms-1">{stat?.suffix}</span>
                  </div>

                  {/* Label */}
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Stat;
