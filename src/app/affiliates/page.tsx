"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, Globe, Mail, Clock } from "lucide-react";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import Link from "next/link";
import { toast } from "sonner";

type ProductDeveloper = {
  user_id: number;
  full_name: string;
  email: string;
  product_name?: string;
  product_url?: string;
};

type Affiliate = {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  user_type?: string;
  profile_image_url?: string;
  bio?: string;
  specialty?: string;
  years_experience?: number;
  website_url?: string;
  reputation_score: number;
  verified: boolean;
  is_connected: boolean;
  mutual_products?: any[];
};

export default function AffiliatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: affiliates, isLoading } = useQuery({
    queryKey: ["affiliates", searchTerm, selectedSpecialty, selectedUserType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedSpecialty) params.append("specialty", selectedSpecialty);
      if (selectedUserType !== "all") params.append("user_type", selectedUserType);

      const response = await api.get(`/api/affiliates/search?${params.toString()}`);
      return response.data as Affiliate[];
    },
  });

  // Get sent requests to check for pending requests
  const { data: sentRequests } = useQuery({
    queryKey: ["sentRequests"],
    queryFn: async () => {
      const response = await api.get("/api/message-requests/sent");
      return response.data as Array<{
        id: number;
        recipient_id: number;
        status: string;
      }>;
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (params: { recipientId: number; messageType: string; name: string }) => {
      const response = await api.post("/api/message-requests", {
        recipient_id: params.recipientId,
        message_type: params.messageType,
        subject: "Request to Connect",
        content: `Hi ${params.name}, I'd like to connect with you to discuss potential collaboration opportunities.`,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to send request");
    },
  });

  const specialties = [
    "All",
    "Health & Wellness",
    "Technology",
    "Finance",
    "E-commerce",
    "Education",
    "Travel",
    "Fitness",
    "Beauty",
    "Food & Nutrition",
    "Home & Garden",
    "Gaming",
  ];

  const formatExperience = (years?: number) => {
    if (!years) return "Experience: N/A";
    return years === 1 ? "1 year experience" : `${years} years experience`;
  };

  const handleRequestConnection = (affiliate: Affiliate) => {
    const messageType = affiliate.user_type === 'Creator'
      ? 'AFFILIATE_TO_DEV'
      : 'AFFILIATE_TO_AFFILIATE';

    requestMutation.mutate({
      recipientId: affiliate.user_id,
      messageType,
      name: affiliate.full_name,
    });
  };

  // Check if there's a pending request to this affiliate
  const hasPendingRequest = (affiliate: Affiliate) => {
    if (!sentRequests) return false;
    return sentRequests.some(
      req => req.recipient_id === affiliate.user_id && req.status === 'pending'
    );
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Affiliate Directory
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            Discover and connect with affiliate marketers
          </p>
        </div>

        {/* Filters */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Search affiliates..."
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

            {/* User Type Filter */}
            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: "var(--surface-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All User Types</option>
              <option value="Affiliate">Affiliates Only</option>
              <option value="Creator">Creators Only</option>
              <option value="Business">Business Only</option>
            </select>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: "var(--surface-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">All Specialties</option>
              {specialties.slice(1).map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Affiliate List */}
        <div
          className="rounded-lg border"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          {isLoading ? (
            <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
              Loading affiliates...
            </div>
          ) : !affiliates || affiliates.length === 0 ? (
            <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No affiliates found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {affiliates.map((affiliate) => (
                <div
                  key={affiliate.id}
                  className="rounded-lg border p-6 hover:shadow-lg transition-shadow"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {affiliate.full_name?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {affiliate.full_name}
                        </h3>
                        {affiliate.verified && (
                          <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 rounded">
                            ✓ Verified
                          </span>
                        )}
                        {affiliate.user_type && (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              affiliate.user_type === 'Affiliate'
                                ? 'text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : affiliate.user_type === 'Creator'
                                ? 'text-xs px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 font-semibold'
                                : 'text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            }`}
                          >
                            {affiliate.user_type === 'Creator' && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {affiliate.user_type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {affiliate.email}
                      </p>
                      {affiliate.years_experience && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                          {formatExperience(affiliate.years_experience)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Specialty */}
                  {affiliate.specialty && (
                    <div className="mb-3">
                      <span
                        className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {affiliate.specialty}
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {affiliate.bio && (
                    <p
                      className="text-sm mb-4 line-clamp-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {affiliate.bio}
                    </p>
                  )}

                  {/* Reputation Score */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${affiliate.reputation_score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                      {affiliate.reputation_score}%
                    </span>
                  </div>
                  
                  {/* Product Developers */}
                  {affiliate.mutual_products && affiliate.mutual_products.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
                        Has Campaigns For:
                      </h4>
                      <div className="space-y-2">
                        {affiliate.mutual_products.slice(0, 2).map((dev) => (
                          <div key={dev.user_id} className="text-xs">
                            <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                              {dev.full_name}
                            </div>
                            {dev.product_name && (
                              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {dev.product_name}
                              </div>
                            )}
                          </div>
                        ))}
                        {affiliate.mutual_products.length > 2 && (
                          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            +{affiliate.mutual_products.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3 mb-4">
                    {affiliate.website_url && (
                      <a
                        href={affiliate.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {/* Connection Status and Action */}
                  <div className="pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                    {affiliate.is_connected ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <UserCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : hasPendingRequest(affiliate) ? (
                      <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-medium">Request Pending</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestConnection(affiliate)}
                        disabled={requestMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail className="w-4 h-4" />
                        {requestMutation.isPending ? "Sending..." : "Request to Connect"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
