"use client";
import { AuthGate } from "src/components/AuthGate";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import Link from "next/link";

type UserInfo = {
  id: number;
  email: string;
  role: string;
  user_type: string;
};

export default function DashboardPage() {
  // Fetch user info to determine user_type
  const { data: userInfo, isLoading } = useQuery<UserInfo>({
    queryKey: ["userInfo"],
    queryFn: async () => (await api.get("/api/auth/me")).data,
  });

  if (isLoading) {
    return (
      <AuthGate requiredRole="user">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </AuthGate>
    );
  }

  const isProductCreator = userInfo?.role === "creator";
  const isBusinessOwner = userInfo?.role === "business";

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {isProductCreator
              ? "Manage your products and track affiliate performance."
              : isBusinessOwner
              ? "Promote your business and grow your affiliate network."
              : "Manage your campaigns and content."}
          </p>
        </div>

        {/* Conditional Dashboard Cards */}
        {isProductCreator ? (
          <ProductCreatorDashboard />
        ) : isBusinessOwner ? (
          <BusinessOwnerDashboard />
        ) : (
          <AffiliateMarketerDashboard />
        )}
      </div>
    </AuthGate>
  );
}

// ============================================================================
// PRODUCT CREATOR DASHBOARD
// ============================================================================

function ProductCreatorDashboard() {
  // Fetch product creator stats
  const { data: stats } = useQuery({
    queryKey: ["productCreatorStats"],
    queryFn: async () => {
      try {
        const [productsRes, analyticsRes] = await Promise.all([
          api.get("/api/products"),
          api
            .get("/api/product-analytics/summary")
            .catch(() => ({ data: null })),
        ]);
        return {
          totalProducts: productsRes.data?.length || 0,
          activeAffiliates: analyticsRes.data?.active_affiliates || 0,
          totalClicks: analyticsRes.data?.total_clicks || 0,
          topProducts: analyticsRes.data?.top_products || [],
        };
      } catch (error) {
        return {
          totalProducts: 0,
          activeAffiliates: 0,
          totalClicks: 0,
          topProducts: [],
        };
      }
    },
  });

  return (
    <>
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Products
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Active Affiliates
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.activeAffiliates || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Clicks (7d)
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.totalClicks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👆</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Avg Performance
              </p>
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {stats?.totalProducts && stats?.totalClicks
                  ? Math.round(stats.totalClicks / stats.totalProducts)
                  : 0}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                clicks/product
              </p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Product Library */}
        <Link
          href="/products"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                📦
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              Product Library
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Add and manage your products for affiliates to promote
          </p>
        </Link>

        {/* Product Analytics */}
        <Link
          href="/product-analytics"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-cyan-400 dark:hover:border-cyan-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-cyan-600 dark:text-cyan-400 text-xl">
                📊
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
              Product Analytics
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Track affiliate performance and leaderboards
          </p>
        </Link>

        {/* Intelligence */}
        <Link
          href="/intelligence"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                🧠
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
              Intelligence
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            AI-powered product research and competitive insights
          </p>
        </Link>

        {/* Networking */}
        <Link
          href="/affiliates"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                👥
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              Networking
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Connect with quality affiliates
          </p>
        </Link>

        {/* Messages */}
        <Link
          href="/messages"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-pink-400 dark:hover:border-pink-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-pink-600 dark:text-pink-400 text-xl">
                💬
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
              Messages
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Communicate with affiliates and partners
          </p>
        </Link>

        {/* Campaigns */}
        <Link
          href="/campaigns"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-blue-600 dark:text-blue-400 text-xl">
                📢
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              Campaigns
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Promote products from your library or others
          </p>
        </Link>

        {/* Content */}
        <Link
          href="/content"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-green-400 dark:hover:border-green-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-green-600 dark:text-green-400 text-xl">
                ✍️
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
              Content
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Generate marketing content and sales copy
          </p>
        </Link>

        {/* Compliance */}
        <Link
          href="/compliance"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-red-400 dark:hover:border-red-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-red-600 dark:text-red-400 text-xl">✅</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              Compliance
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Check content against FTC and network guidelines
          </p>
        </Link>

        {/* Analytics */}
        <Link
          href="/analytics"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-orange-400 dark:hover:border-orange-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-orange-600 dark:text-orange-400 text-xl">
                📈
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
              Analytics
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Overall platform performance and insights
          </p>
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-gray-400 dark:hover:border-gray-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-gray-600 dark:text-gray-400 text-xl">
                ⚙️
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              Settings
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your account and notification preferences
          </p>
        </Link>
      </div>

      {/* Quick Actions & Resources */}
      <div className="border-t pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/products"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Add Product
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Add a new product to your library
              </p>
            </Link>

            <Link
              href="/product-analytics"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-cyan-400 dark:hover:border-cyan-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  View Leaderboard
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                See your top-performing affiliates
              </p>
            </Link>

            <Link
              href="/content"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-400 dark:hover:border-green-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Create Content
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Generate marketing materials
              </p>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            {stats?.totalProducts === 0 ? "Getting Started" : "Pro Tips"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.totalProducts === 0 ? (
              <>
                <div className="p-4 card border-l-4 border-purple-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    📝 Add Your First Product
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Start by adding your product to the library. Include product
                    details, pricing, and commission information.
                  </p>
                  <Link
                    href="/products"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Go to Product Library →
                  </Link>
                </div>

                <div className="p-4 card border-l-4 border-blue-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    🧠 Build Intelligence
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Compile product intelligence to help affiliates understand
                    your product better and create better content.
                  </p>
                  <Link
                    href="/intelligence"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Start Intelligence Compilation →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 card border-l-4 border-cyan-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    📊 Monitor Performance
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Check your affiliate leaderboard regularly. Reward top
                    performers to boost motivation and results.
                  </p>
                  <Link
                    href="/product-analytics"
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    View Analytics →
                  </Link>
                </div>

                <div className="p-4 card border-l-4 border-green-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    ✅ Stay Compliant
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Ensure your marketing materials meet FTC guidelines and
                    affiliate network requirements.
                  </p>
                  <Link
                    href="/compliance"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    Check Compliance →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// BUSINESS OWNER DASHBOARD
// ============================================================================

function BusinessOwnerDashboard() {
  // Fetch business owner stats
  const { data: stats } = useQuery({
    queryKey: ["businessOwnerStats"],
    queryFn: async () => {
      try {
        const [campaignsRes, textContentRes] = await Promise.all([
          api.get("/api/campaigns"),
          api.get("/api/content").catch(() => ({ data: [] })),
        ]);

        const campaigns = campaignsRes.data || [];
        const activeCampaigns = campaigns.filter(
          (c: any) => c.status === "active"
        ).length;
        const textContent = textContentRes.data || [];

        // Fetch images for all campaigns (same pattern as Content Library)
        const allImagePromises = campaigns.map((campaign: any) =>
          api
            .get(`/api/images/campaign/${campaign.id}`)
            .then((res) => res.data.images || [])
            .catch(() => [])
        );
        const allImageArrays = await Promise.all(allImagePromises);
        const images = allImageArrays.flat();
        const totalContentPieces = textContent.length + images.length;

        return {
          totalCampaigns: campaigns.length,
          activeCampaigns: activeCampaigns,
          contentPieces: totalContentPieces,
          textContentPieces: textContent.length,
          imageContentPieces: images.length,
          recentCampaigns: campaigns.slice(0, 3),
        };
      } catch (error) {
        return {
          totalCampaigns: 0,
          activeCampaigns: 0,
          contentPieces: 0,
          textContentPieces: 0,
          imageContentPieces: 0,
          recentCampaigns: [],
        };
      }
    },
  });

  return (
    <>
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Business Campaigns
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalCampaigns || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📢</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Active Campaigns
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.activeCampaigns || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Marketing Content
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.contentPieces || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Business Campaigns */}
        <Link
          href="/campaigns"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-blue-600 dark:text-blue-400 text-xl">
                📢
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              Business Campaigns
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Promote your business and services to affiliates
          </p>
        </Link>

        {/* Content Generation */}
        <Link
          href="/content"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-green-400 dark:hover:border-green-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-green-600 dark:text-green-400 text-xl">
                ✍️
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
              Content
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Generate marketing content for your business
          </p>
        </Link>

        {/* Intelligence */}
        <Link
          href="/intelligence"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                🧠
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
              Intelligence
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Compile business intelligence and market insights
          </p>
        </Link>

        {/* Analytics */}
        <Link
          href="/analytics"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-orange-400 dark:hover:border-orange-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-orange-600 dark:text-orange-400 text-xl">
                📈
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
              Analytics
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Track campaign performance and affiliate metrics
          </p>
        </Link>

        {/* Networking */}
        <Link
          href="/affiliates"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                👥
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              Networking
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Find and connect with quality affiliates
          </p>
        </Link>

        {/* Messages */}
        <Link
          href="/messages"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-pink-400 dark:hover:border-pink-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-pink-600 dark:text-pink-400 text-xl">
                💬
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
              Messages
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Communicate with your affiliate network
          </p>
        </Link>

        {/* Compliance */}
        <Link
          href="/compliance"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-red-400 dark:hover:border-red-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-red-600 dark:text-red-400 text-xl">✅</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              Compliance
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Ensure content meets compliance guidelines
          </p>
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-gray-400 dark:hover:border-gray-500 border-2 border-transparent "
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-gray-600 dark:text-gray-400 text-xl">
                ⚙️
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              Settings
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your account and preferences
          </p>
        </Link>
      </div>

      {/* Quick Actions & Tips */}
      <div className="border-t pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/campaigns"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Create Campaign
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Start a campaign for your business
              </p>
            </Link>

            <Link
              href="/content"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-400 dark:hover:border-green-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Generate Content
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Create marketing materials for affiliates
              </p>
            </Link>

            <Link
              href="/affiliates"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🤝</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Find Affiliates
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Connect with quality affiliates
              </p>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            {stats?.totalCampaigns === 0 ? "Getting Started" : "Pro Tips"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.totalCampaigns === 0 ? (
              <>
                <div className="p-4 card border-l-4 border-blue-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    📢 Create Your First Campaign
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Start by creating a campaign for your business. Enter your
                    business website URL to compile intelligence.
                  </p>
                  <Link
                    href="/campaigns"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Create Campaign →
                  </Link>
                </div>

                <div className="p-4 card border-l-4 border-green-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    ✍️ Generate Marketing Content
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Create compelling marketing materials that your affiliates
                    can use to promote your business.
                  </p>
                  <Link
                    href="/content"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    Start Creating →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 card border-l-4 border-purple-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    👥 Build Your Affiliate Network
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Reach out to quality affiliates who can drive significant
                    traffic to your business.
                  </p>
                  <Link
                    href="/affiliates"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Find Affiliates →
                  </Link>
                </div>

                <div className="p-4 card border-l-4 border-orange-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    📊 Monitor Performance
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Track which campaigns and affiliates are driving the most
                    traffic and conversions.
                  </p>
                  <Link
                    href="/analytics"
                    className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
                  >
                    View Analytics →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Campaign Status Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 card border-l-4 border-green-500">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Active Campaigns
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.activeCampaigns || 0}
              </p>
            </div>

            <div className="p-4 card border-l-4 border-yellow-500">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Draft/Paused
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats?.totalCampaigns
                  ? stats.totalCampaigns - stats.activeCampaigns
                  : 0}
              </p>
            </div>

            <div className="p-4 card border-l-4 border-blue-500">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalCampaigns || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// AFFILIATE MARKETER DASHBOARD
// ============================================================================

function AffiliateMarketerDashboard() {
  // Fetch affiliate marketer stats
  const { data: stats } = useQuery({
    queryKey: ["affiliateMarketerStats"],
    queryFn: async () => {
      try {
        const [campaignsRes, textContentRes] = await Promise.all([
          api.get("/api/campaigns"),
          api.get("/api/content").catch(() => ({ data: [] })),
        ]);

        const campaigns = campaignsRes.data || [];
        const activeCampaigns = campaigns.filter(
          (c: any) => c.status === "active"
        ).length;
        const textContent = textContentRes.data || [];

        // Fetch images for all campaigns (same pattern as Content Library)
        const allImagePromises = campaigns.map((campaign: any) =>
          api
            .get(`/api/images/campaign/${campaign.id}`)
            .then((res) => res.data.images || [])
            .catch(() => [])
        );
        const allImageArrays = await Promise.all(allImagePromises);
        const images = allImageArrays.flat();
        const totalContentPieces = textContent.length + images.length;

        return {
          totalCampaigns: campaigns.length,
          activeCampaigns: activeCampaigns,
          contentPieces: totalContentPieces,
          textContentPieces: textContent.length,
          imageContentPieces: images.length,
          recentCampaigns: campaigns.slice(0, 3),
        };
      } catch (error) {
        return {
          totalCampaigns: 0,
          activeCampaigns: 0,
          contentPieces: 0,
          textContentPieces: 0,
          imageContentPieces: 0,
          recentCampaigns: [],
        };
      }
    },
  });

  return (
    <>
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalCampaigns || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📢</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Active Campaigns
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.activeCampaigns || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Content Pieces
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.contentPieces || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Menu
          </h3>
          {/* Product Library */}
          <Link
            href="/products"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">
                  📦
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Product Library
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Browse products and create campaigns
            </p>
          </Link>

          {/* Campaigns */}
          <Link
            href="/campaigns"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-blue-600 dark:text-blue-400 text-xl">
                  📢
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                Campaigns
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Create and manage marketing campaigns
            </p>
          </Link>

          {/* Content Generation */}
          <Link
            href="/content"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-green-400 dark:hover:border-green-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-green-600 dark:text-green-400 text-xl">
                  ✍️
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                Content
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Generate AI-powered campaign content
            </p>
          </Link>

          {/* Intelligence/RAG */}
          <Link
            href="/intelligence"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                  🧠
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                Intelligence
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Access product intelligence and insights
            </p>
          </Link>

          {/* Analytics */}
          <Link
            href="/analytics"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-orange-400 dark:hover:border-orange-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-orange-600 dark:text-orange-400 text-xl">
                  📈
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                Analytics
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              View campaign performance metrics
            </p>
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-pink-400 dark:hover:border-pink-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-pink-600 dark:text-pink-400 text-xl">
                  💬
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
                Messages
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Chat with affiliates and product creators
            </p>
          </Link>

          {/* Compliance Check */}
          <Link
            href="/compliance"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-red-400 dark:hover:border-red-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-red-600 dark:text-red-400 text-xl">
                  ✓
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                Compliance
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Check content against FTC Compliance rules
            </p>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="group block p-6 rounded-lg transition-all duration-300 card hover:shadow-xl hover:-translate-y-1 hover:border-gray-400 dark:hover:border-gray-500 border-2 border-transparent "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-gray-600 dark:text-gray-400 text-xl">
                  ⚙️
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                Settings
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage your account and preferences
            </p>
          </Link>
        </div>
      </div>

      {/* Quick Actions & Tips */}
      <div className="border-t pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/campaigns"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Create Campaign
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Start a new marketing campaign
              </p>
            </Link>

            <Link
              href="/content"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-400 dark:hover:border-green-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Generate Content
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Create AI-powered marketing content
              </p>
            </Link>

            <Link
              href="/products"
              className="p-4 card hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-500"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  Browse Products
                </h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Find products to promote
              </p>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            {stats?.totalCampaigns === 0 ? "Getting Started" : "Pro Tips"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.totalCampaigns === 0 ? (
              <>
                <div className="p-4 card border-l-4 border-blue-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    📢 Create Your First Campaign
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Start by creating a campaign for a product you want to
                    promote. Browse the Product Library to find great products.
                  </p>
                  <Link
                    href="/campaigns"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Create Campaign →
                  </Link>
                </div>

                <div className="p-4 card border-l-4 border-green-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    ✍️ Generate AI Content
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Use AI to generate high-quality marketing content including
                    emails, articles, social posts, and more.
                  </p>
                  <Link
                    href="/content"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    Start Creating →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 card border-l-4 border-orange-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    📊 Track Your Results
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Monitor your campaign performance in Analytics. Focus on
                    what's working and optimize underperforming campaigns.
                  </p>
                  <Link
                    href="/analytics"
                    className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
                  >
                    View Analytics →
                  </Link>
                </div>

                <div className="p-4 card border-l-4 border-indigo-500">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    🧠 Campiagn Intelligence
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Leverage product intelligence and insights to create more
                    targeted, effective marketing content.
                  </p>
                  <Link
                    href="/intelligence"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Access Intelligence →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
