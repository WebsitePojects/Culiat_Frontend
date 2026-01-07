import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  X,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";

// Document prices (same as backend)
const DOCUMENT_PRICES = {
  indigency: 0,
  residency: 50,
  clearance: 100,
  business_permit: 500,
  business_clearance: 200,
  good_moral: 75,
  barangay_id: 150,
  liquor_permit: 300,
  missionary: 50,
  rehab: 50,
  ctc: 50,
  building_permit: 500,
};

const documentTypeLabels = {
  indigency: "Certificate of Indigency",
  residency: "Certificate of Residency",
  clearance: "Barangay Clearance",
  business_permit: "Business Permit",
  business_clearance: "Business Clearance",
  good_moral: "Certificate of Good Moral",
  barangay_id: "Barangay ID",
  liquor_permit: "Liquor Permit",
  missionary: "Missionary Certificate",
  rehab: "Rehabilitation Certificate",
  ctc: "Community Tax Certificate",
};

const ApprovedDocumentModal = ({ isOpen, onClose, approvedRequests = [] }) => {
  const navigate = useNavigate();

  // Filter to only show requests that need payment (approved + unpaid + not free)
  const pendingPaymentRequests = approvedRequests.filter((req) => {
    const price = DOCUMENT_PRICES[req.documentType] || 0;
    return (
      req.status === "approved" &&
      req.paymentStatus === "unpaid" &&
      price > 0
    );
  });

  // If no pending payments, don't show modal
  if (!isOpen || pendingPaymentRequests.length === 0) {
    return null;
  }

  const handlePayNow = (requestId) => {
    onClose();
    navigate(`/payment/${requestId}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate("/services?tab=my-requests");
  };

  const totalAmount = pendingPaymentRequests.reduce((sum, req) => {
    return sum + (DOCUMENT_PRICES[req.documentType] || 0);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-5 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              {/* Sparkle effects */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute top-3 right-12"
              >
                <Sparkles className="w-4 h-4 text-white/60" />
              </motion.div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Great News! 🎉
                    </h3>
                    <p className="text-sm text-green-100">
                      {pendingPaymentRequests.length === 1
                        ? "Your document request has been approved!"
                        : `${pendingPaymentRequests.length} document requests approved!`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Info message */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {pendingPaymentRequests.length === 1
                    ? "Complete your payment to download your document."
                    : "Complete payments to download your approved documents."}
                </p>
              </div>

              {/* Document list */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {pendingPaymentRequests.map((request, index) => {
                  const price = DOCUMENT_PRICES[request.documentType] || 0;
                  return (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {documentTypeLabels[request.documentType] ||
                              request.documentType}
                          </p>
                          {request.controlNumber && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              #{request.controlNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₱{price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <Clock className="w-3 h-3" />
                            <span>Awaiting Payment</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayNow(request._id)}
                          className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total */}
              {pendingPaymentRequests.length > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₱{totalAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Remind Me Later
              </button>
              <button
                onClick={handleViewAll}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl transition-all shadow-lg shadow-green-600/25"
              >
                View All Requests
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApprovedDocumentModal;
