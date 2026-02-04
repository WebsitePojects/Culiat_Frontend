import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Default fallback slides
const defaultSlides = [
  {
    _id: "default-1",
    title: "Community Garden Initiative",
    subtitle: "Growing together for a greener Barangay Culiat",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
  },
  {
    _id: "default-2",
    title: "Sustainable Living",
    subtitle: "Building a progressive and eco-friendly community",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80",
  },
  {
    _id: "default-3",
    title: "Nature & Community",
    subtitle: "Preserving our environment for future generations",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1492496913980-501348b61469?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
  },
];

const HomeCarousel = () => {
  const [slides, setSlides] = useState(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef(null);

  // Fetch slides from API (using banners endpoint)
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/banners?active=true`);
        if (response.data.success && response.data.data.length > 0) {
          // Map banner data to slide format
          const bannerSlides = response.data.data.map((banner) => ({
            _id: banner._id,
            title: banner.title,
            subtitle: banner.description,
            mediaType: banner.mediaType,
            mediaUrl: banner.mediaUrl,
            ctaButton: banner.ctaButton,
            textPosition: banner.textPosition,
          }));
          setSlides(bannerSlides);
        }
      } catch (error) {
        console.log("Using default carousel slides");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay, slides.length]);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next slide
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      } else {
        // Swipe right - previous slide
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    }
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
    // Reset autoplay timer
    if (isAutoPlaying) startAutoPlay();
  };

  // Navigation handlers
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    if (isAutoPlaying) startAutoPlay();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    if (isAutoPlaying) startAutoPlay();
  };

  const currentSlide = slides[currentIndex];

  if (isLoading) {
    return (
      <section className="w-full h-[50vh] md:h-[60vh] bg-gray-100 flex items-center justify-center overflow-x-hidden">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading carousel...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-900 scroll-snap-below-nav flex flex-col justify-center h-[500px] sm:h-[600px] md:h-screen pt-16 md:pt-20"
      id="carousel-section"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 md:left-16 md:right-16"
        >
          {currentSlide.mediaType === "video" ? (
            <video
              src={currentSlide.mediaUrl}
              poster={currentSlide.thumbnailUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain bg-gray-900"
            />
          ) : (
            <img
              src={currentSlide.mediaUrl}
              alt={currentSlide.title || "Carousel slide"}
              className="w-full h-full object-contain bg-gray-900"
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Caption */}
          {(currentSlide.title || currentSlide.subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute bottom-16 md:bottom-20 left-0 right-0 text-center px-4 md:px-20 w-full max-w-full"
            >
              {currentSlide.title && (
                <h3 className="text-white text-xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg break-words">
                  {currentSlide.title}
                </h3>
              )}
              {currentSlide.subtitle && (
                <p className="text-white/90 text-sm md:text-lg max-w-2xl mx-auto drop-shadow-md break-words">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* CTA Button if enabled */}
              {currentSlide.ctaButton?.enabled && (
                <a
                  href={currentSlide.ctaButton.link}
                  className="inline-block mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-300 whitespace-nowrap"
                >
                  {currentSlide.ctaButton.text}
                </a>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Left Arrow Navigation - Full height rectangle on desktop */}
      {slides.length > 1 && (
        <button
          onClick={goToPrevious}
          aria-label="Previous slide"
          className="absolute left-0 top-0 bottom-0 z-20 flex items-center justify-center w-12 md:w-16 hover:bg-black/10 transition-all duration-300 group"
        >
          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-white opacity-30 md:opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Right Arrow Navigation - Full height rectangle on desktop */}
      {slides.length > 1 && (
        <button
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-center w-12 md:w-16 hover:bg-black/10 transition-all duration-300 group"
        >
          <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-white opacity-30 md:opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Dot Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeCarousel;
