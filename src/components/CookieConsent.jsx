import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import axios from 'axios';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Delay showing banner by 1 second for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const getUserIP = async () => {
    try {
      // Fix: Use proper env variable name for Vite
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${baseURL}/api/get-ip`);
      return response.data.ip;
    } catch (error) {
      console.error('Failed to get IP:', error);
      return 'unknown';
    }
  };

  const getDeviceFingerprint = () => {
    // Collect comprehensive device and browser information for security
    const fingerprint = {
      // Browser Info
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages ? navigator.languages.join(',') : navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      
      // Screen Info (helps detect VPN/proxy with unusual screen configs)
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      screenColorDepth: window.screen.colorDepth,
      screenPixelRatio: window.devicePixelRatio || 1,
      
      // Timezone (VPN detection - mismatched timezone vs IP location)
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // Browser Features (helps uniquely identify device)
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unspecified',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      
      // Connection Info
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      
      // Canvas Fingerprint (unique to each device/browser combo)
      canvasFingerprint: getCanvasFingerprint(),
      
      // WebGL Fingerprint (GPU info, helps identify device)
      webglFingerprint: getWebGLFingerprint(),
    };
    
    return fingerprint;
  };

  const getCanvasFingerprint = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'unsupported';
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 140, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Browser Fingerprint', 2, 2);
      
      return canvas.toDataURL().substring(0, 100); // First 100 chars is enough
    } catch (e) {
      return 'error';
    }
  };

  const getWebGLFingerprint = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'unsupported';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no-debug-info';
      
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch (e) {
      return 'error';
    }
  };

  const logConsent = async (accepted) => {
    try {
      const ip = await getUserIP();
      const deviceFingerprint = getDeviceFingerprint();
      
      // Fix: Use proper env variable name for Vite
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const consentData = {
        ip,
        accepted,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        // Enhanced security data
        deviceFingerprint,
        referrer: document.referrer || 'direct',
        currentUrl: window.location.href,
      };

      const response = await axios.post(
        `${baseURL}/api/cookie-consent`,
        consentData
      );
      
      console.log('Cookie consent logged successfully:', response.data);
    } catch (error) {
      console.error('Failed to log consent:', error);
      // Even if logging fails, still allow user to proceed
    }
  };

  const handleAccept = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    await logConsent(true);
    setShowBanner(false);
  };

  const handleDecline = async () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    await logConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-6"
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Icon & Message */}
                    <div className="flex gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <Cookie className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                          We Value Your Privacy
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          We use cookies to enhance your experience, keep you secure, and analyze site usage. 
                          By clicking "Accept", you agree to our use of cookies. Learn more in our{' '}
                          <a 
                            href="/legal#privacy" 
                            className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                          >
                            Privacy Policy
                          </a>
                          {' '}and{' '}
                          <a 
                            href="/legal#terms" 
                            className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                          >
                            Terms of Service
                          </a>.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full md:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:border-slate-400 transition-all duration-200"
                      >
                        Essential Only
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Accept All
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
