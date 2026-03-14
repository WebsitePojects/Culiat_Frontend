import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, XCircle, FileX, MessageSquare, MessageCircle, RefreshCw } from "lucide-react";
import { notificationAPI } from "../../services/api";
import { useAuth } from "../../../context/AuthContext";

const notificationIconByType = {
  registration_rejected: XCircle,
  document_rejected: FileX,
  committee_response: MessageSquare,
  feedback_response: MessageCircle,
};

const UserNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const defaultCounts = {
    registrationRejections: 0,
    documentRejections: 0,
    committeeResponses: 0,
    feedbackResponses: 0,
    total: 0,
    unreadTotal: 0,
  };
  const [counts, setCounts] = useState({
    registrationRejections: 0,
    documentRejections: 0,
    committeeResponses: 0,
    feedbackResponses: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [recentResponse, countsResponse] = await Promise.all([
        notificationAPI.getMyRecent({ limit: 200 }),
        notificationAPI.getMyCounts(),
      ]);

      setNotifications(recentResponse.data?.data?.notifications || []);
      setCounts(countsResponse.data?.data || defaultCounts);
    } catch (error) {
      console.error("Failed to fetch user notifications:", error);
      setNotifications([]);
      setCounts(defaultCounts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "registration_rejected", label: "Registration" },
    { key: "document_rejected", label: "Documents" },
    { key: "committee_response", label: "Committee" },
    { key: "feedback_response", label: "Feedback" },
  ];

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((notification) => notification.type === activeFilter);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedNotifications = filteredNotifications.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const getNotificationTarget = (notification) => {
    if (notification.type === "registration_rejected" && user?._id) {
      return `/register?reregisterId=${user._id}`;
    }
    return notification.link || null;
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.unread) {
        await notificationAPI.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, unread: false } : item
          )
        );
        setCounts((prev) => ({
          ...prev,
          unreadTotal: Math.max(0, (prev.unreadTotal || 0) - 1),
        }));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    const target = getNotificationTarget(notification);
    if (target) {
      navigate(target);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-neutral)" }}>
      <div className="relative overflow-hidden pt-20 md:pt-24 pb-14 md:pb-20" style={{
        background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-glow) 100%)",
      }}>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="hidden md:flex absolute right-8 top-24 flex-col gap-2.5">
          <span className="px-3 py-1.5 bg-white/15 border border-white/25 rounded-full text-xs text-white/90 font-medium">
            Registration Alerts
          </span>
          <span className="px-3 py-1.5 bg-white/15 border border-white/25 rounded-full text-xs text-white/90 font-medium">
            Document Updates
          </span>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                  {counts.total || 0} Total Notifications
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                Updates about registration review, document requests, committee replies, and feedback responses.
              </p>
            </div>

            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[var(--color-primary-dark)] rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-8 mb-6 md:mb-8">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-wide text-white/80">Registration</p>
              <p className="text-2xl font-bold text-white">{counts.registrationRejections || 0}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-wide text-white/80">Documents</p>
              <p className="text-2xl font-bold text-white">{counts.documentRejections || 0}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-wide text-white/80">Committee</p>
              <p className="text-2xl font-bold text-white">{counts.committeeResponses || 0}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-wide text-white/80">Feedback</p>
              <p className="text-2xl font-bold text-white">{counts.feedbackResponses || 0}</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-px left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            className="relative block w-[calc(100%+2px)] -ml-px h-16 md:h-24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="var(--color-neutral)"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-10 md:pb-14 -mt-2 relative z-10">
        <div className="sticky top-16 z-20 mb-3 md:mb-4">
          <div className="bg-[var(--color-light)]/95 backdrop-blur-md border border-[var(--color-neutral-active)] rounded-xl shadow-sm p-2 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {filterOptions.map((option) => {
                const isActive = activeFilter === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => setActiveFilter(option.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-neutral)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-active)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-neutral-active)] bg-[var(--color-light)] shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-[var(--color-text-secondary)]">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-neutral)] flex items-center justify-center mx-auto mb-3">
                <Bell className="w-7 h-7 text-[var(--color-text-secondary)]" />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {activeFilter === "all" ? "No notifications yet." : "No notifications in this category yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-neutral-active)]">
              {paginatedNotifications.map((notification) => {
                const Icon = notificationIconByType[notification.type] || Bell;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 md:p-5 transition-colors ${
                      notification.unread
                        ? "bg-[var(--color-neutral)] hover:bg-[var(--color-neutral-active)]"
                        : "bg-[var(--color-light)] hover:bg-[var(--color-neutral)]/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl border border-[var(--color-neutral-active)] flex items-center justify-center shrink-0 ${notification.unread ? "bg-[var(--color-neutral-active)]" : "bg-[var(--color-neutral)]"}`}>
                        <Icon className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className={`text-sm md:text-base text-[var(--color-text-color)] leading-snug ${notification.unread ? "font-bold" : "font-semibold"}`}>
                            {notification.title}
                          </p>
                          <span className="text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap mt-0.5">
                            {notification.time}
                          </span>
                        </div>
                        <p className={`text-sm mt-1.5 whitespace-pre-wrap break-words leading-relaxed ${notification.unread ? "text-[var(--color-text-color)]" : "text-[var(--color-text-secondary)]"}`}>
                          {notification.message}
                        </p>
                        {notification.unread && (
                          <span className="inline-flex mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white font-semibold">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!loading && filteredNotifications.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-neutral-active)] bg-[var(--color-light)] text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-xs font-semibold ${page === safePage
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-light)] border border-[var(--color-neutral-active)] text-[var(--color-text-secondary)]"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-neutral-active)] bg-[var(--color-light)] text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
