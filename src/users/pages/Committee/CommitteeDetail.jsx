import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
    ChevronLeft,
    User,
    CheckCircle,
    Calendar,
    Image as ImageIcon,
    Loader2,
    Mail,
    Phone,
    X,
    Send,
    Users,
    Play
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

// Function to get display position name
const getDisplayPosition = (dbPosition) => {
    if (!dbPosition) return "Officer";
    const normalized = dbPosition.toLowerCase().replace(/\s+/g, "_");
    return positionMap[normalized] || dbPosition;
};

const getFullName = (person) => {
    if (!person) return "";
    return `${person.firstName || ""} ${person.lastName || ""}`.trim();
};

const stripHtml = (html = "") =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

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

    const structurePeople = useMemo(() => {
        if (!committee) return [];

        const people = [];
        const seen = new Set();

        const pushPerson = (person, roleLabel) => {
            if (!person?._id) return;
            if (seen.has(person._id)) return;
            seen.add(person._id);
            people.push({
                ...person,
                displayRole:
                    roleLabel ||
                    getDisplayPosition(person.committeeRole || person.position),
            });
        };

        pushPerson(committee.chairperson, "Chairperson");
        pushPerson(committee.coChairperson, "Co-Chairperson");
        (committee.members || []).forEach((member) => {
            pushPerson(
                member,
                getDisplayPosition(member.committeeRole || member.position)
            );
        });

        return people;
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
                setMessageForm(prev => ({
                    ...prev,
                    subject: "",
                    message: ""
                }));
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner */}
            <div className="bg-secondary pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <Link
                        to="/committee"
                        className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Committees
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{committee.name}</h1>
                    {committee.nameEnglish && (
                        <p className="text-xl text-white/70 italic mb-4">{committee.nameEnglish}</p>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description & Responsibilities */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                        >
                            <h2 className="text-2xl font-bold text-text-color mb-4">Tungkol sa Komite</h2>

                            <div
                                className="text-gray-600 leading-relaxed mb-5 prose prose-sm sm:prose max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        committee.description ||
                                        "<p>Ang komiteng ito ay nakatuon sa pagpapaunlad at pagpapanatili ng mga programa para sa Barangay Culiat.</p>",
                                }}
                            />

                            {committee.description2 && (
                                <div
                                    className="text-gray-600 leading-relaxed mb-8 prose prose-sm sm:prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: committee.description2 }}
                                />
                            )}

                            {committee.chairperson && (
                                <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 mb-1">
                                        Committee Chairperson
                                    </p>
                                    <h3 className="text-xl font-bold text-text-color">
                                        {getFullName(committee.chairperson)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {getDisplayPosition(committee.chairperson.position)}
                                    </p>
                                </div>
                            )}

                            {committee.responsibilities && committee.responsibilities.length > 0 && (
                                <>
                                    <h3 className="text-lg font-bold text-text-color mb-4 flex items-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                                        Mga Responsibilidad
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                                        {committee.responsibilities.map((resp, idx) => (
                                            <li key={idx} className="flex items-start text-sm">
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 shrink-0"></span>
                                                {resp}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </motion.div>

                        {/* Committee Structure */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold text-text-color">Committee Structure</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {structurePeople.map((person) => (
                                    <div key={person._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                                {person.photo ? (
                                                    <img src={person.photo} alt={getFullName(person)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-full h-full p-3 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">
                                                    {person.displayRole}
                                                </p>
                                                <h4 className="text-base font-bold text-text-color truncate">
                                                    {getFullName(person)}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {getDisplayPosition(person.position)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Accomplishments Bulletin */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold text-text-color">Accomplishments Bulletin</h2>

                            {/* Navigation for accomplishments of all committees */}
                            {allCommittees.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {allCommittees.map((item) => (
                                        <button
                                            key={item._id}
                                            onClick={() => setSelectedAccomplishmentCommitteeId(item._id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                                selectedAccomplishmentCommitteeId === item._id
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {accomplishmentsLoading ? (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            ) : accomplishments.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[140px]">
                                    {accomplishments.map((acc, idx) => {
                                        const cover = acc.images?.[0] || acc.image;
                                        const bigCard = idx % 5 === 0;
                                        return (
                                            <div
                                                key={acc._id || idx}
                                                className={`group relative rounded-2xl overflow-hidden bg-gray-200 border border-gray-100 ${
                                                    bigCard
                                                        ? "sm:col-span-2 sm:row-span-2"
                                                        : "sm:col-span-1 sm:row-span-1"
                                                }`}
                                            >
                                                {cover ? (
                                                    <img
                                                        src={cover}
                                                        alt={acc.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 flex flex-col justify-end">
                                                    <h5 className="text-white font-bold text-sm line-clamp-2 mb-1">
                                                        {acc.title}
                                                    </h5>
                                                    <p className="text-white/90 text-xs line-clamp-2 mb-2">
                                                        {stripHtml(acc.content || "")}
                                                    </p>
                                                    <div className="flex items-center justify-between text-white/80 text-[11px]">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(acc.eventDate || acc.createdAt).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                        {(acc.youtubeVideoId || acc.youtubeVideoUrl) && (
                                                            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                                                                <Play className="w-3 h-3" />
                                                                Video
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-500">
                                    No accomplishments found for this committee yet.
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Committee Team Quick List */}
                        {structurePeople.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <h3 className="text-lg font-bold text-text-color mb-4">Committee Personnel</h3>
                                <div className="space-y-4">
                                    {structurePeople.map((member) => (
                                        <div key={member._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                                {member.photo ? (
                                                    <img src={member.photo} alt={member.lastName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-full h-full p-2 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="text-sm font-bold text-gray-800 truncate">
                                                    {member.firstName} {member.lastName}
                                                </h5>
                                                <p className="text-[10px] text-primary font-semibold uppercase tracking-wider truncate">
                                                    {member.displayRole}
                                                </p>
                                                <div className="flex items-center text-[10px] text-gray-500 space-x-2">
                                                    {member.contactNumber && <span className="flex items-center"><Phone className="w-2.5 h-2.5 mr-0.5" /> {member.contactNumber}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Contact/Inquiry Widget */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-bold text-text-color mb-2">Have a question?</h3>
                            <p className="text-sm text-gray-600 mb-4">Contact us for more details about our programs.</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowMessageModal(true)}
                                    type="button"
                                    className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                                >
                                    <Mail className="w-4 h-4 mr-2" /> Message Committee
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative my-auto"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-text-color">Message Committee</h3>
                                <p className="text-sm text-gray-500">{committee.name}</p>
                            </div>
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={messageForm.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Juan"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={messageForm.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Dela Cruz"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={messageForm.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="juan@example.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={messageForm.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="09123456789"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    value={messageForm.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Inquiry about programs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows="4"
                                    maxLength="2000"
                                    value={messageForm.message}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="Tell us what you want to know..."
                                ></textarea>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400">{messageForm.message.length}/2000 characters</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {sending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CommitteeDetail;
