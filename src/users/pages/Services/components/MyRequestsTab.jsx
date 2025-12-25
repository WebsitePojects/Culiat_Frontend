import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Download,
  Loader2,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Pending Review",
  },
  approved: {
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Approved - Awaiting Payment",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Rejected",
  },
  completed: {
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Completed",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    label: "Cancelled",
  },
};

const paymentStatusConfig = {
  unpaid: {
    icon: CreditCard,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Unpaid",
  },
  paid: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Paid",
  },
  waived: {
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Fee Waived",
  },
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
};

export default function MyRequestsTab() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/document-requests/my-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (requestId, documentType) => {
    try {
      setDownloading(requestId);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/documents/download/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create download link for the blob
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      const docTypeLabel = documentTypeLabels[documentType] || documentType;
      let filename = `${docTypeLabel.replace(/\s+/g, "_")}.docx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      if (err.response?.status === 402) {
        alert("Please complete payment first to download this document.");
      } else if (err.response?.status === 404) {
        alert("Document not found. Please wait for admin to generate it.");
      } else {
        alert(
          "Failed to download document: " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Requests Yet
        </h3>
        <p className="text-gray-600">
          You haven't submitted any document requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">My Document Requests</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Track the status of your submitted document requests
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const status = statusConfig[request.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          const paymentStatus =
            paymentStatusConfig[request.paymentStatus] ||
            paymentStatusConfig.unpaid;
          const PaymentIcon = paymentStatus.icon;
          const price = DOCUMENT_PRICES[request.documentType] || 0;
          const isFree = price === 0;

          // Determine the actual status label based on payment
          let actualStatusLabel = status.label;
          if (request.status === "approved") {
            if (
              request.paymentStatus === "paid" ||
              request.paymentStatus === "waived" ||
              isFree
            ) {
              actualStatusLabel = "Ready for Download";
            } else {
              actualStatusLabel = "Approved - Awaiting Payment";
            }
          }

          return (
            <div
              key={request._id}
              className={`border-2 ${status.borderColor} ${status.bgColor} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status.bgColor}`}>
                    <FileText className={`h-5 w-5 ${status.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {documentTypeLabels[request.documentType] ||
                        request.documentType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted on {formatDate(request.createdAt)}
                    </p>
                    {request.controlNumber && (
                      <p className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                        Control #: {request.controlNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor} border ${status.borderColor}`}
                  >
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {actualStatusLabel}
                    </span>
                  </div>
                  {/* Payment Status Badge - only show for approved requests */}
                  {request.status === "approved" && !isFree && (
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${paymentStatus.bgColor}`}
                    >
                      <PaymentIcon
                        className={`h-3.5 w-3.5 ${paymentStatus.color}`}
                      />
                      <span
                        className={`text-xs font-medium ${paymentStatus.color}`}
                      >
                        {paymentStatus.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Purpose</p>
                  <p className="font-medium text-gray-900">
                    {request.purposeOfRequest || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Fee</p>
                  <p className="font-medium text-gray-900">
                    {isFree ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₱${price.toFixed(2)}`
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Fee</p>
                  <p className="font-medium text-gray-900">
                    {isFree ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₱${price.toFixed(2)}`
                    )}
                  </p>
                </div>
                {request.preferredPickupDate && (
                  <div>
                    <p className="text-gray-600">Preferred Pickup</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(request.preferredPickupDate)}
                    </p>
                  </div>
                )}
                {request.processedAt && (
                  <div>
                    <p className="text-gray-600">Processed On</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(request.processedAt)}
                    </p>
                  </div>
                )}
                {request.remarks && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Remarks</p>
                    <p className="font-medium text-gray-900">
                      {request.remarks}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Based on Status */}
              {/* Approved but not paid - show Pay button */}
              {request.status === "approved" &&
                request.paymentStatus === "unpaid" && (
                  <div className="mt-4 pt-4 border-t border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-sm text-blue-700">
                      <CreditCard className="inline w-4 h-4 mr-1" />
                      Your request has been approved! Please complete payment to
                      download your document.
                    </div>
                    <button
                      onClick={() => navigate(`/payment/${request._id}`)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Now - ₱{DOCUMENT_PRICES[request.documentType] || 0}
                    </button>
                  </div>
                )}

              {/* Approved/Completed and paid/waived or free - show Download button */}
              {(request.status === "approved" ||
                request.status === "completed") &&
                (request.paymentStatus === "paid" ||
                  request.paymentStatus === "waived" ||
                  DOCUMENT_PRICES[request.documentType] === 0) && (
                  <div className="mt-4 pt-4 border-t border-green-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-sm text-green-700">
                      <CheckCircle className="inline w-4 h-4 mr-1" />
                      {request.paymentStatus === "paid"
                        ? "Payment confirmed! Your document is ready for download."
                        : request.paymentStatus === "waived"
                        ? "Fee has been waived. Your document is ready for download."
                        : "Your document is ready for download."}
                    </div>
                    <button
                      onClick={() =>
                        handleDownload(request._id, request.documentType)
                      }
                      disabled={downloading === request._id}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === request._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Document
                        </>
                      )}
                    </button>
                  </div>
                )}

              {request.status === "rejected" && request.rejectionReason && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Reason:</strong> {request.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
