import React from "react";
import Council from "./HomeSections/Council";
import HeroSection from "./HomeSections/HeroSection";
import HomeCarousel from "./HomeSections/HomeCarousel";
import BarangayOfficials from "./HomeSections/BarangayOfficials";
import Stat from "./HomeSections/Stat";
import Announcements from "./HomeSections/Announcements";
import Explore from "./HomeSections/Explore";
import Services from "./HomeSections/Services";
import GetInTouch from "./HomeSections/GetInTouch";
import AchievementSummary from "./HomeSections/AchievementSummary";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <div className="scroll-snap-container">
        <HeroSection />
        <HomeCarousel />
      </div>
      <BarangayOfficials />
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
