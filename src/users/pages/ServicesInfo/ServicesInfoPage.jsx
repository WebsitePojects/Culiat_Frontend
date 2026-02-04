import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Home,
  BadgeCheck,
  Building2,
  HandCoins,
  Hammer,
  AlertCircle,
  HeartHandshake,
  Shield,
  Heart,
  X,
  Clock,
  Phone,
  MapPin,
  DollarSign,
  CheckCircle2,
  User,
  Upload,
  CreditCard,
  Download,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Smartphone,
  FileCheck,
  ClipboardCheck,
  Printer,
  ExternalLink,
  Info,
  Sparkles,
  UserCheck,
  Receipt,
  Eye,
  Lock,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Icon mapping
const iconMap = {
  FileText,
  Home,
  BadgeCheck,
  Building2,
  HandCoins,
  Hammer,
  AlertCircle,
  HeartHandshake,
  Shield,
  Heart,
};

// Category labels
const categoryLabels = {
  document_issuance: "Document Issuance",
  permits_clearance: "Permits & Clearance",
  health_services: "Health Services",
  social_services: "Social Services",
  emergency_services: "Emergency Services",
  public_safety: "Public Safety",
  other: "Other Services",
};

// Process steps for the guide
const processSteps = [
  {
    step: 1,
    title: "Create an Account",
    description: "Register with your valid ID and personal information. Complete the verification process to access online services.",
    icon: UserCheck,
    color: "from-blue-500 to-blue-600",
    details: [
      "Provide personal details (name, birthdate, address)",
      "Upload valid government ID for verification",
      "Wait for admin approval (usually within 24-48 hours)",
      "Receive confirmation via email/SMS",
    ],
  },
  {
    step: 2,
    title: "Select Document Type",
    description: "Browse available services and select the document or certificate you need to request.",
    icon: FileCheck,
    color: "from-emerald-500 to-emerald-600",
    details: [
      "Choose from various certificates and permits",
      "View requirements and processing time",
      "Check applicable fees before proceeding",
      "Fill out the purpose of request",
    ],
  },
  {
    step: 3,
    title: "Complete Application",
    description: "Review your personal information and upload any additional required documents.",
    icon: ClipboardCheck,
    color: "from-amber-500 to-amber-600",
    details: [
      "Verify pre-filled personal information",
      "Upload supporting documents if needed",
      "Add emergency contact information",
      "Review and confirm all details",
    ],
  },
  {
    step: 4,
    title: "Pay Online",
    description: "Complete payment through our secure online payment system using GCash, Maya, or other methods.",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
    details: [
      "View itemized fees and total amount",
      "Choose your preferred payment method",
      "Complete secure payment transaction",
      "Receive payment confirmation",
    ],
  },
  {
    step: 5,
    title: "Processing & Approval",
    description: "Your request is processed by barangay staff. Track the status through your dashboard.",
    icon: Clock,
    color: "from-cyan-500 to-cyan-600",
    details: [
      "Request goes through verification",
      "Admin reviews and processes document",
      "Receive notifications on status updates",
      "Estimated processing: 1-3 business days",
    ],
  },
  {
    step: 6,
    title: "Download & Verify",
    description: "Once approved, download your document with a unique QR code for authenticity verification.",
    icon: Download,
    color: "from-green-500 to-green-600",
    details: [
      "Download official document as DOCX",
      "Document includes QR code for verification",
      "Print or save digital copy",
    ],
  },
];

// Verification feature info
const verificationFeatures = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    description: "Every official document contains a unique QR code that can be scanned for instant verification.",
  },
  {
    icon: ShieldCheck,
    title: "Instant Validation",
    description: "The verification page confirms document authenticity, showing issue date and holder details.",
  },
  {
    icon: Lock,
    title: "Tamper-Proof",
    description: "Documents are digitally signed with unique tokens that cannot be forged or duplicated.",
  },
  {
    icon: Eye,
    title: "Public Access",
    description: "Anyone can verify document authenticity without needing an account or login credentials.",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function ServicesInfoPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services/active`);
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from services
  const categories = [...new Set(services.map((s) => s.category))];

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 py-16 sm:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Barangay Culiat Online Services</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Government Services
              <span className="block text-emerald-200 mt-2">Made Easy & Accessible</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Request official documents, certificates, and permits online. 
              Our digital platform provides fast, secure, and convenient government services 
              right from your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <User className="w-5 h-5" />
                Login to Request
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6" id="services-list">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Available Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our comprehensive list of barangay services. Click on any service 
              to view requirements, fees, and processing time.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Services Found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service) => {
                const Icon = iconMap[service.icon] || FileText;
                return (
                  <motion.div
                    key={service._id}
                    variants={fadeInUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedService(service)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                          {service.title}
                        </h3>
                        <span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-2">
                          {categoryLabels[service.category] || service.category}
                        </span>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      {service.fees > 0 ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>₱{service.fees.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-emerald-600 font-medium">Free</span>
                      )}
                      {service.processingTime && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{service.processingTime}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 bg-white" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Request Documents Online
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to request official barangay documents 
              from the comfort of your home.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-4"
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                  className="w-full p-6 flex items-center gap-4 text-left hover:bg-gray-100/50 transition-colors"
                >
                  {/* Step Number */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-emerald-600">Step {step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedStep === step.step ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedStep === step.step && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="bg-white rounded-xl p-5 border border-gray-100">
                          <ul className="space-y-3">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Placeholder Image */}
                        <div className="mt-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-48 flex items-center justify-center">
                          <div className="text-center">
                            <step.icon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-500">Step {step.step} Illustration</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Document Verification Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" id="verification">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Document Verification</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Verify Document Authenticity
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              All official documents issued by Barangay Culiat include a unique QR code 
              for instant verification. Anyone can verify the authenticity of our documents.
            </p>
          </motion.div>

          {/* Verification Features */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {verificationFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Verification Demo */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* QR Code Demo */}
              <div className="w-full lg:w-1/3 flex justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-4">Sample QR Code</p>
                </div>
              </div>
              {/* Instructions */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-4">How to Verify a Document</h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="text-white font-medium">Locate the QR Code</p>
                      <p className="text-gray-400 text-sm">Find the QR code printed on the official document</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="text-white font-medium">Scan with Your Phone</p>
                      <p className="text-gray-400 text-sm">Use your phone's camera or a QR scanner app</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="text-white font-medium">View Verification Results</p>
                      <p className="text-gray-400 text-sm">You'll be directed to a secure page showing document details and validity</p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6">
                  <Link
                    to="/verify"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Go to Verification Portal
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Create an account today and experience the convenience of online barangay services. 
              Your requests are processed quickly and securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Already have a pending request?{" "}
              <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                Track your request here
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 relative sticky top-0">
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {React.createElement(iconMap[selectedService.icon] || FileText, {
                      size: 28,
                      className: "text-white",
                    })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedService.title}
                    </h3>
                    <span className="text-emerald-100 text-sm">
                      {categoryLabels[selectedService.category] || selectedService.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Description
                  </h4>
                  <p className="text-gray-700">{selectedService.description}</p>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Fee</span>
                    </div>
                    <p className="font-bold text-gray-900">
                      {selectedService.fees > 0 ? `₱${selectedService.fees.toFixed(2)}` : "Free"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Processing Time</span>
                    </div>
                    <p className="font-bold text-gray-900">
                      {selectedService.processingTime || "1-3 days"}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                {selectedService.requirements?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {selectedService.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Office Info */}
                {(selectedService.officeInCharge || selectedService.contactNumber || selectedService.availableHours) && (
                  <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                    {selectedService.officeInCharge && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">{selectedService.officeInCharge}</span>
                      </div>
                    )}
                    {selectedService.contactNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">{selectedService.contactNumber}</span>
                      </div>
                    )}
                    {selectedService.availableHours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">{selectedService.availableHours}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Request This Document
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-center text-xs text-gray-500">
                  You need to login or create an account to request this service
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
