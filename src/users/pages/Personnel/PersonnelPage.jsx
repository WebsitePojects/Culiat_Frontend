import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

const PersonnelPage = () => {
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeBranch, setActiveBranch] = useState("All");

    const branches = ["All", "Executive", "Legislative", "Administrative", "Lupong Tagapamayapa", "SK Council"];

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
        const branchMatch = activeBranch === "All" || p.branch === activeBranch;
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPersonnel.map((person) => (
                            <motion.div
                                layout
                                key={person._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                            >
                                {/* Profile Photo Wrapper */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100 shrink-0">
                                    {person.photo ? (
                                        <img
                                            src={person.photo}
                                            alt={person.lastName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User className="w-1/2 h-1/2" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm border border-white">
                                            {person.branch}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="mb-4">
                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${person.position === 'barangay_captain' ? 'bg-amber-100 text-amber-700' :
                                                person.position.includes('kagawad') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {positionLabels[person.position] || 'Staff'}
                                        </span>
                                        <h3 className="text-lg font-bold text-text-color leading-tight">
                                            {person.firstName} {person.middleName ? `${person.middleName} ` : ""}{person.lastName}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-grow">
                                        {person.committeeRef ? (
                                            <Link
                                                to={`/committee/${person.committeeRef.slug}`}
                                                className="flex items-center text-xs text-primary font-semibold hover:underline"
                                            >
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                                {person.committeeRef.name}
                                            </Link>
                                        ) : person.committee && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                                                {person.committee}
                                            </div>
                                        )}

                                        {person.bio && (
                                            <p className="text-xs text-gray-500 line-clamp-3 italic">
                                                "{person.bio}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Contact Info Footer */}
                                    <div className="pt-4 border-t border-gray-50 space-y-2">
                                        {person.contactNumber && (
                                            <a
                                                href={`tel:${person.contactNumber}`}
                                                className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors"
                                            >
                                                <Phone className="w-3 h-3 mr-2" />
                                                {person.contactNumber}
                                            </a>
                                        )}
                                        {person.email && (
                                            <a
                                                href={`mailto:${person.email}`}
                                                className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors truncate"
                                                title={person.email}
                                            >
                                                <Mail className="w-3 h-3 mr-2" />
                                                {person.email}
                                            </a>
                                        )}
                                        {(person.officeHours || person.education) && (
                                            <div className="flex items-center space-x-3 mt-2">
                                                {person.officeHours && <Clock className="w-3 h-3 text-gray-400" title={`Hours: ${person.officeHours}`} />}
                                                {person.education && <GraduationCap className="w-3 h-3 text-gray-400" title={`Education: ${person.education}`} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
