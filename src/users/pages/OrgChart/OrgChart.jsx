import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  Loader2,
  Building2,
  Scale,
  Gavel,
  Shield,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const positionLabels = {
  barangay_captain: "Barangay Captain",
  barangay_kagawad: "Barangay Kagawad",
  sk_chairman: "SK Chairman",
  barangay_secretary: "Barangay Secretary",
  barangay_treasurer: "Barangay Treasurer",
  administrative_officer: "Administrative Officer",
  admin_officer_internal: "Admin Officer (Internal)",
  admin_officer_external: "Admin Officer (External)",
  executive_officer: "Executive Officer",
  deputy_officer: "Deputy Officer",
  other: "Staff",
};

/* ─────────── small reusable card ─────────── */
const PersonCard = ({ person, size = "md", highlight = false, accent = "primary" }) => {
  const sizeClasses = {
    lg: "w-36 h-36 sm:w-44 sm:h-44",
    md: "w-24 h-24 sm:w-28 sm:h-28",
    sm: "w-18 h-18 sm:w-22 sm:h-22",
  };

  const accentColors = {
    primary: "border-primary bg-primary",
    secondary: "border-secondary bg-secondary",
    amber: "border-amber-500 bg-amber-500",
    emerald: "border-emerald-600 bg-emerald-600",
    rose: "border-rose-500 bg-rose-500",
    blue: "border-blue-600 bg-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`flex flex-col items-center text-center group ${highlight ? "relative" : ""}`}
    >
      {highlight && (
        <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl -z-10" />
      )}
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden border-3 shadow-lg mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-105 ${accentColors[accent].split(" ")[0]}`}
      >
        {person.photo ? (
          <img
            src={person.photo}
            alt={`${person.firstName} ${person.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <User className="w-1/2 h-1/2 text-gray-300" />
          </div>
        )}
      </div>
      <div
        className={`inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white mb-1 ${accentColors[accent].split(" ")[1]}`}
      >
        {positionLabels[person.position] || person.position}
      </div>
      <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
        {person.firstName} {person.middleName ? `${person.middleName[0]}. ` : ""}
        {person.lastName}
      </h4>
      {person.committee && (
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 max-w-[140px] leading-tight">
          {person.committee}
        </p>
      )}
    </motion.div>
  );
};

/* ─────────── connector line SVG ─────────── */
const VerticalConnector = ({ height = 40 }) => (
  <div className="flex justify-center" style={{ height }}>
    <div className="w-0.5 h-full bg-gray-300" />
  </div>
);

const BranchConnector = () => (
  <div className="flex justify-center py-1">
    <svg width="20" height="24" viewBox="0 0 20 24" className="text-gray-300">
      <circle cx="10" cy="12" r="4" fill="currentColor" />
      <line x1="10" y1="0" x2="10" y2="8" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="16" x2="10" y2="24" stroke="currentColor" strokeWidth="2" />
    </svg>
  </div>
);

/* ─────────── branch section wrapper ─────────── */
const BranchSection = ({ title, icon: Icon, color, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colorMap = {
    primary: {
      bg: "bg-primary/5",
      border: "border-primary/20",
      title: "text-primary",
      iconBg: "bg-primary/10",
      headerBorder: "border-primary/30",
      stripe: "bg-primary",
    },
    secondary: {
      bg: "bg-secondary/5",
      border: "border-secondary/20",
      title: "text-secondary",
      iconBg: "bg-secondary/10",
      headerBorder: "border-secondary/30",
      stripe: "bg-secondary",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      title: "text-amber-700",
      iconBg: "bg-amber-100",
      headerBorder: "border-amber-300",
      stripe: "bg-amber-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      title: "text-emerald-700",
      iconBg: "bg-emerald-100",
      headerBorder: "border-emerald-300",
      stripe: "bg-emerald-600",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      title: "text-rose-700",
      iconBg: "bg-rose-100",
      headerBorder: "border-rose-300",
      stripe: "bg-rose-500",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: "text-blue-700",
      iconBg: "bg-blue-100",
      headerBorder: "border-blue-300",
      stripe: "bg-blue-600",
    },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden`}
    >
      {/* Color stripe */}
      <div className={`h-1 ${c.stripe}`} />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 ${c.headerBorder} border-b transition-colors hover:bg-white/50`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.title}`} />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold ${c.title}`}>{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className={`w-5 h-5 ${c.title}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${c.title}`} />
        )}
      </button>
      {isOpen && <div className="p-4 sm:p-6">{children}</div>}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   MAIN ORG-CHART COMPONENT
   ═══════════════════════════════════════════ */
const OrgChart = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/officials/personnel`);
        if (response.data.success) {
          setPersonnel(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching personnel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonnel();
  }, []);

  /* ── group people by roles / branches ── */
  const captain = personnel.find((p) => p.position === "barangay_captain");
  const secretary = personnel.find((p) => p.position === "barangay_secretary");
  const treasurer = personnel.find((p) => p.position === "barangay_treasurer");

  const legislative = personnel.filter(
    (p) => p.branch === "Legislative" && p.position === "barangay_kagawad"
  );
  const executive = personnel.filter(
    (p) =>
      p.branch === "Executive" &&
      !["barangay_captain", "barangay_secretary", "barangay_treasurer"].includes(p.position)
  );
  const administrative = personnel.filter((p) => p.branch === "Administrative");
  const judiciary = personnel.filter((p) => p.branch === "Lupong Tagapamayapa");
  const skCouncil = personnel.filter((p) => p.branch === "SK Council");

  /* ── SK chair from SK branch ── */
  const skChair = skCouncil.find((p) => p.position === "sk_chairman");
  const skMembers = skCouncil.filter((p) => p.position !== "sk_chairman");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-emerald-600 pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <nav className="flex items-center justify-center text-white/60 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="text-white font-semibold">ORGANIZATIONAL CHART</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Organizational Structure
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            The complete organizational hierarchy of Barangay Culiat — from leadership to every
            dedicated public servant.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading organizational data...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
          {/* ═══════ TOP LEADERSHIP ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 mb-8"
          >
            {/* Barangay Captain */}
            {captain && (
              <div className="flex flex-col items-center mb-6">
                <PersonCard person={captain} size="lg" highlight accent="primary" />
              </div>
            )}

            <VerticalConnector height={32} />

            {/* Secretary & Treasurer */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
              {secretary && <PersonCard person={secretary} size="md" accent="secondary" />}
              {treasurer && <PersonCard person={treasurer} size="md" accent="amber" />}
            </div>
          </motion.div>

          {/* ═══════ BRANCHES GRID ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* ── Legislative Branch ── */}
            <BranchSection title="Legislative Branch" icon={Gavel} color="primary">
              <p className="text-xs text-gray-500 mb-4">
                The Sangguniang Barangay — the legislative body composed of elected Kagawads who
                enact ordinances and resolutions for the barangay.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {legislative.map((person) => (
                  <PersonCard key={person._id} person={person} size="sm" accent="primary" />
                ))}
              </div>
              {legislative.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No legislative members found
                </p>
              )}
            </BranchSection>

            {/* ── Executive Branch ── */}
            <BranchSection title="Executive Branch" icon={Building2} color="secondary">
              <p className="text-xs text-gray-500 mb-4">
                The executive arm implements policies, manages daily operations, and oversees
                barangay programs and services.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {executive.map((person) => (
                  <PersonCard key={person._id} person={person} size="sm" accent="secondary" />
                ))}
              </div>
              {executive.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No executive members found
                </p>
              )}
            </BranchSection>

            {/* ── Judiciary / Lupong Tagapamayapa ── */}
            <BranchSection title="Judiciary Branch" icon={Scale} color="rose">
              <p className="text-xs text-gray-500 mb-4">
                The Lupong Tagapamayapa — the barangay justice system that mediates and settles
                disputes at the community level.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {judiciary.map((person) => (
                  <PersonCard key={person._id} person={person} size="sm" accent="rose" />
                ))}
              </div>
              {judiciary.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No judiciary members found
                </p>
              )}
            </BranchSection>
          </div>

          {/* ═══════ SK COUNCIL & ADMIN STAFF ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* ── SK Council ── */}
            <BranchSection title="Sangguniang Kabataan" icon={Users} color="blue">
              <p className="text-xs text-gray-500 mb-4">
                The youth council representing the interests and welfare of the Katipunan ng
                Kabataan in the barangay.
              </p>
              {skChair && (
                <div className="flex flex-col items-center mb-4">
                  <PersonCard person={skChair} size="md" accent="blue" />
                </div>
              )}
              {skMembers.length > 0 && (
                <>
                  <div className="border-t border-blue-200 my-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {skMembers.map((person) => (
                      <PersonCard key={person._id} person={person} size="sm" accent="blue" />
                    ))}
                  </div>
                </>
              )}
              {skCouncil.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No SK council members found
                </p>
              )}
            </BranchSection>

            {/* ── Administrative Staff ── */}
            <BranchSection title="Administrative Staff" icon={Shield} color="emerald">
              <p className="text-xs text-gray-500 mb-4">
                The administrative team providing essential support services, record management, and
                day-to-day operational assistance.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {administrative.map((person) => (
                  <PersonCard key={person._id} person={person} size="sm" accent="emerald" />
                ))}
              </div>
              {administrative.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No administrative staff found
                </p>
              )}
            </BranchSection>
          </div>

          {/* ═══════ CTA ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-gray-200 p-6 sm:p-8 text-center"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Want to know more about our team?
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-lg mx-auto">
              View detailed profiles, contact information, and committee assignments for all
              barangay personnel.
            </p>
            <Link
              to="/personnel"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              View All Personnel
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrgChart;
