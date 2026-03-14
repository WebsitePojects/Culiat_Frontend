import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CalendarDays, Megaphone, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FloatingUpdatesWidget = () => {
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [latestAchievements, setLatestAchievements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const fetchLatestUpdates = async () => {
      try {
        const [announcementsRes, achievementsRes] = await Promise.all([
          axios.get(`${API_URL}/api/announcements`),
          axios.get(`${API_URL}/api/achievements?limit=5`),
        ]);

        if (announcementsRes.data?.success && Array.isArray(announcementsRes.data?.data)) {
          const sortedAnnouncements = [...announcementsRes.data.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLatestAnnouncements(sortedAnnouncements.slice(0, 4));
        }

        if (achievementsRes.data?.success && Array.isArray(achievementsRes.data?.data)) {
          const sortedAchievements = [...achievementsRes.data.data].sort(
            (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
          );
          setLatestAchievements(sortedAchievements.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch floating updates widget data:", error);
      }
    };

    fetchLatestUpdates();
  }, []);

  const getAnnouncementImage = (announcement) => {
    if (announcement?.image) return announcement.image;
    if (announcement?.youtubeVideoId) {
      return `https://img.youtube.com/vi/${announcement.youtubeVideoId}/hqdefault.jpg`;
    }
    return null;
  };

  const getAchievementImage = (achievement) => {
    if (!achievement?.image || achievement.image === "no-photo.jpg") return null;
    return achievement.image.includes("http")
      ? achievement.image
      : `${API_URL}/uploads/achievements/${achievement.image}`;
  };

  const updates = useMemo(() => {
    const announcementSlides = latestAnnouncements.map((item, index) => ({
      id: `announcement-${item._id || index}`,
      sectionId: "announcements",
      type: "announcement",
      label: index === 0 ? "Latest Announcement" : "Announcement",
      title: item.title,
      date: item.eventDate || item.createdAt,
      icon: Megaphone,
      accent: "text-emerald-300",
      badge: "Announcements",
      image: getAnnouncementImage(item),
      isLatest: index === 0,
    }));

    const achievementSlides = latestAchievements.map((item, index) => ({
      id: `achievement-${item._id || index}`,
      sectionId: "achievements-summary",
      type: "achievement",
      label: index === 0 ? "Latest Achievement" : "Achievement",
      title: item.title,
      date: item.date || item.createdAt,
      icon: Trophy,
      accent: "text-amber-300",
      badge: "Achievements",
      image: getAchievementImage(item),
      isLatest: index === 0,
    }));

    return [...announcementSlides, ...achievementSlides];
  }, [latestAnnouncements, latestAchievements]);

  useEffect(() => {
    if (updates.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % updates.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [updates.length]);

  useEffect(() => {
    if (activeIndex >= updates.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, updates.length]);

  useEffect(() => {
    const handleHeroVisibility = () => {
      const heroSection = document.getElementById("home-hero-section");
      if (!heroSection) {
        setIsHeroVisible(false);
        return;
      }

      const rect = heroSection.getBoundingClientRect();
      const visible = rect.bottom > 120 && rect.top < window.innerHeight;
      setIsHeroVisible(visible);
    };

    handleHeroVisibility();
    window.addEventListener("scroll", handleHeroVisibility, { passive: true });
    window.addEventListener("resize", handleHeroVisibility);

    return () => {
      window.removeEventListener("scroll", handleHeroVisibility);
      window.removeEventListener("resize", handleHeroVisibility);
    };
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (updates.length === 0) {
    return null;
  }

  const activeItem = updates[activeIndex] || updates[0];

  const goToPrevious = (event) => {
    event.stopPropagation();
    setActiveIndex((current) => (current - 1 + updates.length) % updates.length);
  };

  const goToNext = (event) => {
    event.stopPropagation();
    setActiveIndex((current) => (current + 1) % updates.length);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92, x: 16 }}
        animate={
          isHeroVisible
            ? {
                opacity: 1,
                y: [0, -6, 0],
                scale: 1,
                x: 0,
              }
            : {
                opacity: 0,
                y: 12,
                scale: 0.92,
                x: 24,
              }
        }
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
          x: { duration: 0.3 },
          y: isHeroVisible
            ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.25 },
        }}
        className={`hidden md:block fixed right-4 lg:right-8 top-[4.5rem] lg:top-20 z-30 w-[290px] lg:w-[330px] ${
          isHeroVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => scrollToSection(activeItem.sectionId)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              scrollToSection(activeItem.sectionId);
            }
          }}
          className="w-full rounded-2xl border border-white/25 bg-slate-900/65 backdrop-blur-md shadow-2xl p-3 text-left"
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] uppercase tracking-wide text-white/80 font-semibold">
              Community Updates
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-300/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Slide
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/15 bg-white/5">
            <div className="relative h-[130px]">
              {activeItem.image ? (
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-cover transition-all duration-500"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600/80 to-slate-900 flex items-center justify-center">
                  {activeItem.type === "announcement" ? (
                    <Megaphone className="w-10 h-10 text-white/65" />
                  ) : (
                    <Trophy className="w-10 h-10 text-white/65" />
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/20 text-white border border-white/25">
                  {activeItem.badge}
                </span>
                {activeItem.isLatest && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/35 text-emerald-100 border border-emerald-300/50 animate-pulse">
                    Latest
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={goToPrevious}
                  className="w-6 h-6 rounded-full bg-black/45 hover:bg-black/65 border border-white/20 flex items-center justify-center"
                  aria-label="Previous update"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="w-6 h-6 rounded-full bg-black/45 hover:bg-black/65 border border-white/20 flex items-center justify-center"
                  aria-label="Next update"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[11px] text-white/85 font-medium mb-0.5">{activeItem.label}</p>
                <p className="text-xs text-white font-semibold leading-snug line-clamp-2">{activeItem.title}</p>
              </div>
            </div>

            <div className="px-2.5 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[10px] text-white/75 min-w-0">
                <CalendarDays className="w-3 h-3 shrink-0" />
                <span className="truncate">{formatDate(activeItem.date)}</span>
              </div>

              <div className="flex items-center gap-1">
                {updates.slice(0, 6).map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeIndex ? "w-4 bg-emerald-300" : "w-1.5 bg-white/35"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-white/65 mt-2">Tap card to open section</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92, x: 10 }}
        animate={
          isHeroVisible
            ? {
                opacity: 1,
                y: [0, -4, 0],
                scale: 1,
                x: 0,
              }
            : {
                opacity: 0,
                y: 10,
                scale: 0.92,
                x: 18,
              }
        }
        transition={{
          opacity: { duration: 0.25 },
          scale: { duration: 0.25 },
          x: { duration: 0.25 },
          y: isHeroVisible
            ? { duration: 2.9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 },
        }}
        className={`md:hidden fixed right-2 top-16 z-30 w-[170px] ${
          isHeroVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          onClick={() => scrollToSection(activeItem.sectionId)}
          className="w-full rounded-xl border border-white/25 bg-slate-900/70 backdrop-blur-md shadow-xl px-2.5 py-2 text-left"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-wide text-white/75 font-semibold">Updates</span>
            <span className="text-[9px] text-emerald-200 animate-pulse font-semibold">Slide</span>
          </div>

          <div className="rounded-md overflow-hidden h-[64px] mb-1.5 border border-white/15">
            {activeItem.image ? (
              <img src={activeItem.image} alt={activeItem.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-600/80 to-slate-900" />
            )}
          </div>

          <p className="text-[10px] text-white/75 mb-0.5">{activeItem.label}</p>
          <p className="text-[11px] text-white font-medium leading-tight line-clamp-2">{activeItem.title}</p>

          <div className="mt-1.5 flex items-center gap-1">
            {updates.slice(0, 4).map((item, index) => (
              <span
                key={item.id}
                className={`h-1 rounded-full ${index === activeIndex ? "w-3 bg-emerald-300" : "w-1 bg-white/40"}`}
              />
            ))}
          </div>
        </button>
      </motion.div>
    </>
  );
};

export default FloatingUpdatesWidget;