import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Users, ChevronRight, Loader2, UserCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const stripHtml = (html = "") =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const Committees = () => {
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommittees = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/committees`);
                if (response.data.success) {
                    setCommittees(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching committees:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCommittees();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner with Wavy Divider */}
            <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 pt-32 pb-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">Barangay Committees</h1>
                        <p className="text-white/90 max-w-2xl mx-auto">
                            Our specialized committees work tirelessly to ensure the welfare, safety, and
                            development of all residents in Barangay Culiat.
                        </p>
                    </motion.div>
                </div>

                {/* Wavy Banner SVG Divider */}
                <svg className="absolute bottom-0 left-0 w-full h-24 text-gray-50" viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0,50 Q 300,0 600,50 T 1200,50 L 1200,100 L 0,100 Z" fill="currentColor"/>
                </svg>
            </div>

            {/* Horizontal Line */}
            <div className="h-1 bg-gray-200"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 pb-16">

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : committees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {committees.map((committee) => (
                            <motion.div
                                key={committee._id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Users className="text-primary w-6 h-6" />
                                        </div>
                                        {committee.responsibilities?.length > 0 && (
                                            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                {committee.responsibilities.length} Responsibilities
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-text-color mb-2">{committee.name}</h3>
                                    {committee.nameEnglish && (
                                        <p className="text-sm text-gray-400 italic mb-3">{committee.nameEnglish}</p>
                                    )}
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                                        {stripHtml(committee.description) || "Dedicated to serving the community through specialized programs and initiatives."}
                                    </p>

                                    {committee.chairperson && (
                                        <div className="mb-4 p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-xs text-gray-600">
                                                Chairperson: <span className="font-semibold text-text-color">{committee.chairperson.firstName} {committee.chairperson.lastName}</span>
                                            </span>
                                        </div>
                                    )}

                                    <Link
                                        to={`/committee/${committee.slug}`}
                                        className="inline-flex items-center text-primary font-semibold hover:gap-2 transition-all"
                                    >
                                        Learn More <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">No committees found. Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Committees;
