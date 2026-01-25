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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

        const response = await fetch(`${API_URL}/api/verify/${token}`);
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

                {/* Two Column Grid */}
                <div className="grid grid-cols-2 gap-3">
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

                  {/* Status / Expiration Grid */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${documentData.isExpired ? 'bg-red-500' : 'bg-emerald-500'} rounded-lg flex items-center justify-center`}>
                          {documentData.isExpired ? <XCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">Status</p>
                          <p className={`${documentData.isExpired ? 'text-red-600' : 'text-emerald-600'} font-semibold text-sm capitalize`}>
                            {documentData.isExpired ? 'EXPIRED' : documentData.status}
                          </p>
                        </div>
                      </div>

                      {documentData.expirationDate && (
                        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4">
                          <div className={`w-10 h-10 ${documentData.isExpired ? 'bg-red-100' : 'bg-emerald-100'} rounded-lg flex items-center justify-center`}>
                            <Clock className={`w-5 h-5 ${documentData.isExpired ? 'text-red-600' : 'text-emerald-600'}`} />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-medium">Valid Until</p>
                            <p className={`${documentData.isExpired ? 'text-red-600 font-bold' : 'text-gray-900 font-medium'} text-sm`}>
                              {formatDate(documentData.expirationDate)}
                            </p>
                          </div>
                        </div>
                      )}
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
