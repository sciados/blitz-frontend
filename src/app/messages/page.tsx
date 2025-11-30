"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Send, Inbox, Archive } from "lucide-react";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import Link from "next/link";

type Message = {
  id: number;
  sender_id: number;
  subject: string;
  content: string;
  message_type: string;
  parent_message_id?: number;
  is_broadcast: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

type InboxData = {
  messages: Message[];
  total: number;
  unread_count: number;
};

type SentData = {
  messages: Message[];
  total: number;
};

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [page, setPage] = useState(1);

  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ["messages", "inbox", page],
    queryFn: async () => {
      const response = await api.get(`/api/messages/inbox?page=${page}&per_page=20`);
      return response.data as InboxData;
    },
  });

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ["messages", "sent", page],
    queryFn: async () => {
      const response = await api.get(`/api/messages/sent?page=${page}&per_page=20`);
      return response.data as SentData;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const messages = activeTab === "inbox" ? inboxData?.messages : sentData?.messages;
  const loading = activeTab === "inbox" ? inboxLoading : sentLoading;
  const total = activeTab === "inbox" ? inboxData?.total : sentData?.total;
  const unreadCount = activeTab === "inbox" ? (inboxData?.unread_count ?? 0) : 0;

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Messages
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your conversations and messages
          </p>
          <div className="flex items-center gap-4 mt-3">
            <Link
              href="/messages/requests"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Message Requests
            </Link>
            <span style={{ color: "var(--text-tertiary)" }}>•</span>
            <Link
              href="/affiliates"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Affiliate Directory
            </Link>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "inbox"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={{
                color: activeTab === "inbox" ? "white" : "var(--text-primary)",
              }}
            >
              <Inbox className="w-4 h-4" />
              Inbox
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "sent"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={{
                color: activeTab === "sent" ? "white" : "var(--text-primary)",
              }}
            >
              <Send className="w-4 h-4" />
              Sent
            </button>
          </div>

          <Link
            href="/messages/compose"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Compose
          </Link>
        </div>

        {/* Message List */}
        <div
          className="rounded-lg border"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          {loading ? (
            <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
              Loading messages...
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No messages yet</p>
              <p className="text-sm">
                {activeTab === "inbox"
                  ? "Your inbox is empty"
                  : "You haven't sent any messages"}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
              {messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/messages/${message.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {message.subject}
                        </h3>
                        {message.is_broadcast && (
                          <span className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs px-2 py-0.5 rounded">
                            Broadcast
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {truncateContent(message.content)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {formatDate(message.created_at)}
                        </span>
                        <span
                          className="text-xs capitalize"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {message.message_type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {activeTab === "inbox" && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total && total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-sm px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "var(--text-primary)" }}
              >
                Previous
              </button>
              <span style={{ color: "var(--text-secondary)" }}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="text-sm px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "var(--text-primary)" }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
