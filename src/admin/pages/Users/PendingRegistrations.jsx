import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Eye, Calendar, Mail, Phone, MapPin, User, AlertCircle, RefreshCw, Search, ZoomIn, Loader2, FileCheck } from "lucide-react";
import axios from "axios";
import Tesseract from "tesseract.js";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";

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

  // Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [verificationResults, setVerificationResults] = useState(null);
  const imageRef = useRef(null);

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

  // Open Verify ID Modal and start OCR on both front and back of ID
  const handleVerifyID = async () => {
    if (!selectedUser?.validID?.url) return;
    
    setShowVerifyModal(true);
    setOcrLoading(true);
    setOcrProgress(0);
    setExtractedText("");
    setVerificationResults(null);

    try {
      let combinedText = "";
      
      // OCR on front of ID
      const frontResult = await Tesseract.recognize(
        selectedUser.validID.url,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              // Front takes 0-50% of progress
              setOcrProgress(Math.round(m.progress * 50));
            }
          }
        }
      );
      combinedText += "=== FRONT OF ID ===\n" + frontResult.data.text + "\n\n";

      // OCR on back of ID if available
      if (selectedUser?.backOfValidID?.url) {
        const backResult = await Tesseract.recognize(
          selectedUser.backOfValidID.url,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                // Back takes 50-100% of progress
                setOcrProgress(50 + Math.round(m.progress * 50));
              }
            }
          }
        );
        combinedText += "=== BACK OF ID ===\n" + backResult.data.text;
      }

      setExtractedText(combinedText);
      
      // Perform verification matching using combined text
      const results = performVerification(combinedText, selectedUser);
      setVerificationResults(results);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to process the ID image. Please try again.",
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

  // Perform verification against user data
  const performVerification = (extractedText, user) => {
    // Required fields - must match for verification (name fields)
    const requiredFields = [
      { label: 'First Name', value: user.firstName, key: 'firstName', required: true },
      { label: 'Last Name', value: user.lastName, key: 'lastName', required: true },
      { label: 'Middle Name', value: user.middleName, key: 'middleName', required: true },
    ];

    // Optional fields - bonus if matched, but don't count against score if not found in ID
    const optionalFields = [
      { label: 'Date of Birth', value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null, key: 'dateOfBirth', required: false },
      { label: 'Gender', value: user.gender, key: 'gender', required: false },
      { label: 'Address', value: `${user.address?.houseNumber || ''} ${user.address?.street || ''} ${user.address?.subdivision || ''}`.trim(), key: 'address', required: false },
    ];

    const allFields = [...requiredFields, ...optionalFields];

    const results = allFields.map(field => ({
      ...field,
      ...checkMatch(extractedText, field.value)
    }));

    // Calculate score based only on required fields (name fields)
    const requiredResults = results.filter(r => r.required && r.value);
    const matchedRequiredFields = requiredResults.filter(r => r.matched).length;
    const totalRequiredFields = requiredResults.length;

    // Bonus points for optional fields that match (adds up to 10% bonus)
    const optionalResults = results.filter(r => !r.required && r.value);
    const matchedOptionalFields = optionalResults.filter(r => r.matched).length;
    const optionalBonus = optionalResults.length > 0 
      ? Math.round((matchedOptionalFields / optionalResults.length) * 10) 
      : 0;

    // Base score from required fields + optional bonus
    const baseScore = totalRequiredFields > 0 
      ? Math.round((matchedRequiredFields / totalRequiredFields) * 90) 
      : 0;
    const overallScore = Math.min(100, baseScore + optionalBonus);

    return {
      fields: results,
      overallScore,
      totalFields: totalRequiredFields,
      matchedFields: matchedRequiredFields,
      optionalMatched: matchedOptionalFields,
      totalOptional: optionalResults.length
    };
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

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pending Registrations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Review and approve resident registration requests
            </p>
          </div>
          <button
            onClick={fetchPendingRegistrations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
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
            <p className="text-gray-600">Loading pending registrations...</p>
          </div>
        </div>
      ) : !pendingUsers || pendingUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Pending Registrations</h3>
          <p className="text-gray-600 dark:text-gray-400">There are currently no pending resident registration requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{user.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {user.address?.houseNumber} {user.address?.street} {user.address?.subdivision}, Brgy. Culiat, Quezon City
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(user)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details & Decide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedUser && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
            setActionType(null);
            setRejectionReason("");
          }}
          title={`${selectedUser.firstName} ${selectedUser.lastName}`}
          size="3xl"
        >
          <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Account Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1.5 text-xs">Account Credentials</h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-blue-700 dark:text-blue-300 font-medium text-[10px]">Username</label>
                  <p className="text-blue-900 dark:text-blue-100">@{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-blue-700 dark:text-blue-300 font-medium text-[10px]">Email</label>
                  <p className="text-blue-900 dark:text-blue-100">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 text-xs">Personal Information</h4>
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="col-span-3">
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Full Name</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName}{selectedUser.suffix ? ` ${selectedUser.suffix}` : ''}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Date of Birth</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Gender</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Civil Status</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.civilStatus || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Phone</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Occupation</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.occupation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Religion</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.religion || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 text-xs">Address</h4>
              <div className="text-xs">
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedUser.address?.houseNumber} {selectedUser.address?.street} {selectedUser.address?.subdivision}, Barangay Culiat, Quezon City
                </p>
              </div>
            </div>

            {/* Spouse Information (if married) */}
            {selectedUser.spouseInfo && selectedUser.spouseInfo.name && (
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-2.5">
                <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-1.5 text-xs">Spouse Information</h4>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-pink-700 dark:text-pink-300 font-medium text-[10px]">Name</label>
                    <p className="text-pink-900 dark:text-pink-100">{selectedUser.spouseInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-pink-700 dark:text-pink-300 font-medium text-[10px]">Occupation</label>
                    <p className="text-pink-900 dark:text-pink-100">{selectedUser.spouseInfo.occupation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-pink-700 dark:text-pink-300 font-medium text-[10px]">Contact</label>
                    <p className="text-pink-900 dark:text-pink-100">{selectedUser.spouseInfo.contactNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {selectedUser.emergencyContact && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2.5">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1.5 text-xs">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-orange-700 dark:text-orange-300 font-medium text-[10px]">Name</label>
                    <p className="text-orange-900 dark:text-orange-100">{selectedUser.emergencyContact.fullName}</p>
                  </div>
                  <div>
                    <label className="text-orange-700 dark:text-orange-300 font-medium text-[10px]">Relationship</label>
                    <p className="text-orange-900 dark:text-orange-100">{selectedUser.emergencyContact.relationship || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-orange-700 dark:text-orange-300 font-medium text-[10px]">Contact</label>
                    <p className="text-orange-900 dark:text-orange-100">{selectedUser.emergencyContact.contactNumber}</p>
                  </div>
                  <div>
                    <label className="text-orange-700 dark:text-orange-300 font-medium text-[10px]">Address</label>
                    <p className="text-orange-900 dark:text-orange-100">
                      {selectedUser.emergencyContact.address?.houseNumber} {selectedUser.emergencyContact.address?.street} {selectedUser.emergencyContact.address?.subdivision}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(selectedUser.tinNumber || selectedUser.sssGsisNumber || selectedUser.precinctNumber) && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 text-xs">Additional Information</h4>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {selectedUser.tinNumber && (
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">TIN</label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedUser.tinNumber}</p>
                    </div>
                  )}
                  {selectedUser.sssGsisNumber && (
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">SSS/GSIS</label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedUser.sssGsisNumber}</p>
                    </div>
                  )}
                  {selectedUser.precinctNumber && (
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">Precinct</label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedUser.precinctNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Valid ID / Proof of Residency */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                  {selectedUser.validID ? 'Valid ID (Front & Back)' : 'Proof of Residency'}
                </h4>
                {selectedUser.validID?.url && (
                  <button
                    onClick={handleVerifyID}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Verify Valid ID
                  </button>
                )}
              </div>
              {(selectedUser.validID?.url || selectedUser.proofOfResidency) ? (
                <div className="space-y-3">
                  {/* Front of ID */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Front of ID:</p>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={
                          selectedUser.validID?.url 
                            ? selectedUser.validID.url 
                            : `${API_URL}/${selectedUser.proofOfResidency}`
                        }
                        alt={selectedUser.validID ? "Valid ID Front" : "Proof of Residency"}
                        className="w-full h-auto max-h-48 object-contain bg-white dark:bg-gray-800"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  {/* Back of ID */}
                  {selectedUser.backOfValidID?.url && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Back of ID:</p>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={selectedUser.backOfValidID.url}
                          alt="Valid ID Back"
                          className="w-full h-auto max-h-48 object-contain bg-white dark:bg-gray-800"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic text-xs">No ID/proof uploaded</p>
              )}
            </div>

            {/* Action Buttons or Rejection Form */}
            {actionType === null && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setActionType("approve")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Registration
                </button>
                <button
                  onClick={() => setActionType("reject")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Registration
                </button>
              </div>
            )}

            {actionType === "approve" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 mb-4">
                  Are you sure you want to approve this registration? The resident will be able to log in immediately.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Confirm Approval"}
                  </button>
                  <button
                    onClick={() => setActionType(null)}
                    disabled={processing}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {actionType === "reject" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Please provide a clear reason for rejecting this registration..."
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Confirm Rejection"}
                  </button>
                  <button
                    onClick={() => setActionType(null)}
                    disabled={processing}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Verification Modal - Full Screen */}
      {showVerifyModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">ID Verification</h2>
                  <p className="text-blue-100 text-sm">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setExtractedText("");
                  setVerificationResults(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Panel - Large ID Images (Front & Back) */}
              <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-auto bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <ZoomIn className="w-5 h-5 text-blue-600" />
                  Valid ID Document
                </h3>
                <div className="space-y-4">
                  {/* Front of ID */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 px-2">Front of ID:</p>
                    <img
                      ref={imageRef}
                      src={selectedUser.validID?.url}
                      alt="Valid ID Front"
                      className="w-full h-auto rounded-lg object-contain"
                      style={{ maxHeight: '35vh' }}
                    />
                  </div>
                  {/* Back of ID */}
                  {selectedUser.backOfValidID?.url && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 px-2">Back of ID:</p>
                      <img
                        src={selectedUser.backOfValidID.url}
                        alt="Valid ID Back"
                        className="w-full h-auto rounded-lg object-contain"
                        style={{ maxHeight: '35vh' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - OCR Results & Verification */}
              <div className="w-1/2 p-6 overflow-auto">
                {ocrLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{ocrProgress}%</span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                      Scanning ID document{selectedUser.backOfValidID?.url ? 's' : ''}...
                    </p>
                    <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {ocrProgress < 30 ? 'Scanning front of ID...' : 
                       ocrProgress < 50 ? 'Extracting text from front...' :
                       ocrProgress < 70 ? 'Scanning back of ID...' : 
                       'Analyzing results...'}
                    </p>
                  </div>
                ) : verificationResults ? (
                  <div className="space-y-4">
                    {/* Overall Score */}
                    <div className={`p-4 rounded-xl border-2 ${
                      verificationResults.overallScore >= 70 
                        ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' 
                        : verificationResults.overallScore >= 40
                        ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700'
                        : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Verification Score
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {verificationResults.matchedFields} of {verificationResults.totalFields} name fields matched
                            {verificationResults.optionalMatched > 0 && (
                              <span className="text-green-600"> (+{verificationResults.optionalMatched} optional)</span>
                            )}
                          </p>
                        </div>
                        <div className={`text-4xl font-bold ${
                          verificationResults.overallScore >= 70 ? 'text-green-600' : 
                          verificationResults.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {verificationResults.overallScore}%
                        </div>
                      </div>
                    </div>

                    {/* Required Fields - Name Verification */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        Name Verification
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Required</span>
                      </h3>
                      <div className="space-y-2">
                        {verificationResults.fields.filter(f => f.required).map((field, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              !field.value 
                                ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                : field.matched 
                                ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-600' 
                                : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  {field.label}
                                </p>
                                <p className={`font-semibold ${
                                  !field.value 
                                    ? 'text-gray-400 italic' 
                                    : field.matched 
                                    ? 'text-green-700 dark:text-green-300' 
                                    : 'text-red-700 dark:text-red-300'
                                }`}>
                                  {field.value || 'Not provided'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {field.value && (
                                  <>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                      field.matched 
                                        ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' 
                                        : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                                    }`}>
                                      {field.confidence}% match
                                    </span>
                                    {field.matched ? (
                                      <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                      <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optional Fields - Additional Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-400" />
                        Additional Information
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Optional</span>
                      </h3>
                      <div className="space-y-2">
                        {verificationResults.fields.filter(f => !f.required).map((field, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border transition-all ${
                              !field.value 
                                ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                : field.matched 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-700' 
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  {field.label}
                                </p>
                                <p className={`font-medium ${
                                  !field.value 
                                    ? 'text-gray-400 italic' 
                                    : field.matched 
                                    ? 'text-green-700 dark:text-green-300' 
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {field.value || 'Not provided'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {field.value && field.matched && (
                                  <>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                                      Bonus +
                                    </span>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  </>
                                )}
                                {field.value && !field.matched && (
                                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                    Not found in ID
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        * Optional fields don't affect the verification score negatively if not found in the ID
                      </p>
                    </div>

                    {/* Extracted Text Preview */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Extracted Text from ID
                      </h3>
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 max-h-48 overflow-auto">
                        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                          {extractedText || 'No text extracted'}
                        </pre>
                      </div>
                    </div>

                    {/* Action Hint */}
                    <div className={`p-4 rounded-lg ${
                      verificationResults.overallScore >= 70 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      <p className={`text-sm font-medium ${
                        verificationResults.overallScore >= 70 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {verificationResults.overallScore >= 70 
                          ? '✓ ID verification looks good! The submitted information matches the ID document.'
                          : '⚠ Some fields may not match. Please review the ID carefully before approving.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Search className="w-16 h-16 mb-4 opacity-30" />
                    <p>Click "Verify Valid ID" to start the verification process</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setExtractedText("");
                  setVerificationResults(null);
                }}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              {verificationResults && (
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    if (verificationResults.overallScore >= 70) {
                      setActionType("approve");
                    }
                  }}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                    verificationResults.overallScore >= 70
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {verificationResults.overallScore >= 70 ? 'Proceed to Approve' : 'Review & Decide'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
