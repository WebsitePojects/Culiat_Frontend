import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, LogIn, ChevronDown, Bell } from "lucide-react";
import { getGuestProfile, getOrCreateVisitorId } from "../utils/guestIdentity";

const Navbar = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [isInHeroCarousel, setIsInHeroCarousel] = useState(true);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();
   const { user, logout } = useAuth();

   // Dropdown states for navbar
   const [openDropdown, setOpenDropdown] = useState(null);
   const [mobileDropdown, setMobileDropdown] = useState(null);
   const [committees, setCommittees] = useState([]);
   const [notificationCount, setNotificationCount] = useState(0);
   const [showNotifMenu, setShowNotifMenu] = useState(false);
   const [previewNotifications, setPreviewNotifications] = useState([]);
   const [loadingNotifPreview, setLoadingNotifPreview] = useState(false);

   const isHome = location.pathname === "/";
   const hasResidentRole = !!user && (
      user.roleCode === 74934 ||
      user.role === "Resident" ||
      user.roleName === "Resident" ||
      (Array.isArray(user.roles) && user.roles.includes(74934)) ||
      (Array.isArray(user.roleNames) && user.roleNames.includes("Resident"))
   );

   useEffect(() => {
      const handleScroll = () => {
         const scrollY = window.scrollY;
         // Transparent only in hero/carousel sections (approximately first viewport height)
         // Changed from 2 to 1 viewport height to make navbar solid after hero section
         setIsInHeroCarousel(isHome && scrollY < window.innerHeight * 1);
      };

      handleScroll();
      window.addEventListener("scroll", handleScroll);

      return () => window.removeEventListener("scroll", handleScroll);
   }, [isHome]);

   useEffect(() => {
      const fetchCommittees = async () => {
         try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/committees`);
            if (response.data.success) {
               setCommittees(response.data.data);
            }
         } catch (error) {
            console.error("Error fetching committees for navbar:", error);
         }
      };
      fetchCommittees();
   }, []);

   useEffect(() => {
      const fetchNotificationData = async () => {
         try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
            let countsResponse;
            let recentResponse;

            if (hasResidentRole) {
               const token = localStorage.getItem("token");
               if (!token) {
                  setNotificationCount(0);
                  setPreviewNotifications([]);
                  return;
               }

               const headers = {
                  Authorization: `Bearer ${token}`,
               };

               [countsResponse, recentResponse] = await Promise.all([
                  axios.get(`${apiBase}/api/notifications/user/counts`, { headers }),
                  axios.get(`${apiBase}/api/notifications/user/recent?limit=5`, { headers }),
               ]);
            } else {
               const visitorId = getOrCreateVisitorId();
               const guestProfile = getGuestProfile() || {};
               const email = guestProfile?.email || "";

               [countsResponse, recentResponse] = await Promise.all([
                  axios.get(`${apiBase}/api/notifications/guest/counts`, {
                     params: { visitorId, email },
                  }),
                  axios.get(`${apiBase}/api/notifications/guest/recent`, {
                     params: { visitorId, email, limit: 5 },
                  }),
               ]);
            }

            setNotificationCount(countsResponse.data?.data?.unreadTotal || 0);
            setPreviewNotifications(recentResponse.data?.data?.notifications || []);
         } catch (error) {
            setNotificationCount(0);
            setPreviewNotifications([]);
         }
      };

      fetchNotificationData();
   }, [hasResidentRole, user?.id, user?._id]);

   const fetchNotificationPreview = async () => {
      try {
         setLoadingNotifPreview(true);
         const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
         let response;

         if (hasResidentRole) {
            const token = localStorage.getItem("token");
            if (!token) return;

            response = await axios.get(`${apiBase}/api/notifications/user/recent?limit=5`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
         } else {
            const visitorId = getOrCreateVisitorId();
            const guestProfile = getGuestProfile() || {};
            const email = guestProfile?.email || "";

            response = await axios.get(`${apiBase}/api/notifications/guest/recent`, {
               params: { visitorId, email, limit: 5 },
            });
         }

         setPreviewNotifications(response.data?.data?.notifications || []);
      } catch (error) {
         setPreviewNotifications([]);
      } finally {
         setLoadingNotifPreview(false);
      }
   };

   const markNotificationRead = async (notificationId) => {
      if (!notificationId) return;
      try {
         const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

         if (hasResidentRole) {
            const token = localStorage.getItem("token");
            if (!token) return;

            await axios.patch(
               `${apiBase}/api/notifications/user/read`,
               { notificationId },
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );
         } else {
            const visitorId = getOrCreateVisitorId();
            const guestProfile = getGuestProfile() || {};
            await axios.patch(`${apiBase}/api/notifications/guest/read`, {
               notificationId,
               visitorId,
               email: guestProfile?.email || "",
            });
         }

         setPreviewNotifications((prev) =>
            prev.map((item) =>
               item.id === notificationId ? { ...item, unread: false } : item
            )
         );
         setNotificationCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
         console.error("Failed to mark notification as read:", error);
      }
   };

   const handleToggleNotifMenu = async () => {
      const next = !showNotifMenu;
      setShowNotifMenu(next);
      if (next) {
         await fetchNotificationPreview();
      }
   };

   useEffect(() => {
      // Close dropdown when clicking outside
      const handleClickOutside = (event) => {
         if (showUserMenu && !event.target.closest(".user-menu-container")) {
            setShowUserMenu(false);
         }
         if (showNotifMenu && !event.target.closest(".notif-menu-container")) {
            setShowNotifMenu(false);
         }
         // Close mobile menu when clicking outside
         if (isOpen && !event.target.closest(".mobile-menu-container") && !event.target.closest(".hamburger-button")) {
            setIsOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [showUserMenu, showNotifMenu, isOpen]);

   const handleLogout = () => {
      logout();
      setShowUserMenu(false);
      navigate("/");
   };

   const handleLogin = () => {
      // Store the current path to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", location.pathname);
      navigate("/login");
   };

   // Smooth scroll to section helper
   const scrollToSection = (path, sectionId) => {
      if (location.pathname === path) {
         // Same page — just scroll
         const el = document.getElementById(sectionId);
         if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
         // Navigate to page then scroll
         navigate(path);
         setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
         }, 500);
      }
      setOpenDropdown(null);
      setIsOpen(false);
   };

   // Dropdown configurations
   const navDropdowns = {
      home: {
         label: "Home",
         path: "/",
         items: [
            { label: "Carousel", sectionId: "carousel-section", path: "/" },
            { label: "Statistics", sectionId: "statistics", path: "/" },
            { label: "Services", sectionId: "services", path: "/" },
            { label: "Barangay Council", sectionId: "council", path: "/" },
            { label: "Contact Us", sectionId: "contact", path: "/" },
         ],
      },
      about: {
         label: "About",
         path: "/about",
         items: [
            { label: "About Barangay", sectionId: "about-hero", path: "/about" },
            { label: "Goals", sectionId: "goals", path: "/about" },
            { label: "Mission & Vision", sectionId: "mission", path: "/about" },
            { label: "History", sectionId: "history", path: "/about" },
            { label: "Organization", sectionId: "organization", path: "/about" },
         ],
      },
      committee: {
         label: "Committee",
         path: "/committee",
         items: committees.length > 0
            ? [
               { label: "All Committees", path: "/committee" },
               ...committees.map(c => ({ label: c.name, path: `/committee/${c.slug}` }))
            ]
            : [{ label: "All Committees", path: "/committee" }]
      },
      people: {
         label: "People",
         path: "/personnel",
         items: [
            { label: "All Personnel", path: "/personnel" },
            { label: "Organizational Chart", path: "/org-chart" },
            { label: "Barangay Council", path: "/personnel?branch=Legislative" },
            { label: "Sangguniang Kabataan (SK)", path: "/personnel?branch=SK Council" },
            { label: "Administrative Staff", path: "/personnel?branch=Administrative" },
            { label: "BPSO", path: "/personnel?branch=Barangay Public Safety Officers (BPSO)" },
         ],
      },
      downloads: {
         label: "Downloads",
         path: "/downloads",
         items: [
            { label: "Barangay Ordinance", path: "/downloads?tab=ordinance" },
            { label: "Executive Orders", path: "/downloads?tab=executive-orders" },
            { label: "Barangay Resolutions", path: "/downloads?tab=resolutions" },
         ],
      },
   };

   return (
      <nav className={`fixed top-0 left-0 w-full z-100 h-auto`}>
         <div
            className={`relative w-full py-1 transition-all duration-300 ${isInHeroCarousel && !isOpen
               ? "bg-transparent backdrop-blur-sm"
               : "bg-white shadow-md backdrop-blur-sm"
               }`}
         >
            <div
               className={`flex justify-between max-w-7xl mx-auto items-center h-14 px-4 transition-colors duration-300 ${isInHeroCarousel && !isOpen ? "text-text-color-light" : "text-text-color"
                  }`}
            >
               {/* Logo */}
               <Link to="/signin" className="flex items-center gap-2">
                  <div className="rounded-full bg-light">
                     <img
                        src="/images/logo/brgy-culiat-logo.png"
                        alt="Barangay Culiat Logo"
                        className="sm:h-10 sm:w-10 h-9 w-9 rounded-full object-cover"
                     />
                  </div>
                  <p className="flex flex-col" style={{ fontFamily: "'Cinzel', serif" }}>
                     <span className="sm:block hidden leading-4 text-sm font-bold tracking-wide">
                        BARANGAY CULIAT
                     </span>
                     <span className="sm:hidden block text-sm font-bold tracking-wide">BARANGAY CULIAT</span>
                     <span className="font-semibold text-[10px] text-primary uppercase">
                        E-Services
                     </span>
                  </p>
               </Link>

               {/* Desktop Nav Links */}
               <div
                  className={`hidden lg:flex items-center gap-1 font-semibold relative ml-3 xl:ml-6 mr-auto`}
                  style={{ fontFamily: "'Cinzel', serif" }}
               >
                  {/* Home Dropdown */}
                  <div
                     className="relative pb-3"
                     onMouseEnter={() => setOpenDropdown("home")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to="/"
                        className={({ isActive }) =>
                           `navlink text-sm transition flex items-center gap-1 px-2 py-1 ${isActive && "active"}`
                        }
                     >
                        Home
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "home" && (
                        <div className="absolute top-full left-0 -mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                           {navDropdowns.home.items.map((item) => (
                              <button
                                 key={item.sectionId}
                                 onClick={() => scrollToSection(item.path, item.sectionId)}
                                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors whitespace-normal break-words leading-snug"
                              >
                                 {item.label}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Services Dropdown */}
                  <div
                     className="relative pb-3"
                     onMouseEnter={() => setOpenDropdown("services")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to={user && (user.roleCode === 74933 || user.roleCode === 74932) ? "/services" : "/services-info"}
                        className="navlink text-sm px-2 py-1 flex items-center gap-1"
                     >
                        Services
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "services" && (
                        <div className="absolute top-full left-0 -mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 overflow-hidden max-h-96 overflow-y-auto">
                           <Link
                              to="/services-info"
                              className="block px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                           >
                              All Services
                           </Link>
                           <div className="border-t border-gray-100 my-1" />
                           <Link to="/services/business-permit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Business Permit</Link>
                           <Link to="/services/business-closure" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Business Closure</Link>
                           <Link to="/services/certificate-of-residency" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Certificate of Residency</Link>
                           <Link to="/services/certificate-of-indigency" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Certificate of Indigency</Link>
                           <Link to="/services/barangay-id" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Barangay ID</Link>
                           <Link to="/services/building-permit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Building Permit</Link>
                           <Link to="/services/bail-bond" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Bail Bond Certification</Link>
                           <Link to="/services/house-repair-renovation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">House Repair / Renovation</Link>
                           <Link to="/services/cutting-trees" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Tree Cutting Permit</Link>
                           <Link to="/services/estate-tax" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Estate Tax Certification</Link>
                           <Link to="/services/transfer-of-account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Transfer of Account</Link>
                           <Link to="/services/burial-financial-assistance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Burial / Financial Assistance</Link>
                           <Link to="/services/cohabitation-jail-visitation-pao" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Cohabitation / Jail Visitation / PAO</Link>
                           <Link to="/services/missionary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">Missionary Certificate</Link>
                           <Link to="/services/tru-tfb" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">TRU / TFB Certification</Link>
                        </div>
                     )}
                  </div>

                  {/* Committee Dropdown */}
                  <div
                     className="relative pb-3"
                     onMouseEnter={() => setOpenDropdown("committee")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to="/committee"
                        className={({ isActive }) =>
                           `navlink text-sm transition flex items-center gap-1 px-2 py-1 ${isActive && "active"}`
                        }
                     >
                        Committee
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "committee" && (
                        <div className="absolute top-full left-0 -mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                           {navDropdowns.committee.items.map((item, idx) => (
                              <NavLink
                                 key={idx}
                                 to={item.path}
                                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors whitespace-normal break-words leading-snug"
                              >
                                 {item.label}
                              </NavLink>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* People Dropdown */}
                  <div
                     className="relative pb-3"
                     onMouseEnter={() => setOpenDropdown("people")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to="/personnel"
                        className={({ isActive }) =>
                           `navlink text-sm transition flex items-center gap-1 px-2 py-1 ${isActive && "active"}`
                        }
                     >
                        People
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "people" && (
                        <div className="absolute top-full left-0 -mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                           {navDropdowns.people.items.map((item, idx) => (
                              <NavLink
                                 key={idx}
                                 to={item.path}
                                 onClick={() => setOpenDropdown(null)}
                                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors whitespace-normal break-words leading-snug"
                              >
                                 {item.label}
                              </NavLink>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Downloads Dropdown */}
                  <div
                     className="relative pb-3"
                     onMouseEnter={() => setOpenDropdown("downloads")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to="/downloads"
                        className={({ isActive }) =>
                           `navlink text-sm transition flex items-center gap-1 px-2 py-1 ${isActive ? "active" : ""}`
                        }
                     >
                        Downloads
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "downloads" && (
                        <div className="absolute top-full left-0 -mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                           {navDropdowns.downloads.items.map((item, idx) => (
                              <NavLink
                                 key={idx}
                                 to={item.path}
                                 onClick={() => setOpenDropdown(null)}
                                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors whitespace-normal break-words leading-snug"
                              >
                                 {item.label}
                              </NavLink>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Report — flat link (no dropdown) */}
                  <div className="pb-2">
                     <NavLink to="/reports" className="navlink text-sm px-2 py-1">Report</NavLink>
                  </div>

                  {/* About Dropdown */}
                  <div
                     className="relative pb-3"
                     onMouseEnter={() => setOpenDropdown("about")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to="/about"
                        className={({ isActive }) =>
                           `navlink text-sm transition flex items-center gap-1 px-2 py-1 ${isActive && "active"}`
                        }
                     >
                        About
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "about" && (
                        <div className="absolute top-full left-0 -mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                           {navDropdowns.about.items.map((item) => (
                              <button
                                 key={item.sectionId}
                                 onClick={() => scrollToSection(item.path, item.sectionId)}
                                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors whitespace-normal break-words leading-snug"
                              >
                                 {item.label}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* User Menu / Login & Register */}
                  {hasResidentRole ? (
                     <>
                        <div className="relative notif-menu-container">
                           <button
                              onClick={handleToggleNotifMenu}
                              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/10 transition-colors"
                              title="Notifications"
                              aria-label="Open notifications"
                           >
                              <Bell className="w-4.5 h-4.5" />
                              {notificationCount > 0 && (
                                 <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold font-mono tabular-nums flex items-center justify-center leading-none">
                                    {notificationCount > 99 ? "99+" : notificationCount}
                                 </span>
                              )}
                           </button>

                           {showNotifMenu && (
                              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                                 <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                                    <div className="flex items-center gap-2">
                                       <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                          <Bell className="w-4 h-4" />
                                       </span>
                                       <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                    </div>
                                    <span className="text-xs text-gray-500">{notificationCount} total</span>
                                 </div>

                                 <div className="max-h-96 overflow-y-auto">
                                    {loadingNotifPreview ? (
                                       <p className="px-4 py-6 text-xs text-gray-500 text-center">Loading notifications...</p>
                                    ) : previewNotifications.length === 0 ? (
                                       <p className="px-4 py-6 text-xs text-gray-500 text-center">No notifications yet.</p>
                                    ) : (
                                       previewNotifications.map((notif) => (
                                          <button
                                             key={notif.id || notif._id}
                                             onClick={async () => {
                                                if (notif.unread) {
                                                   await markNotificationRead(notif.id);
                                                }
                                                setShowNotifMenu(false);
                                                navigate("/notifications");
                                             }}
                                             className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${notif.unread ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                                          >
                                             <div className="flex items-start gap-3">
                                                <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${notif.unread ? "bg-blue-500" : "bg-gray-300"}`} />
                                                <div className="min-w-0 flex-1">
                                                   <p className={`text-[13px] text-gray-800 truncate ${notif.unread ? "font-bold" : "font-semibold"}`}>{notif.title}</p>
                                                   <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                                   {notif.time && <p className="text-[11px] text-gray-500 mt-1">{notif.time}</p>}
                                                </div>
                                             </div>
                                          </button>
                                       ))
                                    )}
                                 </div>

                                 <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
                                    <button
                                       onClick={() => {
                                          setShowNotifMenu(false);
                                          navigate("/notifications");
                                       }}
                                       className="w-full px-3 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                       View all notifications
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="relative user-menu-container">
                           <button
                              onClick={() => setShowUserMenu(!showUserMenu)}
                              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                           >
                              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                 {user.firstName?.[0]}
                                 {user.lastName?.[0]}
                              </div>
                              <span className="text-xs">{user.firstName}</span>
                              <ChevronDown
                                 className={`w-3 h-3 transition-transform ${showUserMenu ? "rotate-180" : ""
                                    }`}
                              />
                           </button>

                           {showUserMenu && (
                              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                 <div className="px-3 py-2 border-b border-gray-200">
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                       {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate" title={user.email}>
                                       {user.email}
                                    </p>
                                    <p className="text-[10px] text-primary mt-0.5">
                                       Resident
                                    </p>
                                 </div>
                                 <Link
                                    to="/profile"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                                 >
                                    <User className="w-3.5 h-3.5" />
                                    My Profile
                                 </Link>
                                 <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                 >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Logout
                                 </button>
                              </div>
                           )}
                        </div>
                     </>
                  ) : (
                     <div className="flex items-center gap-2">
                        <div className="relative notif-menu-container">
                           <button
                              onClick={handleToggleNotifMenu}
                              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/10 transition-colors"
                              title="Notifications"
                              aria-label="Open notifications"
                           >
                              <Bell className="w-4.5 h-4.5" />
                              {notificationCount > 0 && (
                                 <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold font-mono tabular-nums flex items-center justify-center leading-none">
                                    {notificationCount > 99 ? "99+" : notificationCount}
                                 </span>
                              )}
                           </button>

                           {showNotifMenu && (
                              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                                 <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                                    <div className="flex items-center gap-2">
                                       <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                          <Bell className="w-4 h-4" />
                                       </span>
                                       <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                    </div>
                                    <span className="text-xs text-gray-500">{notificationCount} total</span>
                                 </div>

                                 <div className="max-h-96 overflow-y-auto">
                                    {loadingNotifPreview ? (
                                       <p className="px-4 py-6 text-xs text-gray-500 text-center">Loading notifications...</p>
                                    ) : previewNotifications.length === 0 ? (
                                       <p className="px-4 py-6 text-xs text-gray-500 text-center">No notifications yet.</p>
                                    ) : (
                                       previewNotifications.map((notif) => (
                                          <button
                                             key={notif.id || notif._id}
                                             onClick={async () => {
                                                if (notif.unread) {
                                                   await markNotificationRead(notif.id);
                                                }
                                                setShowNotifMenu(false);
                                                navigate("/notifications");
                                             }}
                                             className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${notif.unread ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                                          >
                                             <div className="flex items-start gap-3">
                                                <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${notif.unread ? "bg-blue-500" : "bg-gray-300"}`} />
                                                <div className="min-w-0 flex-1">
                                                   <p className={`text-[13px] text-gray-800 truncate ${notif.unread ? "font-bold" : "font-semibold"}`}>{notif.title}</p>
                                                   <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                                   {notif.time && <p className="text-[11px] text-gray-500 mt-1">{notif.time}</p>}
                                                </div>
                                             </div>
                                          </button>
                                       ))
                                    )}
                                 </div>

                                 <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
                                    <button
                                       onClick={() => {
                                          setShowNotifMenu(false);
                                          navigate("/notifications");
                                       }}
                                       className="w-full px-3 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                       View all notifications
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>

                        <button
                           onClick={handleLogin}
                           className="flex items-center gap-1.5 px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors text-xs font-semibold"
                        >
                           <LogIn className="w-3.5 h-3.5" />
                           Login
                        </button>
                        <Link
                           to="/register"
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-xs font-semibold"
                        >
                           Register
                        </Link>
                     </div>
                  )}
               </div>

               <div className="flex items-center gap-2 lg:hidden">
                  <div className="relative notif-menu-container">
                        <button
                           onClick={handleToggleNotifMenu}
                           className="relative focus:outline-none text-text-color-light mix-blend-difference cursor-pointer w-8 h-8 flex items-center justify-center"
                           aria-label="Open notifications"
                        >
                           <Bell className="w-5 h-5" />
                           {notificationCount > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono tabular-nums flex items-center justify-center leading-none mix-blend-normal">
                                 {notificationCount > 99 ? "99+" : notificationCount}
                              </span>
                           )}
                        </button>

                        {showNotifMenu && (
                           <div className="absolute right-0 top-full mt-2 w-[22rem] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 mix-blend-normal overflow-hidden">
                              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                                 <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                       <Bell className="w-4 h-4" />
                                    </span>
                                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                 </div>
                                 <span className="text-xs text-gray-500">{notificationCount} total</span>
                              </div>

                              <div className="max-h-96 overflow-y-auto">
                                 {loadingNotifPreview ? (
                                    <p className="px-4 py-6 text-xs text-gray-500 text-center">Loading notifications...</p>
                                 ) : previewNotifications.length === 0 ? (
                                    <p className="px-4 py-6 text-xs text-gray-500 text-center">No notifications yet.</p>
                                 ) : (
                                    previewNotifications.map((notif) => (
                                       <button
                                          key={notif.id || notif._id}
                                          onClick={async () => {
                                             if (notif.unread) {
                                                await markNotificationRead(notif.id);
                                             }
                                             setShowNotifMenu(false);
                                             setIsOpen(false);
                                             navigate("/notifications");
                                          }}
                                          className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${notif.unread ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                                       >
                                          <div className="flex items-start gap-3">
                                             <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${notif.unread ? "bg-blue-500" : "bg-gray-300"}`} />
                                             <div className="min-w-0 flex-1">
                                                <p className={`text-[13px] text-gray-800 truncate ${notif.unread ? "font-bold" : "font-semibold"}`}>{notif.title}</p>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                                {notif.time && <p className="text-[11px] text-gray-500 mt-1">{notif.time}</p>}
                                             </div>
                                          </div>
                                       </button>
                                    ))
                                 )}
                              </div>

                              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
                                 <button
                                    onClick={() => {
                                       setShowNotifMenu(false);
                                       setIsOpen(false);
                                       navigate("/notifications");
                                    }}
                                    className="w-full px-3 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                 >
                                    View all notifications
                                 </button>
                              </div>
                           </div>
                        )}
                        </div>

                  {/* Mobile menu toggle */}
                  <button
                     onClick={() => setIsOpen(!isOpen)}
                     className="hamburger-button lg:hidden focus:outline-none text-text-color-light mix-blend-difference cursor-pointer"
                  >
                     <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                           <motion.svg
                              key="close"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              initial={{ rotate: -90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 90, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M6 18L18 6M6 6l12 12"
                              />
                           </motion.svg>
                        ) : (
                           <motion.svg
                              key="menu"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              initial={{ rotate: 90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -90, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M4 6h16M4 12h16M4 18h16"
                              />
                           </motion.svg>
                        )}
                     </AnimatePresence>
                  </button>
               </div>
            </div>
         </div>
         {/* </div> */}

         {/* Mobile dropdown */}

         <div
            className={`mobile-menu-container absolute top-full w-full lg:hidden bg-light shadow-md px-4 space-y-4 font-medium transition-all duration-600 ${isOpen
               ? "max-h-[85vh] py-4 border-t border-text-color/30 overflow-y-auto"
               : "max-h-0 overflow-hidden"
               }
        `}
         >
            {hasResidentRole && (
               <div className="pb-3 mb-3 border-b border-gray-300">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-gray-900">
                           {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Resident</p>
                     </div>
                  </div>
               </div>
            )}

            {/* Home Mobile Accordion */}
            <div>
               <button
                  onClick={() => setMobileDropdown(mobileDropdown === "home" ? null : "home")}
                  className="flex items-center justify-between w-full text-text-color hover:text-primary"
               >
                  <span>Home</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "home" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "home" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     {navDropdowns.home.items.map((item) => (
                        <button
                           key={item.sectionId}
                           onClick={() => { scrollToSection(item.path, item.sectionId); setIsOpen(false); }}
                           className="block text-sm text-gray-600 hover:text-primary"
                        >
                           {item.label}
                        </button>
                     ))}
                  </div>
               )}
            </div>

            {/* Services Mobile Accordion */}
            <div>
               <button
                  onClick={() => setMobileDropdown(mobileDropdown === "services" ? null : "services")}
                  className="flex items-center justify-between w-full text-text-color hover:text-primary"
               >
                  <span>Barangay Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "services" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "services" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     <Link to="/services-info" onClick={() => setIsOpen(false)} className="block text-sm font-semibold text-emerald-700 hover:text-primary">All Services</Link>
                     <Link to="/services/business-permit" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Business Permit</Link>
                     <Link to="/services/business-closure" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Business Closure</Link>
                     <Link to="/services/certificate-of-residency" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Certificate of Residency</Link>
                     <Link to="/services/certificate-of-indigency" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Certificate of Indigency</Link>
                     <Link to="/services/barangay-id" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Barangay ID</Link>
                     <Link to="/services/building-permit" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Building Permit</Link>
                     <Link to="/services/bail-bond" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Bail Bond</Link>
                     <Link to="/services/house-repair-renovation" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">House Repair / Renovation</Link>
                     <Link to="/services/estate-tax" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Estate Tax</Link>
                     <Link to="/services/transfer-of-account" onClick={() => setIsOpen(false)} className="block text-sm text-gray-600 hover:text-primary">Transfer of Account</Link>
                  </div>
               )}
            </div>

            {/* Downloads Mobile Accordion */}
            <div>
               <button
                  onClick={() => setMobileDropdown(mobileDropdown === "downloads" ? null : "downloads")}
                  className="flex items-center justify-between w-full text-text-color hover:text-primary"
               >
                  <span>Downloads</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "downloads" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "downloads" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     {navDropdowns.downloads.items.map((item, idx) => (
                        <NavLink
                           key={idx}
                           to={item.path}
                           onClick={() => setIsOpen(false)}
                           className="block text-sm text-gray-600 hover:text-primary"
                        >
                           {item.label}
                        </NavLink>
                     ))}
                  </div>
               )}
            </div>

            <NavLink
               to="/reports"
               onClick={() => setIsOpen(false)}
               className="block mobile-navlink text-text-color hover:text-primary"
            >
               Reports
            </NavLink>

            <NavLink
               to="/notifications"
               onClick={() => setIsOpen(false)}
               className="block mobile-navlink text-text-color hover:text-primary"
            >
               Notifications
            </NavLink>

            {/* Committee Mobile Accordion */}
            <div>
               <button
                  onClick={() => setMobileDropdown(mobileDropdown === "committee" ? null : "committee")}
                  className="flex items-center justify-between w-full text-text-color hover:text-primary"
               >
                  <span>Committee</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "committee" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "committee" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     {navDropdowns.committee.items.map((item, idx) => (
                        <NavLink
                           key={idx}
                           to={item.path}
                           onClick={() => setIsOpen(false)}
                           className="block text-sm text-gray-600 hover:text-primary"
                        >
                           {item.label}
                        </NavLink>
                     ))}
                  </div>
               )}
            </div>

            {/* People Mobile Accordion */}
            <div>
               <button
                  onClick={() => setMobileDropdown(mobileDropdown === "people" ? null : "people")}
                  className="flex items-center justify-between w-full text-text-color hover:text-primary"
               >
                  <span>People</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "people" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "people" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     {navDropdowns.people.items.map((item, idx) => (
                        <NavLink
                           key={idx}
                           to={item.path}
                           onClick={() => setIsOpen(false)}
                           className="block text-sm text-gray-600 hover:text-primary"
                        >
                           {item.label}
                        </NavLink>
                     ))}
                  </div>
               )}
            </div>

            {/* About Mobile Accordion */}
            <div>
               <button
                  onClick={() => setMobileDropdown(mobileDropdown === "about" ? null : "about")}
                  className="flex items-center justify-between w-full text-text-color hover:text-primary"
               >
                  <span>About</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "about" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "about" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     {navDropdowns.about.items.map((item) => (
                        <button
                           key={item.sectionId}
                           onClick={() => { scrollToSection(item.path, item.sectionId); setIsOpen(false); }}
                           className="block text-sm text-gray-600 hover:text-primary"
                        >
                           {item.label}
                        </button>
                     ))}
                  </div>
               )}
            </div>

            {hasResidentRole ? (
               <>
                  <NavLink
                     to="/profile"
                     onClick={() => setIsOpen(false)}
                     className="flex items-center gap-2 mobile-navlink text-text-color hover:text-primary pt-3 border-t border-gray-300"
                  >
                     <User className="w-4 h-4" />
                     My Profile
                  </NavLink>
                  <button
                     onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                     }}
                     className="w-full flex items-center gap-2 mobile-navlink text-red-600 hover:text-red-700"
                  >
                     <LogOut className="w-4 h-4" />
                     Logout
                  </button>
               </>
            ) : (
               <div className="flex flex-col gap-3 pt-3 border-t border-gray-300">
                  <button
                     onClick={() => {
                        setIsOpen(false);
                        handleLogin();
                     }}
                     className="w-full flex items-center justify-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors text-sm font-semibold"
                  >
                     <LogIn className="w-4 h-4" />
                     Login
                  </button>
                  <Link
                     to="/register"
                     onClick={() => setIsOpen(false)}
                     className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold"
                  >
                     Register
                  </Link>
               </div>
            )}
         </div>
      </nav>
   );
};

export default Navbar;
