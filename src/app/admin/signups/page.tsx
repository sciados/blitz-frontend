"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import {
  Mail,
  Download,
  Trash2,
  Users,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Mail as MailIcon,
  AlertCircle,
} from "lucide-react";

// Types
interface EmailSignup {
  id: number;
  email: string;
  audience_type: "product-dev" | "affiliate" | "business";
  source: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  notified: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface SignupStats {
  total_signups: number;
  product_dev: number;
  affiliate: number;
  business: number;
  last_24h: number;
}

export default function AdminSignupsPage() {
  const [filters, setFilters] = useState({
    audience_type: "",
    search: "",
    show_inactive: false,
  });
  const [selectedSignups, setSelectedSignups] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 50;

  const queryClient = useQueryClient();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-signups-stats"],
    queryFn: async () => {
      const response = await api.get("/api/stats");
      return response.data as SignupStats;
    },
  });

  // Fetch signups
  const {
    data: signupsData,
    isLoading: signupsLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "admin-signups",
      filters.audience_type,
      filters.show_inactive,
      currentPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: ((currentPage - 1) * perPage).toString(),
        limit: perPage.toString(),
      });

      if (filters.audience_type) {
        params.append("audience_type", filters.audience_type);
      }
      if (filters.show_inactive) {
        params.append("active_only", "false");
      }

      const response = await api.get(`/api/signups?${params.toString()}`);
      return {
        signups: response.data as EmailSignup[],
        total: response.data.length, // Note: API doesn't return total count separately
      };
    },
  });

  // Delete signup mutation
  const deleteSignupMutation = useMutation({
    mutationFn: async (email: string) => {
      await api.delete(`/api/signup/${encodeURIComponent(email)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signups"] });
      queryClient.invalidateQueries({ queryKey: ["admin-signups-stats"] });
      toast.success("Signup deleted successfully");
      setSelectedSignups([]);
    },
    onError: (error: any) => {
      toast.error(
        `Failed to delete signup: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      await Promise.all(
        emails.map((email) =>
          api.delete(`/api/signup/${encodeURIComponent(email)}`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signups"] });
      queryClient.invalidateQueries({ queryKey: ["admin-signups-stats"] });
      toast.success(`${selectedSignups.length} signups deleted successfully`);
      setSelectedSignups([]);
    },
    onError: (error: any) => {
      toast.error(
        `Failed to delete signups: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  // Export CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.audience_type) {
        params.append("audience_type", filters.audience_type);
      }
      if (!filters.show_inactive) {
        params.append("active_only", "true");
      }

      const response = await api.get(`/api/export?${params.toString()}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `email_signups_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Signups exported successfully");
    } catch (error: any) {
      toast.error(`Failed to export: ${error.message}`);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSignups(signupsData?.signups.map((s) => s.id) || []);
    } else {
      setSelectedSignups([]);
    }
  };

  const handleSelectSignup = (id: number) => {
    setSelectedSignups((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedSignups.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedSignups.length} signup(s)?`
      )
    ) {
      const emails = signupsData?.signups
        .filter((s) => selectedSignups.includes(s.id))
        .map((s) => s.email) || [];
      bulkDeleteMutation.mutate(emails);
    }
  };

  const filteredSignups = signupsData?.signups.filter((signup) => {
    const matchesSearch =
      !filters.search ||
      signup.email.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  const getAudienceTypeColor = (type: string) => {
    switch (type) {
      case "product-dev":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "affiliate":
        return "bg-green-100 text-green-800 border-green-200";
      case "business":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <AuthGate requiredRole="admin">
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Email Signups
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Manage pre-launch email signups and audience lists
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)] animate-pulse"
              >
                <div className="h-4 bg-[var(--border-color)] rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-[var(--border-color)] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={20} />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Total Signups
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.total_signups || 0}
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-lg">🎯</span>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Product Devs
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.product_dev || 0}
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-lg">💰</span>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Affiliates
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.affiliate || 0}
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-lg">🚀</span>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Businesses
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.business || 0}
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="text-orange-600" size={20} />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Last 24h
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.last_24h || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)] mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.audience_type}
              onChange={(e) =>
                setFilters({ ...filters, audience_type: e.target.value })
              }
              className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Audiences</option>
              <option value="product-dev">Product Developers</option>
              <option value="affiliate">Affiliates</option>
              <option value="business">Businesses</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={filters.show_inactive}
                onChange={(e) =>
                  setFilters({ ...filters, show_inactive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-[var(--text-primary)]">Show inactive</span>
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSignups.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-blue-600" size={20} />
              <span className="text-[var(--text-primary)] font-medium">
                {selectedSignups.length} signup(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSignups([])}
                className="px-4 py-2 text-[var(--text-primary)] hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Signups Table */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedSignups.length ===
                          (signupsData?.signups.length || 0) &&
                        (signupsData?.signups.length || 0) > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Audience
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Source
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Notified
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Signup Date
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {signupsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border-color)] animate-pulse"
                    >
                      <td className="p-4">
                        <div className="w-4 h-4 bg-[var(--border-color)] rounded"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-[var(--border-color)] rounded w-48"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-[var(--border-color)] rounded w-24"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-[var(--border-color)] rounded w-20"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-[var(--border-color)] rounded w-16"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-[var(--border-color)] rounded w-16"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-[var(--border-color)] rounded w-32"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-8 bg-[var(--border-color)] rounded w-20"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredSignups && filteredSignups.length > 0 ? (
                  filteredSignups.map((signup) => (
                    <tr
                      key={signup.id}
                      className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedSignups.includes(signup.id)}
                          onChange={() => handleSelectSignup(signup.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--text-primary)]">
                            {signup.email}
                          </span>
                          {signup.ip_address && (
                            <span className="text-xs text-[var(--text-secondary)]">
                              {signup.ip_address}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAudienceTypeColor(
                            signup.audience_type
                          )}`}
                        >
                          {signup.audience_type === "product-dev" && "🎯"}
                          {signup.audience_type === "affiliate" && "💰"}
                          {signup.audience_type === "business" && "🚀"}
                          <span className="ml-1">
                            {signup.audience_type
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {signup.source}
                        </span>
                      </td>
                      <td className="p-4">
                        {signup.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <XCircle size={12} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {signup.notified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <MailIcon size={12} />
                            Notified
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-secondary)]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {new Date(signup.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${signup.email}?`
                                )
                              ) {
                                deleteSignupMutation.mutate(signup.email);
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete signup"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-[var(--text-secondary)]"
                    >
                      No signups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredSignups && filteredSignups.length >= perPage && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--hover-bg)] transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-[var(--text-primary)]">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={filteredSignups.length < perPage}
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--hover-bg)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
