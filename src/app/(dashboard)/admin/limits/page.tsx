"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

interface TierLimit {
  tier_name: string;
  display_name: string;
  videos_per_month: number;
  images_per_month: number;
  video_scripts_per_month: number;
  articles_per_month: number;
  emails_per_month: number;
  social_posts_per_month: number;
  campaigns_per_month: number;
  is_active: boolean;
}

interface UsageMetrics {
  tier_name: string;
  total_users: number;
  videos_generated: number;
  images_generated: number;
  video_scripts_generated: number;
  articles_generated: number;
  revenue: number;
  avg_usage_percentage: number;
}

interface BulkUpdateRequest {
  tier_name: string;
  field: string;
  value: number;
  reason?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminLimitsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Fetch tier limits
  const { data: tierLimitsData, isLoading: tierLimitsLoading } = useQuery<{
    tiers: TierLimit[];
  }>({
    queryKey: ["admin-tier-limits"],
    queryFn: async () => (await api.get("/api/admin/limits/tiers")).data,
  });

  // Fetch usage analytics
  const { data: usageData, isLoading: usageLoading } = useQuery<{
    metrics: UsageMetrics[];
  }>({
    queryKey: ["admin-usage-analytics"],
    queryFn: async () => (await api.get("/api/admin/limits/usage")).data,
  });

  const tiers = tierLimitsData?.tiers || [];
  const metrics = usageData?.metrics || [];

  // Mutations
  const updateTierLimitMutation = useMutation({
    mutationFn: async ({ tierName, updates }: { tierName: string; updates: Partial<TierLimit> }) => {
      return await api.put(`/api/admin/limits/tiers/${tierName}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tier-limits"] });
      toast.success("Tier limit updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update tier limit");
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: BulkUpdateRequest[]) => {
      return await api.post("/api/admin/limits/bulk-update", { updates });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tier-limits"] });
      toast.success(`Successfully updated ${data.data.count} tier limits`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to perform bulk update");
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Usage Limits Management</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Configure tier limits and monitor usage across all content types
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "overview"
              ? "bg-white dark:bg-gray-700 shadow"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("tiers")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "tiers"
              ? "bg-white dark:bg-gray-700 shadow"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Tier Limits
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "analytics"
              ? "bg-white dark:bg-gray-700 shadow"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Usage Analytics
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "bulk"
              ? "bg-white dark:bg-gray-700 shadow"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Bulk Update
        </button>
      </div>

      {/* Content */}
      <div className="card rounded-lg p-6">
        {activeTab === "overview" && (
          <OverviewDashboard
            tiers={tiers}
            metrics={metrics}
            isLoading={tierLimitsLoading || usageLoading}
          />
        )}

        {activeTab === "tiers" && (
          <TierLimitsEditor
            tiers={tiers}
            isLoading={tierLimitsLoading}
            onUpdate={(tierName, updates) => updateTierLimitMutation.mutate({ tierName, updates })}
          />
        )}

        {activeTab === "analytics" && (
          <UsageAnalytics
            metrics={metrics}
            isLoading={usageLoading}
          />
        )}

        {activeTab === "bulk" && (
          <BulkUpdate
            tiers={tiers}
            onBulkUpdate={(updates) => bulkUpdateMutation.mutate(updates)}
            isUpdating={bulkUpdateMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW DASHBOARD
// ============================================================================

function OverviewDashboard({
  tiers,
  metrics,
  isLoading,
}: {
  tiers: TierLimit[];
  metrics: UsageMetrics[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Loading overview...</div>;
  }

  // Calculate totals
  const totalUsers = metrics.reduce((sum, m) => sum + m.total_users, 0);
  const totalVideos = tiers.reduce((sum, t) => sum + (t.videos_per_month || 0), 0);
  const totalImages = tiers.reduce((sum, t) => sum + (t.images_per_month || 0), 0);
  const totalScripts = tiers.reduce((sum, t) => sum + (t.video_scripts_per_month || 0), 0);
  const totalArticles = tiers.reduce((sum, t) => sum + (t.articles_per_month || 0), 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Platform Overview</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="p-4 rounded-lg border"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Total Active Users
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            {totalUsers.toLocaleString()}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Monthly Video Limit
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            {totalVideos.toLocaleString()}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Monthly Image Limit
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            {totalImages.toLocaleString()}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Monthly Script Limit
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            {totalScripts.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tier Summary */}
      <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Tier Summary
      </h3>
      <div className="space-y-4">
        {tiers.map((tier) => {
          const tierMetric = metrics.find((m) => m.tier_name === tier.tier_name);
          return (
            <div
              key={tier.tier_name}
              className="p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tier.display_name}
                  </h4>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {tierMetric?.total_users || 0} active users
                  </div>
                </div>
                {!tier.is_active && (
                  <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                    Inactive
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>Videos:</span>
                  <span className="ml-2 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tier.videos_per_month === -1 ? "Unlimited" : tier.videos_per_month.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>Images:</span>
                  <span className="ml-2 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tier.images_per_month === -1 ? "Unlimited" : tier.images_per_month.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>Scripts:</span>
                  <span className="ml-2 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tier.video_scripts_per_month === -1 ? "Unlimited" : tier.video_scripts_per_month.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>Articles:</span>
                  <span className="ml-2 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tier.articles_per_month === -1 ? "Unlimited" : tier.articles_per_month.toLocaleString()}
                  </span>
                </div>
              </div>

              {tierMetric && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--card-border)" }}>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Avg Usage: {tierMetric.avg_usage_percentage.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(tierMetric.avg_usage_percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TIER LIMITS EDITOR
// ============================================================================

function TierLimitsEditor({
  tiers,
  isLoading,
  onUpdate,
}: {
  tiers: TierLimit[];
  isLoading: boolean;
  onUpdate: (tierName: string, updates: Partial<TierLimit>) => void;
}) {
  const [editingTier, setEditingTier] = useState<TierLimit | null>(null);

  if (isLoading) {
    return <div className="text-center py-12">Loading tier limits...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Tier Limits Configuration</h2>

      <div className="space-y-4">
        {tiers.map((tier) => (
          <div
            key={tier.tier_name}
            className="p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.display_name}
                </h3>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {tier.tier_name}
                </span>
              </div>
              <button
                onClick={() => setEditingTier(tier)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Edit Limits
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Videos/Month:</span>
                <div
                  className="mt-1 font-semibold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.videos_per_month === -1 ? "Unlimited" : tier.videos_per_month.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Images/Month:</span>
                <div
                  className="mt-1 font-semibold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.images_per_month === -1 ? "Unlimited" : tier.images_per_month.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Scripts/Month:</span>
                <div
                  className="mt-1 font-semibold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.video_scripts_per_month === -1 ? "Unlimited" : tier.video_scripts_per_month.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Articles/Month:</span>
                <div
                  className="mt-1 font-semibold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.articles_per_month === -1 ? "Unlimited" : tier.articles_per_month.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTier && (
        <TierLimitEditModal
          tier={editingTier}
          onClose={() => setEditingTier(null)}
          onSave={(updatedTier) => {
            onUpdate(editingTier.tier_name, updatedTier);
            setEditingTier(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// TIER LIMIT EDIT MODAL
// ============================================================================

function TierLimitEditModal({
  tier,
  onClose,
  onSave,
}: {
  tier: TierLimit;
  onClose: () => void;
  onSave: (tier: Partial<TierLimit>) => void;
}) {
  const [formData, setFormData] = useState<Partial<TierLimit>>(tier);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div
          className="p-6 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Edit Limits: {tier.display_name}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Videos */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Videos per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.videos_per_month ?? tier.videos_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videos_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Images */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Images per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.images_per_month ?? tier.images_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Video Scripts */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Video Scripts per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.video_scripts_per_month ?? tier.video_scripts_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    video_scripts_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Articles */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Articles per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.articles_per_month ?? tier.articles_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    articles_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Emails */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Emails per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.emails_per_month ?? tier.emails_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emails_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Social Posts */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Social Posts per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.social_posts_per_month ?? tier.social_posts_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_posts_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Campaigns */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Campaigns per Month (-1 for unlimited)
              </label>
              <input
                type="number"
                value={formData.campaigns_per_month ?? tier.campaigns_per_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    campaigns_per_month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="tier_active"
              checked={formData.is_active ?? tier.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="tier_active"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Tier Active
            </label>
          </div>
        </div>

        <div
          className="p-6 border-t flex justify-end space-x-3"
          style={{ borderColor: "var(--card-border)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE ANALYTICS
// ============================================================================

function UsageAnalytics({
  metrics,
  isLoading,
}: {
  metrics: UsageMetrics[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Usage Analytics</h2>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div
            key={metric.tier_name}
            className="p-6 rounded-lg border"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {metric.tier_name}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {metric.total_users} active users
                </p>
              </div>
              <div className="text-right">
                <div
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Avg Usage
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {metric.avg_usage_percentage.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Videos Generated
                </div>
                <div
                  className="text-xl font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {metric.videos_generated.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Images Generated
                </div>
                <div
                  className="text-xl font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {metric.images_generated.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Scripts Generated
                </div>
                <div
                  className="text-xl font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {metric.video_scripts_generated.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Revenue
                </div>
                <div
                  className="text-xl font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  ${metric.revenue.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(metric.avg_usage_percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BULK UPDATE
// ============================================================================

function BulkUpdate({
  tiers,
  onBulkUpdate,
  isUpdating,
}: {
  tiers: TierLimit[];
  onBulkUpdate: (updates: BulkUpdateRequest[]) => void;
  isUpdating: boolean;
}) {
  const [updates, setUpdates] = useState<BulkUpdateRequest[]>([]);
  const [newUpdate, setNewUpdate] = useState<Partial<BulkUpdateRequest>>({
    tier_name: "",
    field: "",
    value: 0,
    reason: "",
  });

  const addUpdate = () => {
    if (!newUpdate.tier_name || !newUpdate.field || newUpdate.value === undefined) {
      toast.error("Please fill in all fields");
      return;
    }

    setUpdates([...updates, newUpdate as BulkUpdateRequest]);
    setNewUpdate({ tier_name: "", field: "", value: 0, reason: "" });
  };

  const removeUpdate = (index: number) => {
    setUpdates(updates.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (updates.length === 0) {
      toast.error("Please add at least one update");
      return;
    }

    onBulkUpdate(updates);
    setUpdates([]);
  };

  const fields = [
    { value: "videos_per_month", label: "Videos per Month" },
    { value: "images_per_month", label: "Images per Month" },
    { value: "video_scripts_per_month", label: "Video Scripts per Month" },
    { value: "articles_per_month", label: "Articles per Month" },
    { value: "emails_per_month", label: "Emails per Month" },
    { value: "social_posts_per_month", label: "Social Posts per Month" },
    { value: "campaigns_per_month", label: "Campaigns per Month" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Bulk Update</h2>

      {/* Add Update Form */}
      <div
        className="p-4 rounded-lg border mb-6"
        style={{ borderColor: "var(--card-border)" }}
      >
        <h3
          className="text-lg font-medium mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Add Update
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Tier
            </label>
            <select
              value={newUpdate.tier_name}
              onChange={(e) =>
                setNewUpdate({ ...newUpdate, tier_name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
            >
              <option value="">Select tier...</option>
              {tiers.map((tier) => (
                <option key={tier.tier_name} value={tier.tier_name}>
                  {tier.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Field
            </label>
            <select
              value={newUpdate.field}
              onChange={(e) =>
                setNewUpdate({ ...newUpdate, field: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
            >
              <option value="">Select field...</option>
              {fields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              New Value
            </label>
            <input
              type="number"
              value={newUpdate.value}
              onChange={(e) =>
                setNewUpdate({ ...newUpdate, value: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
              placeholder="Enter value..."
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Reason (optional)
            </label>
            <input
              type="text"
              value={newUpdate.reason}
              onChange={(e) =>
                setNewUpdate({ ...newUpdate, reason: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
              placeholder="Why this change?"
            />
          </div>
        </div>

        <button
          onClick={addUpdate}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          Add to Batch
        </button>
      </div>

      {/* Pending Updates */}
      {updates.length > 0 && (
        <div
          className="p-4 rounded-lg border mb-6"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Pending Updates ({updates.length})
          </h3>

          <div className="space-y-2">
            {updates.map((update, index) => {
              const fieldLabel = fields.find((f) => f.value === update.field)?.label || update.field;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex-1">
                    <span className="font-medium">{update.tier_name}</span>
                    <span className="mx-2">→</span>
                    <span>{fieldLabel}</span>
                    <span className="mx-2">=</span>
                    <span className="font-mono">{update.value}</span>
                    {update.reason && (
                      <span className="ml-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        ({update.reason})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeUpdate(index)}
                    className="ml-4 p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition flex items-center space-x-2"
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Updating...</span>
              </>
            ) : (
              <span>Apply All Updates</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
