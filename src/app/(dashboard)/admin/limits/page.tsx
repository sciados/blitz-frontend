"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { AuthGate } from "src/components/AuthGate";

// ============================================================================
// TYPES - Matching new database schema
// ============================================================================

interface TierLimit {
  id: number;
  tier_name: string;
  monthly_ai_video_scripts: number | null;  // NULL = unlimited
  monthly_ai_text_generations: number | null;
  monthly_ai_image_generations: number | null;
  monthly_campaigns: number | null;
  max_tokens_per_request: number;
  can_use_premium_ai: boolean;
  can_use_templates: boolean;
  description: string | null;
}

interface TierLimitUpdate {
  monthly_ai_video_scripts?: number | null;
  monthly_ai_text_generations?: number | null;
  monthly_ai_image_generations?: number | null;
  monthly_campaigns?: number | null;
  max_tokens_per_request?: number;
  can_use_premium_ai?: boolean;
  can_use_templates?: boolean;
  description?: string;
}

interface UserUsage {
  user_id: number;
  email: string;
  tier: string;
  usage_month: string;
  ai_video_scripts_used: number;
  ai_text_generations_used: number;
  ai_image_generations_used: number;
  campaigns_created: number;
  estimated_cost_usd: number;
}

interface UsageSummary {
  total_users: number;
  total_cost_this_month: number;
  usage_by_tier: Record<string, {
    user_count: number;
    ai_video_scripts: number;
    ai_text_generations: number;
    ai_image_generations: number;
    total_cost: number;
  }>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminLimitsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const queryClient = useQueryClient();

  // Fetch tier limits from database
  const { data: tiers = [], isLoading: tiersLoading } = useQuery<TierLimit[]>({
    queryKey: ["admin-tier-limits"],
    queryFn: async () => (await api.get("/api/admin/limits/tiers")).data,
  });

  // Fetch usage summary
  const { data: usageSummary, isLoading: summaryLoading } = useQuery<UsageSummary>({
    queryKey: ["admin-usage-summary", selectedMonth],
    queryFn: async () => (await api.get(`/api/admin/limits/usage/summary?month=${selectedMonth}`)).data,
  });

  // Fetch detailed user usage
  const { data: userUsage = [], isLoading: usageLoading } = useQuery<UserUsage[]>({
    queryKey: ["admin-user-usage", selectedMonth],
    queryFn: async () => (await api.get(`/api/admin/limits/usage?month=${selectedMonth}`)).data,
    enabled: activeTab === "users",
  });

  // Update tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ tierName, updates }: { tierName: string; updates: TierLimitUpdate }) => {
      return await api.put(`/api/admin/limits/tiers/${tierName}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tier-limits"] });
      toast.success("Tier limits updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update tier limits");
    },
  });

  // Reset user usage mutation
  const resetUsageMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await api.delete(`/api/admin/limits/usage/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-usage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usage-summary"] });
      toast.success("User usage reset successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to reset usage");
    },
  });

  return (
    <AuthGate requiredRole="admin">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Usage Limits Management</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Configure tier limits and monitor platform usage. Data from database tables: tier_limits, user_usage
          </p>
        </div>

        {/* Month Selector */}
        <div className="mb-4">
          <label className="text-sm mr-2" style={{ color: "var(--text-secondary)" }}>
            Viewing month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1 border rounded"
            style={{ borderColor: "var(--card-border)" }}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {["overview", "tiers", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition capitalize ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-700 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "tiers" ? "Tier Limits" : "User Usage"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card rounded-lg p-6">
          {activeTab === "overview" && (
            <OverviewDashboard
              tiers={tiers}
              summary={usageSummary}
              isLoading={tiersLoading || summaryLoading}
              selectedMonth={selectedMonth}
            />
          )}

          {activeTab === "tiers" && (
            <TierLimitsEditor
              tiers={tiers}
              isLoading={tiersLoading}
              onUpdate={(tierName, updates) => updateTierMutation.mutate({ tierName, updates })}
              isUpdating={updateTierMutation.isPending}
            />
          )}

          {activeTab === "users" && (
            <UserUsageTable
              users={userUsage}
              isLoading={usageLoading}
              onResetUsage={(userId) => resetUsageMutation.mutate(userId)}
              isResetting={resetUsageMutation.isPending}
            />
          )}
        </div>
      </div>
    </AuthGate>
  );
}

// ============================================================================
// OVERVIEW DASHBOARD
// ============================================================================

function OverviewDashboard({
  tiers,
  summary,
  isLoading,
  selectedMonth,
}: {
  tiers: TierLimit[];
  summary?: UsageSummary;
  isLoading: boolean;
  selectedMonth: string;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Loading overview...</div>;
  }

  const formatLimit = (value: number | null) => {
    return value === null ? "Unlimited" : value.toLocaleString();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Platform Overview - {selectedMonth}</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Users"
          value={summary?.total_users?.toLocaleString() || "0"}
        />
        <MetricCard
          label="Total Cost (USD)"
          value={`$${summary?.total_cost_this_month?.toFixed(2) || "0.00"}`}
        />
        <MetricCard
          label="Tiers Configured"
          value={tiers.length.toString()}
        />
        <MetricCard
          label="Premium AI Tiers"
          value={tiers.filter(t => t.can_use_premium_ai).length.toString()}
        />
      </div>

      {/* Usage by Tier */}
      {summary?.usage_by_tier && Object.keys(summary.usage_by_tier).length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-4">Usage by Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(summary.usage_by_tier).map(([tierName, data]) => (
              <div
                key={tierName}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--card-border)" }}
              >
                <h4 className="font-semibold capitalize mb-2">{tierName}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Users: <span className="font-medium">{data.user_count}</span></div>
                  <div>Cost: <span className="font-medium">${data.total_cost.toFixed(2)}</span></div>
                  <div>Video Scripts: <span className="font-medium">{data.ai_video_scripts}</span></div>
                  <div>Text Gens: <span className="font-medium">{data.ai_text_generations}</span></div>
                  <div>Images: <span className="font-medium">{data.ai_image_generations}</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tier Configuration Summary */}
      <h3 className="text-lg font-semibold mb-4">Tier Configuration</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
              <th className="text-left py-3 px-2">Tier</th>
              <th className="text-center py-3 px-2">Video Scripts</th>
              <th className="text-center py-3 px-2">Text Gens</th>
              <th className="text-center py-3 px-2">Images</th>
              <th className="text-center py-3 px-2">Campaigns</th>
              <th className="text-center py-3 px-2">Premium AI</th>
              <th className="text-center py-3 px-2">Templates</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.id} className="border-b" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-3 px-2 font-medium capitalize">{tier.tier_name}</td>
                <td className="py-3 px-2 text-center">{formatLimit(tier.monthly_ai_video_scripts)}</td>
                <td className="py-3 px-2 text-center">{formatLimit(tier.monthly_ai_text_generations)}</td>
                <td className="py-3 px-2 text-center">{formatLimit(tier.monthly_ai_image_generations)}</td>
                <td className="py-3 px-2 text-center">{formatLimit(tier.monthly_campaigns)}</td>
                <td className="py-3 px-2 text-center">
                  {tier.can_use_premium_ai ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  {tier.can_use_templates ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border" style={{ borderColor: "var(--card-border)" }}>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{value}</div>
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
  isUpdating,
}: {
  tiers: TierLimit[];
  isLoading: boolean;
  onUpdate: (tierName: string, updates: TierLimitUpdate) => void;
  isUpdating: boolean;
}) {
  const [editingTier, setEditingTier] = useState<TierLimit | null>(null);

  if (isLoading) {
    return <div className="text-center py-12">Loading tier limits...</div>;
  }

  const formatLimit = (value: number | null) => {
    return value === null ? "Unlimited" : value.toLocaleString();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Tier Limits Configuration</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Set -1 or leave empty for unlimited. Changes are saved to the database immediately.
      </p>

      <div className="space-y-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                  {tier.tier_name}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {tier.description || "No description"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {tier.can_use_premium_ai && (
                  <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                    Premium AI
                  </span>
                )}
                <button
                  onClick={() => setEditingTier(tier)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <LimitDisplay label="AI Video Scripts" value={formatLimit(tier.monthly_ai_video_scripts)} />
              <LimitDisplay label="AI Text Gens" value={formatLimit(tier.monthly_ai_text_generations)} />
              <LimitDisplay label="AI Images" value={formatLimit(tier.monthly_ai_image_generations)} />
              <LimitDisplay label="Campaigns" value={formatLimit(tier.monthly_campaigns)} />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTier && (
        <TierEditModal
          tier={editingTier}
          onClose={() => setEditingTier(null)}
          onSave={(updates) => {
            onUpdate(editingTier.tier_name, updates);
            setEditingTier(null);
          }}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

function LimitDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "var(--text-secondary)" }}>{label}:</span>
      <div className="mt-1 font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

// ============================================================================
// TIER EDIT MODAL
// ============================================================================

function TierEditModal({
  tier,
  onClose,
  onSave,
  isUpdating,
}: {
  tier: TierLimit;
  onClose: () => void;
  onSave: (updates: TierLimitUpdate) => void;
  isUpdating: boolean;
}) {
  const [formData, setFormData] = useState<TierLimitUpdate>({
    monthly_ai_video_scripts: tier.monthly_ai_video_scripts,
    monthly_ai_text_generations: tier.monthly_ai_text_generations,
    monthly_ai_image_generations: tier.monthly_ai_image_generations,
    monthly_campaigns: tier.monthly_campaigns,
    max_tokens_per_request: tier.max_tokens_per_request,
    can_use_premium_ai: tier.can_use_premium_ai,
    can_use_templates: tier.can_use_templates,
    description: tier.description || "",
  });

  const handleNumberChange = (field: keyof TierLimitUpdate, value: string) => {
    const numValue = value === "" || value === "-1" ? null : parseInt(value);
    setFormData({ ...formData, [field]: numValue === -1 ? null : numValue });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b" style={{ borderColor: "var(--card-border)" }}>
          <h3 className="text-xl font-semibold capitalize">Edit: {tier.tier_name} Tier</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Monthly Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LimitInput
              label="AI Video Scripts/Month"
              value={formData.monthly_ai_video_scripts}
              onChange={(v) => handleNumberChange("monthly_ai_video_scripts", v)}
            />
            <LimitInput
              label="AI Text Generations/Month"
              value={formData.monthly_ai_text_generations}
              onChange={(v) => handleNumberChange("monthly_ai_text_generations", v)}
            />
            <LimitInput
              label="AI Images/Month"
              value={formData.monthly_ai_image_generations}
              onChange={(v) => handleNumberChange("monthly_ai_image_generations", v)}
            />
            <LimitInput
              label="Campaigns/Month"
              value={formData.monthly_campaigns}
              onChange={(v) => handleNumberChange("monthly_campaigns", v)}
            />
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium mb-2">Max Tokens per Request</label>
            <input
              type="number"
              value={formData.max_tokens_per_request || 4000}
              onChange={(e) => setFormData({ ...formData, max_tokens_per_request: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
            />
          </div>

          {/* Feature Flags */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.can_use_premium_ai}
                onChange={(e) => setFormData({ ...formData, can_use_premium_ai: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Can use Premium AI (Claude/GPT-4o for video scripts)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.can_use_templates}
                onChange={(e) => setFormData({ ...formData, can_use_templates: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Can use Templates (template-based video scripts)</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "var(--card-border)" }}
              rows={2}
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3" style={{ borderColor: "var(--card-border)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ borderColor: "var(--card-border)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LimitInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="number"
        value={value === null ? "" : value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Empty = unlimited"
        className="w-full px-4 py-2 border rounded-lg"
        style={{ borderColor: "var(--card-border)" }}
      />
      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
        Leave empty or -1 for unlimited
      </p>
    </div>
  );
}

// ============================================================================
// USER USAGE TABLE
// ============================================================================

function UserUsageTable({
  users,
  isLoading,
  onResetUsage,
  isResetting,
}: {
  users: UserUsage[];
  isLoading: boolean;
  onResetUsage: (userId: number) => void;
  isResetting: boolean;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Loading user usage...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
        No usage data for this month
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">User Usage Details</h2>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Showing {users.length} users. Click "Reset" to clear a user's usage for the current month.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
              <th className="text-left py-3 px-2">User</th>
              <th className="text-center py-3 px-2">Tier</th>
              <th className="text-center py-3 px-2">Video Scripts</th>
              <th className="text-center py-3 px-2">Text Gens</th>
              <th className="text-center py-3 px-2">Images</th>
              <th className="text-center py-3 px-2">Campaigns</th>
              <th className="text-center py-3 px-2">Est. Cost</th>
              <th className="text-center py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-3 px-2">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>ID: {user.user_id}</div>
                </td>
                <td className="py-3 px-2 text-center capitalize">{user.tier}</td>
                <td className="py-3 px-2 text-center">{user.ai_video_scripts_used}</td>
                <td className="py-3 px-2 text-center">{user.ai_text_generations_used}</td>
                <td className="py-3 px-2 text-center">{user.ai_image_generations_used}</td>
                <td className="py-3 px-2 text-center">{user.campaigns_created}</td>
                <td className="py-3 px-2 text-center">${user.estimated_cost_usd.toFixed(4)}</td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => {
                      if (confirm(`Reset usage for ${user.email}?`)) {
                        onResetUsage(user.user_id);
                      }
                    }}
                    disabled={isResetting}
                    className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 rounded"
                  >
                    Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
