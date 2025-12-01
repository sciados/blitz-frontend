"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Search,
  Filter,
  Star,
  MoreHorizontal,
  User,
  Users,
  Building,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ["messages", "inbox", page],
    queryFn: async () => {
      const response = await api.get(
        `/api/messages/inbox?page=${page}&per_page=20`
      );
      return response.data as InboxData;
    },
  });

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ["messages", "sent", page],
    queryFn: async () => {
      const response = await api.get(
        `/api/messages/sent?page=${page}&per_page=20`
      );
      return response.data as SentData;
    },
  });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "affiliate":
        return <Users className="w-4 h-4 text-blue-600" />;
      case "business":
        return <Building className="w-4 h-4 text-green-600" />;
      case "system":
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMessageTypeBadgeColor = (type: string) => {
    switch (type) {
      case "affiliate":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "business":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "system":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const messages =
    activeTab === "inbox" ? inboxData?.messages : sentData?.messages;
  const loading = activeTab === "inbox" ? inboxLoading : sentLoading;
  const total = activeTab === "inbox" ? inboxData?.total : sentData?.total;
  const unreadCount = activeTab === "inbox" ? inboxData?.unread_count ?? 0 : 0;

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Messages
                  </h1>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Stay connected with your network
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-20">
                <Link
                  href="/messages/requests"
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Requests
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/affiliates"
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Directory
                </Link>
              </div>
            </div>
            <Link
              href="/messages/compose"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              <span className="font-medium">Compose</span>
            </Link>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === "inbox"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-blue-200 dark:hover:border-gray-700"
                }`}
                style={{
                  color:
                    activeTab === "inbox" ? "white" : "var(--text-primary)",
                }}
              >
                <Inbox className="w-5 h-5" />
                Inbox
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === "sent"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-blue-200 dark:hover:border-gray-700"
                }`}
                style={{
                  color: activeTab === "sent" ? "white" : "var(--text-primary)",
                }}
              >
                <Send className="w-5 h-5" />
                Sent
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              style={{
                backgroundColor: "var(--surface-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All Types</option>
              <option value="affiliate">Affiliate</option>
              <option value="business">Business</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Message List */}
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          {loading ? (
            <div
              className="p-12 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Loading messages...</p>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div
              className="p-16 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No messages yet
              </h3>
              <p className="text-sm max-w-sm mx-auto">
                {activeTab === "inbox"
                  ? "Your inbox is empty. Start a conversation from the affiliate directory!"
                  : "You haven't sent any messages yet. Click compose to get started."}
              </p>
              <Link
                href={
                  activeTab === "inbox" ? "/affiliates" : "/messages/compose"
                }
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {activeTab === "inbox" ? (
                  <>
                    <Users className="w-4 h-4" />
                    Browse Affiliates
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Compose Message
                  </>
                )}
              </Link>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: "var(--border-color)" }}
            >
              {messages.map((message, index) => (
                <Link
                  key={message.id}
                  href={`/messages/${message.id}`}
                  className="block p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-gray-800/50 dark:hover:to-transparent transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {message.subject.charAt(0).toUpperCase()}
                      </div>
                      {message.is_broadcast && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-semibold truncate group-hover:text-blue-600 transition-colors ${
                                activeTab === "inbox" ? "text-lg" : "text-base"
                              }`}
                              style={{ color: "var(--text-primary)" }}
                            >
                              {message.subject}
                            </h3>
                            {message.is_broadcast && (
                              <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Broadcast
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm line-clamp-2 mb-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {truncateContent(message.content, 120)}
                          </p>
                          <div className="flex items-center gap-3">
                            <span
                              className="text-xs font-medium"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {formatRelativeTime(message.created_at)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {getMessageTypeIcon(message.message_type)}
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getMessageTypeBadgeColor(
                                  message.message_type
                                )}`}
                              >
                                {message.message_type.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {activeTab === "inbox" && (
                            <Circle className="w-3 h-3 text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Implement star/favorite
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Implement archive
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Archive className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total && total > 20 && (
            <div
              className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50 dark:bg-gray-900/50"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                <Send className="w-4 h-4 rotate-180" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium px-3 py-1.5 rounded-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Page {page} of {Math.ceil(total / 20)}
                </span>
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Next
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
