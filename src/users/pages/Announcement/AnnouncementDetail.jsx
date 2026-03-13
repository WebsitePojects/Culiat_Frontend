import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Tag, Loader2, Eye, Share2, Megaphone, ChevronLeft, ChevronRight, X, ZoomIn, Image, Download, User, Youtube, Facebook, Twitter, Link2 } from "lucide-react";
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
  const [allAnnouncements, setAllAnnouncements] = useState([]);

  // Image gallery states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
    fetchAllAnnouncements();
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      setError(null);
      const visitorId = getVisitorId();
      const response = await axios.get(`${API_URL}/api/announcements/${slug}`, {
        headers: { 'X-Visitor-Id': visitorId }
      });
      if (response.data.success) {
        setAnnouncement(response.data.data);
      } else {
        setError("Announcement not found");
      }
    } catch (err) {
      console.error("Error fetching announcement:", err);
      setError(err.response?.data?.message || "Announcement not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/announcements`);
      if (response.data.success) {
        setAllAnnouncements(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching all announcements:", err);
    }
  };

  // Get neighboring announcements for previous/next navigation
  const { prevAnnouncement, nextAnnouncement } = (() => {
    if (!announcement || allAnnouncements.length === 0) return { prevAnnouncement: null, nextAnnouncement: null };
    const currentIndex = allAnnouncements.findIndex(a => a._id === announcement._id || a.slug === slug);
    if (currentIndex === -1) return { prevAnnouncement: null, nextAnnouncement: null };
    return {
      nextAnnouncement: currentIndex > 0 ? allAnnouncements[currentIndex - 1] : null,
      prevAnnouncement: currentIndex < allAnnouncements.length - 1 ? allAnnouncements[currentIndex + 1] : null,
    };
  })();

  // Get all images (support both images array and legacy image field)
  const getAnnouncementImages = useCallback(() => {
    if (!announcement) return [];
    if (announcement.images?.length > 0) return announcement.images;
    if (announcement.image) return [announcement.image];
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
      setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
    }
  }, [getAnnouncementImages]);

  const prevImage = useCallback(() => {
    const images = getAnnouncementImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
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
      window.open(imageUrl, '_blank');
    } finally {
      setDownloadingImage(false);
    }
  };

  // Get author full name for SEO
  const getAuthorName = () => {
    if (!announcement?.publishedBy) return 'Barangay Culiat';
    if (announcement?.publishedByDisplayName) return announcement.publishedByDisplayName;
    return `${announcement.publishedBy.firstName || ''} ${announcement.publishedBy.lastName || ''}`.trim() || 'Barangay Culiat';
  };

  // Build image grid layout based on number of images (skip hero image at index 0)
  const renderImageGrid = () => {
    const allImages = getAnnouncementImages();
    if (allImages.length <= 1) return null;

    // Skip the first image since it's already the hero
    const gridImages = allImages.slice(1);

    const renderGridItem = (img, gridIdx) => {
      const realIndex = gridIdx + 1; // offset by 1 because we skipped hero
      return (
        <div key={gridIdx} className="relative group cursor-pointer rounded-xl overflow-hidden" onClick={() => openImageGallery(realIndex)}>
          <img src={img} alt={`Photo ${realIndex + 1}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      );
    };

    if (gridImages.length === 1) {
      return (
        <div className="mb-8">
          <div className="relative group cursor-pointer rounded-xl overflow-hidden" onClick={() => openImageGallery(1)}>
            <img src={gridImages[0]} alt={announcement.title} className="w-full max-h-[500px] object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      );
    }

    if (gridImages.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {gridImages.map((img, idx) => (
            <div key={idx} className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/3]" onClick={() => openImageGallery(idx + 1)}>
              <img src={img} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (gridImages.length === 3) {
      return (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {gridImages.map((img, idx) => (
            <div key={idx} className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square" onClick={() => openImageGallery(idx + 1)}>
              <img src={img} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (gridImages.length <= 4) {
      return (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {gridImages.map((img, idx) => (
            <div key={idx} className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/3]" onClick={() => openImageGallery(idx + 1)}>
              <img src={img} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 5+ images: first row 3, second row 2, etc.
    const rows = [];
    let i = 0;
    let rowIndex = 0;
    while (i < gridImages.length) {
      const cols = rowIndex % 2 === 0 ? 3 : 2;
      const rowImages = gridImages.slice(i, i + cols);
      const startIdx = i; // capture current value for closure
      rows.push(
        <div key={rowIndex} className={`grid gap-3 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {rowImages.map((img, idx) => (
            <div key={startIdx + idx} className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/3]" onClick={() => openImageGallery(startIdx + idx + 1)}>
              <img src={img} alt={`Photo ${startIdx + idx + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      );
      i += cols;
      rowIndex++;
    }

    return <div className="space-y-3 mb-8">{rows}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
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
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Link>
        </div>
      </div>
    );
  }

  const images = getAnnouncementImages();
  const heroImage = images[0];
  const eventDate = new Date(announcement.eventDate || announcement.createdAt);

  return (
    <section className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      {announcement && (
        <Helmet>
          <title>{announcement.title} | Barangay Culiat Announcements</title>
          <meta name="description" content={announcement.content?.substring(0, 160)} />
          <meta name="author" content={getAuthorName()} />
          <meta property="og:title" content={announcement.title} />
          <meta property="og:description" content={announcement.content?.substring(0, 160)} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          {heroImage && <meta property="og:image" content={heroImage} />}
          <meta property="article:published_time" content={announcement.createdAt} />
          <meta property="article:author" content={getAuthorName()} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={announcement.title} />
          <meta name="twitter:description" content={announcement.content?.substring(0, 160)} />
          {heroImage && <meta name="twitter:image" content={heroImage} />}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": announcement.title,
              "description": announcement.content?.substring(0, 160),
              "image": images,
              "datePublished": announcement.publishDate || announcement.createdAt,
              "dateModified": announcement.updatedAt || announcement.createdAt,
              "author": { "@type": "Person", "name": getAuthorName() },
              "publisher": {
                "@type": "Organization",
                "name": "Barangay Culiat",
                "logo": { "@type": "ImageObject", "url": `${window.location.origin}/logo.png` }
              },
              "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
            })}
          </script>
        </Helmet>
      )}

      {/* Hero Banner */}
      <div className="bg-secondary pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 italic font-serif leading-tight">
            {announcement.title}
          </h1>
          {/* Published by */}
          {announcement.publishedBy && (
            <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
              <span>Posted by</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-white/90">
                {getAuthorName()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Article Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Featured Image with date badge */}
              {heroImage && (
                <div className="relative mb-8 rounded-xl overflow-hidden group cursor-pointer" onClick={() => openImageGallery(0)}>
                  <img
                    src={heroImage}
                    alt={announcement.title}
                    className="w-full max-h-[480px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-center leading-tight">
                    <span className="block text-xl font-bold text-secondary">
                      {eventDate.getDate().toString().padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] font-semibold text-gray-500 uppercase">
                      {eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                  {/* Photo count badge */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-900 shadow-md">
                      <Image className="w-3.5 h-3.5" />
                      {images.length} Photos
                    </div>
                  )}
                </div>
              )}

              {/* Meta info bar */}
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span>{formatDate(announcement.eventDate || announcement.createdAt)}</span>
                </div>
                {announcement.location && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{announcement.location}</span>
                  </div>
                )}
                {announcement.views > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Eye className="w-4 h-4 text-primary" />
                    <span>{announcement.views} views</span>
                  </div>
                )}
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  {announcement.category}
                </span>
              </div>

              {/* Article Text Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {announcement.content}
                </p>
              </div>

              {/* YouTube Video Section */}
              {announcement.youtubeVideoUrl && announcement.youtubeVideoId && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
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

              {/* Blog-style image gallery grid */}
              {images.length > 1 && renderImageGrid()}

              {/* Hashtags */}
              {announcement.hashtags?.length > 0 && (
                <div className="mb-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {announcement.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-primary hover:text-primary-dark cursor-pointer text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="py-6 border-t border-b border-gray-200 mb-8">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={shareToFacebook}
                    className="w-10 h-10 rounded-full bg-[#3b5998] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="w-10 h-10 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    title="Copy Link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Previous / Next Navigation */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {prevAnnouncement ? (
                  <Link
                    to={`/announcements/${prevAnnouncement.slug || prevAnnouncement._id}`}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Older</span>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-primary truncate">{prevAnnouncement.title}</p>
                    </div>
                  </Link>
                ) : <div />}
                {nextAnnouncement ? (
                  <Link
                    to={`/announcements/${nextAnnouncement.slug || nextAnnouncement._id}`}
                    className="group flex items-center justify-end gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-right"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Newer</span>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-primary truncate">{nextAnnouncement.title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary shrink-0" />
                  </Link>
                ) : <div />}
              </div>
            </motion.article>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Back to Announcements */}
            <Link
              to="/announcements"
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              All Announcements
            </Link>

            {/* Category sidebar */}
            {announcement.committeeRef && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Committee</h4>
                <Link
                  to={`/committee/${announcement.committeeRef.slug || ''}`}
                  className="text-primary hover:underline text-sm"
                >
                  View Committee Page
                </Link>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Details</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CalendarDays className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{formatDate(announcement.eventDate || announcement.createdAt)}</span>
                </div>
                {announcement.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{announcement.location}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{announcement.category}</span>
                </div>
                {announcement.views > 0 && (
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{announcement.views} views</span>
                  </div>
                )}
              </div>
            </div>

            {/* Published By */}
            {announcement.publishedBy && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Published by</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {getAuthorName()}
                    </p>
                    <p className="text-xs text-gray-500">Barangay Culiat</p>
                  </div>
                </div>
              </div>
            )}

            {/* Images download section */}
            {images.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Photos ({images.length})</h4>
                <div className="grid grid-cols-3 gap-2">
                  {images.slice(0, 6).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => openImageGallery(idx)}
                      className="relative group aspect-square rounded-lg overflow-hidden"
                    >
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Full Screen Image Gallery */}
      <AnimatePresence>
        {imageGalleryOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
            onClick={closeImageGallery}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between px-4">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadImage(images[currentImageIndex], currentImageIndex); }}
                  disabled={downloadingImage}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                  title="Download Image"
                >
                  {downloadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button onClick={closeImageGallery} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors" title="Close">
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
              <img src={images[currentImageIndex]} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
            </motion.div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
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
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 p-4" onClick={(e) => e.stopPropagation()}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                        idx === currentImageIndex ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-center pb-4">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadImage(images[currentImageIndex], currentImageIndex); }}
                  disabled={downloadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {downloadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Image
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 text-white/50 text-xs hidden md:block">
              ← → Navigate &bull; ESC Close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AnnouncementDetail;
