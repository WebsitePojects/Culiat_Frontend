import React from "react";
import Council from "./HomeSections/Council";
import HomeCarousel from "./HomeSections/HomeCarousel";
import Stat from "./HomeSections/Stat";
import Announcements from "./HomeSections/Announcements";
import Explore from "./HomeSections/Explore";
import Services from "./HomeSections/Services";
import GetInTouch from "./HomeSections/GetInTouch";
import AchievementSummary from "./HomeSections/AchievementSummary";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - Welcome to Barangay Culiat */}
      <section 
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{
          backgroundImage: "url('/images/brgy/BRGY.CULIAT.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo/brgy-culiat-logo.png"
              alt="Barangay Culiat Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover bg-white/20 backdrop-blur-sm p-2"
            />
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-wide"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Barangay Culiat
          </h1>
          <p className="text-lg sm:text-xl text-white/80 font-medium mb-6">
            District 6, Quezon City
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/80 font-medium max-w-3xl mx-auto leading-relaxed mb-10">
            Welcome to the official e-services portal of Barangay Culiat. Our platform provides
            residents with convenient access to barangay services, document requests, community
            announcements, and important information — all in one place. We are committed to
            delivering efficient, transparent, and accessible governance to every member of our community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#carousel-section"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg text-sm sm:text-base"
            >
              Explore Our Community
            </a>
            <a
              href="/services-info"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500/20 backdrop-blur-sm text-white border border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-colors text-sm sm:text-base"
            >
              View Services
            </a>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z"
              fill="#111827"
            />
          </svg>
        </div>
      </section>

      {/* HomeCarousel is now the second section */}
      <HomeCarousel />
      <Stat />
      <Services />
      <AchievementSummary />
      <Announcements />
      <Explore />
      <Council />
      <GetInTouch />
    </div>
  );
};

export default Home;
