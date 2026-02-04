import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileText,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  Users,
  Database,
  Bell,
  Scale,
} from "lucide-react";

const LegalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("privacy");

  // Determine initial tab from URL hash
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "terms" || hash === "privacy") {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Update URL hash when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/legal#${tab}`, { replace: true });
  };

  const tabs = [
    {
      id: "privacy",
      label: "Privacy Policy",
      icon: Shield,
      description: "How we collect, use, and protect your data",
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      icon: FileText,
      description: "Rules and guidelines for using our services",
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16 sm:pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <Scale className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Legal Information
                </h1>
                <p className="text-white/80 text-sm sm:text-base mt-1">
                  Barangay Culiat Management System
                </p>
              </div>
            </div>
            <p className="text-white/70 max-w-2xl text-sm sm:text-base">
              Please review our privacy policy and terms of service to
              understand how we handle your information and what rules govern
              the use of our services.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-4 py-3 sm:py-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <AnimatePresence mode="wait">
          {activeTab === "privacy" ? (
            <PrivacyPolicy key="privacy" />
          ) : (
            <TermsConditions key="terms" />
          )}
        </AnimatePresence>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 dark:from-emerald-900/10 dark:via-emerald-900/20 dark:to-emerald-900/10 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h3
              variants={fadeInUp}
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4"
            >
              Have Questions?
            </motion.h3>
            <motion.p
              variants={fadeInUp}
              className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base"
            >
              If you have any questions about our Privacy Policy or Terms &
              Conditions, please don't hesitate to contact us.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
              <a
                href="mailto:brgy.culiat@yahoo.com"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors text-sm sm:text-base"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>brgy.culiat@yahoo.com</span>
              </a>
              <a
                href="tel:+639625821531"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors text-sm sm:text-base"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>+63 962-582-1531</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Privacy Policy Component
const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Calendar className="w-4 h-4" />
        <span>Last Updated: February 1, 2026</span>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Privacy Policy Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
          Barangay Culiat ("we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you register and use our barangay services.
        </p>
      </div>

      {/* Information We Collect */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            Information We Collect
          </h3>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-600 p-4 rounded-r-lg">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Personal identification information (Name, Date of Birth, Gender)</li>
            <li>Contact information (Phone number, Email address)</li>
            <li>Address and residency information</li>
            <li>Government-issued identification documents</li>
            <li>Emergency contact information</li>
            <li>Cookies and tracking technologies for functionality</li>
            <li>IP address and device information for security</li>
            <li>Usage data to improve our services</li>
          </ul>
        </div>
      </div>

      {/* Cookies & Tracking */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            Cookies & Tracking Technologies
          </h3>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded-r-lg">
          <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
            We use cookies to enhance your experience and maintain security:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
            <li><strong>Preference Cookies:</strong> Remember your settings</li>
            <li><strong>Analytics Cookies:</strong> Help us understand site usage</li>
            <li><strong>Security Cookies:</strong> Log IP addresses to prevent fraud and abuse</li>
          </ul>
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
            You can control cookies through your browser settings. Disabling essential cookies may limit functionality.
          </p>
        </div>
      </div>

      {/* How We Use Your Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            How We Use Your Information
          </h3>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 p-4 rounded-r-lg">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Process registration and verification</li>
            <li>Provide access to barangay services</li>
            <li>Send important announcements</li>
            <li>Maintain records for government reporting</li>
            <li>Improve services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>
      </div>

      {/* Data Security */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Data Security
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              We implement appropriate technical measures to protect your personal information against unauthorized access, alteration, or destruction.
            </p>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Data Retention
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              We retain your personal information for as long as your account is active or as needed to provide services and comply with legal obligations.
            </p>
          </div>
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Data Sharing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              We do not sell or rent your personal information. We may share data with government agencies as required by law, or with service providers under strict confidentiality agreements.
            </p>
          </div>
        </div>
      </div>

      {/* Your Rights */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            Your Rights (Data Privacy Act 2012)
          </h3>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 rounded-r-lg">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Right to access your personal information</li>
            <li>Right to request correction of inaccurate data</li>
            <li>Right to erasure/deletion of your data</li>
            <li>Right to object to processing</li>
          </ul>
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
            Contact our Data Protection Officer at <strong>bautista.vergel.agripa@gmail.com</strong> to exercise these rights.
          </p>
        </div>
      </div>

      {/* Updates Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-amber-100 dark:border-amber-800">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-amber-500/10 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Policy Updates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Terms & Conditions Component
const TermsConditions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Calendar className="w-4 h-4" />
        <span>Last Updated: February 1, 2026</span>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Terms of Service Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
          By registering for Barangay Culiat services, you agree to comply with and be bound by the following terms and conditions.
        </p>
      </div>

      {/* Account Registration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            Account Registration
          </h3>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 p-4 rounded-r-lg">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>You must be a resident or stakeholder of Barangay Culiat</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for account confidentiality</li>
            <li>Registration subject to admin verification</li>
            <li>False information may result in account suspension</li>
          </ul>
        </div>
      </div>

      {/* User Responsibilities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            User Responsibilities
          </h3>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 rounded-r-lg">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Provide truthful and accurate information</li>
            <li>Update your profile when changes occur</li>
            <li>Use services in compliance with applicable laws</li>
            <li>Respect privacy and rights of other users</li>
            <li>Report suspicious activity or security concerns</li>
          </ul>
        </div>
      </div>

      {/* Account Restrictions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            Account Restrictions
          </h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
          <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">Your account may be suspended if you:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Provide false or misleading information</li>
            <li>Violate any terms or conditions</li>
            <li>Engage in fraudulent or illegal activities</li>
            <li>Abuse or misuse barangay services</li>
          </ul>
        </div>
      </div>

      {/* Service Availability */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Service Availability
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              While we strive to provide uninterrupted service, we do not guarantee availability at all times. We may suspend services for maintenance or updates.
            </p>
          </div>
        </div>
      </div>

      {/* Changes to Terms */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 sm:p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Changes to Terms
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              We reserve the right to modify these terms at any time. Significant changes will be communicated through email or system notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-700 rounded-xl sm:rounded-2xl flex-shrink-0">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
            Contact Us
          </h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Barangay Culiat, Quezon City</strong></p>
          <p><strong>Email:</strong> brgy.culiat@yahoo.com</p>
          <p><strong>Cellphone:</strong> 0962-582-1531</p>
          <p><strong>Telephone:</strong> 856722-60</p>
          <p><strong>Office Hours:</strong> Monday-Friday, 8:00 AM - 5:00 PM</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LegalPage;
