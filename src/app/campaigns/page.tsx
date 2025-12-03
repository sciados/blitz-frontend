"use client";

import { AuthGate } from "src/components/AuthGate";
import { CreateCampaignModal } from "src/components/CreateCampaignModal";
import { useState, useEffect, useMemo } from "react";
import { api } from "src/lib/appClient";
import { Campaign } from "src/lib/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, SortAsc, SortDesc, ChevronDown, Grid, List } from "lucide-react";

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";
type StatusFilter = "all" | "active" | "draft" | "paused" | "completed";

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedProductId, setPreselectedProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sorting, filtering, and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/campaigns");
      setCampaigns(response.data);
    } catch (err: any) {
      console.error("Failed to fetch campaigns:", err);
      setError("Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();

    // Check if productId query parameter exists
    const productIdParam = searchParams.get("productId");
    if (productIdParam) {
      const productId = parseInt(productIdParam, 10);
      if (!isNaN(productId)) {
        setPreselectedProductId(productId);
        setIsModalOpen(true);
        // Clear the query parameter from URL
        router.replace("/campaigns");
      }
    }
  }, [searchParams, router]);

  const handleCreateSuccess = () => {
    // Refresh campaigns list after successful creation
    fetchCampaigns();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPreselectedProductId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let result = [...campaigns];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.product_url?.toLowerCase().includes(query) ||
          c.affiliate_network?.toLowerCase().includes(query) ||
          c.keywords?.some((k) => k.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [campaigns, searchQuery, statusFilter, sortBy]);

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    name_asc: "Name (A-Z)",
    name_desc: "Name (Z-A)",
  };

  const statusLabels: Record<StatusFilter, string> = {
    all: "All Status",
    active: "Active",
    draft: "Draft",
    paused: "Paused",
    completed: "Completed",
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Campaigns
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition hover:bg-opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <Filter className="w-4 h-4" />
              <span>{statusLabels[statusFilter]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterDropdown && (
              <div
                className="absolute top-full mt-1 right-0 w-40 rounded-lg shadow-lg border z-10"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
              >
                {(Object.keys(statusLabels) as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-opacity-80 first:rounded-t-lg last:rounded-b-lg ${
                      statusFilter === status ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                    }`}
                    style={{ color: statusFilter === status ? undefined : 'var(--text-primary)' }}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition hover:bg-opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              {sortBy.includes("asc") || sortBy === "oldest" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortDropdown && (
              <div
                className="absolute top-full mt-1 right-0 w-40 rounded-lg shadow-lg border z-10"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
              >
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-opacity-80 first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === option ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                    }`}
                    style={{ color: sortBy === option ? undefined : 'var(--text-primary)' }}
                  >
                    {sortLabels[option]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
              Loading campaigns...
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card rounded-lg p-12 text-center">
            <div className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No campaigns yet
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Create your first campaign to get started
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : filteredAndSortedCampaigns.length === 0 ? (
          <div className="card rounded-lg p-12 text-center">
            <div className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              <Search className="w-16 h-16 mx-auto opacity-30" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No matching campaigns
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-blue-600 hover:text-blue-700 transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="card rounded-lg hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                {/* Campaign Thumbnail */}
                <div className="relative h-40 rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {campaign.thumbnail_image_url ? (
                    <img
                      src={campaign.thumbnail_image_url}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-16 h-16 opacity-30"
                        style={{ color: 'var(--text-secondary)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Status Badge - Top Right */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                  {/* Warning badge if product was removed */}
                  {!campaign.product_intelligence_id && campaign.thumbnail_image_url && (
                    <span
                      className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 flex items-center space-x-1"
                      title="Product removed from library"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Campaign Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {campaign.name}
                  </h3>

                  <div className="space-y-2 text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {/* Affiliate Network */}
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{campaign.affiliate_network || 'No network'}</span>
                    </div>

                    {/* Product Type */}
                    {campaign.product_type && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="truncate">{campaign.product_type}</span>
                      </div>
                    )}

                    {/* Keywords */}
                    {campaign.keywords && campaign.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {campaign.keywords.slice(0, 2).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                        {campaign.keywords.length > 2 && (
                          <span className="text-xs text-gray-500">+{campaign.keywords.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/campaigns/${campaign.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <span>Open</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCreateSuccess}
        preselectedProductId={preselectedProductId}
      />
    </AuthGate>
  );
}
