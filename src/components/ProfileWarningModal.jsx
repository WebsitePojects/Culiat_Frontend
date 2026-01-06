import { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, FileText, ArrowRight, Bell, Calendar, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * ProfileWarningModal
 * Shows a warning modal when user's PSA profile is incomplete
 * Displayed on login if deadline is approaching
 * Features: Live countdown timer, urgency levels, direct link to profile
 * 
 * TEMPORARILY DISABLED - Return null immediately
 */
const ProfileWarningModal = ({ 
  isOpen, 
  onClose, 
  daysLeft, 
  deadline, 
  verificationStatus,
  rejectionReason 
}) => {
  const navigate = useNavigate();
  const [isDismissing, setIsDismissing] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Live countdown timer
  useEffect(() => {
    if (!isOpen || !deadline) return;

    const calculateTimeLeft = () => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diff = deadlineDate - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isExpired: false,
      };
    };

    // Initial calculation
    setCountdown(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, deadline]);

  // Early return if not open OR if essential data is missing
  if (!isOpen) return null;
  
  // Don't render the backdrop if deadline is missing - prevent the broken modal state
  if (!deadline) {
    console.warn('ProfileWarningModal: deadline is missing, closing modal');
    if (onClose) onClose();
    return null;
  }

  // Safeguard for daysLeft being null/undefined
  const safeDaysLeft = daysLeft ?? 90;

  const getUrgencyLevel = () => {
    if (countdown.isExpired || safeDaysLeft <= 0) return 'expired';
    if (safeDaysLeft <= 7) return 'critical';
    if (safeDaysLeft <= 14) return 'warning';
    return 'info';
  };

  const urgencyLevel = getUrgencyLevel();

  const urgencyStyles = {
    expired: {
      bg: 'bg-gray-900',
      bgLight: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-500',
      title: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      badge: 'bg-red-500 text-white',
      gradient: 'from-red-600 to-red-800',
      countdownBg: 'bg-red-900/50',
    },
    critical: {
      bg: 'bg-red-600',
      bgLight: 'bg-red-50',
      border: 'border-red-300',
      icon: 'text-red-500',
      title: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700',
      badge: 'bg-red-100 text-red-700',
      gradient: 'from-red-500 to-red-700',
      countdownBg: 'bg-red-800/80',
    },
    warning: {
      bg: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      border: 'border-amber-300',
      icon: 'text-amber-500',
      title: 'text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700',
      badge: 'bg-amber-100 text-amber-700',
      gradient: 'from-amber-500 to-orange-600',
      countdownBg: 'bg-amber-800/80',
    },
    info: {
      bg: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      border: 'border-blue-300',
      icon: 'text-blue-500',
      title: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-100 text-blue-700',
      gradient: 'from-blue-500 to-blue-700',
      countdownBg: 'bg-blue-800/80',
    },
  };

  const styles = urgencyStyles[urgencyLevel] || urgencyStyles.info;

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await axios.post(`${API_URL}/api/profile-verification/dismiss-warning`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Failed to dismiss warning:', error);
    }
    setIsDismissing(false);
    onClose();
  };

  const handleGoToProfile = () => {
    onClose();
    navigate('/profile?tab=psa');
  };

  const formatDeadline = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Countdown display component
  const CountdownUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className={`${styles.countdownBg} rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[50px] sm:min-w-[60px]`}>
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-white/80 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={handleDismiss}
      />

      {/* Modal Container - centered modal */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div 
          style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 text-white/80 hover:text-white transition-colors z-10 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Gradient Header with Countdown */}
          <div className={`bg-gradient-to-br ${styles.gradient} px-4 sm:px-6 py-6 sm:py-8 text-center`}>
            {/* Bell Icon with Animation */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-white/30 rounded-full"></div>
                <div className="relative bg-white/20 rounded-full p-3 sm:p-4">
                  {urgencyLevel === 'expired' ? (
                    <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  ) : (
                    <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" />
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {urgencyLevel === 'expired' 
                ? '⚠️ Profile Update Overdue!'
                : urgencyLevel === 'critical'
                ? '🚨 Urgent Action Required!'
                : 'Complete Your Profile'}
            </h2>
            <p className="text-white/90 text-sm sm:text-base">
              {urgencyLevel === 'expired' 
                ? 'Your deadline has passed. Please complete your profile immediately.'
                : 'Your PSA Birth Certificate information is required'}
            </p>

            {/* Live Countdown Timer */}
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                <span className="text-white/80 text-xs sm:text-sm uppercase tracking-wider">
                  {countdown.isExpired ? 'Time Expired' : 'Time Remaining'}
                </span>
              </div>
              
              {countdown.isExpired ? (
                <div className="bg-red-900/50 rounded-xl px-6 py-4 inline-block">
                  <span className="text-2xl sm:text-3xl font-bold text-white">OVERDUE</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <span className="text-2xl sm:text-3xl font-bold text-white/60 pb-6">:</span>
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <span className="text-2xl sm:text-3xl font-bold text-white/60 pb-6">:</span>
                  <CountdownUnit value={countdown.minutes} label="Mins" />
                  <span className="text-2xl sm:text-3xl font-bold text-white/60 pb-6">:</span>
                  <CountdownUnit value={countdown.seconds} label="Secs" />
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Rejection message if any */}
            {verificationStatus === 'rejected' && rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-semibold text-sm">Previous submission rejected</p>
                    <p className="text-red-600 text-sm mt-1">{rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Deadline Info */}
            <div className={`${styles.bgLight} ${styles.border} border rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 ${styles.icon} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm">Deadline Date</p>
                  <p className={`font-semibold ${styles.title} text-sm sm:text-base truncate`}>
                    {formatDeadline(deadline)}
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements List */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <p className="text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 text-gray-500" />
                Required Information
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  PSA Certificate Number
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  Registry Number
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  Date & Place Issued
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  Father's Information
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  Mother's Information
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  Birth Certificate Copy
                </li>
              </ul>
            </div>

            {/* Info Note */}
            <p className="text-gray-500 text-xs sm:text-sm text-center px-2">
              Complete your profile to access all Barangay Culiat services. 
              Your submission will be reviewed by an administrator.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="border-t bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleDismiss}
              disabled={isDismissing}
              className="flex-1 px-4 py-2.5 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base order-2 sm:order-1"
            >
              {isDismissing ? 'Please wait...' : 'Remind Me Later'}
            </button>
            <button
              onClick={handleGoToProfile}
              className={`flex-1 px-4 py-2.5 sm:py-3 text-white ${styles.button} rounded-xl transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 shadow-lg hover:shadow-xl`}
            >
              Update Profile Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWarningModal;
