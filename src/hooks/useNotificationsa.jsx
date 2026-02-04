import React, { useEffect, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  duration: 5000,
  position: 'top-right',
  style: {
    background: '#1F2937',
    color: '#F3F4F6',
    borderRadius: '0.5rem',
    padding: '1rem',
    fontSize: '0.875rem',
    maxWidth: '500px',
  },
  success: {
    iconTheme: {
      primary: '#10B981',
      secondary: '#F3F4F6',
    },
  },
  error: {
    iconTheme: {
      primary: '#EF4444',
      secondary: '#F3F4F6',
    },
  },
};

// Notification types
export const notificationTypes = {
  NEW_REGISTRATION: 'NEW_REGISTRATION',
  NEW_DOCUMENT_REQUEST: 'NEW_DOCUMENT_REQUEST',
  NEW_REPORT: 'NEW_REPORT',
  DOCUMENT_COMPLETED: 'DOCUMENT_COMPLETED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  REPORT_RESOLVED: 'REPORT_RESOLVED',
  ANNOUNCEMENT_PUBLISHED: 'ANNOUNCEMENT_PUBLISHED',
  SYSTEM_UPDATE: 'SYSTEM_UPDATE',
};

// Notification service class
class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.notifications = [];
  }

  showToast(type, message, data = {}) {
    const notification = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.notifications.push(notification);
    this.notifyListeners(notification);

    switch (type) {
      case notificationTypes.NEW_REGISTRATION:
        return toast.success(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">New Registration</div>
              <div className="text-sm opacity-90">{message}</div>
              {data.userName && (
                <div className="text-xs opacity-75 mt-1">User: {data.userName}</div>
              )}
            </div>
          ),
          toastConfig
        );

      case notificationTypes.NEW_DOCUMENT_REQUEST:
        return toast(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">Document Request</div>
              <div className="text-sm opacity-90">{message}</div>
              {data.documentType && (
                <div className="text-xs opacity-75 mt-1">Type: {data.documentType}</div>
              )}
            </div>
          ),
          {
            ...toastConfig,
            style: {
              ...toastConfig.style,
              background: '#3B82F6',
            },
          }
        );

      case notificationTypes.NEW_REPORT:
        return toast(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">New Report</div>
              <div className="text-sm opacity-90">{message}</div>
              {data.category && (
                <div className="text-xs opacity-75 mt-1">Category: {data.category}</div>
              )}
              {data.priority && (
                <div className="text-xs opacity-75">Priority: {data.priority}</div>
              )}
            </div>
          ),
          {
            ...toastConfig,
            style: {
              ...toastConfig.style,
              background: '#F59E0B',
            },
          }
        );

      case notificationTypes.DOCUMENT_COMPLETED:
        return toast.success(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">Document Completed</div>
              <div className="text-sm opacity-90">{message}</div>
            </div>
          ),
          toastConfig
        );

      case notificationTypes.DOCUMENT_REJECTED:
        return toast.error(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">Document Rejected</div>
              <div className="text-sm opacity-90">{message}</div>
            </div>
          ),
          toastConfig
        );

      case notificationTypes.ANNOUNCEMENT_PUBLISHED:
        return toast(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">Announcement</div>
              <div className="text-sm opacity-90">{message}</div>
            </div>
          ),
          {
            ...toastConfig,
            style: {
              ...toastConfig.style,
              background: '#8B5CF6',
            },
          }
        );

      case notificationTypes.SYSTEM_UPDATE:
        return toast(
          (t) => (
            <div className="flex flex-col">
              <div className="font-semibold mb-1">System Update</div>
              <div className="text-sm opacity-90">{message}</div>
            </div>
          ),
          {
            ...toastConfig,
            duration: 7000,
          }
        );

      default:
        return toast(message, toastConfig);
    }
  }

  success(message) {
    return toast.success(message, toastConfig);
  }

  error(message) {
    return toast.error(message, toastConfig);
  }

  info(message) {
    return toast(message, toastConfig);
  }

  loading(message) {
    return toast.loading(message, toastConfig);
  }

  dismiss(toastId) {
    return toast.dismiss(toastId);
  }

  promise(promise, messages) {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      toastConfig
    );
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(notification) {
    this.listeners.forEach((callback) => callback(notification));
  }

  getNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = [];
  }

  withAction(message, actionLabel, onAction) {
    return toast(
      (t) => (
        <div className="flex items-center justify-between w-full">
          <span className="mr-4">{message}</span>
          <button
            onClick={() => {
              onAction();
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      ),
      {
        ...toastConfig,
        duration: 8000,
      }
    );
  }
}

// Singleton instance
const notificationService = new NotificationService();

// Export convenience functions
export const showNotification = (type, message, data) =>
  notificationService.showToast(type, message, data);

export const showSuccess = (message) => notificationService.success(message);

export const showError = (message) => notificationService.error(message);

export const showInfo = (message) => notificationService.info(message);

export const showLoading = (message) => notificationService.loading(message);

export const dismissToast = (toastId) => notificationService.dismiss(toastId);

export const showPromise = (promise, messages) =>
  notificationService.promise(promise, messages);

export const showWithAction = (message, actionLabel, onAction) =>
  notificationService.withAction(message, actionLabel, onAction);

/**
 * Custom hook for managing notifications
 * @returns {Object} Notification methods and utilities
 */
export const useNotifications = () => {
  // Subscribe to notification events
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      // Handle notification event (e.g., update state, trigger actions)
    });

    return unsubscribe;
  }, []);

  // Notify new registration
  const notifyNewRegistration = useCallback((userName) => {
    return showNotification(
      notificationTypes.NEW_REGISTRATION,
      `New user registration pending approval`,
      { userName }
    );
  }, []);

  // Notify new document request
  const notifyNewDocumentRequest = useCallback((documentType, userName) => {
    return showNotification(
      notificationTypes.NEW_DOCUMENT_REQUEST,
      `${userName} requested a ${documentType}`,
      { documentType, userName }
    );
  }, []);

  // Notify new report
  const notifyNewReport = useCallback((category, priority) => {
    return showNotification(
      notificationTypes.NEW_REPORT,
      `New ${category.toLowerCase()} report submitted`,
      { category, priority }
    );
  }, []);

  // Notify document completed
  const notifyDocumentCompleted = useCallback((documentType) => {
    return showNotification(
      notificationTypes.DOCUMENT_COMPLETED,
      `${documentType} has been completed and is ready for pickup`
    );
  }, []);

  // Notify document rejected
  const notifyDocumentRejected = useCallback((documentType, reason) => {
    return showNotification(
      notificationTypes.DOCUMENT_REJECTED,
      `${documentType} request has been rejected: ${reason}`
    );
  }, []);

  // Notify report resolved
  const notifyReportResolved = useCallback((reportTitle) => {
    return showNotification(
      notificationTypes.REPORT_RESOLVED,
      `Report "${reportTitle}" has been resolved`
    );
  }, []);

  // Notify announcement published
  const notifyAnnouncementPublished = useCallback((title) => {
    return showNotification(
      notificationTypes.ANNOUNCEMENT_PUBLISHED,
      `New announcement: ${title}`
    );
  }, []);

  // Notify system update
  const notifySystemUpdate = useCallback((message) => {
    return showNotification(
      notificationTypes.SYSTEM_UPDATE,
      message
    );
  }, []);

  // Poll for new notifications (simulated - replace with WebSocket in production)
  const startPolling = useCallback((interval = 30000) => {
    const pollInterval = setInterval(async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/notifications/recent');
        // const data = await response.json();
        // Process new notifications
      } catch (error) {
        // Silent polling failure
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, []);

  return {
    // Notification types
    notificationTypes,
    
    // Generic methods
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismissToast,
    showPromise,
    showWithAction,
    
    // Specific notification methods
    notifyNewRegistration,
    notifyNewDocumentRequest,
    notifyNewReport,
    notifyDocumentCompleted,
    notifyDocumentRejected,
    notifyReportResolved,
    notifyAnnouncementPublished,
    notifySystemUpdate,
    
    // Polling
    startPolling,
    
    // Get notifications history
    getNotifications: () => notificationService.getNotifications(),
    clearNotifications: () => notificationService.clearNotifications(),
  };
};

export default useNotifications;
