"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, User, Search } from "lucide-react";
import Link from "next/link";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import { toast } from "sonner";

type Recipient = {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  user_type: string;
  verified: boolean;
  mutual_products?: any[];
};

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

// Define which message types each user type should see
const getAvailableMessageTypes = (userType: string): { value: MessageType; label: string }[] => {
  const typeConfig: Record<string, MessageType[]> = {
    Creator: [
      "general",
      "announcement",
      "update",
      "support",
      "collaboration",
    ],
    Affiliate: [
      "general",
      "product_inquiry",
      "support",
      "collaboration",
      "affiliate",
    ],
    Business: [
      "general",
      "collaboration",
      "support",
      "announcement",
      "update",
      "reminder",
    ],
    Admin: [
      "announcement",
      "general",
      "update",
      "support",
    ],
    Other: [
      "general",
      "support",
      "collaboration",
    ],
  };

  const allowedTypes = typeConfig[userType] || typeConfig["Other"];
  return MESSAGE_TYPES.filter(type => allowedTypes.includes(type.value));
};

// Map frontend message types to backend enum values based on sender/recipient types
const mapMessageTypeToBackend = (
  frontendType: MessageType,
  isBroadcast: boolean,
  currentUserType: string,
  recipientTypes: string[]
): string => {
  if (isBroadcast) {
    return "ADMIN_BROADCAST";
  }

  // If sending to Creator/Dev (typically from Affiliate)
  if (recipientTypes.includes("Creator")) {
    const devMessageTypes: Record<MessageType, string> = {
      general: "USER_TO_USER",
      affiliate: "AFFILIATE_REQUEST_DEV",
      product_inquiry: "AFFILIATE_REQUEST_DEV",
      collaboration: "USER_TO_USER", // Could add DEV_TO_DEV if needed
      support: "USER_TO_USER",
      announcement: "USER_TO_USER",
      update: "USER_TO_USER",
      reminder: "USER_TO_USER",
    };
    return devMessageTypes[frontendType] || "USER_TO_USER";
  }

  // If sending to Affiliate (typically from Creator/Dev)
  if (recipientTypes.includes("Affiliate")) {
    const devToAffiliateTypes: Record<MessageType, string> = {
      general: "DEV_TO_AFFILIATES",
      affiliate: "DEV_TO_AFFILIATES",
      product_inquiry: "DEV_TO_AFFILIATES",
      collaboration: "USER_TO_USER",
      support: "DEV_TO_AFFILIATES",
      announcement: "DEV_TO_AFFILIATES",
      update: "DEV_TO_AFFILIATES",
      reminder: "DEV_TO_AFFILIATES",
    };
    return devToAffiliateTypes[frontendType] || "USER_TO_USER";
  }

  // If sending to other Affiliates
  if (recipientTypes.includes("Affiliate") && currentUserType === "Affiliate") {
    const affiliateTypes: Record<MessageType, string> = {
      general: "AFFILIATE_REQUEST_AFFILIATE",
      affiliate: "AFFILIATE_REQUEST_AFFILIATE",
      product_inquiry: "AFFILIATE_REQUEST_AFFILIATE",
      collaboration: "AFFILIATE_REQUEST_AFFILIATE",
      support: "AFFILIATE_REQUEST_AFFILIATE",
      announcement: "AFFILIATE_REQUEST_AFFILIATE",
      update: "AFFILIATE_REQUEST_AFFILIATE",
      reminder: "AFFILIATE_REQUEST_AFFILIATE",
    };
    return affiliateTypes[frontendType] || "USER_TO_USER";
  }

  // Default fallback
  return "USER_TO_USER";
};

export default function ComposeMessagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    message_type: "general" as MessageType,
    is_broadcast: false,
    broadcast_group: "all_connections" as string,
  });

  // Handle pre-selected recipient from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const recipientId = searchParams.get("recipient_id");
    const recipientName = searchParams.get("name");

    if (recipientId && recipientName) {
      // Add the recipient to selected recipients
      const preSelectedRecipient: Recipient = {
        id: parseInt(recipientId),
        user_id: parseInt(recipientId),
        email: "", // Will be filled when recipients data loads
        full_name: decodeURIComponent(recipientName),
        user_type: "", // Will be filled when recipients data loads
        verified: false,
      };
      setSelectedRecipients([preSelectedRecipient]);
    }
  }, []);

  // Fetch allowed recipients
  const { data: recipientsData, isLoading: recipientsLoading } = useQuery({
    queryKey: ["message-recipients"],
    queryFn: async () => {
      const response = await api.get("/api/messages/recipients");
      return response.data;
    },
  });

  // Get current user info from recipients data
  const currentUser = recipientsData?.current_user;

  // Flatten all recipients into a single array
  const allRecipients: Recipient[] = recipientsData ?
    Object.values(recipientsData.connections || {}).flat() as Recipient[] : [];

  // Update default message type based on user type
  useEffect(() => {
    if (currentUser && formData.message_type) {
      const availableTypes = getAvailableMessageTypes(currentUser.user_type || "Other");
      const currentTypeIsValid = availableTypes.some(type => type.value === formData.message_type);

      if (!currentTypeIsValid && availableTypes.length > 0) {
        setFormData(prev => ({
          ...prev,
          message_type: availableTypes[0].value,
        }));
      }
    }
  }, [currentUser, formData.message_type]);

  // Update pre-selected recipient when recipients data loads
  useEffect(() => {
    if (selectedRecipients.length > 0 && allRecipients.length > 0) {
      const updatedSelected = selectedRecipients.map(selected => {
        const found = allRecipients.find(r => r.user_id === selected.user_id);
        return found || selected;
      });
      setSelectedRecipients(updatedSelected);
    }
  }, [allRecipients, selectedRecipients]);

  // Filter recipients based on search
  const filteredRecipients = allRecipients.filter(recipient =>
    recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get recipient IDs for the form
  const recipientIds = selectedRecipients.map(r => r.user_id);

  // Get unique recipient types
  const recipientTypes = [...new Set(selectedRecipients.map(r => r.user_type))];

  const sendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/messages", {
        recipient_ids: recipientIds,
        subject: formData.subject,
        content: formData.content,
        message_type: mapMessageTypeToBackend(
          formData.message_type,
          formData.is_broadcast,
          currentUser?.user_type || "Other",
          recipientTypes
        ),
        is_broadcast: formData.is_broadcast,
        broadcast_group: formData.is_broadcast ? formData.broadcast_group : null,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      // Invalidate queries with error handling
      try {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
      } catch (err) {
        console.error("Query invalidation error:", err);
      }
      // Navigate immediately - no setTimeout needed
      router.push("/messages");
    },
    onError: (error: any) => {
      console.error("Message send error:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to send message";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (sendMutation.isPending) {
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter message content");
      return;
    }

    // For non-broadcast messages, need at least one recipient
    if (recipientIds.length === 0 && !formData.is_broadcast) {
      toast.error("Please add at least one recipient");
      return;
    }

    sendMutation.mutate();
  };

  const toggleRecipient = (recipient: Recipient) => {
    // Find the canonical recipient from allRecipients to ensure consistent object reference
    const canonicalRecipient = allRecipients.find(r => r.user_id === recipient.user_id) || recipient;

    setSelectedRecipients(prevSelected => {
      const isSelected = prevSelected.some(r => r.user_id === recipient.user_id);
      if (isSelected) {
        return prevSelected.filter(r => r.user_id !== recipient.user_id);
      } else {
        return [...prevSelected, canonicalRecipient];
      }
    });
  };

  const removeRecipient = (recipientId: number) => {
    setSelectedRecipients(selectedRecipients.filter(r => r.user_id !== recipientId));
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
                {getAvailableMessageTypes(currentUser?.user_type || "Other").map((type) => (
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

              {!formData.is_broadcast && (
                <>
                  {/* Selected Recipients */}
                  {selectedRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedRecipients.map((recipient) => (
                        <div
                          key={recipient.user_id}
                          className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm"
                        >
                          <span>{recipient.full_name}</span>
                          <button
                            type="button"
                            onClick={() => removeRecipient(recipient.user_id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Recipients Button */}
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-2"
                  >
                    <User className="w-4 h-4" />
                    {selectedRecipients.length === 0 ? "Add Recipients" : "Add More Recipients"}
                  </button>

                  {/* Recipients Dropdown */}
                  {showDropdown && (
                    <div
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      {/* Search */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                        <input
                          type="text"
                          placeholder="Search recipients..."
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

                      {/* Recipients List */}
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {recipientsLoading ? (
                          <p className="text-center py-4" style={{ color: "var(--text-secondary)" }}>
                            Loading recipients...
                          </p>
                        ) : filteredRecipients.length === 0 ? (
                          <p className="text-center py-4" style={{ color: "var(--text-secondary)" }}>
                            No recipients found
                          </p>
                        ) : (
                          filteredRecipients.map((recipient) => {
                            const isSelected = selectedRecipients.some(r => r.user_id === recipient.user_id);
                            return (
                              <div
                                key={recipient.user_id}
                                onClick={() => toggleRecipient(recipient)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-blue-100 dark:bg-blue-900"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 pointer-events-none"
                                />
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                  {recipient.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                    {recipient.full_name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                                      {recipient.email}
                                    </p>
                                    <span
                                      className="text-xs px-2 py-0.5 rounded"
                                      style={{
                                        backgroundColor: recipient.user_type === "Creator"
                                          ? "rgba(147, 51, 234, 0.1)"
                                          : "rgba(59, 130, 246, 0.1)",
                                        color: recipient.user_type === "Creator"
                                          ? "#9333ea"
                                          : "#3b82f6",
                                      }}
                                    >
                                      {recipient.user_type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => setShowDropdown(false)}
                        className="w-full mt-3 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        style={{
                          borderColor: "var(--border-color)",
                          color: "var(--text-primary)",
                        }}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Broadcast Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="broadcast"
                checked={formData.is_broadcast}
                onChange={(e) => {
                  const isBroadcast = e.target.checked;
                  setFormData({ ...formData, is_broadcast: isBroadcast });
                  if (isBroadcast) {
                    setSelectedRecipients([]);
                    setShowDropdown(false);
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="broadcast" style={{ color: "var(--text-primary)" }}>
                Send as broadcast message
              </label>
            </div>

            {/* Broadcast Group Selection */}
            {formData.is_broadcast && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Broadcast To
                </label>
                <select
                  value={formData.broadcast_group}
                  onChange={(e) => setFormData({ ...formData, broadcast_group: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all_connections">All My Connections</option>
                  <option value="all_affiliates">All Affiliates</option>
                  <option value="all_creators">All Creators</option>
                </select>
              </div>
            )}

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
