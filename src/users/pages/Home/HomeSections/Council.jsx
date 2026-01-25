import React, { useState, useEffect } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { User } from "lucide-react";
import ImageHover from "../../../../components/Animation/ImageHover";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Position labels for display
const positionLabels = {
  barangay_captain: "Barangay Captain",
  barangay_kagawad: "Barangay Kagawad",
  sk_chairman: "SK Chairman",
  barangay_secretary: "Barangay Secretary",
  barangay_treasurer: "Barangay Treasurer",
  administrative_officer: "Administrative Officer",
  admin_officer_internal: "Administrative Officer - Internal",
  admin_officer_external: "Administrative Officer - External",
  executive_officer: "Executive Officer",
  deputy_officer: "Deputy Officer",
  other: "Official",
};

const Council = () => {
  const [officials, setOfficials] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [captainLoading, setCaptainLoading] = useState(true);

  useEffect(() => {
    fetchOfficials();
    fetchCaptain();
  }, []);

  // Fetch barangay captain dynamically
  const fetchCaptain = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/officials/position/barangay_captain`);
      if (response.data.success && response.data.data.length > 0) {
        // Get the first active barangay captain
        const activeCaptain = response.data.data.find(o => o.isActive) || response.data.data[0];
        setCaptain(activeCaptain);
      }
    } catch (error) {
      console.error("Failed to fetch barangay captain:", error);
    } finally {
      setCaptainLoading(false);
    }
  };

  const fetchOfficials = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/officials`);
      if (response.data.success) {
        // Filter to get active officials for the council grid
        // Based on user feedback, council members only consist of:
        // 1. Punong Barangay (shown in Captain section)
        // 2. Barangay Kagawad
        // 3. SK Chairperson
        const councilMembers = response.data.data.filter(
          (official) => (official.position === "barangay_kagawad" || official.position === "sk_chairman") && official.isActive
        );

        // Sort by position importance/hierarchy
        const hierarchy = [
          "sk_chairman",
          "barangay_kagawad"
        ];

        councilMembers.sort((a, b) => {
          const indexA = hierarchy.indexOf(a.position);
          const indexB = hierarchy.indexOf(b.position);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setOfficials(councilMembers);
      }
    } catch (error) {
      console.error("Failed to fetch officials:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get full name
  const getFullName = (official) => {
    if (!official) return "";
    const parts = [official.firstName];
    if (official.middleName) parts.push(official.middleName.charAt(0) + ".");
    parts.push(official.lastName);
    return parts.join(" ");
  };

  // Helper to get full name with honorific
  const getCaptainFullName = (official) => {
    if (!official) return "Hon. Cristina V. Benardino";
    // Check if firstName already starts with an honorific to avoid double prefix
    const hasHonorific = /^(Hon\.|Honorable|Dr\.|Engr\.|Atty\.)/i.test(official.firstName);
    const prefix = hasHonorific ? "" : "Hon. ";
    const parts = [prefix + official.firstName];
    if (official.middleName) parts.push(official.middleName.charAt(0) + ".");
    parts.push(official.lastName);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  };


  // Helper to get position label
  const getPositionLabel = (position) => {
    return positionLabels[position] || position;
  };

  return (
    <section className="py-20 bg-neutral overflow-hidden " id="council">
      <div className="max-w-6xl mx-auto  px-4">
        {/* --- Barangay Captain Section --- */}
        <div className="flex flex-wrap-reverse items-center gap-12 md:gap-[5em] justify-between mb-20 ">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex-1 basis-xs"
          >
            <h3 className="text-3xl md:text-5xl font-extrabold text-primary-dark mb-6">
              Meet the Barangay Captain of Culiat
            </h3>
            {captainLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <>
                <p className="text-text-secondary leading-relaxed mb-4">
                  {captain?.bio ||
                    `${getCaptainFullName(captain)} has dedicated years to public service, fostering inclusive growth and transparency in Barangay Culiat. Their leadership continues to uplift families and empower community-driven initiatives.`
                  }
                </p>
                <p className="text-text-secondary leading-relaxed mb-4">
                  Focused on health, education, and local livelihood, ensuring
                  that every citizen has a voice in shaping a progressive and
                  sustainable Barangay.
                </p>

                <div className="border-l-4 border-accent pl-4 mt-6">
                  <p className="italic text-lg text-text-color mb-1">
                    "Leadership through Service"
                  </p>
                  <p className="text-sm text-text-secondary">
                    — {getCaptainFullName(captain)}, Barangay Captain
                  </p>
                </div>
              </>
            )}
          </motion.div>
          {/* Right Image */}
          <div className="flex-1 relative md:min-h-[480px] basis-xs ">
            {captainLoading ? (
              <div className="animate-pulse">
                <div className="rounded-xl bg-gray-200 h-[480px] w-full"></div>
              </div>
            ) : (
              <ImageHover
                imageSrc={captain?.photo}
                imageAlt={captain ? `${getCaptainFullName(captain)} - Barangay Captain` : "Barangay Captain"}
              />
            )}
          </div>
        </div>

        {/* --- Council Members Grid (Hierarchical Layout) --- */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-center text-2xl font-bold text-text-color mb-10">
            Our Dedicated Council Members
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : officials.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {officials.map((official, index) => (
                <motion.div
                  key={official._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 text-center p-5 hover:shadow-lg transition-shadow"
                >
                  {/* Official Image or Fallback Icon */}
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    {official.photo ? (
                      <img
                        src={official.photo}
                        alt={getFullName(official)}
                        className="w-24 h-24 rounded-full object-cover border-3 border-emerald-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-3 border-gray-200">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className="font-bold text-secondary text-sm mb-1">
                    {getFullName(official)}
                  </h4>

                  {/* Position */}
                  <p className="text-xs text-primary font-semibold mb-1">
                    {getPositionLabel(official.position)}
                  </p>

                  {/* Committee */}
                  {official.committee && (
                    <p className="text-xs text-gray-500">
                      {official.committee}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No council members available</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Council;
