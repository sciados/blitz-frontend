"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Reply, Send } from "lucide-react";
import Link from "next/link";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import { toast } from "sonner";

type MessageDetail = {
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
  recipients?: {
    recipient_id: number;
    email: string;
    full_name: string;
    read_at?: string;
    status: string;
  }[];
};

type MessageType = "general" | "affiliate" | "product_inquiry" | "collaboration" | "support" | "announcement" | "update" | "reminder";

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const messageId = parseInt(params.id as string);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const { data: message, isLoading } = useQuery({
    queryKey: ["message", messageId],
    queryFn: async () => {
      const response = await api.get(`/api/messages/${messageId}`);
      return response.data as MessageDetail;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message", messageId] });
      queryClient.invalidateQueries({ queryKey: ["messages", "inbox"] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/api/messages/${messageId}/reply`, {
        content,
        message_type: message?.message_type || "general",
        recipient_ids: [message?.sender_id || 0],
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Reply sent successfully!");
      setReplyContent("");
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to send reply");
    },
  });

  const handleMarkAsRead = () => {
    markAsReadMutation.mutate();
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    replyMutation.mutate(replyContent);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Mark as read when component loads
  if (message && markAsReadMutation.isPending === false) {
    handleMarkAsRead();
  }

  if (isLoading) {
    return (
      <AuthGate requiredRole="user">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AuthGate>
    );
  }

  if (!message) {
    return (
      <AuthGate requiredRole="user">
        <div className="p-6 max-w-4xl mx-auto text-center">
          <p style={{ color: "var(--text-secondary)" }}>Message not found</p>
          <Link href="/messages" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Messages
          </Link>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {message.subject}
              </h1>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>{formatMessageType(message.message_type)}</span>
                <span>•</span>
                <span>{formatDate(message.created_at)}</span>
                {message.is_broadcast && (
                  <>
                    <span>•</span>
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs px-2 py-0.5 rounded">
                      Broadcast
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
          </div>
        </div>

        {/* Message Content */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <div
            className="prose max-w-none"
            style={{ color: "var(--text-primary)" }}
          >
            {message.content.split("\n").map((paragraph, idx) => (
              <p key={idx} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Recipients (for sent messages) */}
          {message.recipients && message.recipients.length > 0 && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                Recipients
              </h3>
              <div className="space-y-2">
                {message.recipients.map((recipient) => (
                  <div key={recipient.recipient_id} className="flex items-center justify-between text-sm">
                    <div>
                      <span style={{ color: "var(--text-primary)" }}>{recipient.full_name}</span>
                      <span className="ml-2" style={{ color: "var(--text-secondary)" }}>
                        {recipient.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {recipient.read_at ? (
                        <span className="text-green-600 text-xs">Read</span>
                      ) : (
                        <span className="text-gray-500 text-xs">Unread</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <form
            onSubmit={handleReply}
            className="space-y-4"
          >
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: "var(--surface-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--text-primary)" }}>
                Reply to Message
              </h3>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyContent.trim()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {replyMutation.isPending ? "Sending..." : "Send Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                  className="px-6 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AuthGate>
  );
}
