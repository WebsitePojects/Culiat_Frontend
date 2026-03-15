import React, { useState, useEffect } from "react";
import { X, MessageSquare, Calendar, User, Star } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ReplyModal = ({ isOpen, onClose, notificationId, notificationType }) => {
  const [messageData, setMessageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && notificationId) {
      fetchMessage();
    }
  }, [isOpen, notificationId]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract message ID from notification ID (format: "type_messageId")
      const messageId = notificationId.split("_").pop();
      const endpoint =
        notificationType === "feedback_response"
          ? `/api/contact-messages/guest/${messageId}`
          : `/api/committee-messages/guest/${messageId}`;

      const response = await axios.get(`${API_URL}${endpoint}`);
      if (response.data.success) {
        setMessageData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching message:", err);
      setError("Failed to load message details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-600 ml-2">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {notificationType === "feedback_response"
                        ? "Feedback Reply"
                        : "Committee Reply"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {notificationType === "feedback_response"
                        ? "Admin feedback response"
                        : "Committee message response"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading message...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : messageData ? (
                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {messageData.firstName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {messageData.firstName} {messageData.lastName}
                      </p>
                      {messageData.email && (
                        <p className="text-sm text-gray-600">{messageData.email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(messageData.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Your Message</h3>
                    </div>

                    {messageData.subject && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Subject
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {messageData.subject}
                        </p>
                      </div>
                    )}

                    {notificationType === "feedback_response" &&
                      messageData.rating && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Your Rating
                          </p>
                          {renderStars(messageData.rating)}
                        </div>
                      )}

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {messageData.message}
                      </p>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {messageData.response && messageData.response.message && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">
                          Admin Response
                        </h3>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 relative">
                        {/* Response badge */}
                        <div className="absolute -top-2 -left-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                            <MessageSquare className="w-3 h-3" />
                            REPLY
                          </span>
                        </div>

                        <div className="pt-2">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {messageData.response.message}
                          </p>

                          {messageData.response.respondedAt && (
                            <div className="mt-3 pt-3 border-t border-blue-200 text-[11px] text-gray-600 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Replied {formatDate(messageData.response.respondedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReplyModal;
