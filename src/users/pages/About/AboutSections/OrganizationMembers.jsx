import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Animation Variants for the Grid ---
const container = {
   hidden: {},
   show: {
      transition: {
         staggerChildren: 0.1,
      },
   },
};

const item = {
   hidden: { opacity: 0, y: 40 },
   show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Position label mapping
const getPositionLabel = (position) => {
   const labels = {
      barangay_captain: "Punong Barangay (Barangay Captain)",
      barangay_kagawad: "Barangay Kagawad (Councilor)",
      sk_chairman: "SK Chairperson",
      barangay_secretary: "Barangay Secretary",
      barangay_treasurer: "Barangay Treasurer",
      administrative_officer: "Administrative Officer",
      admin_officer_internal: "Administrative Officer - Internal",
      admin_officer_external: "Administrative Officer - External",
      executive_officer: "Executive Officer (EX-O)",
      deputy_officer: "Deputy Officer",
      other: "Staff",
   };
   return labels[position] || position;
};

// --- Enhanced Card Component (Without Email & Social Icons) ---
const MemberCard = ({ member }) => {
   // Format the full name
   const fullName = [member.firstName, member.middleName, member.lastName]
      .filter(Boolean)
      .join(" ");

   return (
      <motion.div
         className="group h-full"
         whileHover={{ y: -8 }}
         transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
         <div className="relative h-full bg-white rounded-2xl shadow-sm group-hover:shadow-2xl border border-gray-100 overflow-hidden transition-shadow duration-300 flex flex-col">
            {/* Decorative Top Banner with Shine Effect */}
            <div className="h-24 bg-gradient-to-r from-emerald-700 to-emerald-500 relative overflow-hidden">
               {/* The Shine/Glint Animation */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>

            {/* Avatar (Overlapping) */}
            <div className="relative mx-auto -mt-16 w-36 h-36 p-1 bg-white rounded-full z-10">
               <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md relative">
                  {member.photo ? (
                     <img
                        src={member.photo}
                        alt={fullName}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3"
                     />
                  ) : (
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg
                           className="w-16 h-16 text-gray-400"
                           fill="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                     </div>
                  )}
               </div>
            </div>

            {/* Content Body */}
            <div className="p-6 pt-3 text-center flex-grow flex flex-col justify-center relative z-10">
               <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 group-hover:text-emerald-700 transition-colors duration-300">
                     {fullName}
                  </h3>
                  {/* Position Text */}
                  <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-1">
                     {getPositionLabel(member.position)}
                  </p>

                  {/* Committee if available */}
                  {member.committee && (
                     <p className="text-xs text-gray-500 mt-2">
                        Committee: {member.committee}
                     </p>
                  )}
               </div>
            </div>
         </div>
      </motion.div>
   );
};

// --- Loading Skeleton ---
const LoadingSkeleton = () => (
   <div className="animate-pulse">
      <div className="h-24 bg-gray-200 rounded-t-2xl"></div>
      <div className="bg-white rounded-b-2xl p-6 pt-16 text-center">
         <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto -mt-20 mb-4"></div>
         <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
         <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
   </div>
);

// --- Main Section Component ---
const OrganizationMembers = () => {
   const [officials, setOfficials] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchOfficials();
   }, []);

   const fetchOfficials = async () => {
      try {
         const response = await axios.get(`${API_URL}/api/officials/active`);
         if (response.data.success) {
            setOfficials(response.data.data);
         }
      } catch (err) {
         console.error("Error fetching officials:", err);
         setError("Unable to load officials");
      } finally {
         setLoading(false);
      }
   };

   // Find the main member (Barangay Captain) and other members
   const mainMember = officials.find(
      (official) => official.position === "barangay_captain"
   );
   const otherMembers = officials.filter(
      (official) => official.position !== "barangay_captain"
   );

   if (loading) {
      return (
         <section className="py-12 sm:py-16 lg:py-20 bg-neutral" id="organization">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12">
                  <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                     <LoadingSkeleton key={i} />
                  ))}
               </div>
            </div>
         </section>
      );
   }

   if (error) {
      return (
         <section className="py-12 sm:py-16 lg:py-20 bg-neutral" id="organization">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
               <p className="text-red-600">{error}</p>
            </div>
         </section>
      );
   }

   if (officials.length === 0) {
      return null; // Don't render section if no officials
   }

   return (
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral" id="organization">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               viewport={{ once: true }}
               className="text-center mb-12"
            >
               <h2 className="text-3xl sm:text-4xl font-bold text-text-color mb-4">
                  Barangay Officials
               </h2>
               <p className="text-base sm:text-lg text-text-color max-w-2xl mx-auto">
                  Meet the dedicated leaders serving our community with passion
                  and integrity.
               </p>
            </motion.div>

            {/* Main Member (Punong Barangay) */}
            {mainMember && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="mb-16 w-full max-w-sm mx-auto"
               >
                  <MemberCard member={mainMember} />
               </motion.div>
            )}

            {/* Other Members Grid */}
            {otherMembers.length > 0 && (
               <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
               >
                  {otherMembers.map((member, index) => {
                     // Logic to center the last item if it's a lone orphan in the grid
                     const isSingleLastItem = otherMembers.length % 3 === 1;
                     const isLastItemInPartialRow =
                        isSingleLastItem && index === otherMembers.length - 1;

                     return (
                        <motion.div
                           key={member._id}
                           variants={item}
                           className={`w-full max-w-sm mx-auto sm:max-w-none ${isLastItemInPartialRow ? "lg:col-start-2" : ""
                              }`}
                        >
                           <MemberCard member={member} />
                        </motion.div>
                     );
                  })}
               </motion.div>
            )}
         </div>
      </section>
   );
};

export default OrganizationMembers;
