/**
 * Document Verification Page
 * Public page accessible via QR code scan
 * Displays verified document information from Barangay Culiat
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  FileText,
  User,
  Calendar,
  Building2,
  MapPin,
  Clock,
  QrCode,
  ArrowLeft,
  Loader2,
  BadgeCheck,
  Home,
  Phone,
  Mail,
  ExternalLink,
  Info,
  Hash,
  Fingerprint,
  ShieldCheck,
  Award,
  Lock,
  Globe,
  Camera,
  Search,
  X,
  ScanLine,
  Keyboard,
} from 'lucide-react';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, verified, not-found, error, incomplete, portal
  const [documentData, setDocumentData] = useState(null);
  const [issuerData, setIssuerData] = useState(null);
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // Portal state
  const [controlNumber, setControlNumber] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera for QR scanning
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Start scanning for QR codes
        requestAnimationFrame(scanQRCode);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions or use manual entry.');
      setIsScanning(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsScanning(false);
    setCameraError(null);
  };

  // Scan QR code from video stream
  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Try to detect QR code using BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue;
            handleQRCodeDetected(qrData);
            return;
          }
        } catch (err) {
          // Continue scanning
        }
      }
    }
    
    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  // Handle detected QR code
  const handleQRCodeDetected = (qrData) => {
    stopCamera();
    // Check if it's a verification URL or just a token
    if (qrData.includes('/verify/')) {
      const token = qrData.split('/verify/').pop();
      navigate(`/verify/${token}`);
    } else {
      // Assume it's a direct token/control number
      navigate(`/verify/${qrData}`);
    }
  };

  // Handle manual verification
  const handleManualVerify = (e) => {
    e.preventDefault();
    if (controlNumber.trim()) {
      navigate(`/verify/${controlNumber.trim()}`);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const verifyDocument = async () => {
      // If no token, show the verification portal (not an error)
      if (!token) {
        setVerificationStatus('portal');
        return;
      }

      try {
        setVerificationStatus('loading');

        // Try to verify with the token first
        let response = await fetch(`${API_URL}/api/verify/${token}`);
        let data = await response.json();

        // If it fails with 400 (Bad Request), it might be a control number instead of a token
        // Try searching by control number
        if (response.status === 400 || (data.message && data.message.includes('Invalid verification token'))) {
          // Try to find document by control number
          try {
            const searchResponse = await fetch(`${API_URL}/api/verify/control/${token}`);
            const searchData = await searchResponse.json();
            
            if (searchResponse.ok && searchData.success) {
              // Found the document by control number, redirect to proper verification
              if (searchData.verificationToken) {
                // Use the verification token to verify
                response = await fetch(`${API_URL}/api/verify/${searchData.verificationToken}`);
                data = await response.json();
              } else if (searchData.verified) {
                // The control number endpoint returned full verification data
                setVerificationStatus('verified');
                setDocumentData(searchData.document);
                setIssuerData(searchData.issuer);
                setVerificationInfo(searchData.verificationInfo);
                return;
              }
            } else {
              // Control number not found either
              setVerificationStatus('not-found');
              setError('Document not found. Please check the control number or verification code and try again.');
              return;
            }
          } catch (searchErr) {
            console.error('Control number search error:', searchErr);
            setVerificationStatus('error');
            setError('Unable to verify document. Please try again later.');
            return;
          }
        }

        if (data.success && data.verified) {
          setVerificationStatus('verified');
          setDocumentData(data.document);
          setIssuerData(data.issuer);
          setVerificationInfo(data.verificationInfo);
        } else if (data.success && !data.verified) {
          setVerificationStatus('incomplete');
          setDocumentData(data);
          setError(data.message);
        } else if (response.status === 404) {
          setVerificationStatus('not-found');
          setError(data.message || 'Document not found');
        } else {
          setVerificationStatus('error');
          setError(data.message || 'Verification failed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setVerificationStatus('error');
        setError('Unable to connect to verification server. Please try again later.');
      }
    };

    verifyDocument();
  }, [token]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verification Portal State (no token provided - informational page)
  if (verificationStatus === 'portal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
        {/* Header */}
        <div className="relative py-16 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            ></div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-emerald-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Document Verification Portal
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Verify the authenticity of official documents issued by Barangay Culiat, Quezon City using our secure verification system.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-16 pt-8">
          {/* Verify Now Section - Primary Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <ScanLine className="w-7 h-7 text-emerald-400" />
              Verify a Document Now
            </h2>
            <p className="text-gray-300 mb-6">
              Use your camera to scan the QR code or enter the control number manually.
            </p>

            {/* Camera Scanner Section */}
            {showCamera ? (
              <div className="mb-6">
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video max-w-md mx-auto">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scanner overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                      {/* Scanning line animation */}
                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={stopCamera}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <p className="text-center text-gray-400 text-sm mt-4">
                  Position the QR code within the frame to scan
                </p>
                
                {cameraError && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                    {cameraError}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Camera className="w-6 h-6" />
                  <span>Open Camera & Scan QR</span>
                </button>
                
                <div className="flex items-center justify-center my-6">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="px-6 text-gray-400 text-sm font-medium">OR</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Keyboard className="w-4 h-4 inline mr-2" />
                  Enter Verification Code or Control Number
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={controlNumber}
                      onChange={(e) => setControlNumber(e.target.value)}
                      placeholder="e.g., VRF-IND202600002-... or RES-2026-00003"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!controlNumber.trim()}
                    className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Verify</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You can enter either the verification code (below the QR code) or the document control number
                </p>
              </div>
            </form>
          </motion.div>

          {/* How to Verify - with margin top fix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8 mt-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <QrCode className="w-6 h-6 text-emerald-400" />
              How to Verify a Document
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Locate QR Code</h3>
                <p className="text-gray-400 text-sm">Find the QR code printed on your official barangay document</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Scan with Phone</h3>
                <p className="text-gray-400 text-sm">Use your smartphone camera or any QR scanner app to scan the code</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">View Results</h3>
                <p className="text-gray-400 text-sm">See verification results instantly showing document authenticity</p>
              </div>
            </div>
          </motion.div>

          {/* Features - with margin top fix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4 mb-8 mt-8"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Secure & Tamper-Proof</h3>
              <p className="text-gray-400 text-sm">Each document has a unique token that cannot be duplicated or forged</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Publicly Accessible</h3>
              <p className="text-gray-400 text-sm">Anyone can verify document authenticity without creating an account</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-400 text-sm">Get immediate verification with complete document details</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <BadgeCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Official Records</h3>
              <p className="text-gray-400 text-sm">Verification checks against official barangay database records</p>
            </div>
          </motion.div>

          {/* What Gets Verified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Info className="w-6 h-6 text-emerald-400" />
              What Information is Verified
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Document type and control number</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Holder's name and details</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Date of issuance</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Validity period and expiration</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Purpose of document</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Issuing authority details</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/25"
            >
              <Home className="w-5 h-5" />
              Back to Homepage
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Need to request a document?{' '}
              <Link to="/services-info" className="text-emerald-400 hover:underline font-medium">
                View available services
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading State
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-neutral-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Loader2 className="w-16 h-16 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Document</h2>
          <p className="text-gray-600">Please wait while we verify your document...</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure verification in progress</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Verified State
  if (verificationStatus === 'verified' && documentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Barangay Culiat</span>
            </Link>
          </motion.div>

          {/* Verification Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Success Header */}
            <div className={`${documentData.isExpired ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} p-6 relative overflow-hidden`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="relative flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
                >
                  <ShieldCheck className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {documentData.isExpired ? 'Document Expired' : 'Document Verified ✓'}
                  </h1>
                  <p className="text-white/90 text-sm">
                    {documentData.isExpired
                      ? 'This document has passed its validity period'
                      : 'This document is authentic and officially issued'}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="p-6 space-y-5">
              {/* Expired Document Warning */}
              {documentData.isExpired && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-red-700 font-bold text-lg">This Document Has Expired</h3>
                      <p className="text-red-600 text-sm mt-1">
                        This document expired on <span className="font-semibold">{formatDate(documentData.expirationDate)}</span>. 
                        Please request a new document from Barangay Culiat.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Document Type Badge */}
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-flex items-center gap-2 ${documentData.isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'} px-4 py-2 rounded-full`}
                >
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">{documentData.documentTypeLabel}</span>
                </motion.div>
              </div>

              {/* Control Number - Prominent */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`${documentData.isExpired ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-primary/20'} rounded-2xl p-4 border`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${documentData.isExpired ? 'bg-red-500' : 'bg-primary'} rounded-xl flex items-center justify-center`}>
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Control Number</p>
                    <p className="text-gray-900 font-mono text-xl font-bold tracking-wide">{documentData.controlNumber}</p>
                  </div>
                </div>
              </motion.div>

              {/* Main Details Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid gap-3"
              >
                {/* Resident Name */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-medium">Issued To</p>
                      <p className="text-gray-900 font-semibold">{documentData.residentName}</p>
                    </div>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Issued On</p>
                      <p className="text-gray-900 font-medium text-sm">{formatDate(documentData.issuedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Expiration Date - Prominent */}
                {documentData.expirationDate && (
                  <div className={`rounded-xl p-4 border-2 ${documentData.isExpired ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${documentData.isExpired ? 'bg-red-500' : 'bg-emerald-500'} rounded-lg flex items-center justify-center`}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs font-medium">
                          {documentData.isExpired ? 'Expired On' : 'Valid Until'}
                        </p>
                        <p className={`${documentData.isExpired ? 'text-red-700' : 'text-emerald-700'} font-bold text-base`}>
                          {formatDate(documentData.expirationDate)}
                        </p>
                      </div>
                      {documentData.isExpired && (
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Expired
                        </div>
                      )}
                      {!documentData.isExpired && (
                        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Valid
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${documentData.isExpired ? 'bg-red-500' : 'bg-emerald-500'} rounded-lg flex items-center justify-center`}>
                      {documentData.isExpired ? <XCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Document Status</p>
                      <p className={`${documentData.isExpired ? 'text-red-600' : 'text-emerald-600'} font-semibold capitalize`}>
                        {documentData.isExpired ? 'EXPIRED' : documentData.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                {documentData.purpose && documentData.purpose !== 'N/A' && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs font-medium">Purpose</p>
                        <p className="text-gray-900 font-medium">{documentData.purpose}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(documentData.barangay || documentData.city) && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs font-medium">Location</p>
                        <p className="text-gray-900 font-medium">Barangay {documentData.barangay || 'Culiat'}, {documentData.city || 'Quezon City'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Info (if applicable) */}
                {documentData.businessName && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs font-medium">Business Name</p>
                        <p className="text-gray-900 font-medium">{documentData.businessName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Issuer Information */}
              {issuerData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-slate-100 rounded-2xl p-4 border border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-secondary" />
                    <h3 className="text-gray-800 font-semibold text-sm">Issuing Authority</h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span>{issuerData.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{issuerData.location}</span>
                    </div>
                    {issuerData.website && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a href={issuerData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {issuerData.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                    {issuerData.contact && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>brgy.culiat@yahoo.com</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Digital Authentication Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-emerald-50 rounded-xl p-4 border border-emerald-200"
              >
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-700 font-semibold text-sm mb-1">Digital Authentication</p>
                    <p className="text-emerald-600 text-xs leading-relaxed">
                      {verificationInfo?.securityNote ||
                        'This document has been digitally verified through the Barangay Culiat Document Verification System.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Verification Timestamp */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 text-gray-500 text-xs pt-2"
              >
                <Clock className="w-3 h-3" />
                <span>Verified on {formatDateTime(verificationInfo?.verifiedAt || new Date().toISOString())}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-6 space-y-2"
          >
            <p className="text-white/90 text-sm font-medium">
              This verification confirms the document was officially issued by Barangay Culiat, Quezon City.
            </p>
            <p className="text-white/70 text-xs">
              For concerns or inquiries, contact the barangay office.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Document Incomplete (exists but not fully processed)
  if (verificationStatus === 'incomplete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-12 h-12 text-amber-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Pending</h2>
          <p className="text-gray-600 mb-4">
            This document request exists but has not been fully processed yet.
          </p>
          {documentData?.controlNumber && (
            <p className="text-gray-500 text-sm mb-6">
              Control Number: <span className="font-mono text-gray-800 font-semibold">{documentData.controlNumber}</span>
            </p>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Not Found or Error State
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {verificationStatus === 'not-found' ? 'Document Not Found' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error || 'We could not verify this document. It may not exist or the QR code may be invalid.'}
        </p>

        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please contact <span className="font-medium text-gray-700">Barangay Culiat</span> with your document details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationPage;
