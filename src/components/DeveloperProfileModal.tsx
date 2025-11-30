"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { X, Package, TrendingUp, Users, MousePointer, Eye } from "lucide-react";

interface Developer {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialty?: string;
  bio?: string;
  years_experience?: number;
  website_url?: string;
  verified: boolean;
  reputation_score: number;
}

interface ProductStats {
  product_id: number;
  product_name: string;
  campaigns: number;
  affiliates: number;
  total_clicks: number;
  unique_clicks: number;
}

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: Developer | null;
  onRequestConnection: (developer: Developer) => void;
  isRequesting: boolean;
  hasPendingRequest: boolean;
}

export function DeveloperProfileModal({
  isOpen,
  onClose,
  developer,
  onRequestConnection,
  isRequesting,
  hasPendingRequest,
}: DeveloperProfileModalProps) {
  // Fetch analytics for this developer's products
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<{
    products: Array<{
      id: number;
      product_name: string;
      product_url: string;
      is_public: boolean;
      created_by_user_id: number;
    }>;
    total_affiliates: number;
    active_campaigns: number;
    total_clicks: number;
    unique_visitors: number;
    product_performance: ProductStats[];
  }>({
    queryKey: ["developerAnalytics", developer?.user_id],
    queryFn: async () => {
      if (!developer) return null;
      const response = await api.get(`/api/analytics/developer/${developer.user_id}`);
      return response.data;
    },
    enabled: !!developer && isOpen,
  });

  if (!isOpen || !developer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                {developer.full_name?.charAt(0) || "D"}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{developer.full_name}</h2>
                  {developer.verified && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">
                    Creator
                  </span>
                </div>
                <p className="text-purple-100 mt-1">{developer.email}</p>
                {developer.specialty && (
                  <p className="text-purple-200 text-sm mt-1">{developer.specialty}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Reputation Score */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${developer.reputation_score}%` }}
              />
            </div>
            <span className="text-sm font-medium">{developer.reputation_score}% Reputation</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Bio */}
          {developer.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{developer.bio}</p>
            </div>
          )}

          {/* Quick Stats */}
          {analyticsData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Affiliates</span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {analyticsData.total_affiliates}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">Active Campaigns</span>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {analyticsData.active_campaigns}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                  <MousePointer className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Clicks</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {analyticsData.total_clicks.toLocaleString()}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Unique Visitors</span>
                </div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {analyticsData.unique_visitors.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Products & Performance
            </h3>

            {analyticsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading product analytics...</p>
              </div>
            ) : analyticsData?.product_performance && analyticsData.product_performance.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.product_performance.map((product) => (
                  <div
                    key={product.product_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {product.product_name}
                        </h4>
                      </div>
                      <a
                        href={`/intelligence?productId=${product.product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Campaigns</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {product.campaigns}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Affiliates</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {product.affiliates}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Clicks</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {product.total_clicks.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unique</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {product.unique_clicks.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No product analytics available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {developer.years_experience && (
                <span>
                  {developer.years_experience === 1 ? "1 year" : `${developer.years_experience} years`} experience
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onRequestConnection(developer)}
                disabled={isRequesting || hasPendingRequest}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {hasPendingRequest ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request Pending
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Request to Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
