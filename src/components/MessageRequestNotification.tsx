"use client";

import { useEffect, useState } from "react";
import { Bell, X, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

type MessageRequest = {
  id: number;
  sender_id: number;
  message_type: string;
  subject: string;
  created_at: string;
};

export function MessageRequestNotification() {
  const pathname = usePathname();
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  useEffect(() => {
    const handleShowNotification = (event: CustomEvent) => {
      const { requests: pendingRequests, hasNewRequests: newReq, hasNewMessages: newMsg } = event.detail;

      // Only show if we have new data
      if (newReq || newMsg) {
        setRequests(pendingRequests || []);
        setHasNewRequests(newReq || false);
        setHasNewMessages(newMsg || false);
        setShowBanner(true);

        // Show appropriate toast notification
        if (newReq && newMsg) {
          toast.info("You have new messages", {
            description: "Connection requests and messages",
            action: {
              label: "View",
              onClick: () => {
                window.location.href = "/messages";
              },
            },
            duration: 10000,
          });
        } else if (newReq) {
          toast.info("You have a new connection request", {
            description: pendingRequests.length === 1 ? `From: ${pendingRequests[0].subject}` : `${pendingRequests.length} new requests`,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = "/messages";
              },
            },
            duration: 10000,
          });
        } else if (newMsg) {
          toast.info("You have new messages", {
            description: "Check your inbox",
            action: {
              label: "View",
              onClick: () => {
                window.location.href = "/messages";
              },
            },
            duration: 10000,
          });
        }
      }
    };

    // Listen for both old and new event names for backwards compatibility
    window.addEventListener("showMessageNotification", handleShowNotification as EventListener);
    window.addEventListener("showMessageRequestNotification", handleShowNotification as EventListener);

    return () => {
      window.removeEventListener("showMessageNotification", handleShowNotification as EventListener);
      window.removeEventListener("showMessageRequestNotification", handleShowNotification as EventListener);
    };
  }, [dismissedCount]);

  // Hide banner when user visits the messages page
  useEffect(() => {
    if (pathname === "/messages") {
      setShowBanner(false);
      setDismissedCount(requests.length);
    }
  }, [pathname, requests.length]);

  // Don't show if we have no requests or banner is dismissed
  if (requests.length === 0 || (!showBanner && requests.length <= dismissedCount)) {
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
                {hasNewRequests && hasNewMessages
                  ? "You have new messages and connection requests"
                  : hasNewMessages
                  ? "You have new messages"
                  : requests.length === 1
                  ? "You have a new connection request"
                  : `You have ${requests.length} new connection requests`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <p className="text-xs opacity-90 truncate">
                  {hasNewMessages && requests.length === 0
                    ? "Just now"
                    : formatTimeAgo(requests[0]?.created_at || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/messages"
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
    </>
  );
}
