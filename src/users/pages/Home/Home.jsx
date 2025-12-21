import React from "react";
import Council from "./HomeSections/Council";
import Hero from "./HomeSections/Hero";
import Announcements from "./HomeSections/Announcements";
import Explore from "./HomeSections/Explore";
import Services from "./HomeSections/Services";
import GetInTouch from "./HomeSections/GetInTouch";
import AchievementSummary from "./HomeSections/AchievementSummary";

const Home = () => {
  return (
    <div>
      <Hero />
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
