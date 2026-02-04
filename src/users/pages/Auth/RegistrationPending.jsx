import { Link } from "react-router-dom";
import { 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  Mail, 
  FileCheck, 
  UserCheck,
  Shield,
  Sparkles
} from "lucide-react";

const RegistrationPending = () => {
  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Hero Section - Left Side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        {/* Animated Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-8 xl:px-16 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 text-sm font-medium group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Success Animation */}
          <div className="mb-5">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30 animate-bounce" style={{ animationDuration: '2s' }}>
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-xl">
            <h1 className="text-2xl xl:text-3xl font-bold mb-3 leading-tight">
              Registration
              <span className="block text-emerald-200 text-xl xl:text-2xl mt-1">
                Successfully Submitted! 🎉
              </span>
            </h1>

            <p className="text-base text-white/90 mb-5 leading-relaxed">
              Welcome to the Barangay Culiat community! Your application is now being processed by our team.
            </p>

            {/* Timeline Steps */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-400/30 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs mb-0.5">Application Received</h3>
                  <p className="text-white/80 text-[10px]">Your documents are now in our system</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-400/30 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs mb-0.5">Under Review</h3>
                  <p className="text-white/80 text-[10px]">Admin team is verifying your information</p>
                </div>
                <Clock className="w-4 h-4 text-yellow-300 flex-shrink-0 animate-pulse" />
              </div>

              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 opacity-60">
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs mb-0.5">Account Activated</h3>
                  <p className="text-white/80 text-[10px]">You'll receive email confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Card Section - Right Side */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-3 sm:p-4 relative">
        {/* Mobile Back Button */}
        <Link
          to="/"
          className="lg:hidden absolute top-3 left-3 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group z-20"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        {/* Decorative Elements for Mobile/Tablet */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Success Card */}
        <div className="w-full max-w-md relative">
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center mb-2 mt-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-1 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-base font-bold text-slate-800 mb-0.5">Success!</h1>
            <p className="text-slate-600 text-[10px]">Registration Submitted</p>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-slate-200/60">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2.5 sm:p-4 text-center">
              <div className="hidden lg:flex w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white mb-0.5">
                Thank You for Registering!
              </h2>
              <p className="text-emerald-100 text-[10px] sm:text-xs">
                Barangay Culiat E-Services Portal
              </p>
            </div>

            {/* Content Section */}
            <div className="p-2.5 sm:p-4">
              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full">
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold text-amber-700">Pending Approval</span>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 sm:p-3 mb-2">
                <div className="flex items-start gap-1.5">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center">
                    <FileCheck className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-emerald-800 font-medium">
                      Your registration has been submitted successfully!
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-emerald-600 mt-0.5">
                      Our admin team is reviewing your application and documents.
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Next Section */}
              <div className="mb-2">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  What happens next?
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-1.5 p-1.5 sm:p-2 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-2 h-2 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-700">Document Verification</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">Admin will review your valid ID</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1.5 p-1.5 sm:p-2 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="w-2 h-2 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-700">Email Notification</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">You'll receive an email once approved</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 p-1.5 sm:p-2 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Shield className="w-2 h-2 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-700">Full Access Granted</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">Access all barangay services online</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Time Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 mb-2">
                <div className="flex items-start gap-1.5">
                  <div className="flex-shrink-0 w-5 h-5 bg-amber-400 rounded-md flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-amber-800">
                      Processing Time
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-amber-700 mt-0.5">
                      Usually takes <span className="font-bold">1-3 business days</span>. For inquiries, contact us at <a href="mailto:brgy.culiat@yahoo.com" className="text-amber-800 underline hover:no-underline">brgy.culiat@yahoo.com</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-[10px] sm:text-xs tracking-wide"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Login
              </Link>
            </div>

            {/* Footer */}
            <div className="bg-slate-50/80 px-3 py-2 text-center border-t border-slate-200">
              <p className="text-[9px] sm:text-[10px] text-slate-500 mb-0.5">
                Need help? Contact us anytime
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-600 font-medium">
                © 2025 Barangay Culiat. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPending;
