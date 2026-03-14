import React from "react";
import Council from "./HomeSections/Council";
import HomeCarousel from "./HomeSections/HomeCarousel";
import Stat from "./HomeSections/Stat";
import Announcements from "./HomeSections/Announcements";
import Explore from "./HomeSections/Explore";
import Services from "./HomeSections/Services";
import GetInTouch from "./HomeSections/GetInTouch";
import AchievementSummary from "./HomeSections/AchievementSummary";
import FloatingUpdatesWidget from "./HomeSections/FloatingUpdatesWidget";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - Welcome to Barangay Culiat */}
      <section
        id="home-hero-section"
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
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

        <FloatingUpdatesWidget />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 md:pr-[320px] lg:pr-[360px] xl:pr-8 text-left xl:text-center py-8 sm:py-10 lg:py-12">
          {/* Logo */}
          <div className="flex justify-start xl:justify-center mb-2 sm:mb-3">
            <img
              src="/images/logo/brgy-culiat-logo.png"
              alt="Barangay Culiat Logo"
              className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full object-cover bg-white/20 backdrop-blur-sm p-1 sm:p-1.5 shadow-2xl ring-2 ring-white/20"
            />
          </div>

          {/* Title */}
          <h1
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2 tracking-wide leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Barangay Culiat
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 font-medium mb-2 sm:mb-3 tracking-wide">
            District 6, Quezon City
          </p>

          {/* Divider accent */}
          <div className="flex items-center justify-start xl:justify-center gap-2 mb-2 sm:mb-3">
            <div className="h-px w-6 sm:w-8 bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <div className="h-px w-6 sm:w-8 bg-white/40" />
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-base text-white/85 font-normal max-w-xs sm:max-w-lg md:max-w-2xl xl:mx-auto leading-tight mb-3 sm:mb-4">
            Malugod po kayong tinatanggap sa opisyal na e-services portal ng Barangay Culiat.
            Ang aming platform ay ginawa upang mabigyan ang bawat residente ng madali, mabilis, at maginhawang paraan upang ma-access ang iba’t ibang serbisyo ng barangay—kabilang ang paghingi ng mga dokumento, mga anunsyo sa komunidad, at mahahalagang impormasyon—lahat ay makikita sa iisang lugar lamang.
            Layunin po namin na maihatid sa bawat mamamayan ng Barangay Culiat ang mas episyente, malinaw, at madaling maabot na pamamahala, gamit ang makabagong teknolohiya upang mas mapalapit ang serbisyo ng barangay sa ating komunidad.
            Maraming salamat po sa inyong pagbisita at pakikiisa sa pagpapaunlad ng ating Barangay Culiat.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start xl:justify-center items-start sm:items-center px-0 xl:px-0">
            <a
              href="#carousel-section"
              className="w-full sm:w-auto sm:min-w-[180px] inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/70 px-5 sm:px-7 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-white/10 hover:border-white active:scale-95 transition-all text-xs sm:text-sm"
            >
              Explore Our Community
            </a>
            <a
              href="/services-info"
              className="w-full sm:w-auto sm:min-w-[180px] inline-flex items-center justify-center gap-2 bg-emerald-600 backdrop-blur-sm text-white border-2 border-emerald-500 px-5 sm:px-7 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-emerald-500 hover:border-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-900/40 text-xs sm:text-sm"
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
