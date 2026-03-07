import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ArrowRight,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import servicesData, { servicesList } from "../../ServicesInfo/servicesData";

/* ─── animation variants ─── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* card accent colours — green palette only */
const ACCENTS = [
  "from-emerald-500 to-teal-500",
  "from-teal-500 to-emerald-600",
  "from-emerald-600 to-green-500",
  "from-green-500 to-teal-600",
  "from-teal-600 to-emerald-500",
  "from-emerald-400 to-teal-500",
  "from-green-600 to-emerald-500",
  "from-teal-400 to-green-500",
  "from-emerald-500 to-green-600",
  "from-teal-500 to-green-600",
];

/* ────────────────────────────────────────────────────── */
const Services = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section className="py-20 px-4 sm:px-6 bg-gray-50 relative overflow-hidden" id="services">
      {/* Subtle dot-grid background */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Top green orb */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Barangay Services
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            How Can We Help You?
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-base sm:text-lg">
            Browse official barangay services. Click any card to view full
            requirements, fees, and step-by-step procedure.
          </p>
        </motion.div>

        {/* ── Service Cards Grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {servicesList.map((s, idx) => {
            const SIcon = s.icon || FileText;
            const accent = ACCENTS[idx % ACCENTS.length];
            const detail = servicesData[s.slug];
            const isHovered = hoveredIdx === idx;

            return (
              <motion.div
                key={s.slug}
                variants={cardVariant}
                onHoverStart={() => setHoveredIdx(idx)}
                onHoverEnd={() => setHoveredIdx(null)}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <Link
                  to={`/services/${s.slug}`}
                  className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-300 overflow-hidden h-full"
                >
                  {/* Top gradient bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${accent} transition-all duration-300 ${isHovered ? "h-1.5" : ""}`} />

                  <div className="flex flex-col flex-1 p-5 sm:p-6">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className={`w-13 h-13 sm:w-14 sm:h-14 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${accent} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                        <SIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-base sm:text-[15px] leading-snug mb-1.5 group-hover:text-emerald-600 transition-colors">
                      {s.title}
                    </h3>

                    {/* Category */}
                    <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-4">
                      {s.category}
                    </p>

                    {/* Bottom meta row */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {detail?.fee && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                            <DollarSign className="w-3 h-3" />
                            {detail.fee}
                          </span>
                        )}
                        {detail?.processingTime && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <Clock className="w-3 h-3" />
                            {detail.processingTime}
                          </span>
                        )}
                      </div>

                      <motion.div
                        animate={isHovered ? { x: 3 } : { x: 0 }}
                        className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold group-hover:text-emerald-700"
                      >
                        View
                        <ChevronRight className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── CTA row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Link
            to="/services-info"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 group"
          >
            Browse All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
          >
            Request a Document
          </Link>
        </motion.div>

      </div>
    </section>
  );
};


export default Services;
