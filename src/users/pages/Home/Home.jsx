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
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16"
        style={{
          backgroundImage: "url('/images/brgy/landingpage.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          /* backgroundAttachment fixed breaks on iOS — use scroll */
          backgroundAttachment: "scroll",
        }}
      >
        {/* Overlay — slightly darker on mobile for readability */}
        <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20 lg:py-24">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <img
              src="/images/logo/brgy-culiat-logo.png"
              alt="Barangay Culiat Logo"
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full object-cover bg-white/20 backdrop-blur-sm p-1.5 sm:p-2 shadow-2xl ring-2 ring-white/20"
            />
          </div>

          {/* Title */}
          <h1
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-3 tracking-wide leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Barangay Culiat
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 font-medium mb-4 sm:mb-6 tracking-wide">
            District 6, Quezon City
          </p>

          {/* Divider accent */}
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-12 bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="h-px w-8 sm:w-12 bg-white/40" />
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-white/85 font-normal max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10">
            Welcome to the official e-services portal of Barangay Culiat. Our platform provides
            residents with convenient access to barangay services, document requests, community
            announcements, and important information — all in one place. We are committed to
            delivering efficient, transparent, and accessible governance to every member of our community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-6 xs:px-10 sm:px-0">
            <a
              href="#carousel-section"
              className="w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/70 px-7 sm:px-9 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-white/10 hover:border-white active:scale-95 transition-all text-sm sm:text-base"
            >
              Explore Our Community
            </a>
            <a
              href="/services-info"
              className="w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2 bg-emerald-600 backdrop-blur-sm text-white border-2 border-emerald-500 px-7 sm:px-9 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-emerald-500 hover:border-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-900/40 text-sm sm:text-base"
            >
              View Services
            </a>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            style={{ height: "clamp(40px, 8vw, 90px)" }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,54 1440,48 L1440,80 L0,80 Z"
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
