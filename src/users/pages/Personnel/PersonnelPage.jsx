import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Search,
    Phone,
    Mail,
    Clock,
    GraduationCap,
    ChevronRight,
    User,
    Filter,
    Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const positionLabels = {
    barangay_captain: 'Barangay Captain',
    barangay_kagawad: 'Barangay Kagawad',
    sk_chairman: 'SK Chairman',
    barangay_secretary: 'Barangay Secretary',
    barangay_treasurer: 'Barangay Treasurer',
    administrative_officer: 'Administrative Officer',
    admin_officer_internal: 'Admin Officer (Internal)',
    admin_officer_external: 'Admin Officer (External)',
    executive_officer: 'Executive Officer',
    deputy_officer: 'Deputy Officer',
    other: 'Staff',
};

const normalizeBranch = (branch) => {
    if (!branch) return "";
    if (branch === "Sangguniang Kabataan") return "SK Council";
    if (branch === "Judiciary" || branch === "Lupong Tagapamayapa" || branch === "The Judiciary") return "The Judiciary";
    if (branch === "BPSO") return "Barangay Public Safety Officers (BPSO)";
    return branch;
};

const getBranchLabel = (branch) => {
    const normalized = normalizeBranch(branch);
    if (normalized === "The Judiciary") return "The Judiciary";
    return normalized;
};

const getPersonBranches = (person) => {
    const raw = Array.isArray(person.branches) && person.branches.length > 0
        ? person.branches
        : [person.branch].filter(Boolean);
    return [...new Set(raw.map(normalizeBranch).filter(Boolean))];
};

const PersonnelPage = () => {
    const [searchParams] = useSearchParams();
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const branchFromUrl = searchParams.get("branch") || "All";
    const [activeBranch, setActiveBranch] = useState(branchFromUrl);

    // Sync activeBranch when URL changes
    useEffect(() => {
        const b = searchParams.get("branch") || "All";
        setActiveBranch(b);
    }, [searchParams]);

    const branches = [
        "All",
        "Executive",
        "Legislative",
        "Administrative",
        "The Judiciary",
        "SK Council",
        "Barangay Public Safety Officers (BPSO)",
    ];

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

    const filteredPersonnel = personnel.filter(p => {
        const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const personBranches = getPersonBranches(p);
        const branchMatch = activeBranch === "All" || personBranches.includes(normalizeBranch(activeBranch));
        return nameMatch && branchMatch;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner */}
            <div className="bg-secondary pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <nav className="flex items-center text-white/60 text-sm mb-4 justify-center md:justify-start">
                                <Link to="/" className="hover:text-white">HOME</Link>
                                <ChevronRight className="w-3 h-3 mx-2" />
                                <span className="text-white">PERSONNEL</span>
                            </nav>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Barangay Personnel</h1>
                            <p className="text-xl text-white/70">Meet the dedicated public servants of Barangay Culiat</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
                {/* Filter & Search Bar */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-12 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Branch Tabs */}
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
                            <div className="p-1 bg-gray-100 rounded-xl flex">
                                {branches.map(branch => (
                                    <button
                                        key={branch}
                                        onClick={() => setActiveBranch(branch)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeBranch === branch
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {branch}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full lg:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading personnel data...</p>
                    </div>
                ) : filteredPersonnel.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {filteredPersonnel.map((person) => {
                                const personBranches = getPersonBranches(person);
                                const branchLabel = (Array.isArray(person.branches) && person.branches.length > 0)
                                    ? getBranchLabel(personBranches[0])
                                    : getBranchLabel(person.branch);

                                return (
                                    <motion.div
                                        layout
                                        key={person._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group h-full relative"
                                    >
                                        {/* Branch Badge (Absolute) */}
                                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block">
                                            <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                                                {branchLabel}
                                            </span>
                                        </div>

                                        {/* Profile Photo - Matching OrgChart Fix Sizes */}
                                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md mb-3 sm:mb-4 shrink-0 transition-transform duration-300 group-hover:scale-105 bg-gray-100 flex items-center justify-center relative">
                                            {person.photo ? (
                                                <img
                                                    src={person.photo}
                                                    alt={person.lastName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-1/2 h-1/2 text-gray-300" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-grow items-center w-full">
                                            <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-2 ${
                                                person.position === 'barangay_captain' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                person.position.includes('kagawad') ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                                'bg-primary/10 text-primary border-primary/20'
                                            } border`}>
                                                {positionLabels[person.position] || 'Staff'}
                                            </span>
                                            
                                            <h3 className="text-sm sm:text-base font-bold text-text-color leading-tight mb-2">
                                                {person.firstName} {person.middleName ? `${person.middleName[0]}. ` : ""}{person.lastName}
                                            </h3>

                                            <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 flex-grow w-full">
                                                {/* Committee Information - Kept as requested */}
                                                {(Array.isArray(person.committeeAssignments) && person.committeeAssignments.length > 0) ? (
                                                    <div className="space-y-1">
                                                        {person.committeeAssignments.slice(0, 2).map((assignment, index) => {
                                                            const committee = assignment?.committeeRef;
                                                            const role = assignment?.committeeRole;
                                                            const roleLabel = role
                                                                ? role.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
                                                                : "Member";

                                                            if (committee?.slug) {
                                                                return (
                                                                    <Link
                                                                        key={`${committee._id || committee.slug}-${index}`}
                                                                        to={`/committee/${committee.slug}`}
                                                                        className="flex justify-center items-center text-[10px] sm:text-xs text-primary font-medium hover:underline text-center"
                                                                    >
                                                                        {committee.name} {role ? `(${roleLabel})` : ""}
                                                                    </Link>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                ) : person.committeeRef ? (
                                                    <Link
                                                        to={`/committee/${person.committeeRef.slug}`}
                                                        className="text-[10px] sm:text-xs text-primary font-medium hover:underline"
                                                    >
                                                        {person.committeeRef.name}
                                                    </Link>
                                                ) : person.committee && (
                                                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                                        {person.committee}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Info Footer (Condensed) */}
                                            <div className="w-full pt-3 sm:pt-4 border-t border-gray-100 flex flex-col items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                                                {person.contactNumber && (
                                                    <a href={`tel:${person.contactNumber}`} className="flex items-center text-gray-500 hover:text-primary transition-colors">
                                                        <Phone className="w-3 h-3 mr-1.5" />
                                                        {person.contactNumber}
                                                    </a>
                                                )}
                                                {person.email && (
                                                    <a href={`mailto:${person.email}`} className="flex items-center text-gray-500 hover:text-primary transition-colors truncate max-w-full" title={person.email}>
                                                        <Mail className="w-3 h-3 mr-1.5 shrink-0" />
                                                        <span className="truncate">{person.email}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200"
                    >
                        <Filter className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No personnel found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                        <button
                            onClick={() => { setSearchTerm(""); setActiveBranch("All"); }}
                            className="mt-6 text-primary font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PersonnelPage;
