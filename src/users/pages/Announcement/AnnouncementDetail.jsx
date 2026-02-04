import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Tag, Loader2, Eye, Share2, Megaphone, ChevronLeft, ChevronRight, X, ZoomIn, Image, Download, Facebook, Twitter, Link2, User, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Generate a persistent visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
};

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Image gallery states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      setError(null);
      const visitorId = getVisitorId();
      console.log('Fetching announcement with slug/id:', slug);
      const response = await axios.get(`${API_URL}/api/announcements/${slug}`, {
        headers: {
          'X-Visitor-Id': visitorId
        }
      });
      console.log('Announcement response:', response.data);
      if (response.data.success) {
        setAnnouncement(response.data.data);
      } else {
        setError("Announcement not found");
      }
    } catch (err) {
      console.error("Error fetching announcement:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Announcement not found");
    } finally {
      setLoading(false);
    }
  };

  // Get all images (support both images array and legacy image field)
  const getAnnouncementImages = useCallback(() => {
    if (!announcement) return [];
    if (announcement.images?.length > 0) {
      return announcement.images;
    }
    if (announcement.image) {
      return [announcement.image];
    }
    return [];
  }, [announcement]);

  // Image gallery handlers
  const openImageGallery = useCallback((index = 0) => {
    setCurrentImageIndex(index);
    setImageGalleryOpen(true);
  }, []);

  const closeImageGallery = useCallback(() => {
    setImageGalleryOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    const images = getAnnouncementImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  }, [getAnnouncementImages]);

  const prevImage = useCallback(() => {
    const images = getAnnouncementImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  }, [getAnnouncementImages]);

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageGalleryOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeImageGallery();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageGalleryOpen, nextImage, prevImage, closeImageGallery]);

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
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(announcement?.title)}`, '_blank');
    setShowShareMenu(false);
  };

  // Download image function
  const downloadImage = async (imageUrl, index = 0) => {
    try {
      setDownloadingImage(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = `${announcement?.title?.replace(/[^a-z0-9]/gi, '_') || 'announcement'}_${index + 1}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    } finally {
      setDownloadingImage(false);
    }
  };

  // Get author full name for SEO
  const getAuthorName = () => {
    if (!announcement?.publishedBy) return 'Barangay Culiat';
    return `${announcement.publishedBy.firstName || ''} ${announcement.publishedBy.lastName || ''}`.trim() || 'Barangay Culiat';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
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
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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
      {/* SEO Meta Tags with Structured Data */}
      {announcement && (
        <Helmet>
          <title>{announcement.title} | Barangay Culiat Announcements</title>
          <meta name="description" content={announcement.content?.substring(0, 160)} />
          <meta name="author" content={getAuthorName()} />
          <meta property="og:title" content={announcement.title} />
          <meta property="og:description" content={announcement.content?.substring(0, 160)} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          {getAnnouncementImages()[0] && <meta property="og:image" content={getAnnouncementImages()[0]} />}
          <meta property="article:published_time" content={announcement.createdAt} />
          <meta property="article:author" content={getAuthorName()} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={announcement.title} />
          <meta name="twitter:description" content={announcement.content?.substring(0, 160)} />
          {getAnnouncementImages()[0] && <meta name="twitter:image" content={getAnnouncementImages()[0]} />}
          {/* Structured Data for Search Engines */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": announcement.title,
              "description": announcement.content?.substring(0, 160),
              "image": getAnnouncementImages(),
              "datePublished": announcement.publishDate || announcement.createdAt,
              "dateModified": announcement.updatedAt || announcement.createdAt,
              "author": {
                "@type": "Person",
                "name": getAuthorName()
              },
              "publisher": {
                "@type": "Organization",
                "name": "Barangay Culiat",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${window.location.origin}/logo.png`
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
              }
            })}
          </script>
        </Helmet>
      )}

      {/* Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 overflow-hidden">
        {getAnnouncementImages().length > 0 ? (
          <>
            <img
              src={getAnnouncementImages()[0]}
              alt={announcement.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openImageGallery(0)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {/* View Gallery Button - Show if multiple images */}
            {getAnnouncementImages().length > 1 && (
              <button
                onClick={() => openImageGallery(0)}
                className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-900 hover:bg-white transition-colors shadow-lg"
              >
                <Image className="w-4 h-4" />
                {getAnnouncementImages().length} Photos
              </button>
            )}
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
          <span className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full shadow-lg uppercase tracking-wide">
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
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">{formatDate(announcement.eventDate || announcement.createdAt)}</span>
              </div>
              
              {announcement.location && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">{announcement.location}</span>
                </div>
              )}

              {announcement.views > 0 && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">{announcement.views} views</span>
                </div>
              )}

              <button
                onClick={handleShare}
                className="relative flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors ml-auto"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              {/* Share Menu Dropdown */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 min-w-[160px]"
                  >
                    <button
                      onClick={copyToClipboard}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Link2 className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={shareToFacebook}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Facebook className="w-4 h-4 text-emerald-600" />
                      Facebook
                    </button>
                    <button
                      onClick={shareToTwitter}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Twitter className="w-4 h-4 text-sky-500" />
                      Twitter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>

            {/* YouTube Video Section */}
            {announcement.youtubeVideoUrl && announcement.youtubeVideoId && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Featured Video</h4>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${announcement.youtubeVideoId}`}
                    title={announcement.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Image Gallery Thumbnails */}
            {getAnnouncementImages().length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Photos ({getAnnouncementImages().length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {getAnnouncementImages().map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => openImageGallery(idx)}
                      className="relative group aspect-square rounded-xl overflow-hidden"
                    >
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {announcement.hashtags && announcement.hashtags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {announcement.hashtags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-emerald-600 hover:text-emerald-700 cursor-pointer text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Published By - SEO Optimized */}
            {announcement.publishedBy && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Published by</p>
                    <p className="text-sm font-semibold text-gray-900" itemProp="author" itemScope itemType="https://schema.org/Person">
                      <span itemProp="name">{announcement.publishedBy.firstName} {announcement.publishedBy.lastName}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Back Link Bottom */}
        <div className="text-center mt-8">
          <Link
            to="/announcements"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            View All Announcements
          </Link>
        </div>
      </div>

      {/* Full Screen Image Gallery */}
      <AnimatePresence>
        {imageGalleryOpen && getAnnouncementImages().length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
            onClick={closeImageGallery}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between px-4">
              {/* Image Counter */}
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full">
                {currentImageIndex + 1} / {getAnnouncementImages().length}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Download Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); downloadImage(getAnnouncementImages()[currentImageIndex], currentImageIndex); }}
                  disabled={downloadingImage}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                  title="Download Image"
                >
                  {downloadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
                
                {/* Share Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={closeImageGallery}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center p-4 pt-20 pb-24"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getAnnouncementImages()[currentImageIndex]}
                alt=""
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>

            {/* Navigation Buttons */}
            {getAnnouncementImages().length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Bottom Bar with Thumbnails */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent">
              {getAnnouncementImages().length > 1 && (
                <div
                  className="flex items-center justify-center gap-2 p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getAnnouncementImages().map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                        idx === currentImageIndex
                          ? "ring-2 ring-white scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Download Current Image Button */}
              <div className="flex justify-center pb-4">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadImage(getAnnouncementImages()[currentImageIndex], currentImageIndex); }}
                  disabled={downloadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {downloadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Image
                </button>
              </div>
            </div>

            {/* Keyboard Hint */}
            <div className="absolute bottom-4 right-4 text-white/50 text-xs hidden md:block">
              ← → Navigate • ESC Close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AnnouncementDetail;
