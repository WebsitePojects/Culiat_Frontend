import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  User,
  MapPin,
  Calendar,
  Download,
  ExternalLink,
  Clock,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PaymentPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [requestId]);

  // Poll for payment verification after returning from payment
  useEffect(() => {
    if (paymentDetails?.paymentStatus === 'unpaid' && paymentDetails?.paymentReference) {
      const interval = setInterval(() => {
        verifyPayment(false);
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [paymentDetails?.paymentStatus, paymentDetails?.paymentReference]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/payments/details/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentDetails(response.data.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Document request not found");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view this payment");
      } else {
        setError("Failed to load payment details");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (showLoading = true) => {
    try {
      if (showLoading) setVerifying(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/payments/verify/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.paid) {
        // Refresh payment details
        await fetchPaymentDetails();
      }
    } catch (err) {
      // Verification error - silently fail
    } finally {
      if (showLoading) setVerifying(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_URL}/api/payments/create-link`,
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.isFree) {
        // Document is free, refresh the page
        await fetchPaymentDetails();
        return;
      }

      if (response.data.paymentLink) {
        // Open payment link in new tab
        window.open(response.data.paymentLink, '_blank');
        
        // Refresh payment details to get reference number
        await fetchPaymentDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/documents/download/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
      let filename = `${paymentDetails?.documentLabel || "document"}.docx`;
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
      if (err.response?.status === 402) {
        setError("Please complete payment first to download this document.");
      } else {
        setError("Failed to download document");
      }
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      approved: { bg: "bg-blue-100", text: "text-blue-800", icon: CheckCircle },
      completed: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      unpaid: { bg: "bg-orange-100", text: "text-orange-800", icon: CreditCard },
      paid: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      waived: { bg: "bg-blue-100", text: "text-blue-800", icon: CheckCircle },
    };
    const config = statusConfig[status] || statusConfig.unpaid;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status === 'waived' ? 'Fee Waived' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading payment details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canPay = paymentDetails?.status === 'approved' && paymentDetails?.paymentStatus === 'unpaid' && !paymentDetails?.isFree;
  const canDownload = (paymentDetails?.status === 'approved' || paymentDetails?.status === 'completed') && 
                       (paymentDetails?.paymentStatus === 'paid' || paymentDetails?.paymentStatus === 'waived' || paymentDetails?.isFree);
  const isPending = paymentDetails?.status === 'pending';
  const isRejected = paymentDetails?.status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/services")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Secure Payment</h1>
                <p className="text-blue-100">Document Request Payment Portal</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Document Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Document Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <p className="font-medium text-gray-900">{paymentDetails?.documentLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Status</p>
                  <div className="mt-1">{getStatusBadge(paymentDetails?.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <div className="mt-1">{getPaymentStatusBadge(paymentDetails?.paymentStatus)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Date</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(paymentDetails?.createdAt)}
                  </p>
                </div>
                {paymentDetails?.purposeOfRequest && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Purpose</p>
                    <p className="font-medium text-gray-900">{paymentDetails?.purposeOfRequest}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Applicant Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Applicant Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {paymentDetails?.applicant?.firstName} {paymentDetails?.applicant?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{paymentDetails?.applicant?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium text-gray-900">{paymentDetails?.applicant?.phone || 'N/A'}</p>
                </div>
                {paymentDetails?.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900 flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>
                        {[
                          paymentDetails.address.houseNumber,
                          paymentDetails.address.street,
                          paymentDetails.address.subdivision,
                          'Brgy. Culiat, Quezon City'
                        ].filter(Boolean).join(', ')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Summary
              </h2>
              <div className="flex justify-between items-center py-3 border-b border-blue-200">
                <span className="text-gray-600">Document Fee</span>
                <span className="font-medium text-gray-900">
                  {paymentDetails?.isFree ? 'FREE' : formatCurrency(paymentDetails?.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  {paymentDetails?.isFree ? 'FREE' : formatCurrency(paymentDetails?.amount || 0)}
                </span>
              </div>
            </div>

            {/* Status Messages */}
            {isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800">Awaiting Approval</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your document request is currently under review. You will be able to pay once it has been approved by the barangay admin.
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Request Rejected</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Unfortunately, your document request has been rejected. Please contact the barangay office for more information or submit a new request.
                  </p>
                </div>
              </div>
            )}

            {canDownload && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800">Payment Complete!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment has been confirmed. You can now download your document below.
                  </p>
                </div>
              </div>
            )}

            {paymentDetails?.paymentReference && paymentDetails?.paymentStatus === 'unpaid' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800">Payment in Progress</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    A payment link has been opened. Complete your payment in the new tab, then click "Verify Payment" below.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Reference: {paymentDetails.paymentReference}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {canPay && (
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay Now - {formatCurrency(paymentDetails?.amount || 0)}
                    </>
                  )}
                </button>
              )}

              {paymentDetails?.paymentReference && paymentDetails?.paymentStatus === 'unpaid' && (
                <button
                  onClick={() => verifyPayment(true)}
                  disabled={verifying}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify Payment
                    </>
                  )}
                </button>
              )}

              {canDownload && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Document
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t">
              <Shield className="w-4 h-4" />
              <span>Your payment is secured by PayMongo. We never store your card details.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
