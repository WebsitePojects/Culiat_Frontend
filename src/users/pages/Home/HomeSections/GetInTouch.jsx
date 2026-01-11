import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MapPin, Clock, FileText, Star, CheckCircle, AlertCircle, Loader, ExternalLink, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../tailadminsrc/components/ui/button/Button";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const GetInTouch = () => {
  const [contactInfo, setContactInfo] = useState({
    address: {
      street: "Barangay Hall, Culiat",
      municipality: "Quezon City",
      province: "Metro Manila",
      region: "Philippines"
    },
    contactInfo: {
      phoneNumber: "(02) 8123-4567",
      email: "barangay@culiat.gov.ph"
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: ""
    }
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    rating: 0,
    privacyAccepted: false,
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchBarangayInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/barangay-info`);
        if (response.data.success) {
          setContactInfo(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching barangay info:", error);
      }
    };
    fetchBarangayInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();    if (submitting) return; // Prevent duplicate submissions    setSubmitStatus({ type: "", message: "" });

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    if (!formData.privacyAccepted) {
      setSubmitStatus({ type: "error", message: "Please accept the privacy policy to continue." });
      return;
    }

    if (formData.rating === 0) {
      setSubmitStatus({ type: "error", message: "Please provide a star rating for your experience." });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_URL}/api/contact-messages`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating,
        category: "feedback",
      });

      if (response.data.success) {
        setSubmitStatus({ type: "success", message: response.data.message || "Thank you for your feedback! We'll get back to you soon." });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
          rating: 0,
          privacyAccepted: false,
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to submit feedback. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return "Very Poor";
      case 2: return "Poor";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "Rate your experience";
    }
  };

  return (
    <section className="py-10 sm:py-16 px-4 bg-background text-foreground" id="contact">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Get in Touch</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Visit our office, call our hotlines, or reach out online. We're here
            to serve you
            <br className="hidden sm:block" />
            with dedication and transparency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Contact Information</h3>

            <div className="space-y-4 sm:space-y-6">
              {/* Address */}
              <motion.div
                variants={fadeUp}
                custom={0.1}
                className="flex items-center space-x-3 sm:space-x-4 hover:translate-y-[-3px] transition-transform duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center text-text-color-light justify-center shrink-0 shadow-sm">
                  <MapPin size={20} className="sm:hidden" />
                  <MapPin size={24} className="hidden sm:block" />
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-foreground text-sm sm:text-base">
                    Address
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {"467 Tandang Sora Ave"}, {"Quezon City"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {"1128 Metro Manila"}, {"Philippines"}
                  </p>
                </div>
              </motion.div>

              {/* Phone Numbers */}
              <motion.div
                variants={fadeUp}
                custom={0.2}
                className="flex items-center space-x-3 sm:space-x-4 hover:translate-y-[-3px] transition-transform duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center text-text-color-light justify-center shrink-0 shadow-sm">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
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
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-foreground text-sm sm:text-base">
                    Phone Numbers
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Main Line: {contactInfo.contactInfo?.phoneNumber || "(02) 8123-4567"}
                  </p>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                variants={fadeUp}
                custom={0.3}
                className="flex items-center space-x-3 sm:space-x-4 hover:translate-y-[-3px] transition-transform duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center text-text-color-light justify-center shrink-0 shadow-sm">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
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
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-foreground text-sm sm:text-base">Email</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {contactInfo.contactInfo?.email || "info@barangayculiat.gov.ph"}
                  </p>
                </div>
              </motion.div>

              {/* Office Hours */}
              <motion.div
                variants={fadeUp}
                custom={0.4}
                className="flex items-center space-x-3 sm:space-x-4 hover:translate-y-[-3px] transition-transform duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center text-text-color-light justify-center shrink-0 shadow-sm">
                  <Clock size={20} className="sm:hidden" />
                  <Clock size={24} className="hidden sm:block" />
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5 sm:mb-1 text-foreground text-sm sm:text-base">
                    Office Hours
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Monday - Friday: 8:00 AM - 5:00 PM
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Saturday: 9:00 AM - 12:00 PM
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Quick Links */}
            <motion.div variants={fadeUp} custom={0.5} className="mt-8">
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=100091344363854"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  <Facebook size={16} className="text-secondary" />
                  <span>Facebook Page</span>
                </a>
                <Link
                  to="/legal#privacy"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  <FileText size={16} className="text-secondary" />
                  <span>Privacy Policy</span>
                </Link>
                <Link
                  to="/legal#terms"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  <FileText size={16} className="text-secondary" />
                  <span>Terms & Conditions</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  <FileText size={16} className="text-secondary" />
                  <span>About Us</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Send us a Message Form */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.6}
            className="bg-card border border-text-secondary/30 rounded-lg p-8 shadow-md bg-light"
          >
            <h3 className="text-xl font-bold mb-6">Send us a Message</h3>

            {/* Status Messages */}
            {submitStatus.message && (
              <div
                className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                  submitStatus.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{submitStatus.message}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-2 border border-text-secondary/30 rounded-lg focus:ring focus:ring-secondary outline-none transition-all bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-2 border border-text-secondary/30 rounded-lg focus:ring focus:ring-secondary outline-none transition-all bg-background"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-secondary">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-text-secondary/30 rounded-lg focus:ring focus:ring-secondary outline-none transition-all bg-background"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject <span className="text-secondary">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-text-secondary/30 rounded-lg focus:ring focus:ring-secondary bg-background outline-none transition-all"
                >
                  <option value="">Select a subject</option>
                  <option value="Document Request">Document Request</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rate Your Experience <span className="text-secondary">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoveredStar || formData.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getRatingLabel(hoveredStar || formData.rating)}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message <span className="text-secondary">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-2 border border-text-secondary/30 rounded-lg focus:ring focus:ring-secondary outline-none transition-all bg-background resize-none"
                ></textarea>
              </div>

              {/* Privacy Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-secondary border-border rounded focus:ring-secondary"
                />
                <label
                  htmlFor="privacy"
                  className="text-sm text-muted-foreground"
                >
                  I agree to the{" "}
                  <a href="/legal#privacy" className="text-secondary hover:underline">
                    privacy policy
                  </a>{" "}
                  and{" "}
                  <a href="/legal#terms" className="text-secondary hover:underline">
                    terms of service
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={submitting}
                className="w-full font-medium transition-all duration-200"
                startIcon={
                  submitting ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )
                }
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
