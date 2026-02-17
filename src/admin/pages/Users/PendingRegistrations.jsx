import { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle, XCircle, Eye, Calendar, Mail, Phone, MapPin, User, AlertCircle, RefreshCw, Search, ZoomIn, Loader2, FileCheck, ChevronLeft, ChevronRight, Users, Clock, FileText, Shield, X, Baby, Heart, Briefcase, Building, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Tesseract from "tesseract.js";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import { getDocumentTypeLabel, isEndorsementLetter } from "../../../utils/documentTypes";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PendingRegistrations() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [alert, setAlert] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Tab State
  const [activeTab, setActiveTab] = useState("personal");

  // Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [verificationResults, setVerificationResults] = useState(null);
  const imageRef = useRef(null);

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return pendingUsers;
    const search = searchTerm.toLowerCase();
    return pendingUsers.filter(user =>
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search)
    );
  }, [pendingUsers, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Stats
  const todayRegistrations = useMemo(() => {
    const today = new Date().toDateString();
    return pendingUsers.filter(user =>
      new Date(user.createdAt).toDateString() === today
    ).length;
  }, [pendingUsers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/pending-registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPendingUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      setPendingUsers([]); // Set to empty array on error
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to fetch pending registrations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setActionType(null);
    setRejectionReason("");
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/auth/approve-registration/${selectedUser._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAlert({
          type: "success",
          message: `Successfully approved registration for ${selectedUser.firstName} ${selectedUser.lastName}`,
        });
        setShowModal(false);
        setSelectedUser(null);
        fetchPendingRegistrations();
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to approve registration",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setAlert({
        type: "error",
        message: "Please provide a reason for rejection",
      });
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/auth/reject-registration/${selectedUser._id}`,
        { reason: rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAlert({
          type: "success",
          message: `Registration rejected for ${selectedUser.firstName} ${selectedUser.lastName}`,
        });
        setShowModal(false);
        setSelectedUser(null);
        setRejectionReason("");
        fetchPendingRegistrations();
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to reject registration",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to format name objects {firstName, middleName, lastName} to string
  const formatNameObject = (nameObj) => {
    if (!nameObj) return 'N/A';
    if (typeof nameObj === 'string') return nameObj;
    const parts = [nameObj.firstName, nameObj.middleName, nameObj.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  // Helper function to format place objects {cityMunicipality, province, country} or {hospital, cityMunicipality, province}
  const formatPlaceObject = (placeObj) => {
    if (!placeObj) return 'N/A';
    if (typeof placeObj === 'string') return placeObj;
    // Handle different place object structures
    const parts = [
      placeObj.hospital,
      placeObj.cityMunicipality,
      placeObj.province,
      placeObj.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Helper function to format informant object {name, relationship, address}
  const formatInformantObject = (informantObj) => {
    if (!informantObj) return 'N/A';
    if (typeof informantObj === 'string') return informantObj;
    // Extract informant details
    const name = informantObj.name || '';
    const relationship = informantObj.relationship || '';
    const address = informantObj.address || '';

    if (!name && !relationship && !address) return 'N/A';

    let result = name;
    if (relationship) result += result ? ` (${relationship})` : relationship;
    if (address) result += result ? ` - ${address}` : address;
    return result || 'N/A';
  };

  // Helper function to format ISO date to yyyy-mm-dd
  const formatDateYMD = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue !== 'string') {
      // Handle Date objects
      try {
        const d = new Date(dateValue);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      } catch (e) {
        return 'N/A';
      }
    }
    // Already in yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    // ISO format like 2026-01-05T00:00:00.000Z
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    return dateValue;
  };

  // Open Verify ID Modal and start OCR on ALL ID images (4 images: 2 IDs x front/back)
  const handleVerifyID = async () => {
    // Check if at least one ID exists
    const hasAnyID = selectedUser?.validID?.url || selectedUser?.primaryID2?.url;
    if (!hasAnyID) return;

    setShowVerifyModal(true);
    setOcrLoading(true);
    setOcrProgress(0);
    setExtractedText("");
    setVerificationResults(null);

    try {
      // Collect all available ID images
      const idImages = [];

      // Primary ID 1 (validID and backOfValidID for backward compatibility)
      const id1TypeLabel = getDocumentTypeLabel(selectedUser.primaryID1Type || selectedUser.validID?.idType || "");
      const id1IsEndorsement = isEndorsementLetter(selectedUser.primaryID1Type);

      if (selectedUser?.validID?.url) {
        idImages.push({
          url: selectedUser.validID.url,
          label: id1IsEndorsement ? `DOCUMENT 1 - ${id1TypeLabel}` : `DOCUMENT 1 - ${id1TypeLabel} (FRONT)`,
          type: id1TypeLabel
        });
      }
      if (selectedUser?.backOfValidID?.url && !id1IsEndorsement) {
        idImages.push({
          url: selectedUser.backOfValidID.url,
          label: `DOCUMENT 1 - ${id1TypeLabel} (BACK)`,
          type: id1TypeLabel
        });
      }

      // Primary ID 2
      const id2TypeLabel = getDocumentTypeLabel(selectedUser.primaryID2Type || selectedUser.primaryID2?.idType || "");
      const id2IsEndorsement = isEndorsementLetter(selectedUser.primaryID2Type);

      if (selectedUser?.primaryID2?.url) {
        idImages.push({
          url: selectedUser.primaryID2.url,
          label: id2IsEndorsement ? `DOCUMENT 2 - ${id2TypeLabel}` : `DOCUMENT 2 - ${id2TypeLabel} (FRONT)`,
          type: id2TypeLabel
        });
      }
      if (selectedUser?.primaryID2Back?.url && !id2IsEndorsement) {
        idImages.push({
          url: selectedUser.primaryID2Back.url,
          label: `DOCUMENT 2 - ${id2TypeLabel} (BACK)`,
          type: id2TypeLabel
        });
      }

      const totalImages = idImages.length;
      let combinedText = "";
      const perImageResults = [];

      // Process each image with advanced OCR settings
      for (let i = 0; i < idImages.length; i++) {
        const img = idImages[i];
        const progressStart = (i / totalImages) * 100;
        const progressEnd = ((i + 1) / totalImages) * 100;

        try {
          // Use advanced Tesseract settings for better recognition
          const result = await Tesseract.recognize(
            img.url,
            'eng+fil', // English + Filipino for Philippine IDs
            {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  setOcrProgress(Math.round(progressStart + (m.progress * (progressEnd - progressStart))));
                }
              },
              // Advanced OCR parameters for better accuracy
              tessedit_pageseg_mode: 3, // Fully automatic page segmentation
              tessedit_ocr_engine_mode: 2, // LSTM neural net mode
              preserve_interword_spaces: 1,
            }
          );

          const extractedFromImage = result.data.text.trim();
          const confidence = result.data.confidence;

          combinedText += `\n═══════════════════════════════════════\n`;
          combinedText += `📄 ${img.label} (${img.type})\n`;
          combinedText += `📊 OCR Confidence: ${confidence.toFixed(1)}%\n`;
          combinedText += `═══════════════════════════════════════\n`;
          combinedText += extractedFromImage + "\n";

          // Store per-image results
          perImageResults.push({
            label: img.label,
            type: img.type,
            text: extractedFromImage,
            confidence: confidence,
            wordCount: extractedFromImage.split(/\s+/).filter(Boolean).length
          });

        } catch (imgError) {
          combinedText += `\n═══════════════════════════════════════\n`;
          combinedText += `📄 ${img.label} (${img.type})\n`;
          combinedText += `⚠️ Failed to process this image\n`;
          combinedText += `═══════════════════════════════════════\n`;

          perImageResults.push({
            label: img.label,
            type: img.type,
            text: "",
            confidence: 0,
            error: true
          });
        }
      }

      setExtractedText(combinedText);

      // Perform advanced verification matching
      const results = performAdvancedVerification(combinedText, selectedUser, perImageResults);
      setVerificationResults(results);
    } catch (error) {
      console.error("OCR Error:", error);
      setAlert({
        type: "error",
        message: "Failed to process ID images. Please try again.",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  // Normalize text for comparison (remove special chars, lowercase, trim)
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Check if extracted text contains the field value
  const checkMatch = (extractedText, fieldValue) => {
    if (!fieldValue || !extractedText) return { matched: false, confidence: 0 };

    const normalizedExtracted = normalizeText(extractedText);
    const normalizedField = normalizeText(fieldValue);

    if (!normalizedField) return { matched: false, confidence: 0 };

    // Check for exact match
    if (normalizedExtracted.includes(normalizedField)) {
      return { matched: true, confidence: 100 };
    }

    // Check for partial match (each word)
    const words = normalizedField.split(' ').filter(w => w.length > 2);
    let matchedWords = 0;

    for (const word of words) {
      if (normalizedExtracted.includes(word)) {
        matchedWords++;
      }
    }

    if (words.length > 0 && matchedWords > 0) {
      const confidence = Math.round((matchedWords / words.length) * 100);
      return { matched: confidence >= 50, confidence };
    }

    return { matched: false, confidence: 0 };
  };

  // Advanced fuzzy matching with Levenshtein distance
  const levenshteinDistance = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  };

  // Calculate similarity percentage using Levenshtein
  const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 100;
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return Math.round((1 - distance / maxLen) * 100);
  };

  // Advanced check with fuzzy matching
  const advancedCheckMatch = (extractedText, fieldValue, fieldKey) => {
    if (!fieldValue || !extractedText) return { matched: false, confidence: 0, foundIn: [] };

    const normalizedExtracted = normalizeText(extractedText);
    const normalizedField = normalizeText(fieldValue);

    if (!normalizedField) return { matched: false, confidence: 0, foundIn: [] };

    // Check for exact match first
    if (normalizedExtracted.includes(normalizedField)) {
      return { matched: true, confidence: 100, foundIn: ['exact match'] };
    }

    // For address, check each component separately
    if (fieldKey === 'address') {
      const addressParts = normalizedField.split(' ').filter(w => w.length > 1);
      let matchedParts = 0;
      const foundParts = [];

      for (const part of addressParts) {
        if (normalizedExtracted.includes(part)) {
          matchedParts++;
          foundParts.push(part);
        }
      }

      if (addressParts.length > 0 && matchedParts > 0) {
        const confidence = Math.round((matchedParts / addressParts.length) * 100);
        return { matched: confidence >= 40, confidence, foundIn: foundParts };
      }
    }

    // Check word by word with fuzzy matching
    const words = normalizedField.split(' ').filter(w => w.length > 2);
    let totalScore = 0;
    const foundWords = [];

    for (const word of words) {
      // Direct match
      if (normalizedExtracted.includes(word)) {
        totalScore += 100;
        foundWords.push({ word, score: 100, type: 'exact' });
        continue;
      }

      // Fuzzy match - find best matching word in extracted text
      const extractedWords = normalizedExtracted.split(' ').filter(w => w.length > 2);
      let bestMatch = { word: '', score: 0 };

      for (const extWord of extractedWords) {
        const similarity = calculateSimilarity(word, extWord);
        if (similarity > bestMatch.score && similarity >= 70) {
          bestMatch = { word: extWord, score: similarity };
        }
      }

      if (bestMatch.score >= 70) {
        totalScore += bestMatch.score;
        foundWords.push({ word, score: bestMatch.score, type: 'fuzzy', matched: bestMatch.word });
      }
    }

    if (words.length > 0) {
      const avgConfidence = Math.round(totalScore / words.length);
      return {
        matched: avgConfidence >= 50 || foundWords.length >= Math.ceil(words.length / 2),
        confidence: Math.min(100, avgConfidence),
        foundIn: foundWords
      };
    }

    return { matched: false, confidence: 0, foundIn: [] };
  };

  // Advanced verification with per-image analysis
  const performAdvancedVerification = (extractedText, user, perImageResults) => {
    // REQUIRED fields - Full Name and Address (must verify)
    const requiredFields = [
      { label: 'Full Name', value: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(), key: 'fullName', required: true, category: 'identity' },
      { label: 'First Name', value: user.firstName, key: 'firstName', required: true, category: 'identity' },
      { label: 'Last Name', value: user.lastName, key: 'lastName', required: true, category: 'identity' },
      { label: 'Address', value: `${user.address?.houseNumber || ''} ${user.address?.street || ''} ${user.address?.subdivision || ''}`.trim(), key: 'address', required: true, category: 'address' },
    ];

    // Optional fields for additional verification
    const optionalFields = [
      { label: 'Middle Name', value: user.middleName, key: 'middleName', required: false, category: 'identity' },
      { label: 'Date of Birth', value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null, key: 'dateOfBirth', required: false, category: 'personal' },
      { label: 'Date of Birth (Short)', value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null, key: 'dateOfBirthShort', required: false, category: 'personal' },
      { label: 'Gender', value: user.gender, key: 'gender', required: false, category: 'personal' },
      { label: 'Street', value: user.address?.street, key: 'street', required: false, category: 'address' },
      { label: 'Subdivision/Barangay', value: user.address?.subdivision, key: 'subdivision', required: false, category: 'address' },
    ];

    const allFields = [...requiredFields, ...optionalFields];

    // Perform advanced matching for each field
    const results = allFields.map(field => ({
      ...field,
      ...advancedCheckMatch(extractedText, field.value, field.key)
    }));

    // Calculate scores by category
    const identityFields = results.filter(r => r.category === 'identity' && r.value);
    const addressFields = results.filter(r => r.category === 'address' && r.value);

    const identityScore = identityFields.length > 0
      ? Math.round(identityFields.reduce((sum, f) => sum + f.confidence, 0) / identityFields.length)
      : 0;

    const addressScore = addressFields.length > 0
      ? Math.round(addressFields.reduce((sum, f) => sum + f.confidence, 0) / addressFields.length)
      : 0;

    // Check critical requirements: Name AND Address
    const nameVerified = results.some(r => r.key === 'fullName' && r.matched) ||
      (results.some(r => r.key === 'firstName' && r.matched) && results.some(r => r.key === 'lastName' && r.matched));
    const addressVerified = results.some(r => r.key === 'address' && r.matched) ||
      results.filter(r => r.category === 'address' && r.matched).length >= 2;

    // Calculate overall verification score
    // Weight: Identity (60%), Address (40%)
    const overallScore = Math.round((identityScore * 0.6) + (addressScore * 0.4));

    // Verification status
    let verificationStatus = 'failed';
    if (nameVerified && addressVerified && overallScore >= 70) {
      verificationStatus = 'verified';
    } else if ((nameVerified || addressVerified) && overallScore >= 50) {
      verificationStatus = 'partial';
    }

    // Per-image analysis
    const imageAnalysis = perImageResults.map(img => ({
      ...img,
      hasName: advancedCheckMatch(img.text, `${user.firstName} ${user.lastName}`, 'name').matched,
      hasAddress: advancedCheckMatch(img.text, user.address?.street || user.address?.subdivision, 'address').matched,
    }));

    // Average OCR confidence across all images
    const avgOcrConfidence = perImageResults.length > 0
      ? Math.round(perImageResults.reduce((sum, img) => sum + (img.confidence || 0), 0) / perImageResults.length)
      : 0;

    return {
      fields: results,
      overallScore,
      identityScore,
      addressScore,
      nameVerified,
      addressVerified,
      verificationStatus,
      imageAnalysis,
      avgOcrConfidence,
      totalImages: perImageResults.length,
      processedImages: perImageResults.filter(img => !img.error).length,
    };
  };

  // Keep backward compatible performVerification
  const performVerification = (extractedText, user) => {
    return performAdvancedVerification(extractedText, user, []);
  };

  // Highlight matching text in the extracted OCR text
  const highlightExtractedText = (text, verificationResults) => {
    if (!verificationResults || !text) return text;

    let highlightedText = text;
    const matchedTerms = [];
    const unmatchedTerms = [];

    verificationResults.fields.forEach(field => {
      if (!field.value) return;

      const words = field.value.split(' ').filter(w => w.length > 2);
      words.forEach(word => {
        if (field.matched) {
          matchedTerms.push(word);
        } else {
          unmatchedTerms.push(word);
        }
      });
    });

    return { text, matchedTerms, unmatchedTerms };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Pending Registrations
              </h1>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm max-w-lg hidden sm:block">
              Review and approve resident registration requests
            </p>
          </div>

          <button
            onClick={fetchPendingRegistrations}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-900 bg-white rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/25"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
          {[
            { label: "Total Pending", count: pendingUsers.length, icon: Clock, iconColor: "text-yellow-300", iconBg: "bg-yellow-500/20" },
            { label: "Today", count: todayRegistrations, icon: Calendar, iconColor: "text-green-300", iconBg: "bg-green-500/20" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stat.count}</p>
                  <p className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-wider truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading pending registrations...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? "No Results Found" : "No Pending Registrations"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? `No registrations match "${searchTerm}"`
              : "There are currently no pending resident registration requests."
            }
          </p>
        </div>
      ) : (
        <>
          {/* Cards Grid with Animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {paginatedUsers.map((user, index) => {
              return (
                <motion.div
                  key={user._id}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Status Indicator */}
                  <div className="h-1.5 bg-gradient-to-r from-yellow-500 to-orange-500"></div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-[10px] font-semibold rounded-full">
                          Pending
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span>{user.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">
                          {user.address?.houseNumber} {user.address?.street}, Brgy. Culiat
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(user)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                </span>{" "}
                of <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredUsers.length}</span> results
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))
                }

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal - Full Screen with Tabs */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => {
              setShowModal(false);
              setSelectedUser(null);
              setActionType(null);
              setRejectionReason("");
              setActiveTab("personal");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - sticky to stay above content */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 relative overflow-visible z-10 flex-shrink-0">
                <div className="absolute inset-0 opacity-10 z-0">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "24px 24px"
                  }}></div>
                </div>
                <div className="relative z-[5] flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-xl shadow-lg">
                      {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-white truncate">
                        {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}
                      </h2>
                      <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 flex-wrap">
                        <span className="text-blue-200 text-xs sm:text-sm">@{selectedUser.username}</span>
                        <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] sm:text-xs font-semibold rounded-full">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedUser(null);
                      setActionType(null);
                      setActiveTab("personal");
                    }}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>

                {/* Tabs - positioned above content */}
                <div className="relative z-[5] flex gap-1 mt-3 sm:mt-5 -mb-px overflow-x-auto scrollbar-hide">
                  {[
                    { id: "personal", label: "Personal", fullLabel: "Personal Info", icon: User },
                    { id: "documents", label: "Docs", fullLabel: "Documents", icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-t-lg border-t border-l border-r border-gray-200 dark:border-gray-700"
                        : "text-blue-200 hover:bg-white/10 rounded-t-lg"
                        }`}
                    >
                      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="sm:hidden">{tab.label}</span>
                      <span className="hidden sm:inline">{tab.fullLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Account Information */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Account Credentials
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">Username</label>
                          <p className="text-blue-900 dark:text-blue-100 font-medium truncate">@{selectedUser.username}</p>
                        </div>
                        <div>
                          <label className="text-blue-600 dark:text-blue-300 font-medium text-[10px] sm:text-xs">Email</label>
                          {selectedUser.email ? (
                            <p className="text-blue-900 dark:text-blue-100 truncate">{selectedUser.email}</p>
                          ) : (
                            <p className="text-blue-400 dark:text-blue-500 italic text-xs">Not provided (elderly user)</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Personal Information
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="col-span-2 sm:col-span-3">
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Full Name</label>
                          <p className="text-gray-900 dark:text-gray-100 font-medium text-xs sm:text-sm">
                            {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}{selectedUser.suffix ? ` ${selectedUser.suffix}` : ''}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Date of Birth</label>
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Age</label>
                          <p className="text-gray-900 dark:text-gray-100 font-semibold text-xs sm:text-sm">
                            {selectedUser.dateOfBirth ? `${calculateAge(selectedUser.dateOfBirth)} years old` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Gender</label>
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{selectedUser.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Civil Status</label>
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{selectedUser.civilStatus || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Phone</label>
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{selectedUser.phoneNumber}</p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Occupation</label>
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{selectedUser.occupation || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Religion</label>
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{selectedUser.religion || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Resident Type */}
                    <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 ${selectedUser.residentType === 'non_resident'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                      <h4 className={`font-semibold mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 ${selectedUser.residentType === 'non_resident' ? 'text-amber-900 dark:text-amber-100' : 'text-emerald-900 dark:text-emerald-100'
                        }`}>
                        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Residency Status
                      </h4>
                      <div className="flex items-center gap-2">
                        {selectedUser.residentType === 'non_resident' ? (
                          <>
                            <Users className="w-4 h-4 text-amber-600" />
                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                              Non-Resident
                            </span>
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              (Resides outside Barangay Culiat)
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                              Barangay Culiat Resident
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sectoral Groups */}
                    {selectedUser.sectoralGroups && selectedUser.sectoralGroups.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-100/50 border border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="font-semibold text-purple-900 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Sectoral Groups
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.sectoralGroups.map((group) => (
                            <span
                              key={group}
                              className="px-2 py-1 bg-white text-purple-700 text-[10px] sm:text-xs font-semibold rounded-lg border border-purple-200 shadow-sm"
                            >
                              {group.charAt(0).toUpperCase() + group.slice(1).replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        {selectedUser.womensOrganization && (
                          <div className="mt-3 pt-3 border-t border-purple-100">
                            <label className="text-purple-600 font-medium text-[10px] sm:text-xs">Women's Organization</label>
                            <p className="text-purple-900 font-bold text-xs sm:text-sm">{selectedUser.womensOrganization}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {selectedUser.residentType === 'non_resident' ? 'Current Address (Outside Barangay)' : 'Address in Barangay Culiat'}
                      </h4>
                      {selectedUser.residentType === 'non_resident' && selectedUser.nonResidentAddress ? (
                        <div className="space-y-2">
                          <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                            {selectedUser.nonResidentAddress.houseNumber} {selectedUser.nonResidentAddress.street}
                            {selectedUser.nonResidentAddress.subdivision && `, ${selectedUser.nonResidentAddress.subdivision}`}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                            Barangay {selectedUser.nonResidentAddress.barangay}, {selectedUser.nonResidentAddress.city}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                            {selectedUser.nonResidentAddress.province}
                            {selectedUser.nonResidentAddress.region && `, ${selectedUser.nonResidentAddress.region}`}
                            {selectedUser.nonResidentAddress.postalCode && ` ${selectedUser.nonResidentAddress.postalCode}`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                          {selectedUser.address?.houseNumber} {selectedUser.address?.street}
                          {selectedUser.address?.subdivision && `, ${selectedUser.address.subdivision}`}
                          {selectedUser.address?.compound && selectedUser.address.compound !== "No Compound" && ` (${selectedUser.address.compound})`}
                          , Barangay Culiat, Quezon City
                        </p>
                      )}
                    </div>

                    {/* Spouse Information */}
                    {selectedUser.spouseInfo?.name && (
                      <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Spouse Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <label className="text-pink-600 dark:text-pink-300 font-medium text-[10px] sm:text-xs">Name</label>
                            <p className="text-pink-900 dark:text-pink-100">{selectedUser.spouseInfo.name}</p>
                          </div>
                          <div>
                            <label className="text-pink-600 dark:text-pink-300 font-medium text-[10px] sm:text-xs">Occupation</label>
                            <p className="text-pink-900 dark:text-pink-100">{selectedUser.spouseInfo.occupation || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-pink-600 dark:text-pink-300 font-medium text-[10px] sm:text-xs">Contact</label>
                            <p className="text-pink-900 dark:text-pink-100">{selectedUser.spouseInfo.contactNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {selectedUser.emergencyContact && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Emergency Contact
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Name</label>
                            <p className="text-orange-900 dark:text-orange-100">{selectedUser.emergencyContact.fullName}</p>
                          </div>
                          <div>
                            <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Relationship</label>
                            <p className="text-orange-900 dark:text-orange-100">{selectedUser.emergencyContact.relationship || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Contact</label>
                            <p className="text-orange-900 dark:text-orange-100">{selectedUser.emergencyContact.contactNumber}</p>
                          </div>
                          <div>
                            <label className="text-orange-600 dark:text-orange-300 font-medium text-[10px] sm:text-xs">Address</label>
                            <p className="text-orange-900 dark:text-orange-100 text-xs sm:text-sm">
                              {selectedUser.emergencyContact.address?.houseNumber} {selectedUser.emergencyContact.address?.street} {selectedUser.emergencyContact.address?.subdivision}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    {(() => {
                      const tin = selectedUser.tinNumber || selectedUser.additionalInfo?.tinNumber;
                      const sss = selectedUser.sssGsisNumber || selectedUser.additionalInfo?.sssGsisNumber;
                      const precinct = selectedUser.precinctNumber || selectedUser.additionalInfo?.precinctNumber;
                      const hasTin = tin && tin !== 'N/A' && tin.trim() !== '';
                      const hasSss = sss && sss !== 'N/A' && sss.trim() !== '';
                      const hasPrecinct = precinct && precinct.trim() !== '';

                      if (!hasTin && !hasSss && !hasPrecinct) return null;

                      return (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Additional Information
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                            {hasTin && (
                              <div>
                                <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">TIN</label>
                                <p className="text-gray-900 dark:text-gray-100">{tin}</p>
                              </div>
                            )}
                            {hasSss && (
                              <div>
                                <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">SSS/GSIS</label>
                                <p className="text-gray-900 dark:text-gray-100">{sss}</p>
                              </div>
                            )}
                            {hasPrecinct && (
                              <div>
                                <label className="text-gray-500 dark:text-gray-400 font-medium text-[10px] sm:text-xs">Precinct</label>
                                <p className="text-gray-900 dark:text-gray-100">{precinct}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "documents" && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Verification Button - Global */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ID Verification
                        </h4>
                        <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                          Verify all uploaded IDs using advanced OCR with name and address matching
                        </p>
                      </div>
                      {(selectedUser?.validID?.url || selectedUser?.primaryID2?.url) && (
                        <button
                          onClick={handleVerifyID}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                          <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Verify All IDs
                        </button>
                      )}
                    </div>

                    {/* Document 1 */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="hidden sm:inline">Document #1</span>
                          <span className="sm:hidden">Doc 1</span>
                          {(selectedUser.primaryID1Type || selectedUser.validID?.idType) && (
                            <span className={`px-1.5 sm:px-2 py-0.5 ${isEndorsementLetter(selectedUser.primaryID1Type) ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'} text-[10px] sm:text-xs font-medium rounded-full`}>
                              {getDocumentTypeLabel(selectedUser.primaryID1Type || selectedUser.validID?.idType)}
                            </span>
                          )}
                        </h4>
                      </div>
                      {selectedUser.validID?.url ? (
                        <div className={`grid ${isEndorsementLetter(selectedUser.primaryID1Type) ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4`}>
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1">
                              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                                {isEndorsementLetter(selectedUser.primaryID1Type) ? 'L' : 'F'}
                              </span>
                              {isEndorsementLetter(selectedUser.primaryID1Type) ? 'Letter' : 'Front'}
                            </p>
                            <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                              <img
                                src={selectedUser.validID.url}
                                alt={`Document 1 ${isEndorsementLetter(selectedUser.primaryID1Type) ? 'Letter' : 'Front'}`}
                                className="w-full h-auto max-h-36 sm:max-h-56 object-contain cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(selectedUser.validID.url, '_blank')}
                              />
                            </div>
                          </div>
                          {!isEndorsementLetter(selectedUser.primaryID1Type) && (
                            <div>
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1">
                                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">B</span>
                                Back
                              </p>
                              {selectedUser.backOfValidID?.url ? (
                                <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                  <img
                                    src={selectedUser.backOfValidID.url}
                                    alt="Document 1 Back"
                                    className="w-full h-auto max-h-36 sm:max-h-56 object-contain cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => window.open(selectedUser.backOfValidID.url, '_blank')}
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl h-36 sm:h-56 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50">
                                  <p className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs italic">Not uploaded</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-5 sm:p-8 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50">
                          <p className="text-gray-400 dark:text-gray-500 italic text-xs sm:text-sm">No Document #1 uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Document 2 */}
                    <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30' : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30'}`}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'text-amber-500' : 'text-indigo-500'}`} />
                          <span className="hidden sm:inline">Document #2</span>
                          <span className="sm:hidden">Doc 2</span>
                          {(selectedUser.primaryID2Type || selectedUser.primaryID2?.idType) && (
                            <span className={`px-1.5 sm:px-2 py-0.5 ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'} text-[10px] sm:text-xs font-medium rounded-full`}>
                              {getDocumentTypeLabel(selectedUser.primaryID2Type || selectedUser.primaryID2?.idType)}
                            </span>
                          )}
                        </h4>
                      </div>
                      {selectedUser.primaryID2?.url ? (
                        <div className={`grid ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4`}>
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1">
                              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'} flex items-center justify-center text-[8px] sm:text-[10px] font-bold`}>
                                {isEndorsementLetter(selectedUser.primaryID2Type) ? 'L' : 'F'}
                              </span>
                              {isEndorsementLetter(selectedUser.primaryID2Type) ? 'Letter' : 'Front'}
                            </p>
                            <div className={`border-2 ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'border-amber-200 dark:border-amber-700' : 'border-indigo-200 dark:border-indigo-700'} rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`}>
                              <img
                                src={selectedUser.primaryID2.url}
                                alt={`Document 2 ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'Letter' : 'Front'}`}
                                className="w-full h-auto max-h-36 sm:max-h-56 object-contain cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(selectedUser.primaryID2.url, '_blank')}
                              />
                            </div>
                          </div>
                          {!isEndorsementLetter(selectedUser.primaryID2Type) && (
                            <div>
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1">
                                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">B</span>
                                Back
                              </p>
                              {selectedUser.primaryID2Back?.url ? (
                                <div className="border-2 border-indigo-200 dark:border-indigo-700 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                  <img
                                    src={selectedUser.primaryID2Back.url}
                                    alt="Document 2 Back"
                                    className="w-full h-auto max-h-36 sm:max-h-56 object-contain cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => window.open(selectedUser.primaryID2Back.url, '_blank')}
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-700 rounded-lg sm:rounded-xl h-36 sm:h-56 flex items-center justify-center bg-indigo-50/30 dark:bg-indigo-900/10">
                                  <p className="text-indigo-400 dark:text-indigo-500 text-[10px] sm:text-xs italic">Not uploaded</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-700 rounded-lg sm:rounded-xl p-5 sm:p-8 flex items-center justify-center bg-indigo-50/30 dark:bg-indigo-900/10">
                          <p className="text-indigo-400 dark:text-indigo-500 italic text-xs sm:text-sm">No Document #2 uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Documents Summary */}
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3">Documents Summary</h4>
                      <div className="space-y-2">
                        {/* Document 1 Summary */}
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Doc #1: {getDocumentTypeLabel(selectedUser.primaryID1Type || selectedUser.validID?.idType) || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${selectedUser.validID?.url ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isEndorsementLetter(selectedUser.primaryID1Type) ? 'Letter' : 'Front'}: {selectedUser.validID?.url ? '✓' : '—'}
                            </span>
                            {!isEndorsementLetter(selectedUser.primaryID1Type) && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${selectedUser.backOfValidID?.url ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                Back: {selectedUser.backOfValidID?.url ? '✓' : '—'}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Document 2 Summary */}
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${isEndorsementLetter(selectedUser.primaryID2Type) ? 'text-amber-500' : 'text-indigo-500'}`} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Doc #2: {getDocumentTypeLabel(selectedUser.primaryID2Type || selectedUser.primaryID2?.idType) || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${selectedUser.primaryID2?.url ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isEndorsementLetter(selectedUser.primaryID2Type) ? 'Letter' : 'Front'}: {selectedUser.primaryID2?.url ? '✓' : '—'}
                            </span>
                            {!isEndorsementLetter(selectedUser.primaryID2Type) && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${selectedUser.primaryID2Back?.url ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                Back: {selectedUser.primaryID2Back?.url ? '✓' : '—'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                {actionType === null && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => setActionType("approve")}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="sm:hidden">Approve</span>
                      <span className="hidden sm:inline">Approve Registration</span>
                    </button>
                    <button
                      onClick={() => setActionType("reject")}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all shadow-lg"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="sm:hidden">Reject</span>
                      <span className="hidden sm:inline">Reject Registration</span>
                    </button>
                  </div>
                )}

                {actionType === "approve" && (
                  <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-green-800 dark:text-green-200 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Are you sure you want to approve this registration? The resident will be able to log in immediately.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Confirm Approval"}
                      </button>
                      <button
                        onClick={() => setActionType(null)}
                        disabled={processing}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {actionType === "reject" && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                      Reason for Rejection *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
                      placeholder="Please provide a clear reason for rejecting this registration..."
                    />
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2.5 sm:mt-3">
                      <button
                        onClick={handleReject}
                        disabled={processing}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => setActionType(null)}
                        disabled={processing}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Modal - Full Screen Enhanced with Mobile Responsiveness */}
      {showVerifyModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                  <FileCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-xl font-bold text-white truncate">Advanced ID Verification</h2>
                  <p className="text-blue-100 text-[10px] sm:text-sm truncate">
                    {selectedUser.firstName} {selectedUser.lastName} • {verificationResults?.totalImages || 0} ID images
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setExtractedText("");
                  setVerificationResults(null);
                }}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
              {/* Left Panel - ID Images Gallery */}
              <div className="w-full sm:w-2/5 p-3 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 overflow-auto bg-gray-50 dark:bg-gray-900 max-h-[30vh] sm:max-h-none">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  ID Documents ({[selectedUser.validID?.url, selectedUser.backOfValidID?.url, selectedUser.primaryID2?.url, selectedUser.primaryID2Back?.url].filter(Boolean).length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-4">
                  {/* Primary ID 1 - Front */}
                  {selectedUser.validID?.url && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <p className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">ID 1 FRONT</p>
                        <span className="text-[9px] sm:text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[60px] sm:max-w-none">
                          {selectedUser.primaryID1Type || selectedUser.validID?.idType || 'Primary ID'}
                        </span>
                      </div>
                      <img
                        src={selectedUser.validID.url}
                        alt="ID 1 Front"
                        className="w-full h-auto rounded-lg object-contain cursor-pointer hover:opacity-90"
                        style={{ maxHeight: '100px' }}
                        onClick={() => window.open(selectedUser.validID.url, '_blank')}
                      />
                    </div>
                  )}
                  {/* Primary ID 1 - Back */}
                  {selectedUser.backOfValidID?.url && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">ID 1 BACK</p>
                      <img
                        src={selectedUser.backOfValidID.url}
                        alt="ID 1 Back"
                        className="w-full h-auto rounded-lg object-contain cursor-pointer hover:opacity-90"
                        style={{ maxHeight: '100px' }}
                        onClick={() => window.open(selectedUser.backOfValidID.url, '_blank')}
                      />
                    </div>
                  )}
                  {/* Primary ID 2 - Front */}
                  {selectedUser.primaryID2?.url && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-3 border border-indigo-200 dark:border-indigo-700">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <p className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400">ID 2 FRONT</p>
                        <span className="text-[9px] sm:text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[60px] sm:max-w-none">
                          {selectedUser.primaryID2Type || selectedUser.primaryID2?.idType || 'Secondary ID'}
                        </span>
                      </div>
                      <img
                        src={selectedUser.primaryID2.url}
                        alt="ID 2 Front"
                        className="w-full h-auto rounded-lg object-contain cursor-pointer hover:opacity-90"
                        style={{ maxHeight: '100px' }}
                        onClick={() => window.open(selectedUser.primaryID2.url, '_blank')}
                      />
                    </div>
                  )}
                  {/* Primary ID 2 - Back */}
                  {selectedUser.primaryID2Back?.url && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-3 border border-indigo-200 dark:border-indigo-700">
                      <p className="text-[10px] sm:text-xs font-semibold text-indigo-500 dark:text-indigo-400 mb-1.5 sm:mb-2">ID 2 BACK</p>
                      <img
                        src={selectedUser.primaryID2Back.url}
                        alt="ID 2 Back"
                        className="w-full h-auto rounded-lg object-contain cursor-pointer hover:opacity-90"
                        style={{ maxHeight: '100px' }}
                        onClick={() => window.open(selectedUser.primaryID2Back.url, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - OCR Results & Verification */}
              <div className="flex-1 sm:w-3/5 p-3 sm:p-6 overflow-auto">
                {ocrLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 sm:py-0">
                    <div className="relative">
                      <Loader2 className="w-14 h-14 sm:w-20 sm:h-20 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm sm:text-lg font-bold text-blue-600">{ocrProgress}%</span>
                      </div>
                    </div>
                    <p className="mt-4 sm:mt-6 text-gray-600 dark:text-gray-400 font-semibold text-sm sm:text-lg text-center">
                      Advanced OCR Processing...
                    </p>
                    <div className="w-48 sm:w-80 h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 sm:mt-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 text-center">
                      {ocrProgress < 25 ? 'Scanning ID 1 front...' :
                        ocrProgress < 50 ? 'Scanning ID 1 back...' :
                          ocrProgress < 75 ? 'Scanning ID 2...' :
                            'Analyzing and matching data...'}
                    </p>
                    <p className="mt-1 text-[10px] sm:text-xs text-gray-400 text-center">
                      Using Tesseract OCR with English + Filipino language support
                    </p>
                  </div>
                ) : verificationResults ? (
                  <div className="space-y-3 sm:space-y-5">
                    {/* Verification Status Banner */}
                    <div className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 ${verificationResults.verificationStatus === 'verified'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700'
                      : verificationResults.verificationStatus === 'partial'
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700'
                        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                              {verificationResults.verificationStatus === 'verified' ? '✓ VERIFIED' :
                                verificationResults.verificationStatus === 'partial' ? '⚠ PARTIAL MATCH' : '✗ NOT VERIFIED'}
                            </h3>
                            {verificationResults.avgOcrConfidence > 0 && (
                              <span className="text-[10px] sm:text-xs bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                OCR: {verificationResults.avgOcrConfidence}%
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                            {verificationResults.processedImages} of {verificationResults.totalImages} images processed
                          </p>
                        </div>
                        <div className={`text-3xl sm:text-5xl font-bold ${verificationResults.overallScore >= 70 ? 'text-green-600' :
                          verificationResults.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {verificationResults.overallScore}%
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${verificationResults.nameVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">Identity Score</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-lg sm:text-2xl font-bold ${verificationResults.nameVerified ? 'text-green-700' : 'text-red-700'}`}>
                              {verificationResults.identityScore}%
                            </span>
                            <span className={`text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${verificationResults.nameVerified ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                              {verificationResults.nameVerified ? 'Verified' : 'Not Found'}
                            </span>
                          </div>
                        </div>
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${verificationResults.addressVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                          <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">Address Score</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-lg sm:text-2xl font-bold ${verificationResults.addressVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                              {verificationResults.addressScore}%
                            </span>
                            <span className={`text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${verificationResults.addressVerified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                              {verificationResults.addressVerified ? 'Verified' : 'Partial'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field-by-Field Results */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Required Fields - Identity */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                          Identity
                          <span className="text-[9px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full ml-auto">Required</span>
                        </h4>
                        <div className="space-y-1.5 sm:space-y-2">
                          {verificationResults.fields.filter(f => f.category === 'identity').map((field, idx) => (
                            <div key={idx} className={`p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm ${field.matched ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                              }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">{field.label}</span>
                                <span className={`font-bold text-xs sm:text-sm ${field.matched ? 'text-green-600' : 'text-red-600'}`}>
                                  {field.confidence}%
                                </span>
                              </div>
                              <p className={`font-semibold truncate text-xs sm:text-sm ${field.matched ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                {field.value || 'N/A'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Address Fields */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                          Address
                          <span className="text-[9px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full ml-auto">Required</span>
                        </h4>
                        <div className="space-y-1.5 sm:space-y-2">
                          {verificationResults.fields.filter(f => f.category === 'address').map((field, idx) => (
                            <div key={idx} className={`p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm ${field.matched ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
                              }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">{field.label}</span>
                                <span className={`font-bold text-xs sm:text-sm ${field.matched ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {field.confidence}%
                                </span>
                              </div>
                              <p className={`font-semibold truncate text-xs sm:text-sm ${field.matched ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                {field.value || 'N/A'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        Additional Matches
                        <span className="text-[9px] sm:text-xs bg-gray-200 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full">Optional</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {verificationResults.fields.filter(f => f.category === 'personal' && f.value).map((field, idx) => (
                          <span key={idx} className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${field.matched
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {field.label}: {field.matched ? `✓ ${field.confidence}%` : '—'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Extracted Text Preview (Collapsible) */}
                    <details className="bg-gray-100 dark:bg-gray-900 rounded-lg sm:rounded-xl">
                      <summary className="p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl">
                        📄 View OCR Text ({extractedText.split('\n').length} lines)
                      </summary>
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 max-h-36 sm:max-h-48 overflow-auto">
                        <pre className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                          {extractedText || 'No text extracted'}
                        </pre>
                      </div>
                    </details>

                    {/* Action Recommendation */}
                    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${verificationResults.verificationStatus === 'verified'
                      ? 'bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-700'
                      : verificationResults.verificationStatus === 'partial'
                        ? 'bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700'
                        : 'bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700'
                      }`}>
                      <p className={`text-xs sm:text-sm font-medium ${verificationResults.verificationStatus === 'verified'
                        ? 'text-green-800 dark:text-green-200'
                        : verificationResults.verificationStatus === 'partial'
                          ? 'text-yellow-800 dark:text-yellow-200'
                          : 'text-red-800 dark:text-red-200'
                        }`}>
                        {verificationResults.verificationStatus === 'verified'
                          ? '✓ Verification Successful! Full name and address match the submitted ID documents. Safe to approve.'
                          : verificationResults.verificationStatus === 'partial'
                            ? '⚠ Partial Match. Some information was found but not all required fields matched. Please review manually.'
                            : '✗ Verification Failed. Name or address could not be confirmed from the ID documents. Manual review required.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                    <Search className="w-12 h-12 sm:w-20 sm:h-20 mb-3 sm:mb-4 opacity-20" />
                    <p className="text-sm sm:text-lg font-medium">Ready to Verify</p>
                    <p className="text-xs sm:text-sm">Processing will begin automatically...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 flex-shrink-0">
              <div className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
                {verificationResults && (
                  <span>Processed {verificationResults.processedImages} images • {new Date().toLocaleTimeString()}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setExtractedText("");
                    setVerificationResults(null);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium rounded-lg transition-colors order-2 sm:order-1"
                >
                  Close
                </button>
                {verificationResults && (
                  <button
                    onClick={() => {
                      setShowVerifyModal(false);
                      if (verificationResults.verificationStatus === 'verified') {
                        setActionType("approve");
                      }
                    }}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors order-1 sm:order-2 ${verificationResults.verificationStatus === 'verified'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : verificationResults.verificationStatus === 'partial'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    {verificationResults.verificationStatus === 'verified' ? 'Proceed to Approve' :
                      verificationResults.verificationStatus === 'partial' ? 'Review & Decide' : 'Close & Review'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
