import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Loader2, Megaphone, Youtube } from "lucide-react";
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
         <section className="py-8 px-4 sm:px-6 md:px-8 mb-12 md:mb-[7em] bg-neutral" id="announcements">
            <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
               <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
         </section>
      );
   }

   if (announcements.length === 0) {
      return (
         <section className="py-8 px-4 sm:px-6 md:px-8 mb-12 md:mb-[7em] bg-neutral" id="announcements">
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
      <section className="py-8 px-4 sm:px-6 md:px-8 mb-12 md:mb-[7em] bg-neutral" id="announcements">
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
                  className="text-emerald-600 hover:text-emerald-700 hover:underline text-nowrap font-medium"
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
                        to={`/announcements/${main.slug && main.slug.trim() !== '' ? main.slug : main._id}`}
                        className="group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 block"
                     >
                        <div className="relative h-full w-full">
                           {main.youtubeVideoId ? (
                              <div className="relative w-full lg:max-h-[450px] min-h-[350px] h-full">
                                 <img
                                    src={`https://img.youtube.com/vi/${main.youtubeVideoId}/maxresdefault.jpg`}
                                    alt={main.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                       // Fallback to high quality thumbnail if maxres doesn't exist
                                       e.target.src = `https://img.youtube.com/vi/${main.youtubeVideoId}/hqdefault.jpg`;
                                    }}
                                 />
                                 {/* Video Play Icon Overlay */}
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                       <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                       </svg>
                                    </div>
                                 </div>
                              </div>
                           ) : main.image ? (
                              <img
                                 src={main.image}
                                 alt={main.title}
                                 className="w-full lg:max-h-[450px] min-h-[350px] h-full object-cover"
                              />
                           ) : (
                              <div className="w-full lg:max-h-[450px] min-h-[350px] h-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                                 <Megaphone className="w-24 h-24 text-white/30" />
                              </div>
                           )}
                           <div className="absolute h-full inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                              <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
                                 {main.category}
                              </span>
                              <h3 className="text-white text-xl sm:text-3xl font-bold mb-2">
                                 {main.title}
                              </h3>

                              <p className="text-gray-200 text-sm mb-2 flex gap-2">
                                 <span className="flex items-center">
                                    <CalendarDays
                                       className="w-4 h-4 inline-block mr-1 text-emerald-400"
                                       strokeWidth={3}
                                    />
                                    {formatDate(main.eventDate || main.createdAt)}
                                 </span>
                                 {main.location && (
                                    <>
                                       |
                                       <span className="flex items-center">
                                          <MapPin
                                             className="w-4 h-4 inline-block mr-1 text-emerald-400"
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

               {/* SIDE ARTICLES - Clickable cards with images */}
               <motion.div
                  variants={staggerContainer}
                  className="flex flex-col gap-4"
               >
                  {side.map((item, index) => (
                     <motion.div key={item._id} variants={fadeUp}>
                        <Link
                           to={`/announcements/${item.slug && item.slug.trim() !== '' ? item.slug : item._id}`}
                           className="group flex gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300"
                        >
                           {/* Thumbnail Image */}
                           <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 relative">
                              {item.image ? (
                                 <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <Megaphone className="w-8 h-8 text-white/50" />
                                 </div>
                              )}
                              {/* Video Badge */}
                              {item.youtubeVideoId && (
                                 <div className="absolute bottom-1 right-1 p-1 bg-red-600 rounded">
                                    <Youtube className="w-3 h-3 text-white" />
                                 </div>
                              )}
                           </div>

                           {/* Content */}
                           <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <span className="text-xs text-emerald-600 font-semibold uppercase mb-1">
                                 {item.category}
                              </span>
                              <h4 className="text-sm font-semibold text-text-color mb-1 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                 {item.title}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-text-secondary">
                                 <CalendarDays className="w-3 h-3 text-emerald-500" />
                                 <span className="line-clamp-1">
                                    {formatDate(item.eventDate || item.createdAt)}
                                 </span>
                              </div>
                           </div>
                        </Link>
                     </motion.div>
                  ))}

                  {/* View All Button at bottom */}
                  <motion.div variants={fadeUp}>
                     <Link
                        to="/announcements"
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-colors"
                     >
                        View All Announcements
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                     </Link>
                  </motion.div>
               </motion.div>
            </motion.div>
         </motion.div>
      </section>
   );
};

export default Announcements;
