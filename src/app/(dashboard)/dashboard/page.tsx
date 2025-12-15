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
  affiliate_tier?: string | null;
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
        const [campaignsRes, textContentRes, videosRes] = await Promise.all([
          api.get("/api/campaigns"),
          api.get("/api/content").catch((err) => {
            console.error(
              "Failed to fetch text content:",
              err.response?.status,
              err.response?.data || err.message
            );
            return { data: [] };
          }),
          api.get("/api/video/library").catch(() => ({ data: { videos: [] } })),
        ]);

        const campaigns = campaignsRes.data || [];
        const activeCampaigns = campaigns.filter(
          (c: any) => c.status === "active"
        ).length;
        const textContent = textContentRes.data || [];
        const videos = videosRes.data?.videos || [];

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
          videoContentPieces: videos.length,
          recentCampaigns: campaigns.slice(0, 3),
        };
      } catch (error) {
        return {
          totalCampaigns: 0,
          activeCampaigns: 0,
          contentPieces: 0,
          textContentPieces: 0,
          imageContentPieces: 0,
          videoContentPieces: 0,
          recentCampaigns: [],
        };
      }
    },
  });

  return (
    <>
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                Text Content
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.textContentPieces || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Images
              </p>
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {stats?.imageContentPieces || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Videos
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats?.videoContentPieces || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎬</span>
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
// Marketer DASHBOARD
// ============================================================================

function AffiliateMarketerDashboard() {
  // Fetch user info to get affiliate tier
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => (await api.get("/api/auth/me")).data,
  });

  // Fetch usage and limits for dashboard display
  const { data: usageLimits } = useQuery({
    queryKey: ["usageLimits"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/auth/usage");
        return res.data;
      } catch {
        return null;
      }
    },
  });

  // Fetch Marketer stats
  const { data: stats } = useQuery({
    queryKey: ["affiliateMarketerStats"],
    queryFn: async () => {
      try {
        const [campaignsRes, textContentRes, videosRes] = await Promise.all([
          api.get("/api/campaigns"),
          api.get("/api/content").catch((err) => {
            console.error(
              "Failed to fetch text content:",
              err.response?.status,
              err.response?.data || err.message
            );
            return { data: [] };
          }),
          api.get("/api/video/library").catch(() => ({ data: { videos: [] } })),
        ]);

        const campaigns = campaignsRes.data || [];
        const activeCampaigns = campaigns.filter(
          (c: any) => c.status === "active"
        ).length;
        const textContent = textContentRes.data || [];
        const videos = videosRes.data?.videos || [];

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
          videoContentPieces: videos.length,
          recentCampaigns: campaigns.slice(0, 3),
        };
      } catch (error) {
        return {
          totalCampaigns: 0,
          activeCampaigns: 0,
          contentPieces: 0,
          textContentPieces: 0,
          imageContentPieces: 0,
          videoContentPieces: 0,
          recentCampaigns: [],
        };
      }
    },
  });

  // Helper to format usage display
  const formatUsage = (used: number, limit: number | null) => {
    if (limit === null || limit === undefined) return `${used}`;
    return `${used}/${limit}`;
  };

  // Helper to get progress percentage
  const getProgress = (used: number, limit: number | null) => {
    if (limit === null || limit === undefined || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // Helper to get color based on usage percentage
  const getUsageColor = (used: number, limit: number | null) => {
    const progress = getProgress(used, limit);
    if (progress >= 90) return "text-red-600 dark:text-red-400";
    if (progress >= 70) return "text-orange-600 dark:text-orange-400";
    return "";
  };

  return (
    <>
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Campaigns
              </p>
              <p className={`text-3xl font-bold text-blue-600 dark:text-blue-400 ${getUsageColor(stats?.totalCampaigns || 0, usageLimits?.limits?.campaigns)}`}>
                {formatUsage(stats?.totalCampaigns || 0, usageLimits?.limits?.campaigns)}
              </p>
              {usageLimits?.limits?.campaigns && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${getProgress(stats?.totalCampaigns || 0, usageLimits?.limits?.campaigns)}%` }}
                  />
                </div>
              )}
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
                Text Content
              </p>
              <p className={`text-3xl font-bold text-purple-600 dark:text-purple-400 ${getUsageColor(usageLimits?.usage?.text_content || 0, usageLimits?.limits?.text_content)}`}>
                {formatUsage(usageLimits?.usage?.text_content || stats?.textContentPieces || 0, usageLimits?.limits?.text_content)}
              </p>
              {usageLimits?.limits?.text_content && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${getProgress(usageLimits?.usage?.text_content || 0, usageLimits?.limits?.text_content)}%` }}
                  />
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Images
              </p>
              <p className={`text-3xl font-bold text-pink-600 dark:text-pink-400 ${getUsageColor(usageLimits?.usage?.images || 0, usageLimits?.limits?.images)}`}>
                {formatUsage(usageLimits?.usage?.images || stats?.imageContentPieces || 0, usageLimits?.limits?.images)}
              </p>
              {usageLimits?.limits?.images && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-pink-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${getProgress(usageLimits?.usage?.images || 0, usageLimits?.limits?.images)}%` }}
                  />
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Videos
              </p>
              <p className={`text-3xl font-bold text-red-600 dark:text-red-400 ${getUsageColor(usageLimits?.usage?.videos || 0, usageLimits?.limits?.videos)}`}>
                {formatUsage(usageLimits?.usage?.videos || stats?.videoContentPieces || 0, usageLimits?.limits?.videos)}
              </p>
              {usageLimits?.limits?.videos && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${getProgress(usageLimits?.usage?.videos || 0, usageLimits?.limits?.videos)}%` }}
                  />
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 space-y-6">
        <GettingStartedJourney />
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

// ============================================================================
// GETTING STARTED JOURNEY COMPONENT
// ============================================================================

function GettingStartedJourney() {
  // Fetch user progress data
  const { data: campaignsData } = useQuery({
    queryKey: ["campaigns-count"],
    queryFn: async () => {
      const response = await api.get("/api/campaigns");
      return { campaigns: response.data || [] };
    },
  });

  const { data: contentData } = useQuery({
    queryKey: ["content-count"],
    queryFn: async () => {
      const response = await api
        .get("/api/content")
        .catch(() => ({ data: [] }));
      return { contents: response.data || [] };
    },
  });

  const campaigns = campaignsData?.campaigns || [];
  const contents = contentData?.contents || [];

  const steps = [
    {
      id: 1,
      title: "Browse Products",
      description: "Explore products, get links & create campaigns",
      icon: "📦",
      href: "/products" as const,
      color: "purple",
      disabled: false,
      active: true,
      requirement: null,
    },
    {
      id: 2,
      title: "Generate Content",
      description: "Create AI-powered marketing content",
      icon: "✍️",
      href: "/content" as const,
      color: "indigo",
      disabled: campaigns.length === 0,
      active: campaigns.length > 0,
      requirement: `${campaigns.length} campaign${
        campaigns.length !== 1 ? "s" : ""
      } created`,
    },
    {
      id: 3,
      title: "Publish Content",
      description: "Connect your social media accounts (Coming Soon)",
      icon: "🔗",
      href: "#" as const,
      color: "orange",
      disabled: true,
      active: false,
      requirement: null,
    },
    {
      id: 4,
      title: "Track Success",
      description: "Monitor performance and optimize",
      icon: "📈",
      href: "/analytics" as const,
      color: "pink",
      disabled: contents.length === 0,
      active: contents.length > 0,
      requirement: `${contents.length} content piece${
        contents.length !== 1 ? "s" : ""
      } generated`,
    },
  ];

  const colorMap = {
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-300 dark:border-purple-700",
      hover: "hover:border-purple-500 dark:hover:border-purple-400",
      line: "bg-purple-300 dark:bg-purple-700",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-700",
      hover: "hover:border-blue-500 dark:hover:border-blue-400",
      line: "bg-blue-300 dark:bg-blue-700",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-300 dark:border-green-700",
      hover: "hover:border-green-500 dark:hover:border-green-400",
      line: "bg-green-300 dark:bg-green-700",
    },
    indigo: {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-300 dark:border-indigo-700",
      hover: "hover:border-indigo-500 dark:hover:border-indigo-400",
      line: "bg-indigo-300 dark:bg-indigo-700",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-300 dark:border-orange-700",
      hover: "hover:border-orange-500 dark:hover:border-orange-400",
      line: "bg-orange-300 dark:bg-orange-700",
    },
    pink: {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400",
      border: "border-pink-300 dark:border-pink-700",
      hover: "hover:border-pink-500 dark:hover:border-pink-400",
      line: "bg-pink-300 dark:bg-pink-700",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          🚀 Getting Started - Your Journey to Success
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Follow these 4 Steps to create and launch your first successful
          campaign
        </p>

        {/* Journey Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div />{" "}
          {/* className="absolute top-8 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-700 z-0 hidden md:block" */}
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, index) => {
              const colors = colorMap[step.color as keyof typeof colorMap];
              const isLast = index === steps.length - 1;
              const isMiddle = index === 2;

              return step.disabled ? (
                <div key={step.id} className="group block">
                  <div
                    className={`card p-6 transition-all duration-300 border-2 ${colors.border} opacity-60 cursor-not-allowed`}
                  >
                    {/* Step Number & Icon */}
                    <div className="flex items-start space-x-4">
                      {/* Step Circle */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center border-4 ${colors.border} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text}`}
                          >
                            Step {step.id}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--text-primary)]">
                          {step.title}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          {step.description}
                        </p>
                        {step.requirement && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            🔒 Complete Step {step.id - 1} first:{" "}
                            {step.requirement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={step.id} href={step.href} className="group block">
                  <div
                    className={`card p-6 transition-all duration-300 border-2 ${colors.border} ${colors.hover} hover:shadow-xl hover:-translate-y-1`}
                  >
                    {/* Step Number & Icon */}
                    <div className="flex items-start space-x-4">
                      {/* Step Circle */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center border-4 ${colors.border} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                        {step.active && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text}`}
                          >
                            Step {step.id}
                          </span>
                          {step.active && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              ✓ Active
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--text-primary)]">
                          {step.title}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Arrow for desktop */}
                    {!isLast && !isMiddle && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                        <div className="w-6 h-6 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Arrow down for middle row */}
                    {isMiddle && (
                      <div className="hidden lg:block absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="w-6 h-6 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-4 p-6 card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Ready to Start Your Journey? 🎯
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Begin with Step 1 - Browse products, get your affiliate link &
                create campaigns
              </p>
            </div>
            <Link
              href="/products"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2 whitespace-nowrap"
            >
              <span>Start Now</span>
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
