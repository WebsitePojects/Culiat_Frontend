import React from "react";
import { motion } from "framer-motion";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

const BarangayOfficials = () => {

  return (
    <section className="relative py-16 px-4 bg-gray-50 overflow-hidden" id="barangay-officials">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0.1}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Barangay Officials
          </h2>
          <p className="text-gray-600">Meet the leaders of Barangay Culiat</p>
        </motion.div>

        {/* Officials Images */}
        <div className="space-y-8">
          {/* First Image */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0.2}
            className="w-full"
          >
            <img
              src="/images/officials/barangay-officials-1.png"
              alt="Barangay Culiat Officials - Group 1"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>

          {/* Second Image */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0.3}
            className="w-full"
          >
            <img
              src="/images/officials/barangay-officials-2.png"
              alt="Barangay Culiat Officials - Group 2"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0.4}
          className="text-center mt-12"
        >
          <p className="text-lg md:text-xl font-semibold text-emerald-700 italic">
            "Kalidad sa Serbisyo. Kalinga sa Tao. Kalingang Nanay. Kalingang Tunay!"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BarangayOfficials;
