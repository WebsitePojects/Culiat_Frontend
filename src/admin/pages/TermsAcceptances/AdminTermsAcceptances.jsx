import { useState, useEffect, useMemo } from "react";
import {
  FileSignature,
  Calendar,
  User,
  Eye,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Mail,
  Shield,
  FileText,
  Scale,
  Lock,
  ScrollText,
  UserCheck,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Full Terms & Conditions Content
const TERMS_AND_CONDITIONS = `
TERMS AND CONDITIONS OF USE
Barangay Culiat Online Services Portal
Last Updated: January 2026

1. ACCEPTANCE OF TERMS
By registering for an account and using the Barangay Culiat Online Services Portal ("the Portal"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.

2. ELIGIBILITY
2.1 You must be a legitimate resident of Barangay Culiat, Quezon City to register and use this Portal.
2.2 You must be at least 18 years of age or have parental/guardian consent.
2.3 You must provide accurate and truthful information during registration.

3. USER ACCOUNT
3.1 You are responsible for maintaining the confidentiality of your account credentials.
3.2 You agree to notify us immediately of any unauthorized use of your account.
3.3 One account per household member is permitted.

4. SERVICES PROVIDED
4.1 Online document requests (Barangay Clearance, Certificate of Residency, etc.)
4.2 Access to barangay announcements and updates
4.3 Online payment processing for barangay fees
4.4 Community reporting system
4.5 Profile management and verification

5. USER RESPONSIBILITIES
5.1 Provide accurate personal information
5.2 Keep your profile information updated
5.3 Use the services only for lawful purposes
5.4 Not attempt to hack, exploit, or compromise the system
5.5 Report any security vulnerabilities immediately

6. DOCUMENT REQUESTS
6.1 All document requests are subject to verification by barangay officials.
6.2 Processing times may vary depending on document type and volume.
6.3 Physical documents must be claimed at the Barangay Hall unless otherwise specified.
6.4 The barangay reserves the right to reject requests with incomplete or false information.

7. PAYMENT TERMS
7.1 All fees are in Philippine Pesos (PHP).
7.2 Payment processing is handled through secure third-party providers.
7.3 Refunds are subject to barangay policies and approval.
7.4 Keep payment receipts for your records.

8. INTELLECTUAL PROPERTY
8.1 All content, trademarks, and materials on this Portal are property of Barangay Culiat.
8.2 Unauthorized reproduction or distribution is prohibited.

9. LIMITATION OF LIABILITY
9.1 The Portal is provided "as is" without warranties of any kind.
9.2 We are not liable for any damages arising from your use of the Portal.
9.3 We do not guarantee uninterrupted or error-free service.

10. MODIFICATIONS
10.1 We reserve the right to modify these terms at any time.
10.2 Continued use after modifications constitutes acceptance of new terms.
10.3 Users will be notified of significant changes.

11. GOVERNING LAW
These Terms are governed by the laws of the Republic of the Philippines.

12. CONTACT
For questions about these Terms, contact the Barangay Culiat Administration Office.
`;

const PRIVACY_POLICY = `
PRIVACY POLICY
Barangay Culiat Online Services Portal
Last Updated: January 2026

1. INTRODUCTION
Barangay Culiat ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Online Services Portal.

2. INFORMATION WE COLLECT

2.1 Personal Information
- Full name (First, Middle, Last, Suffix)
- Date of birth and place of birth
- Gender and civil status
- Contact information (email, phone number, address)
- Government-issued identification numbers
- Employment information
- Profile photographs
- Digital signatures

2.2 Automatically Collected Information
- IP address and device information
- Browser type and version
- Access times and dates
- Pages visited and actions taken
- Location data (if permitted)

3. HOW WE USE YOUR INFORMATION

3.1 Primary Purposes
- Identity verification and authentication
- Processing document requests
- Facilitating barangay services
- Maintaining resident records
- Communication regarding services
- Security and fraud prevention

3.2 Secondary Purposes
- Service improvement and analytics
- Statistical analysis for barangay planning
- Compliance with legal obligations
- Emergency notifications

4. DATA PROTECTION MEASURES

4.1 Security Measures
- Encrypted data transmission (SSL/TLS)
- Secure database storage
- Access controls and authentication
- Regular security audits
- Employee training on data protection

4.2 Data Retention
- Active accounts: Data retained while account is active
- Inactive accounts: Retained for 5 years after last activity
- Document records: Retained as per government regulations

5. INFORMATION SHARING

5.1 We may share your information with:
- Barangay officials and staff for service delivery
- Government agencies as required by law
- Payment processors for transactions
- Service providers under strict confidentiality agreements

5.2 We will NOT:
- Sell your personal information to third parties
- Share data for commercial marketing purposes
- Disclose information without legal basis

6. YOUR RIGHTS UNDER THE DATA PRIVACY ACT OF 2012

6.1 You have the right to:
- Access your personal data
- Correct inaccurate information
- Request erasure of data (subject to legal requirements)
- Object to certain processing activities
- Data portability
- Lodge complaints with the National Privacy Commission

7. COOKIES AND TRACKING

7.1 We use cookies for:
- Session management
- Security purposes
- Service functionality
- Analytics (anonymized)

7.2 You can control cookies through your browser settings.

8. CHILDREN'S PRIVACY
We do not knowingly collect information from children under 13 without parental consent.

9. DATA BREACH NOTIFICATION
In the event of a data breach, we will:
- Notify affected individuals within 72 hours
- Report to the National Privacy Commission
- Take immediate remedial action

10. CHANGES TO THIS POLICY
We may update this Privacy Policy periodically. Users will be notified of significant changes.

11. DATA PROTECTION OFFICER
For privacy concerns, contact our Data Protection Officer at the Barangay Culiat Administration Office.

12. CONSENT
By registering and using this Portal, you consent to the collection, use, and processing of your personal information as described in this Privacy Policy.

13. LEGAL BASIS
This Privacy Policy is in accordance with:
- Republic Act No. 10173 (Data Privacy Act of 2012)
- National Privacy Commission Guidelines
- Local Government Code of the Philippines
`;

const AdminTermsAcceptances = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
  });

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchApprovedResidents();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchApprovedResidents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/terms/approved-residents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setResidents(response.data.data.residents);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Error fetching approved residents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate
  const filteredResidents = useMemo(() => {
    if (!searchTerm.trim()) return residents;
    const search = searchTerm.toLowerCase();
    return residents.filter(
      (r) =>
        r.firstName?.toLowerCase().includes(search) ||
        r.lastName?.toLowerCase().includes(search) ||
        r.email?.toLowerCase().includes(search)
    );
  }, [residents, searchTerm]);

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  const paginatedResidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResidents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResidents, currentPage, itemsPerPage]);

  const viewDetails = (resident) => {
    setSelectedResident(resident);
    setShowDetailModal(true);
  };

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Acceptance Date",
      "Terms Version",
      "Privacy Policy Accepted",
      "Digital Consent",
    ];
    const rows = residents.map((r) => [
      `${r.firstName || ""} ${r.lastName || ""}`,
      r.email || "",
      new Date(r.acceptedAt).toLocaleString(),
      "v1.0",
      "Yes",
      "Yes (Upon Registration)",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terms-privacy-acceptances-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Loading acceptance records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Terms & Privacy Acceptances
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Legal records of residents who accepted Terms & Conditions and Privacy Policy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTermsModal(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all"
            >
              <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Terms</span>
            </button>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/10 border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Privacy Policy</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg sm:rounded-xl transition-all shadow-lg"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={fetchApprovedResidents}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-white/25"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
          <div className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider truncate">
                  Total Accepted
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stats.thisMonth}</p>
                <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider truncate">
                  This Month
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stats.thisWeek}</p>
                <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider truncate">
                  This Week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Notice Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Legal Consent Records
            </h3>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              All residents listed below have digitally consented to the Terms & Conditions and Privacy
              Policy upon completing their registration. This consent was obtained through the mandatory
              acceptance checkbox during account creation, in compliance with the Data Privacy Act of
              2012 (RA 10173).
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {filteredResidents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Scale className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? "No Results Found" : "No Acceptance Records"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {searchTerm
              ? `No residents match "${searchTerm}"`
              : "There are currently no approved resident records."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Resident
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acceptance Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Terms
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Privacy
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedResidents.map((resident) => (
                    <tr
                      key={resident._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                            {resident.firstName?.charAt(0)}
                            {resident.lastName?.charAt(0)}
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {resident.firstName} {resident.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {resident.email}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(resident.acceptedAt).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="w-3 h-3" />
                          Accepted v1.0
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="w-3 h-3" />
                          Consented
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewDetails(resident)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="md:hidden grid grid-cols-1 gap-3"
          >
            {paginatedResidents.map((resident) => (
              <motion.div
                key={resident._id}
                variants={cardVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {resident.firstName?.charAt(0)}
                        {resident.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {resident.firstName} {resident.lastName}
                        </h3>
                        <span className="px-2 py-0.5 inline-flex text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {resident.roleName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{resident.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <span>{new Date(resident.acceptedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 inline-flex items-center gap-1 text-[10px] font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="w-3 h-3" />
                      Terms v1.0
                    </span>
                    <span className="px-2 py-1 inline-flex items-center gap-1 text-[10px] font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <Shield className="w-3 h-3" />
                      Privacy
                    </span>
                  </div>

                  <button
                    onClick={() => viewDetails(resident)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    View Acceptance Details
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.min(currentPage * itemsPerPage, filteredResidents.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {filteredResidents.length}
                </span>{" "}
                results
              </p>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedResident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden flex-shrink-0">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                        Consent Certificate
                      </h2>
                      <p className="text-blue-200 text-xs sm:text-sm truncate">
                        {selectedResident.firstName} {selectedResident.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* User Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Resident Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">
                        Full Name
                      </label>
                      <p className="text-blue-900 dark:text-blue-100 font-medium">
                        {selectedResident.firstName} {selectedResident.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">
                        Email Address
                      </label>
                      <p className="text-blue-900 dark:text-blue-100 truncate">
                        {selectedResident.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consent Details */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Legal Consent Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <label className="text-green-600 dark:text-green-300 font-medium text-[10px] sm:text-xs">
                        Consent Date
                      </label>
                      <p className="text-green-900 dark:text-green-100">
                        {new Date(selectedResident.acceptedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-green-600 dark:text-green-300 font-medium text-[10px] sm:text-xs">
                        Terms Version
                      </label>
                      <p className="text-green-900 dark:text-green-100 font-semibold">v1.0</p>
                    </div>
                  </div>
                </div>

                {/* Consent Confirmation */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Consent Acknowledgment
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Terms & Conditions Accepted
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          User agreed to all terms governing the use of Barangay Culiat Online Services
                          Portal.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Privacy Policy Consented
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          User consented to the collection, processing, and storage of personal data as
                          outlined in the Privacy Policy, in compliance with RA 10173.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Digital Consent Recorded
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          Consent was digitally captured during account registration with timestamp and
                          user authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Footer */}
                <div className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p>
                    This consent record is maintained in accordance with the Data Privacy Act of 2012
                    (Republic Act No. 10173) and National Privacy Commission guidelines.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden flex-shrink-0">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                        Terms & Conditions
                      </h2>
                      <p className="text-blue-200 text-xs sm:text-sm">Version 1.0 - January 2026</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                    {TERMS_AND_CONDITIONS}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden flex-shrink-0">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                        Privacy Policy
                      </h2>
                      <p className="text-blue-200 text-xs sm:text-sm">
                        Data Privacy Act of 2012 Compliant
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                    {PRIVACY_POLICY}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTermsAcceptances;
