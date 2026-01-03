import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Tag, Loader2, Eye, Share2, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncement();
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/announcements/${slug}`);
      if (response.data.success) {
        setAnnouncement(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching announcement:", err);
      setError("Announcement not found");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement?.title,
          text: announcement?.content?.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Announcement Not Found</h2>
          <p className="text-gray-500 mb-6">The announcement you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/announcements"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 overflow-hidden">
        {announcement.image ? (
          <>
            <img
              src={announcement.image}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className="w-32 h-32 text-white/20" />
          </div>
        )}
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/announcements"
            className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Link>
        </div>

        {/* Category Badge */}
        <div className="absolute top-6 right-6 z-10">
          <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg uppercase tracking-wide">
            {announcement.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {announcement.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{formatDate(announcement.eventDate || announcement.createdAt)}</span>
              </div>
              
              {announcement.location && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{announcement.location}</span>
                </div>
              )}

              {announcement.views > 0 && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{announcement.views} views</span>
                </div>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors ml-auto"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>

            {/* Hashtags */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium">
                  #KapitanaNanayBebangBernardino
                </span>
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium">
                  #MostChildFriendlyBarangay
                </span>
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium">
                  #KalidadsaSerbisyo
                </span>
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium">
                  #KalingaSaTao
                </span>
              </div>
            </div>

            {/* Published By */}
            {announcement.publishedBy && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Published by <span className="font-medium text-gray-700">{announcement.publishedBy.firstName} {announcement.publishedBy.lastName}</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Back Link Bottom */}
        <div className="text-center mt-8">
          <Link
            to="/announcements"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            View All Announcements
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementDetail;
