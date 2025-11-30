"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Users, User, Search } from "lucide-react";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import { toast } from "sonner";

type UserType = "all" | "affiliates" | "product_developers" | "business_owners" | "individuals";

type IndividualRecipient = {
  id: number;
  email: string;
  full_name?: string;
  role: string;
};

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [messageType, setMessageType] = useState<UserType>("individuals");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [individualRecipients, setIndividualRecipients] = useState<IndividualRecipient[]>([]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const recipients = messageType === "individuals"
        ? selectedRecipients
        : []; // Backend will fetch based on type

      const response = await api.post("/api/admin/messages/broadcast", {
        message_type: messageType,
        recipient_ids: recipients,
        subject,
        content,
        is_broadcast: messageType !== "individuals",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setSubject("");
      setContent("");
      setSelectedRecipients([]);
      setIndividualRecipients([]);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to send message");
    },
  });

  const searchUsersMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await api.get(`/api/admin/users?search=${encodeURIComponent(query)}`);
      return response.data as IndividualRecipient[];
    },
    onSuccess: (data) => {
      setIndividualRecipients(data);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) {
      toast.error("Please enter at least 2 characters to search");
      return;
    }
    searchUsersMutation.mutate(searchTerm);
  };

  const toggleRecipient = (userId: number) => {
    setSelectedRecipients(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getRecipientCount = () => {
    switch (messageType) {
      case "affiliates":
        return "All Affiliates";
      case "product_developers":
        return "All Product Developers";
      case "business_owners":
        return "All Business Owners";
      case "all":
        return "All Users";
      case "individuals":
        return `${selectedRecipients.length} recipient${selectedRecipients.length !== 1 ? 's' : ''}`;
      default:
        return "0";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter message content");
      return;
    }

    if (messageType === "individuals" && selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    sendMutation.mutate();
  };

  return (
    <AuthGate requiredRole="admin">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Admin Messenger
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            Send messages to individuals or broadcast to entire user groups
          </p>
        </div>

        {/* Message Type Selection */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Select Recipients
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Broadcast Options */}
            <button
              onClick={() => setMessageType("all")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                messageType === "all"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
              style={{
                borderColor: messageType === "all" ? "var(--accent-primary)" : "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    All Users
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Broadcast to every user
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMessageType("affiliates")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                messageType === "affiliates"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
              style={{
                borderColor: messageType === "affiliates" ? "var(--accent-primary)" : "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    All Affiliates
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Broadcast to all affiliate marketers
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMessageType("product_developers")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                messageType === "product_developers"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
              style={{
                borderColor: messageType === "product_developers" ? "var(--accent-primary)" : "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    All Product Developers
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Broadcast to all product creators
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMessageType("business_owners")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                messageType === "business_owners"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
              style={{
                borderColor: messageType === "business_owners" ? "var(--accent-primary)" : "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    All Business Owners
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Broadcast to all business users
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMessageType("individuals")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                messageType === "individuals"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
              style={{
                borderColor: messageType === "individuals" ? "var(--accent-primary)" : "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    Specific Individuals
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Select specific users to message
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Recipient Count Display */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                Recipients: {getRecipientCount()}
              </span>
            </div>
          </div>
        </div>

        {/* Individual Recipient Selection */}
        {messageType === "individuals" && (
          <div
            className="rounded-lg border p-6 mb-6"
            style={{
              backgroundColor: "var(--surface-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Select Recipients
            </h3>

            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Search Results */}
            {individualRecipients.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Search Results ({individualRecipients.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {individualRecipients.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleRecipient(user.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRecipients.includes(user.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                      style={{
                        borderColor: selectedRecipients.includes(user.id) ? "var(--accent-primary)" : "var(--border-color)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.includes(user.id)}
                          onChange={() => toggleRecipient(user.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                            {user.full_name || "Unknown"}
                          </div>
                          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {user.email} • {user.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Recipients */}
            {selectedRecipients.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Selected Recipients ({selectedRecipients.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipients.map((userId) => {
                    const user = individualRecipients.find(u => u.id === userId);
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{user?.full_name || user?.email || `User ${userId}`}</span>
                        <button
                          onClick={() => toggleRecipient(userId)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Composition */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: "var(--surface-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Compose Message
            </h2>

            <div className="space-y-4">
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
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject"
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Send className="w-5 h-5" />
                  {sendMutation.isPending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthGate>
  );
}
