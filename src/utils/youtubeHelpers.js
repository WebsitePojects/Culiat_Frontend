/**
 * YouTube Video Utilities
 * Helper functions for working with YouTube video URLs and embeds
 */

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 * 
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Extracted video ID or null if invalid
 * 
 * @example
 * extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 * extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
};

/**
 * Validate if URL is a valid YouTube URL
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 * 
 * @example
 * isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // true
 * isValidYouTubeUrl('https://example.com/video') // false
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false;
  // More lenient check to allow iframe embed codes
  return url.includes('youtube.com') || url.includes('youtu.be') || /<iframe.*src=".*youtube\.com\/embed\/.*">/.test(url);
};

/**
 * Get YouTube embed URL from video ID
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {string|null} - Embed URL or null if invalid
 * 
 * @example
 * getYouTubeEmbedUrl('dQw4w9WgXcQ') // 'https://www.youtube.com/embed/dQw4w9WgXcQ'
 */
export const getYouTubeEmbedUrl = (videoId) => {
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

/**
 * Get YouTube thumbnail URL from video ID
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality ('default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault')
 * @returns {string|null} - Thumbnail URL or null if invalid
 * 
 * @example
 * getYouTubeThumbnail('dQw4w9WgXcQ', 'hqdefault') // 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
 */
export const getYouTubeThumbnail = (videoId, quality = 'hqdefault') => {
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : null;
};

/**
 * Create a responsive YouTube iframe embed
 * 
 * @param {string} videoId - YouTube video ID
 * @param {Object} options - Additional options for the iframe
 * @returns {Object} - Props object for iframe element
 * 
 * @example
 * const iframeProps = getYouTubeIframeProps('dQw4w9WgXcQ', { autoplay: true });
 */
export const getYouTubeIframeProps = (videoId, options = {}) => {
  if (!videoId) return null;

  const {
    autoplay = false,
    muted = false,
    controls = true,
    loop = false,
    modestBranding = true,
    rel = false, // Show related videos from same channel
    title = 'YouTube video player',
  } = options;

  // Build URL parameters
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: controls ? '1' : '0',
    loop: loop ? '1' : '0',
    modestbranding: modestBranding ? '1' : '0',
    rel: rel ? '1' : '0',
  });

  if (loop) {
    params.append('playlist', videoId); // Required for loop to work
  }

  return {
    src: `https://www.youtube.com/embed/${videoId}?${params.toString()}`,
    title,
    frameBorder: '0',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    allowFullScreen: true,
  };
};

/**
 * Extract video ID from URL or return as-is if already an ID
 * 
 * @param {string} urlOrId - YouTube URL or video ID
 * @returns {string|null} - Video ID or null if invalid
 */
export const normalizeYouTubeId = (urlOrId) => {
  if (!urlOrId) return null;
  
  // If it looks like an ID (11 characters, alphanumeric), return as-is
  if (/^[\w-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }
  
  // Otherwise, try to extract from URL
  return extractYouTubeVideoId(urlOrId);
};
