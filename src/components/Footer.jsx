import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Facebook } from "lucide-react";

const Footer = () => {
  const [barangayInfo, setBarangayInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchBarangayInfo();
  }, []);

  const fetchBarangayInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/barangay-info`);
      if (response.data.success) {
        setBarangayInfo(response.data.data);
      }
    } catch (error) {
      // Silently fail - not critical for footer display
    } finally {
      setLoading(false);
    }
  };

  // Default values if barangay info not loaded
  const siteInfo = {
    barangayName: barangayInfo?.barangayName || "Barangay Culiat",
    city: "Quezon City",
  };

  const contactInfo = {
    officeAddress: "467 Tandang Sora Ave, Quezon City, 1128 Metro Manila",
    phoneNumber: barangayInfo?.contactInfo?.phoneNumber || "+63 962-582-1531",
    mobileNumber: "856-722-60",
    emailAddress: barangayInfo?.contactInfo?.email || "brgy.culiat@yahoo.com",
    officeHours: "Monday - Friday, 8:00 AM - 5:00 PM",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d964.9469179112511!2d121.05602636955277!3d14.667987796511813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7475e1333fb%3A0xb01b3d6a168686a5!2sCuliat%20Barangay%20Hall!5e0!3m2!1sen!2sph!4v1760884990064!5m2!1sen!2sph",
    mapDirectionsUrl:
      "https://www.google.com/maps/place/Culiat+Barangay+Hall/@14.667987,121.05667,17z/data=!4m6!3m5!1s0x3397b7475e1333fb:0xb01b3d6a168686a5!8m2!3d14.6679865!4d121.0566701!16s%2Fg%2F11c3tsgbjt?hl=en&entry=ttu&g_ep=EgoyMDI1MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  };

  const socialMedia = {
    facebook: barangayInfo?.socialMedia?.facebook || "https://www.facebook.com/profile.php?id=100091344363854",
  };

  const navigate = useNavigate();

  // Default quick links with proper routes
  const defaultQuickLinks = [
    { title: "Online Services", url: "/services", isRoute: true },
    { title: "Report Incident", url: "/reports", isRoute: true },
    { title: "Announcements", url: "/announcements", isRoute: true },
    { title: "Achievements", url: "/achievements", isRoute: true },
    { title: "Committees", url: "/committee", isRoute: true },
    { title: "Personnel", url: "/personnel", isRoute: true },
    { title: "About Us", url: "/about", isRoute: true },
    { title: "Facebook Page", url: "https://www.facebook.com/profile.php?id=100091344363854", isRoute: false, isExternal: true },
    { title: "Terms & Conditions", url: "/legal#terms", isRoute: true },
    { title: "Privacy Policy", url: "/legal#privacy", isRoute: true },
    { title: "Contact Us", url: "/#contact", isRoute: false },
  ];

  const footer = {
    aboutText:
      "Serving our community with transparency, dedication, and excellence. Building a safer and unified Barangay Culiat for all residents.",
    copyrightText:
      "© 2026 Barangay Culiat | Managed by Barangay Culiat Information Office",
    poweredByText: "Prince IT Solutions",
    showQuickLinks: true,
    quickLinks: defaultQuickLinks,
    showMap: true,
  };

  return (
    <footer className="bg-emerald-800 text-white">
      {/* ─── Desktop / Tablet Layout (sm and above) ─── */}
      <div className="hidden sm:block py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 mb-8">
            {/* Barangay Info */}
            <div className="lg:col-span-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/images/logo/brgy-culiat-logo.png" alt={`${siteInfo.barangayName} Logo`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{siteInfo.barangayName?.toUpperCase()}</h3>
                  <p className="text-xs text-white/80">{siteInfo.city}</p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed mb-4">{footer.aboutText}</p>
              {socialMedia.facebook && (
                <div className="flex justify-center sm:justify-start space-x-3">
                  <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-4 text-center sm:text-left">
              <h4 className="font-bold text-lg mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-white/90 font-semibold text-sm">{siteInfo.barangayName?.toUpperCase()}</p>
                    <p className="text-white/90 text-sm">{contactInfo.officeAddress}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${contactInfo.emailAddress}`} className="text-white/90 hover:text-white transition-colors">{contactInfo.emailAddress}</a>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-white/90">{contactInfo.phoneNumber}</p>
                    {contactInfo.mobileNumber && <p className="text-white/90">{contactInfo.mobileNumber}</p>}
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white/90">{contactInfo.officeHours}</p>
                </div>
              </div>
            </div>

            {/* Location Map */}
            {footer.showMap && contactInfo.mapEmbedUrl && (
              <div className="lg:col-span-5 sm:col-span-2">
                <h4 className="font-bold text-lg mb-4 text-center sm:text-left">Location Map</h4>
                <div className="bg-white/10 rounded-lg overflow-hidden mb-3">
                  <iframe src={contactInfo.mapEmbedUrl} width="100%" height="180" allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade" title={`${siteInfo.barangayName} Location`}
                    className="w-full sm:h-[220px]" />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-white/90 text-center sm:text-left">Visit our barangay hall for in-person services and assistance.</p>
                  {contactInfo.mapDirectionsUrl && (
                    <a href={contactInfo.mapDirectionsUrl} target="_blank" rel="noopener noreferrer"
                      className="bg-white text-emerald-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2 w-full sm:w-auto justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Get Directions</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Bottom Bar */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="flex flex-col items-center md:items-start space-y-1">
                <p className="text-sm text-white/80 text-center md:text-left">{footer.copyrightText}</p>
                {footer.poweredByText && (
                  <div className="flex items-center space-x-2 text-xs text-white/60">
                    <span>Powered by</span>
                    <span className="font-bold text-white/80">{footer.poweredByText}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
                <Link to="/legal#terms" className="text-white/80 hover:text-white transition-colors">Terms & Conditions</Link>
                <Link to="/legal#privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link>
                <a href="https://www.facebook.com/profile.php?id=100091344363854" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Layout (below sm) ─── */}
      <div className="sm:hidden">
        {/* Brand section */}
        <div className="px-5 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md">
              <img src="/images/logo/brgy-culiat-logo.png" alt={`${siteInfo.barangayName} Logo`} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base leading-tight">{siteInfo.barangayName?.toUpperCase()}</h3>
              <p className="text-xs text-white/70">{siteInfo.city}</p>
            </div>
          </div>
          <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto mb-4">{footer.aboutText}</p>
          {/* Social icons */}
          <div className="flex justify-center gap-3">
            {socialMedia.facebook && (
              <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-white/15" />

        {/* Contact Us section */}
        <div className="px-5 py-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 text-center">Contact Us</h4>
          <div className="space-y-3">
            {/* Address */}
            <div className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/90">{siteInfo.barangayName?.toUpperCase()}</p>
                <p className="text-xs text-white/70 leading-snug mt-0.5">{contactInfo.officeAddress}</p>
              </div>
            </div>
            {/* Email */}
            <a href={`mailto:${contactInfo.emailAddress}`}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-white/80">{contactInfo.emailAddress}</span>
            </a>
            {/* Phone */}
            <div className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/80">{contactInfo.phoneNumber}</p>
                {contactInfo.mobileNumber && <p className="text-xs text-white/70 mt-0.5">{contactInfo.mobileNumber}</p>}
              </div>
            </div>
            {/* Hours */}
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-white/80">{contactInfo.officeHours}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-white/15" />

        {/* Map section */}
        {footer.showMap && contactInfo.mapEmbedUrl && (
          <div className="px-5 py-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 text-center">Location Map</h4>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-3">
              <iframe src={contactInfo.mapEmbedUrl} width="100%" height="200" allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title={`${siteInfo.barangayName} Location`} className="w-full block" />
            </div>
            <p className="text-xs text-white/70 text-center mb-3 leading-relaxed">
              Visit our barangay hall for in-person services and assistance.
            </p>
            {contactInfo.mapDirectionsUrl && (
              <a href={contactInfo.mapDirectionsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Directions
              </a>
            )}
          </div>
        )}

        {/* Mobile Bottom Bar */}
        <div className="border-t border-white/15 bg-emerald-900/40 px-5 py-5 text-center">
          <p className="text-[11px] text-white/70 leading-snug mb-1">{footer.copyrightText}</p>
          {footer.poweredByText && (
            <p className="text-[10px] text-white/50 mb-4">
              Powered by <span className="font-semibold text-white/70">{footer.poweredByText}</span>
            </p>
          )}
          <div className="flex items-center justify-center gap-1 text-[11px] text-white/60">
            <Link to="/legal#terms" className="hover:text-white transition-colors px-2 py-1">Terms & Conditions</Link>
            <span className="text-white/30">|</span>
            <Link to="/legal#privacy" className="hover:text-white transition-colors px-2 py-1">Privacy Policy</Link>
            <span className="text-white/30">|</span>
            <a href="https://www.facebook.com/profile.php?id=100091344363854" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors px-2 py-1">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;