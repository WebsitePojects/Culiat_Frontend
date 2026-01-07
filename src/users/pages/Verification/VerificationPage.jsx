/**
 * Document Verification Page
 * Public page accessible via QR code scan
 * Displays verified document information from Barangay Culiat
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Globe
} from 'lucide-react';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VerificationPage = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, verified, not-found, error, incomplete
  const [documentData, setDocumentData] = useState(null);
  const [issuerData, setIssuerData] = useState(null);
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyDocument = async () => {
      if (!token) {
        setVerificationStatus('not-found');
        setError('No verification token provided');
        return;
      }

      try {
        setVerificationStatus('loading');
        
        const response = await fetch(`${API_URL}/verify/${token}`);
        const data = await response.json();

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

  // Loading State
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center max-w-md w-full border border-white/20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Loader2 className="w-16 h-16 text-blue-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Document</h2>
          <p className="text-blue-200">Please wait while we verify your document...</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-900 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Barangay Culiat</span>
            </Link>
          </motion.div>

          {/* Verification Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl"
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 relative overflow-hidden">
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
                    Document Verified ✓
                  </h1>
                  <p className="text-emerald-100 text-sm">
                    This document is authentic and officially issued
                  </p>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="p-6 space-y-5">
              {/* Document Type Badge */}
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30"
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
                className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl p-4 border border-blue-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Hash className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Control Number</p>
                    <p className="text-white font-mono text-xl font-bold tracking-wide">{documentData.controlNumber}</p>
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
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs">Issued To</p>
                      <p className="text-white font-semibold">{documentData.residentName}</p>
                    </div>
                  </div>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Issue Date */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Issued On</p>
                        <p className="text-white font-medium text-sm">{formatDate(documentData.issuedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Status</p>
                        <p className="text-emerald-400 font-medium text-sm capitalize">{documentData.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                {documentData.purpose && documentData.purpose !== 'N/A' && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 text-xs">Purpose</p>
                        <p className="text-white font-medium">{documentData.purpose}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(documentData.barangay || documentData.city) && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 text-xs">Location</p>
                        <p className="text-white font-medium">Barangay {documentData.barangay || 'Culiat'}, {documentData.city || 'Quezon City'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Info (if applicable) */}
                {documentData.businessName && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 text-xs">Business Name</p>
                        <p className="text-white font-medium">{documentData.businessName}</p>
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
                  className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-2xl p-4 border border-white/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold text-sm">Issuing Authority</h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{issuerData.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{issuerData.location}</span>
                    </div>
                    {issuerData.website && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <a href={issuerData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {issuerData.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                    {issuerData.contact && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{issuerData.contact}</span>
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
                className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/20"
              >
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-medium text-sm mb-1">Digital Authentication</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {verificationInfo?.securityNote || 
                        'This document has been digitally verified through the Barangay Culiat Document Verification System. This verification confirms the document is authentic and officially issued.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Verification Timestamp */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 text-slate-500 text-xs pt-2"
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
            <p className="text-slate-400 text-xs">
              This verification confirms the document was officially issued by Barangay Culiat, Quezon City.
            </p>
            <p className="text-slate-500 text-xs">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/30 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center max-w-md w-full border border-amber-500/30"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-12 h-12 text-amber-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Document Pending</h2>
          <p className="text-amber-200 mb-4">
            This document request exists but has not been fully processed yet.
          </p>
          {documentData?.controlNumber && (
            <p className="text-slate-400 text-sm mb-6">
              Control Number: <span className="font-mono text-white">{documentData.controlNumber}</span>
            </p>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-6 py-3 rounded-xl transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center max-w-md w-full border border-red-500/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-12 h-12 text-red-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {verificationStatus === 'not-found' ? 'Document Not Found' : 'Verification Failed'}
        </h2>
        <p className="text-red-200 mb-6">
          {error || 'We could not verify this document. It may not exist or the QR code may be invalid.'}
        </p>
        
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            If you believe this is an error, please contact Barangay Culiat with your document details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-xl transition-colors"
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
