"use client";

import { useEffect, useState } from "react";
import { Bell, X, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type MessageRequest = {
  id: number;
  sender_id: number;
  message_type: string;
  subject: string;
  created_at: string;
};

export function MessageRequestNotification() {
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    const handleShowNotification = (event: CustomEvent) => {
      const { requests: pendingRequests } = event.detail;
      setRequests(pendingRequests);
      setShowBanner(true);
      setHasShownNotification(true);

      // Also show a toast notification
      if (pendingRequests.length === 1) {
        toast.info("You have a new connection request", {
          description: `From: ${pendingRequests[0].subject}`,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/messages/requests";
            },
          },
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.info(`You have ${pendingRequests.length} new connection requests`, {
          description: "Click to view and respond",
          action: {
            label: "View All",
            onClick: () => {
              window.location.href = "/messages/requests";
            },
          },
          duration: 10000, // Show for 10 seconds
        });
      }
    };

    window.addEventListener("showMessageRequestNotification", handleShowNotification as EventListener);

    return () => {
      window.removeEventListener("showMessageRequestNotification", handleShowNotification as EventListener);
    };
  }, []);

  // Don't show on first load if already checked
  if (!showBanner || requests.length === 0) {
    return null;
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <>
      {/* Banner Notification */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg border-b border-blue-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm md:text-base truncate">
                {requests.length === 1
                  ? "You have a new connection request"
                  : `You have ${requests.length} new connection requests`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <p className="text-xs opacity-90 truncate">
                  {formatTimeAgo(requests[0].created_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/messages/requests"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              View {requests.length === 1 ? "Request" : "All"}
            </Link>
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Inline preview of requests (compact view) */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {requests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-blue-200 dark:border-blue-700 flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {request.subject}
                </span>
              </div>
            ))}
            {requests.length > 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-blue-200 dark:border-blue-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  +{requests.length - 3} more
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
