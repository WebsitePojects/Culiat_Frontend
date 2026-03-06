import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { sanitizeHTML } from "../../../utils/sanitize";
import {
    User,
    Image as ImageIcon,
    Loader2,
    Mail,
    Phone,
    X,
    Send,
    Play,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Position name mapping for display
const positionMap = {
    "barangay_captain": "Punong Barangay",
    "barangay_secretary": "Sekretaryo ng Barangay",
    "barangay_treasurer": "Dalubhasa sa Pinansyal",
    "kagawad": "Kagawad",
    "sk_chairman": "Punong SK",
    "sk_secretary": "Sekretaryo ng SK",
    "sk_treasurer": "Dalubhasa sa Pinansyal (SK)",
    "chairperson": "Pangulo",
    "co_chairperson": "Kapangulo",
    "secretary": "Sekretaryo",
    "treasurer": "Dalubhasa sa Pinansyal",
    "member": "Miyembro",
    "coordinator": "Koordinador"
};

const getDisplayPosition = (dbPosition) => {
    if (!dbPosition) return "Officer";
    const normalized = dbPosition.toLowerCase().replace(/\s+/g, "_");
    return positionMap[normalized] || dbPosition;
};

const getFullName = (person) => {
    if (!person) return "";
    const parts = [person.firstName, person.middleName, person.lastName].filter(Boolean);
    return parts.join(" ").trim();
};

const CommitteeDetail = () => {
    const { slug } = useParams();
    const [committee, setCommittee] = useState(null);
    const [allCommittees, setAllCommittees] = useState([]);
    const [selectedAccomplishmentCommitteeId, setSelectedAccomplishmentCommitteeId] = useState("");
    const [accomplishments, setAccomplishments] = useState([]);
    const [accomplishmentsLoading, setAccomplishmentsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Message Modal State
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [messageForm, setMessageForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        subject: "",
        message: ""
    });

    useEffect(() => {
        if (user) {
            setMessageForm(prev => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || ""
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchCommittee = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/committees/${slug}`);
                if (response.data.success) {
                    setCommittee(response.data.data);
                    setSelectedAccomplishmentCommitteeId(response.data.data._id);
                }
            } catch (error) {
                console.error("Error fetching committee details:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAllCommittees = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/committees`);
                if (response.data.success) {
                    setAllCommittees(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching committee list:", error);
            }
        };

        fetchCommittee();
        fetchAllCommittees();
    }, [slug]);

    useEffect(() => {
        const fetchAccomplishments = async () => {
            if (!selectedAccomplishmentCommitteeId) return;
            try {
                setAccomplishmentsLoading(true);
                const response = await axios.get(
                    `${API_URL}/api/committees/${selectedAccomplishmentCommitteeId}/accomplishments`
                );
                if (response.data.success) {
                    setAccomplishments(response.data.data || []);
                } else {
                    setAccomplishments([]);
                }
            } catch (error) {
                console.error("Error fetching accomplishments:", error);
                setAccomplishments([]);
            } finally {
                setAccomplishmentsLoading(false);
            }
        };

        fetchAccomplishments();
    }, [selectedAccomplishmentCommitteeId]);

    // Build people categorized by role
    const { leadership, coordinators } = useMemo(() => {
        if (!committee) return { leadership: [], coordinators: [] };

        const leaders = [];
        const coords = [];
        const seen = new Set();

        const addPerson = (person, roleLabel, isLeader) => {
            if (!person?._id) return;
            if (seen.has(person._id)) return;
            seen.add(person._id);
            const entry = {
                ...person,
                displayRole: roleLabel || getDisplayPosition(person.committeeRole || person.position),
            };
            if (isLeader) leaders.push(entry);
            else coords.push(entry);
        };

        addPerson(committee.chairperson, "Chairperson", true);
        addPerson(committee.coChairperson, "Co-Chairperson", true);

        (committee.members || []).forEach((member) => {
            const role = member.committeeRole || member.position;
            addPerson(member, getDisplayPosition(role), false);
        });

        return { leadership: leaders, coordinators: coords };
    }, [committee]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMessageForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const response = await axios.post(`${API_URL}/api/committee-messages`, {
                committeeId: committee._id,
                ...messageForm
            });
            if (response.data.success) {
                toast.success("Message sent successfully!");
                setShowMessageModal(false);
                setMessageForm(prev => ({ ...prev, subject: "", message: "" }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!committee) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h2 className="text-2xl font-bold">Committee not found</h2>
                <Link to="/committee" className="text-primary hover:underline mt-4 inline-block">
                    Back to all committees
                </Link>
            </div>
        );
    }

    const committeeName = committee.name;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner */}
            <div className="bg-secondary pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 italic font-serif">
                        {committeeName}
                    </h1>
                    {/* Breadcrumb */}
                    <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                        <Link to="/" className="hover:text-white transition-colors uppercase tracking-wider text-xs">Home</Link>
                        <span>/</span>
                        <Link to="/committee" className="hover:text-white transition-colors uppercase tracking-wider text-xs">Committee</Link>
                        <span>/</span>
                        <span className="text-accent uppercase tracking-wider text-xs font-medium">{committeeName}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

                {/* ─── About Section: Description + Responsibilities ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <div className="w-16 h-1 bg-accent mb-6"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
                        {committeeName} Committee
                    </h2>

                    {committee.description && (
                        <div
                            className="text-gray-600 leading-relaxed mb-6 prose prose-sm sm:prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(committee.description) }}
                        />
                    )}
                    {committee.description2 && (
                        <div
                            className="text-gray-600 leading-relaxed mb-8 prose prose-sm sm:prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(committee.description2) }}
                        />
                    )}

                    {/* Responsibilities — 2-column layout */}
                    {committee.responsibilities?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 mt-8">
                            {committee.responsibilities.map((resp, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"></span>
                                    <p className="text-gray-600 text-[15px] leading-relaxed">{resp}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chairperson attribution */}
                    {committee.chairperson && (
                        <div className="mt-10">
                            <p className="text-lg font-bold text-secondary">
                                -- {getFullName(committee.chairperson)}
                            </p>
                            <p className="text-accent text-sm font-semibold uppercase tracking-wider mt-1">
                                Chairperson
                            </p>
                        </div>
                    )}
                </motion.section>

                {/* ─── Committee Structure Section ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-20"
                >
                    <div className="w-16 h-1 bg-accent mx-auto mb-6"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-4">
                        Committee Structure
                    </h2>
                    <p className="text-gray-500 text-center mb-12 text-sm max-w-xl mx-auto">
                        Meet the dedicated officials leading the {committeeName} Committee
                    </p>

                    {/* ── Leadership Spotlight ── */}
                    {leadership.length > 0 && (
                        <div className="mb-14">
                            {/* Featured Chairperson Card */}
                            {leadership[0] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.15 }}
                                    className="relative max-w-2xl mx-auto mb-8"
                                >
                                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-shadow duration-300">
                                        {/* Accent top stripe */}
                                        <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-accent"></div>
                                        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
                                            {/* Photo */}
                                            <div className="relative shrink-0">
                                                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-lg ring-4 ring-secondary/10 group-hover:ring-secondary/25 transition-all">
                                                    {leadership[0].photo ? (
                                                        <img src={leadership[0].photo} alt={getFullName(leadership[0])} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                                                            <User className="w-14 h-14 text-secondary/40" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Role badge on photo */}
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                                    {leadership[0].displayRole}
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="text-center sm:text-left flex-1">
                                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                                    {getFullName(leadership[0])}
                                                </h3>
                                                <p className="text-secondary font-semibold text-sm mb-3">{committeeName} Committee</p>
                                                {(leadership[0].contactNumber || leadership[0].email) && (
                                                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                                        {leadership[0].contactNumber && (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                                                <Phone className="w-3 h-3 text-primary" />
                                                                {leadership[0].contactNumber}
                                                            </span>
                                                        )}
                                                        {leadership[0].email && (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                                                <Mail className="w-3 h-3 text-primary" />
                                                                {leadership[0].email}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Co-Chairperson (if exists) — smaller companion card */}
                            {leadership[1] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.25 }}
                                    className="max-w-md mx-auto"
                                >
                                    <div className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group hover:shadow-lg transition-shadow duration-300">
                                        <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
                                        <div className="flex items-center gap-4 p-4 sm:p-5">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all shrink-0">
                                                {leadership[1].photo ? (
                                                    <img src={leadership[1].photo} alt={getFullName(leadership[1])} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                        <User className="w-8 h-8 text-primary/40" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-gray-900">{getFullName(leadership[1])}</h4>
                                                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-white bg-primary px-2.5 py-0.5 rounded-full">
                                                    {leadership[1].displayRole}
                                                </span>
                                                {leadership[1].contactNumber && (
                                                    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-primary" />
                                                        {leadership[1].contactNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* ── Connecting visual element ── */}
                    {coordinators.length > 0 && leadership.length > 0 && (
                        <div className="flex items-center justify-center my-10">
                            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-secondary/20"></div>
                            <div className="mx-4 w-3 h-3 rotate-45 border-2 border-secondary/30 bg-white"></div>
                            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-secondary/20"></div>
                        </div>
                    )}

                    {/* ── Members / Coordinators Grid ── */}
                    {coordinators.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-secondary text-center mb-8">
                                Members & Coordinators
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                {coordinators.map((person, idx) => (
                                    <motion.div
                                        key={person._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                            {/* Photo area */}
                                            <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                                {person.photo ? (
                                                    <img
                                                        src={person.photo}
                                                        alt={getFullName(person)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                        <User className="w-10 h-10 text-gray-300" />
                                                    </div>
                                                )}
                                                {/* Role chip overlay */}
                                                <div className="absolute bottom-2 left-2">
                                                    <span className="bg-white/90 backdrop-blur-sm text-secondary text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                                                        {person.displayRole}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="p-3 sm:p-4">
                                                <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">{getFullName(person)}</h4>
                                                {person.contactNumber && (
                                                    <p className="text-gray-400 text-[11px] mt-1.5 flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-primary/60" />
                                                        {person.contactNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Button */}
                    <div className="text-center mt-14">
                        <button
                            onClick={() => setShowMessageModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                            <Mail className="w-4 h-4" />
                            Contact this Committee
                        </button>
                    </div>
                </motion.section>

                {/* ─── Accomplishments Bulletin Section ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="w-16 h-1 bg-accent mx-auto mb-6"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-3">
                        Accomplishments Bulletin
                    </h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">
                        {committeeName} Committee past events and activities
                    </p>

                    {/* Committee filter tabs */}
                    {allCommittees.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                            {allCommittees.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() => setSelectedAccomplishmentCommitteeId(item._id)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                                        selectedAccomplishmentCommitteeId === item._id
                                            ? "bg-secondary text-white border-secondary shadow-md"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Accomplishment Cards — Blog grid with date badges */}
                    {accomplishmentsLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : accomplishments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {accomplishments.map((acc) => {
                                const cover = acc.images?.[0] || acc.image;
                                const date = new Date(acc.eventDate || acc.createdAt);
                                const day = date.getDate().toString().padStart(2, "0");
                                const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

                                return (
                                    <Link
                                        to={`/announcements/${acc.slug || acc._id}`}
                                        key={acc._id}
                                        className="group relative rounded-xl overflow-hidden bg-gray-200 aspect-[4/3] block shadow-sm hover:shadow-lg transition-all"
                                    >
                                        {cover ? (
                                            <img
                                                src={cover}
                                                alt={acc.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-2.5 py-1.5 text-center leading-tight">
                                            <span className="block text-lg font-bold text-secondary">{day}</span>
                                            <span className="block text-[10px] font-semibold text-gray-500 uppercase">{month}</span>
                                        </div>

                                        {/* Video badge */}
                                        {(acc.youtubeVideoId || acc.youtubeVideoUrl) && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-medium text-secondary">
                                                <Play className="w-3 h-3" /> Video
                                            </div>
                                        )}

                                        {/* Title overlay */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16">
                                            <h4 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-2">
                                                {acc.title}
                                            </h4>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No accomplishments found for this committee yet.</p>
                        </div>
                    )}
                </motion.section>
            </div>

            {/* ─── Message Modal ─── */}
            {showMessageModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative my-auto"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-text-color">Message Committee</h3>
                                <p className="text-sm text-gray-500">{committee.name}</p>
                            </div>
                            <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                                    <input type="text" name="firstName" required value={messageForm.firstName} onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Juan" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <input type="text" name="lastName" required value={messageForm.lastName} onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Dela Cruz" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                    <input type="email" name="email" required value={messageForm.email} onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="juan@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone (Optional)</label>
                                    <input type="tel" name="phoneNumber" value={messageForm.phoneNumber} onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="09123456789" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                                <input type="text" name="subject" required value={messageForm.subject} onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Inquiry about programs" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                                <textarea name="message" required rows="4" maxLength="2000" value={messageForm.message} onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="Tell us what you want to know..."></textarea>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400">{messageForm.message.length}/2000 characters</span>
                                </div>
                            </div>
                            <button type="submit" disabled={sending}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CommitteeDetail;
