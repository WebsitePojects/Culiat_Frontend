import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
