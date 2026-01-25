import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ImageHover = ({ imageSrc, imageAlt = "Barangay Captain" }) => {
  // Use provided image or fallback to default
  const captainImage = imageSrc || "/images/brgy/captain-main.jpg";

  return (
    <div className="relative inline-block cursor-default">
      {/* Base Image */}
      <motion.div
        initial={{ opacity: 0.5, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="relative rounded-xl overflow-hidden shadow-2xl max-h-[550px]">
          <img
            src={captainImage}
            alt={imageAlt}
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageHover;
