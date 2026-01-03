import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Loader2, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const fadeUp = {
   hidden: { opacity: 0, y: 40, scale: 0.98 },
   show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
   },
};

const staggerContainer = {
   hidden: {},
   show: {
      transition: {
         staggerChildren: 0.15,
         delayChildren: 0.1,
      },
   },
};

const Announcements = () => {
   const [announcements, setAnnouncements] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchAnnouncements();
   }, []);

   const fetchAnnouncements = async () => {
      try {
         setLoading(true);
         const response = await axios.get(`${API_URL}/api/announcements`);
         if (response.data.success) {
            setAnnouncements(response.data.data);
         }
      } catch (err) {
         console.error("Error fetching announcements:", err);
      } finally {
         setLoading(false);
      }
   };

   // Sort by event date and filter only future/recent events
   const sortedAnnouncements = useMemo(() => {
      const now = new Date();
      return [...announcements]
         .map((a) => ({
            ...a,
            parsedDate: new Date(a.eventDate || a.createdAt),
         }))
         .sort((a, b) => {
            // Prioritize upcoming events, then recent past events
            const aIsFuture = a.parsedDate >= now;
            const bIsFuture = b.parsedDate >= now;
            if (aIsFuture && !bIsFuture) return -1;
            if (!aIsFuture && bIsFuture) return 1;
            return aIsFuture ? a.parsedDate - b.parsedDate : b.parsedDate - a.parsedDate;
         });
   }, [announcements]);

   const main = sortedAnnouncements[0];
   const side = sortedAnnouncements.slice(1, 4);

   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: 'long',
         day: 'numeric',
         year: 'numeric'
      });
   };

   if (loading) {
      return (
         <section className="py-8 px-4 sm:px-6 md:px-8 mb-12 md:mb-[7em] bg-neutral">
            <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
               <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
         </section>
      );
   }

   if (announcements.length === 0) {
      return (
         <section className="py-8 px-4 sm:px-6 md:px-8 mb-12 md:mb-[7em] bg-neutral">
            <div className="max-w-6xl mx-auto">
               <div className="flex justify-between items-end mb-8 gap-2">
                  <div>
                     <h2 className="text-4xl font-bold text-text-color mb-2">
                        Announcements
                     </h2>
                     <p className="text-gray-600">
                        Stay updated with the latest barangay news and events
                     </p>
                  </div>
               </div>
               <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No announcements at this time. Check back soon!</p>
               </div>
            </div>
         </section>
      );
   }

   return (
      <section className="py-8 px-4 sm:px-6 md:px-8 mb-12 md:mb-[7em] bg-neutral">
         <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
         >
            {/* Header */}
            <motion.div
               variants={fadeUp}
               className="flex justify-between items-end mb-8 gap-2"
            >
               <div>
                  <h2 className="text-4xl font-bold text-text-color mb-2">
                     Announcements
                  </h2>
                  <p className="text-gray-600">
                     Stay updated with the latest barangay news and events
                  </p>
               </div>
               <Link
                  to="/announcements"
                  className="text-blue-600 hover:text-blue-700 hover:underline text-nowrap font-medium"
               >
                  See all
               </Link>
            </motion.div>

            {/* Main + Side layout */}
            <motion.div
               variants={staggerContainer}
               className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-6"
            >
               {/* MAIN FEATURED POST */}
               {main && (
                  <motion.div variants={fadeUp} className="md:col-span-3">
                     <Link
                        to={`/announcements/${main.slug || main._id}`}
                        className="group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 block"
                     >
                        <div className="relative h-full w-full">
                           {main.image ? (
                              <img
                                 src={main.image}
                                 alt={main.title}
                                 className="w-full lg:max-h-[450px] min-h-[350px] h-full object-cover"
                              />
                           ) : (
                              <div className="w-full lg:max-h-[450px] min-h-[350px] h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                 <Megaphone className="w-24 h-24 text-white/30" />
                              </div>
                           )}
                           <div className="absolute h-full inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
                                 {main.category}
                              </span>
                              <h3 className="text-white text-xl sm:text-3xl font-bold mb-2">
                                 {main.title}
                              </h3>

                              <p className="text-gray-200 text-sm mb-2 flex gap-2">
                                 <span className="flex items-center">
                                    <CalendarDays
                                       className="w-4 h-4 inline-block mr-1 text-blue-400"
                                       strokeWidth={3}
                                    />
                                    {formatDate(main.eventDate || main.createdAt)}
                                 </span>
                                 {main.location && (
                                    <>
                                       |
                                       <span className="flex items-center">
                                          <MapPin
                                             className="w-4 h-4 inline-block mr-1 text-blue-400"
                                             strokeWidth={3}
                                          />
                                          {main.location}
                                       </span>
                                    </>
                                 )}
                              </p>
                              <p className="text-gray-300 text-sm max-w-2xl line-clamp-2">
                                 {main.content}
                              </p>
                           </div>
                        </div>
                     </Link>
                  </motion.div>
               )}

               {/* SIDE ARTICLES */}
               <motion.div
                  variants={staggerContainer}
                  className="flex flex-col gap-6 md:justify-around"
               >
                  {side.map((item) => (
                     <motion.div key={item._id} variants={fadeUp}>
                        <Link
                           to={`/announcements/${item.slug || item._id}`}
                           className="h-fit transition-all duration-300 block hover:translate-x-1"
                        >
                           <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                              {item.category}
                           </p>
                           <h4 className="text-lg font-semibold text-text-color mb-2 leading-snug hover:text-blue-600 transition-colors">
                              {item.title}
                           </h4>
                           <div className="mb-2 flex gap-1 text-xs">
                              <p className="text-text-secondary line-clamp-1">
                                 {formatDate(item.eventDate || item.createdAt)}
                              </p>
                              {item.location && (
                                 <>
                                    <span>|</span>
                                    <p className="text-text-secondary line-clamp-1 flex-1">
                                       {item.location}
                                    </p>
                                 </>
                              )}
                           </div>
                           <p className="text-sm text-gray-700 line-clamp-3">
                              {item.content}
                           </p>
                        </Link>
                     </motion.div>
                  ))}
               </motion.div>
            </motion.div>
         </motion.div>
      </section>
   );
};

export default Announcements;
