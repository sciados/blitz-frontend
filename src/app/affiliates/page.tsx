"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, Globe, Mail } from "lucide-react";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import Link from "next/link";
import { toast } from "sonner";

type Affiliate = {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
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
  const queryClient = useQueryClient();

  const { data: affiliates, isLoading } = useQuery({
    queryKey: ["affiliates", searchTerm, selectedSpecialty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedSpecialty) params.append("specialty", selectedSpecialty);

      const response = await api.get(`/api/affiliates/search?${params.toString()}`);
      return response.data as Affiliate[];
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (recipientId: number) => {
      const response = await api.post("/api/message-requests", {
        recipient_id: recipientId,
        message_type: "affiliate",
        subject: "Request to Connect",
        content: "I'd like to connect with you to discuss potential collaboration opportunities.",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
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

  const handleRequestConnection = (userId: number) => {
    requestMutation.mutate(userId);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    ) : (
                      <button
                        onClick={() => handleRequestConnection(affiliate.user_id)}
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
