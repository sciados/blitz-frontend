"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import { toast } from "sonner";

type MessageType = "general" | "affiliate" | "product_inquiry" | "collaboration" | "support" | "announcement" | "update" | "reminder";

const MESSAGE_TYPES: { value: MessageType; label: string }[] = [
  { value: "general", label: "General" },
  { value: "affiliate", label: "Affiliate" },
  { value: "product_inquiry", label: "Product Inquiry" },
  { value: "collaboration", label: "Collaboration" },
  { value: "support", label: "Support" },
  { value: "announcement", label: "Announcement" },
  { value: "update", label: "Update" },
  { value: "reminder", label: "Reminder" },
];

export default function ComposeMessagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    recipient_ids: [] as number[],
    subject: "",
    content: "",
    message_type: "general" as MessageType,
    is_broadcast: false,
  });

  const sendMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post("/api/messages", {
        recipient_ids: data.recipient_ids,
        subject: data.subject,
        content: data.content,
        message_type: data.message_type,
        is_broadcast: data.is_broadcast,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      router.push("/messages");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to send message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter message content");
      return;
    }

    if (formData.recipient_ids.length === 0 && !formData.is_broadcast) {
      toast.error("Please add at least one recipient");
      return;
    }

    sendMutation.mutate(formData);
  };

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
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Compose Message
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div
            className="rounded-lg border p-6 space-y-4"
            style={{
              backgroundColor: "var(--surface-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Message Type */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Message Type
              </label>
              <select
                value={formData.message_type}
                onChange={(e) =>
                  setFormData({ ...formData, message_type: e.target.value as MessageType })
                }
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                {MESSAGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter message subject"
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Recipients */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Recipients *
              </label>
              <input
                type="text"
                placeholder="Enter recipient IDs (comma-separated)"
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
                onChange={(e) => {
                  const ids = e.target.value
                    .split(",")
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  setFormData({ ...formData, recipient_ids: ids });
                }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                Enter user IDs separated by commas (e.g., 1, 2, 3)
              </p>
            </div>

            {/* Broadcast Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="broadcast"
                checked={formData.is_broadcast}
                onChange={(e) =>
                  setFormData({ ...formData, is_broadcast: e.target.checked, recipient_ids: e.target.checked ? [] : formData.recipient_ids })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="broadcast" style={{ color: "var(--text-primary)" }}>
                Send as broadcast message
              </label>
            </div>

            {/* Content */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Message *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Type your message here..."
                rows={10}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sendMutation.isPending ? "Sending..." : "Send Message"}
              </button>
              <Link
                href="/messages"
                className="px-6 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthGate>
  );
}
