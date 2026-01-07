import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useMemo } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import MaintenancePage from "./components/MaintenancePage";
import BypassForm from "./components/BypassForm";
import ProfileWarningModal from "./components/ProfileWarningModal";
import ApprovedDocumentModal from "./components/ApprovedDocumentModal";
import AdminLogin from "./tailadminsrc/pages/AuthPages/SignIn";
import Register from "./users/pages/Auth/Register";
import RegistrationPending from "./users/pages/Auth/RegistrationPending";
import Dashboard from "./users/pages/Home/Dashboard";
import Reports from "./users/pages/Reports/Reports";
import NewReport from "./users/pages/Reports/NewReport";
import ReportDetail from "./users/pages/Reports/ReportDetail";
import Announcements from "./users/pages/Announcement/Announcements";
import AnnouncementDetail from "./users/pages/Announcement/AnnouncementDetail";
import Services from "./users/pages/Services/Services";
import MainLayout from "./MainLayout/MainLayout";
import Home from "./users/pages/Home/Home";
import About from "./users/pages/About/About";
import PolicyPopup from "./components/PolicyPopup";
import NotFound from "./tailadminsrc/pages/OtherPage/NotFound";

// Admin imports
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard/AdminDashboard";
import AdminReports from "./admin/pages/Reports/AdminReports";
import AdminAnnouncements from "./admin/pages/Announcements/AdminAnnouncements";
import AdminUsers from "./admin/pages/Users/AdminUsers";
import PendingRegistrations from "./admin/pages/Users/PendingRegistrations";
import RegistrationHistory from "./admin/pages/Users/RegistrationHistory";
import SettingsPage from "./admin/pages/Settings/SettingsPage";
import AdminDocuments from "./admin/pages/Documents/AdminDocuments";
import AdminAnalytics from "./admin/pages/Analytics/AdminAnalytics";
import AdminCalendar from "./admin/pages/Calendar/AdminCalendar";
import AdminNotifications from "./admin/pages/Notifications/AdminNotifications";
import AdminTermsAcceptances from "./admin/pages/TermsAcceptances/AdminTermsAcceptances";
import AdminAchievements from "./admin/pages/Achievements/AdminAchievements";
import AdminOfficials from "./admin/pages/Officials/AdminOfficials";
import CMSServices from "./admin/pages/CMS/CMSServices";
import CMSAboutUs from "./admin/pages/CMS/CMSAboutUs";
import AdminProfile from "./admin/pages/Profile/AdminProfile";
import DocumentRequestHistory from "./admin/pages/ActivityLogs/DocumentRequestHistory";
import DocumentPayments from "./admin/pages/Transparency/DocumentPayments";
import WebsiteFeedback from "./admin/pages/Feedback/WebsiteFeedback";
import ProfileVerifications from "./admin/pages/ProfileVerifications/ProfileVerifications";
import ProfileUpdates from "./admin/pages/ProfileUpdates/ProfileUpdates";

// Resident Auth
import ResidentAuth from "./users/pages/Auth/ResidentAuth";
import Profile from "./users/pages/Profile/Profile";
import Achievements from "./users/pages/Achievements/Achievements";
import ForgotPassword from "./users/pages/Auth/ForgotPassword";
import ResetPassword from "./users/pages/Auth/ResetPassword";
import PaymentPage from "./users/pages/Payment/PaymentPage";
import LegalPage from "./users/pages/Legal/LegalPage";

// Document Verification (Public - QR Code scan)
import VerificationPage from "./users/pages/Verification/VerificationPage";

// Global click handler to dismiss toasts
const ToastDismissWrapper = ({ children }) => {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Don't dismiss if clicking on the toast itself
      const toastContainer = document.querySelector('[data-sonner-toaster]') || 
                             document.querySelector('.go2072408551') || // react-hot-toast container class
                             e.target.closest('[role="status"]');
      if (toastContainer && toastContainer.contains(e.target)) {
        return;
      }
      // Dismiss all toasts on any click/touch
      toast.dismiss();
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('touchstart', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('touchstart', handleGlobalClick);
    };
  }, []);

  return children;
};

// PSA Warning Modal Wrapper - uses auth context
const PsaWarningModalWrapper = () => {
  const { showPsaWarningModal, psaWarningData, closePsaWarningModal } = useAuth();
  
  return (
    <ProfileWarningModal 
      isOpen={showPsaWarningModal}
      onClose={closePsaWarningModal}
      daysLeft={psaWarningData?.daysLeft}
      deadline={psaWarningData?.deadline}
      verificationStatus={psaWarningData?.verificationStatus}
      rejectionReason={psaWarningData?.rejectionReason}
    />
  );
};

// Approved Document Notification Modal Wrapper - uses auth context
const ApprovedDocModalWrapper = () => {
  const { showApprovedDocModal, approvedDocRequests, closeApprovedDocModal } = useAuth();
  
  return (
    <ApprovedDocumentModal 
      isOpen={showApprovedDocModal}
      onClose={closeApprovedDocModal}
      approvedRequests={approvedDocRequests}
    />
  );
};

function App() {
  const location = useLocation();
  const bypassKeyword = useMemo(() => {
    const bypassKeywordRaw = (import.meta.env.VITE_MAINTENANCE_BYPASS_KEYWORD || "vergel").toLowerCase().trim();
    return bypassKeywordRaw.replace(/[^a-z0-9-]/g, "") || "vergel";
  }, []);
  const pathname = location?.pathname?.toLowerCase() || "";
  const search = location?.search || "";
  const hash = location?.hash || "";

  const maintenanceBypassActive = useMemo(() => {
    // Check localStorage first for persistent bypass
    const storedBypass = localStorage.getItem('maintenanceBypass');
    const bypassTime = localStorage.getItem('maintenanceBypassTime');
    
    if (storedBypass && storedBypass.toLowerCase() === bypassKeyword && bypassTime) {
      const timeElapsed = Date.now() - parseInt(bypassTime);
      const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes
      
      // Check if bypass has expired (more than 10 minutes)
      if (timeElapsed > tenMinutesInMs) {
        // Bypass expired, clear localStorage
        localStorage.removeItem('maintenanceBypass');
        localStorage.removeItem('maintenanceBypassTime');
        return false;
      }
      return true;
    }

    // Check URL parameters
    const pathnameSegments = pathname.split("/").filter(Boolean);
    const searchParams = new URLSearchParams(search);
    const hashValue = hash.replace(/^#/, "").toLowerCase();

    let hasBypassParam = false;
    for (const [key, value] of searchParams.entries()) {
      if (key.toLowerCase() === bypassKeyword || value.toLowerCase() === bypassKeyword) {
        hasBypassParam = true;
        break;
      }
    }

    const urlBypass = pathnameSegments.includes(bypassKeyword) || hasBypassParam || hashValue === bypassKeyword;
    
    // If bypass is in URL, store it in localStorage with timestamp
    if (urlBypass) {
      localStorage.setItem('maintenanceBypass', bypassKeyword);
      localStorage.setItem('maintenanceBypassTime', Date.now().toString());
    }

    return urlBypass;
  }, [pathname, search, hash, bypassKeyword]);
  const bypassPath = useMemo(() => `/${bypassKeyword}`, [bypassKeyword]);
  const homeElement = useMemo(() => (
      <MainLayout>
        <Home />
      </MainLayout>
    ), []);

  // Check if maintenance mode is enabled
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // If maintenance mode is active and not on bypass page, show maintenance page
  if (isMaintenanceMode && !maintenanceBypassActive && pathname !== '/bypass') {
    return <MaintenancePage />;
  }

  return (
    <>
      <AuthProvider>
        <ToastDismissWrapper>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            style: {
              background: "#1F2937",
              color: "#F3F4F6",
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.875rem",
              maxWidth: "500px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#F3F4F6",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#F3F4F6",
              },
            },
            loading: {
              iconTheme: {
                primary: "#3B82F6",
                secondary: "#F3F4F6",
              },
            },
          }}
        />

        {/* 👇 Render only on client side */}
        {typeof window !== "undefined" && <PolicyPopup />}

        {/* PSA Profile Completion Warning Modal */}
        <PsaWarningModalWrapper />

        {/* Approved Document Notification Modal */}
        <ApprovedDocModalWrapper />

        <Routes>
          {/* Maintenance Bypass Route - Always accessible */}
          <Route path="/bypass" element={<BypassForm />} />
          
          {/* PUBLIC: Document Verification via QR Code */}
          <Route path="/verify/:token" element={<VerificationPage />} />
          
          {/* Public Routes */}
          <Route path="/signin" element={<AdminLogin />} />
          <Route path="/login" element={<ResidentAuth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />
          <Route
            path="/registration-pending"
            element={<RegistrationPending />}
          />

          {/* User Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* User Profile Route */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Admin Routes with AdminLayout */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route
              path="terms-acceptances"
              element={<AdminTermsAcceptances />}
            />
            <Route path="reports" element={<AdminReports />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="achievements" element={<AdminAchievements />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route
              path="pending-registrations"
              element={<PendingRegistrations />}
            />
            <Route
              path="registration-history"
              element={<RegistrationHistory />}
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="officials" element={<AdminOfficials />} />
            <Route path="cms/services" element={<CMSServices />} />
            <Route path="cms/about-us" element={<CMSAboutUs />} />
            <Route path="document-history" element={<DocumentRequestHistory />} />
            <Route path="document-payments" element={<DocumentPayments />} />
            <Route path="feedback" element={<WebsiteFeedback />} />
            <Route path="profile-verifications" element={<ProfileVerifications />} />
            <Route path="profile-updates" element={<ProfileUpdates />} />
          </Route>

          {/* User Routes with MainLayout */}
          <Route
            path="/"
            element={homeElement}
          />

          {/* Maintenance bypass route */}
          <Route
            path={bypassPath}
            element={homeElement}
          />

          <Route
            path="/reports"
            element={
              <MainLayout>
                <Reports />
              </MainLayout>
            }
          />

          <Route
            path="/reports/newreport"
            element={
              <MainLayout>
                <NewReport />
              </MainLayout>
            }
          />

          <Route
            path="/reports/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ReportDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <MainLayout>
                <Announcements />
              </MainLayout>
            }
          />
          <Route
            path="/announcements/:slug"
            element={
              <MainLayout>
                <AnnouncementDetail />
              </MainLayout>
            }
          />
          <Route
            path="/achievements"
            element={
              <MainLayout>
                <Achievements />
              </MainLayout>
            }
          />
          <Route
            path="/services/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Services />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Payment Route */}
          <Route
            path="/payment/:requestId"
            element={
              <PrivateRoute>
                <MainLayout>
                  <PaymentPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/about"
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />

          {/* Legal Pages - Privacy Policy & Terms */}
          <Route
            path="/legal"
            element={
              <MainLayout>
                <LegalPage />
              </MainLayout>
            }
          />

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ToastDismissWrapper>
      </AuthProvider>
    </>
  );
}

export default App;
