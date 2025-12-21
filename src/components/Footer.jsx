import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Facebook } from "lucide-react";

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [barangayInfo, setBarangayInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSettings();
    fetchBarangayInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSettings(response.data.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchBarangayInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/barangay-info`);
      if (response.data.success) {
        setBarangayInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching barangay info:", error);
    } finally {
      setLoading(false);
    }
  };

  // Default values if settings not loaded
  const siteInfo = settings?.siteInfo || {
    barangayName: barangayInfo?.barangayName || "Barangay Culiat",
    city: "Quezon City",
  };

  const contactInfo = {
    officeAddress: barangayInfo?.address
      ? `${barangayInfo.address.street}, ${barangayInfo.address.municipality}, ${barangayInfo.address.province}`
      : settings?.contactInfo?.officeAddress || "467 Tandang Sora Ave, Quezon City, 1128 Metro Manila",
    phoneNumber: barangayInfo?.contactInfo?.phoneNumber || settings?.contactInfo?.phoneNumber || "+63 962-582-1531",
    mobileNumber: settings?.contactInfo?.mobileNumber || "856-722-60",
    emailAddress: barangayInfo?.contactInfo?.email || settings?.contactInfo?.emailAddress || "brgy.culiat@yahoo.com",
    officeHours: settings?.contactInfo?.officeHours || "Monday - Friday, 8:00 AM - 5:00 PM",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d964.9469179112511!2d121.05602636955277!3d14.667987796511813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7475e1333fb%3A0xb01b3d6a168686a5!2sCuliat%20Barangay%20Hall!5e0!3m2!1sen!2sph!4v1760884990064!5m2!1sen!2sph",
    mapDirectionsUrl:
      "https://www.google.com/maps/place/Culiat+Barangay+Hall/@14.667987,121.05667,17z/data=!4m6!3m5!1s0x3397b7475e1333fb:0xb01b3d6a168686a5!8m2!3d14.6679865!4d121.0566701!16s%2Fg%2F11c3tsgbjt?hl=en&entry=ttu&g_ep=EgoyMDI1MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  };

  const socialMedia = {
    facebook: barangayInfo?.socialMedia?.facebook || settings?.socialMedia?.facebook || "https://www.facebook.com/profile.php?id=100091344363854",
  };

  const navigate = useNavigate();

  // Default quick links with proper routes
  const defaultQuickLinks = [
    { title: "Online Services", url: "/services", isRoute: true },
    { title: "Report Incident", url: "/reports", isRoute: true },
    { title: "Announcements", url: "/announcements", isRoute: true },
    { title: "Achievements", url: "/achievements", isRoute: true },
    { title: "About Us", url: "/about", isRoute: true },
    { title: "Privacy Policy", url: "#privacy", isRoute: false },
    { title: "Terms of Service", url: "#terms", isRoute: false },
  ];

  const footer = settings?.footer || {
    aboutText:
      "Serving our community with transparency, dedication, and excellence. Building a safer and unified Barangay Culiat for all residents.",
    copyrightText:
      "© 2025 Barangay Culiat | Managed by Barangay Culiat Information Office",
    poweredByText: "Prince IT Solutions",
    showQuickLinks: true,
    quickLinks: defaultQuickLinks,
    showMap: true,
  };

  return (
    <footer className="bg-secondary text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-8">
          {/* Barangay Info - 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/images/logo/brgy-culiat-logo.png"
                  alt={`${siteInfo.barangayName} Logo`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {siteInfo.barangayName?.toUpperCase()}
                </h3>
                <p className="text-xs text-white/80">{siteInfo.city}</p>
              </div>
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              {footer.aboutText}
            </p>
            {socialMedia.facebook && (
              <div className="flex space-x-3">
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Visit our Facebook page"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                {socialMedia.twitter && (
                  <a
                    href={socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Visit our Twitter page"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {socialMedia.instagram && (
                  <a
                    href={socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Visit our Instagram page"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {socialMedia.youtube && (
                  <a
                    href={socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Visit our YouTube channel"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact Information - 4 columns */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-white/90 font-semibold">
                    {siteInfo.barangayName?.toUpperCase()}
                  </p>
                  <p className="text-white/90">{contactInfo.officeAddress}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href={`mailto:${contactInfo.emailAddress}`}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {contactInfo.emailAddress}
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="text-white/90">{contactInfo.phoneNumber}</p>
                  {contactInfo.mobileNumber && (
                    <p className="text-white/90">{contactInfo.mobileNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-white/90">{contactInfo.officeHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map - 5 columns */}
          {footer.showMap && contactInfo.mapEmbedUrl && (
            <div className="lg:col-span-5">
              <h4 className="font-bold text-lg mb-4">Location Map</h4>
              <div className="bg-white/10 rounded-lg overflow-hidden mb-3">
                <iframe
                  src={contactInfo.mapEmbedUrl}
                  width="100%"
                  height="220"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${siteInfo.barangayName} Location`}
                  className="w-full"
                ></iframe>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-white/90">
                  Visit our barangay hall for in-person services and assistance.
                </p>
                {contactInfo.mapDirectionsUrl && (
                  <a
                    href={contactInfo.mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-secondary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Get Directions</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col items-center md:items-start space-y-2">
              <p className="text-sm text-white/80 text-center md:text-left">
                {footer.copyrightText}
              </p>
              {footer.poweredByText && (
                <div className="flex items-center space-x-2 text-xs text-white/60">
                  <span>Powered by</span>
                  <span className="font-bold text-white/80">
                    {footer.poweredByText}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="/about"
                className="text-white/80 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/about"
                className="text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/about"
                className="text-white/80 hover:text-white transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
