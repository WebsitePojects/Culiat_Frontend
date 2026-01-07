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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16 sm:pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary via-secondary/95 to-secondary/90 text-white">
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
                      ? "bg-secondary text-white shadow-lg shadow-secondary/25"
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
      <div className="bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5 dark:from-secondary/10 dark:via-secondary/20 dark:to-secondary/10 border-t border-gray-200 dark:border-gray-700">
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
                className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors text-sm sm:text-base"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>brgy.culiat@yahoo.com</span>
              </a>
              <a
                href="tel:+639625821531"
                className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors text-sm sm:text-base"
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
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you register or use our services, we may collect personal information including but not limited to: full name, date of birth, address, contact number, email address, and government-issued IDs for verification purposes.",
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our platform, including pages visited, features used, timestamps, and device information to improve our services.",
        },
        {
          subtitle: "Document Requests",
          text: "When you request barangay documents, we collect and store the relevant information needed to process your request, including supporting documents you may upload.",
        },
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "To process your requests for barangay documents, verify your identity, and provide you with the services you request.",
        },
        {
          subtitle: "Communication",
          text: "To send you important updates about your requests, announcements, and notifications relevant to barangay services and community activities.",
        },
        {
          subtitle: "Improvement",
          text: "To analyze usage patterns and improve our platform's functionality, user experience, and service quality.",
        },
      ],
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        {
          subtitle: "Government Agencies",
          text: "We may share your information with relevant government agencies when required by law or for the purpose of verifying your identity and processing official documents.",
        },
        {
          subtitle: "Service Providers",
          text: "We may engage trusted third-party service providers to assist in operating our platform. These providers are bound by confidentiality agreements.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required to do so by law or in response to valid requests by public authorities.",
        },
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        {
          subtitle: "Protection Measures",
          text: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        },
        {
          subtitle: "Data Encryption",
          text: "All sensitive data transmitted through our platform is encrypted using industry-standard SSL/TLS protocols.",
        },
        {
          subtitle: "Access Control",
          text: "Access to personal information is restricted to authorized personnel who need it to perform their duties.",
        },
      ],
    },
    {
      icon: CheckCircle,
      title: "Your Rights",
      content: [
        {
          subtitle: "Access & Correction",
          text: "You have the right to access, correct, or update your personal information at any time through your account settings or by contacting us.",
        },
        {
          subtitle: "Data Deletion",
          text: "You may request the deletion of your personal data, subject to legal retention requirements and ongoing service needs.",
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of receiving non-essential communications from us while still receiving important service-related notifications.",
        },
      ],
    },
  ];

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
        <span>Last Updated: January 7, 2026</span>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Privacy Policy Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
          Barangay Culiat Management System ("we," "us," or "our") is committed
          to protecting your privacy. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use
          our online services platform. By using our services, you agree to the
          collection and use of information in accordance with this policy.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2.5 sm:p-3 bg-secondary/10 rounded-xl sm:rounded-2xl flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
                {section.title}
              </h3>
            </div>
            <div className="space-y-4 sm:space-y-6 pl-0 sm:pl-16">
              {section.content.map((item, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2 text-sm sm:text-base">
                    {item.subtitle}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Data Retention */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-blue-500/10 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Data Retention
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              We retain your personal information only for as long as necessary
              to fulfill the purposes for which it was collected, including to
              satisfy any legal, accounting, or reporting requirements. For
              document requests, we maintain records as required by Philippine
              government regulations and barangay record-keeping requirements.
            </p>
          </div>
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
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. You are advised to
              review this Privacy Policy periodically for any changes.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Terms & Conditions Component
const TermsConditions = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content:
        "By accessing and using the Barangay Culiat Management System, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.",
    },
    {
      icon: Users,
      title: "User Registration",
      content: [
        "You must be a resident of Barangay Culiat or have legitimate business with the barangay to register for an account.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "All information provided during registration must be accurate, current, and complete.",
        "Your account may be subject to verification by barangay officials before full access is granted.",
        "You must notify us immediately of any unauthorized use of your account.",
      ],
    },
    {
      icon: FileText,
      title: "Document Request Services",
      content: [
        "Document requests are subject to verification and approval by authorized barangay personnel.",
        "Processing times may vary depending on the type of document and verification requirements.",
        "Fees for document requests are as prescribed by the barangay and must be paid before document release.",
        "The barangay reserves the right to reject requests that do not meet the requirements.",
        "Digital copies of documents are for reference only; official copies must be claimed in person.",
      ],
    },
    {
      icon: AlertCircle,
      title: "Prohibited Activities",
      content: [
        "Providing false or misleading information in your registration or document requests.",
        "Attempting to access other users' accounts or personal information.",
        "Using the platform for any illegal or unauthorized purpose.",
        "Interfering with or disrupting the platform's security features.",
        "Uploading malicious software, viruses, or harmful code.",
        "Impersonating another person or entity.",
      ],
    },
    {
      icon: Shield,
      title: "Intellectual Property",
      content:
        "All content, features, and functionality of this platform, including but not limited to text, graphics, logos, icons, and software, are the property of Barangay Culiat or its licensors and are protected by intellectual property laws.",
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content:
        "The Barangay Culiat Management System and its administrators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform. We do not guarantee that the platform will be available at all times or that it will be free from errors.",
    },
  ];

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
        <span>Last Updated: January 7, 2026</span>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Terms & Conditions Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
          Welcome to the Barangay Culiat Management System. These Terms and
          Conditions govern your use of our online platform and services. Please
          read these terms carefully before using our services. Your continued
          use of the platform constitutes your acceptance of these terms.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2.5 sm:p-3 bg-secondary/10 rounded-xl sm:rounded-2xl flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-1">
                {section.title}
              </h3>
            </div>
            <div className="pl-0 sm:pl-16">
              {Array.isArray(section.content) ? (
                <ul className="space-y-2 sm:space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                  {section.content}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Governing Law */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-green-100 dark:border-green-800">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-green-500/10 rounded-xl sm:rounded-2xl flex-shrink-0">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Governing Law
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              These Terms and Conditions shall be governed by and construed in
              accordance with the laws of the Republic of the Philippines. Any
              disputes arising from these terms shall be subject to the
              exclusive jurisdiction of the courts of Quezon City.
            </p>
          </div>
        </div>
      </div>

      {/* Termination */}
      <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-red-100 dark:border-red-800">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-red-500/10 rounded-xl sm:rounded-2xl flex-shrink-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Account Termination
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              We reserve the right to terminate or suspend your account and
              access to our services immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation
              if you breach these Terms and Conditions. Upon termination, your
              right to use the platform will immediately cease.
            </p>
          </div>
        </div>
      </div>

      {/* Contact for Terms */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Questions About These Terms?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
          If you have any questions about these Terms and Conditions, please
          contact the Barangay Culiat office:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              467 Tandang Sora Ave, Quezon City
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              brgy.culiat@yahoo.com
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LegalPage;
