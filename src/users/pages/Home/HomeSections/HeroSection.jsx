import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, delay, ease: "easeOut" },
  }),
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [barangayInfo, setBarangayInfo] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(
    "../../../../../images/brgy/heroSectionBg.png"
  );

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  const handleRequestDocument = (e) => {
    e.preventDefault();
    if (isLoggedIn()) {
      navigate("/services");
    } else {
      // Redirect to services page for non-logged in users
      navigate("/services-info");
    }
  };

  useEffect(() => {
    const fetchBarangayInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/barangay-info`);
        if (response.data.success) {
          setBarangayInfo(response.data.data);
          if (response.data.data.heroBackgroundUrl) {
            setBackgroundImage(response.data.data.heroBackgroundUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching barangay info:", error);
      }
    };
    fetchBarangayInfo();
  }, []);

  return (
    <section className="relative scroll-snap-hero flex flex-col min-h-screen md:min-h-screen pt-16 md:pt-0 overflow-x-hidden" id="hero-section">
      {/* Background Image */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        custom={0}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat md:bg-fixed"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        {/* Overlay for text readability - stronger on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/75 via-black/60 to-emerald-950/85 md:from-emerald-900/70 md:via-black/50 md:to-emerald-950/80" />
      </motion.div>

      {/* Content Container - Mobile-First Layout */}
      <div className="relative z-10 flex-1 flex flex-col justify-between items-center px-5 py-8 pb-12 md:justify-center md:py-16 w-full max-w-full">
        
        {/* Top Spacer for mobile - pushes content to middle */}
        <div className="flex-1 md:hidden" />
        
        {/* Welcome Text - Centered vertically on mobile */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.3}
          className="text-center max-w-3xl mx-auto w-full space-y-5 md:space-y-6"
        >
          {/* Logo or Icon Space - Optional */}
          <div className="mb-4 md:mb-0">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-emerald-400/30 md:hidden">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight break-words">
            Welcome to
            <br />
            <span className="text-emerald-400 font-extrabold">Barangay Culiat</span>
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="text-white/95 text-base sm:text-base md:text-lg lg:text-xl max-w-xl md:max-w-2xl mx-auto leading-relaxed px-2"
          >
            A progressive community, dedicated to genuine service to enrich the lives of its residents.
          </motion.p>
        </motion.div>

        {/* CTA Buttons - Sticky at bottom on mobile */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.7}
          className="w-full max-w-md mx-auto px-5 mt-8 md:mt-10 space-y-3"
        >
          <button
            onClick={handleRequestDocument}
            className="w-full block px-6 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center text-base md:text-base"
          >
            Request Document
          </button>
          <Link
            to="/about"
            className="w-full block px-6 py-4 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-md text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 text-center text-base md:text-base"
          >
            Learn More About Us
          </Link>
        </motion.div>

        {/* Bottom Spacer for mobile */}
        <div className="h-4 md:hidden" />

        {/* Scroll Indicator - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </div>

      {/* NO wave divider - clean edge */}
    </section>
  );
};

export default HeroSection;
