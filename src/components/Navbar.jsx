import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, LogIn, ChevronDown } from "lucide-react";

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

   const isHome = location.pathname === "/";

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
      // Close dropdown when clicking outside
      const handleClickOutside = (event) => {
         if (showUserMenu && !event.target.closest(".user-menu-container")) {
            setShowUserMenu(false);
         }
         // Close mobile menu when clicking outside
         if (isOpen && !event.target.closest(".mobile-menu-container") && !event.target.closest(".hamburger-button")) {
            setIsOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [showUserMenu, isOpen]);

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
      services: {
         label: "Services",
         path: user && user.roleCode === 74934 ? "/services" : "/services-info",
         items: user && user.roleCode === 74934
            ? [
               { label: "Request Document", path: "/services" },
               { label: "Services Info", path: "/services-info" },
            ]
            : [
               { label: "All Services", path: "/services-info" },
               { label: "Request Document", path: "/services-info" },
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
                     <span className="sm:hidden block text-sm font-bold tracking-wide">BRGY. CULIAT</span>
                     <span className="font-semibold text-[10px] text-primary uppercase">
                        E-Services
                     </span>
                  </p>
               </Link>

               {/* Desktop Nav Links */}
               <div
                  className={`hidden lg:flex items-center gap-1 font-semibold relative`}
                  style={{ fontFamily: "'Cinzel', serif" }}
               >
                  {/* Home Dropdown */}
                  <div
                     className="relative pb-2"
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
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50">
                           {navDropdowns.home.items.map((item) => (
                              <button
                                 key={item.sectionId}
                                 onClick={() => scrollToSection(item.path, item.sectionId)}
                                 className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                 {item.label}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Services Dropdown */}
                  <div
                     className="relative pb-2"
                     onMouseEnter={() => setOpenDropdown("services")}
                     onMouseLeave={() => setOpenDropdown(null)}
                  >
                     <NavLink
                        to={user && user.roleCode === 74934 ? "/services" : "/services-info"}
                        className={({ isActive }) =>
                           `navlink text-sm transition flex items-center gap-1 px-2 py-1 ${isActive && "active"}`
                        }
                     >
                        Services
                        <ChevronDown className="w-3 h-3" />
                     </NavLink>
                     {openDropdown === "services" && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50">
                           {navDropdowns.services.items.map((item) => (
                              <NavLink
                                 key={item.label}
                                 to={item.path}
                                 className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                 {item.label}
                              </NavLink>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Committee Dropdown */}
                  <div
                     className="relative pb-2"
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
                        <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 overflow-hidden">
                           {navDropdowns.committee.items.map((item, idx) => (
                              <NavLink
                                 key={idx}
                                 to={item.path}
                                 className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors truncate"
                              >
                                 {item.label}
                              </NavLink>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* People — flat link */}
               <div className="pb-2">
                  <NavLink to="/personnel" className="navlink text-sm px-2 py-1">People</NavLink>
               </div>

               {/* Report — flat link (no dropdown) */}
               <div className="pb-2">
                  <NavLink to="/reports" className="navlink text-sm px-2 py-1">Report</NavLink>
               </div>
                  {/* About Dropdown */}
                  <div
                     className="relative pb-2"
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
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50">
                           {navDropdowns.about.items.map((item) => (
                              <button
                                 key={item.sectionId}
                                 onClick={() => scrollToSection(item.path, item.sectionId)}
                                 className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                 {item.label}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* User Menu / Login & Register */}
                  {user && user.roleCode === 74934 ? (
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
                  ) : (
                     <div className="flex items-center gap-2">
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
         {/* </div> */}

         {/* Mobile dropdown */}

         <div
            className={`mobile-menu-container absolute top-full w-full lg:hidden bg-light shadow-md px-4 space-y-4 font-medium transition-all duration-600 ${isOpen
               ? "max-h-[85vh] py-4 border-t border-text-color/30 overflow-y-auto"
               : "max-h-0 overflow-hidden"
               }
        `}
         >
            {user && user.roleCode === 74934 && (
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
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === "services" ? "rotate-180" : ""}`} />
               </button>
               {mobileDropdown === "services" && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/20">
                     {navDropdowns.services.items.map((item) => (
                        <NavLink
                           key={item.label}
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

            <NavLink
               to="/personnel"
               onClick={() => setIsOpen(false)}
               className="block mobile-navlink text-text-color hover:text-primary"
            >
               People
            </NavLink>

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

            {user && user.roleCode === 74934 ? (
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
