import { useState, useEffect } from "react";
import { Wrench, Clock, Mail, AlertTriangle, RefreshCcw } from "lucide-react";

const MaintenancePage = () => {
  const [dots, setDots] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [showCountdown, setShowCountdown] = useState(true);

  // Get custom message from env
  const customMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE || 
    "We're currently performing scheduled maintenance to improve your experience. Our system will be back online shortly. Thank you for your patience!";

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer - uses VITE_MAINTENANCE_END_TIME or defaults to 30 minutes
  useEffect(() => {
    let estimatedTime;
    const endTimeEnv = import.meta.env.VITE_MAINTENANCE_END_TIME;

    if (endTimeEnv && endTimeEnv.trim() !== "") {
      // Parse environment variable date/time
      // Expected format: YYYY-MM-DD HH:MM or ISO string
      estimatedTime = new Date(endTimeEnv);
      
      // Validate the date
      if (isNaN(estimatedTime.getTime())) {
        console.error("Invalid VITE_MAINTENANCE_END_TIME format. Using default 30 minutes.");
        estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
      }
    } else {
      // Default: 30 minutes from now
      estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
    }

    // Check if time is in the past
    const now = new Date();
    if (estimatedTime <= now) {
      setCountdown("Anytime now");
      setShowCountdown(true);
      return;
    }
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = estimatedTime - now;
      
      if (diff <= 0) {
        setCountdown("Anytime now");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          {/* Icon Container */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-full">
                <Wrench className="w-16 h-16 text-white animate-spin-slow" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              We'll Be Right Back
            </h1>
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-xl font-semibold">
                System Under Maintenance{dots}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300 text-center text-lg leading-relaxed">
              {customMessage}
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Estimated Time */}
            <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-5 border border-blue-100 dark:border-gray-600">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Estimated Time
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {countdown || "Calculating..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-amber-50 dark:bg-gray-700 rounded-xl p-5 border border-amber-100 dark:border-gray-600">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <RefreshCcw className="w-5 h-5 text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Current Status
                  </p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                    In Progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Need urgent assistance?
                </p>
                <a
                  href="mailto:barangayculiat@gmail.com"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  barangayculiat@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="text-center">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <RefreshCcw className="w-5 h-5" />
              Check Status
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Barangay Culiat Management System • Maintenance Mode Active
            </p>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              99.9%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Uptime Record
            </p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              24/7
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Support Available
            </p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              Secure
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Data Protected
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;
