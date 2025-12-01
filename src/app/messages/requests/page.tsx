"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import { toast } from "sonner";

type MessageRequest = {
  id: number;
  sender_id: number;
  recipient_id: number;
  message_type: string;
  subject: string;
  content: string;
  status: "pending" | "approved" | "rejected" | "blocked";
  created_at: string;
  responded_at?: string;
};

type Connection = {
  connection_id: number;
  user1_id: number;
  user2_id: number;
  other_user_id: number;
  connection_type: string;
  created_at: string;
};

export default function MessageRequestsPage() {
  const [activeTab, setActiveTab] = useState<
    "received" | "sent" | "connections"
  >("received");

  const queryClient = useQueryClient();

  const { data: receivedRequests, isLoading: receivedLoading } = useQuery({
    queryKey: ["message-requests", "received"],
    queryFn: async () => {
      const response = await api.get("/api/message-requests/received");
      return response.data as MessageRequest[];
    },
  });

  const { data: sentRequests, isLoading: sentLoading } = useQuery({
    queryKey: ["message-requests", "sent"],
    queryFn: async () => {
      const response = await api.get("/api/message-requests/sent");
      return response.data as MessageRequest[];
    },
  });

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await api.get("/api/connections");
      return response.data as Connection[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await api.put(
        `/api/message-requests/${requestId}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Request approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["message-requests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to approve request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await api.put(
        `/api/message-requests/${requestId}/reject`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["message-requests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to reject request");
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await api.put(
        `/api/message-requests/${requestId}/block`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Sender blocked");
      queryClient.invalidateQueries({ queryKey: ["message-requests"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to block sender");
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await api.delete(`/api/connections/${connectionId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Connection removed");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to remove connection"
      );
    },
  });

  const blockConnectionUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.post(`/api/connections/block/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User blocked and connection removed");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to block user");
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

  const formatRequestType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "blocked":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const requests =
    activeTab === "received"
      ? receivedRequests
      : activeTab === "sent"
      ? sentRequests
      : [];
  const loading =
    activeTab === "received"
      ? receivedLoading
      : activeTab === "sent"
      ? sentLoading
      : connectionsLoading;

  const pendingReceived =
    receivedRequests?.filter((r) => r.status === "pending").length || 0;

  // Filter connections to show only approved ones
  const approvedConnections =
    connections?.filter(
      (conn) =>
        conn.connection_type === "approved_request" ||
        conn.connection_type === "mutual_connection"
    ) || [];

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Requests
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage connection requests and message permissions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "received"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            style={{
              color: activeTab === "received" ? "white" : "var(--text-primary)",
            }}
          >
            <UserCheck className="w-4 h-4" />
            Received
            {pendingReceived > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingReceived}
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
            <UserCheck className="w-4 h-4" />
            Sent
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "connections"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            style={{
              color:
                activeTab === "connections" ? "white" : "var(--text-primary)",
            }}
          >
            <Users className="w-4 h-4" />
            My Connections ({approvedConnections.length})
          </button>
        </div>

        {/* Request List */}
        <div
          className="rounded-lg border"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          {loading ? (
            <div
              className="p-8 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              Loading requests...
            </div>
          ) : activeTab === "connections" ? (
            /* Connections List */
            !approvedConnections || approvedConnections.length === 0 ? (
              <div
                className="p-8 text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No connections yet</p>
                <p className="text-sm">
                  Start networking by approving connection requests
                </p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "var(--border-color)" }}
              >
                {approvedConnections.map((connection) => (
                  <div key={connection.connection_id} className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Connected User #{connection.other_user_id}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Connected
                          </span>
                        </div>
                        <p
                          className="text-sm mb-3"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Connection Type:{" "}
                          {connection.connection_type.replace(/_/g, " ")}
                        </p>
                        <div
                          className="flex items-center gap-4 text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          <span>
                            Connected: {formatDate(connection.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Connections */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() =>
                          deleteConnectionMutation.mutate(
                            connection.connection_id
                          )
                        }
                        disabled={deleteConnectionMutation.isPending}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserX className="w-4 h-4" />
                        Remove Connection
                      </button>
                      <button
                        onClick={() =>
                          blockConnectionUserMutation.mutate(
                            connection.other_user_id
                          )
                        }
                        disabled={blockConnectionUserMutation.isPending}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Ban className="w-4 h-4" />
                        Block User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : !requests || requests.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No requests</p>
              <p className="text-sm">
                {activeTab === "received"
                  ? "You haven't received any message requests"
                  : "You haven't sent any requests"}
              </p>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: "var(--border-color)" }}
            >
              {requests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="font-semibold text-lg"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {request.subject}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </div>
                      <p
                        className="text-sm mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {request.content}
                      </p>
                      <div
                        className="flex items-center gap-4 text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <span>{formatRequestType(request.message_type)}</span>
                        <span>•</span>
                        <span>{formatDate(request.created_at)}</span>
                        {request.responded_at && (
                          <>
                            <span>•</span>
                            <span>
                              Responded: {formatDate(request.responded_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Received Requests */}
                  {activeTab === "received" && request.status === "pending" && (
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(request.id)}
                        disabled={rejectMutation.isPending}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => blockMutation.mutate(request.id)}
                        disabled={blockMutation.isPending}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Ban className="w-4 h-4" />
                        Block
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
