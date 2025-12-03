"use client";

import { AuthGate } from "src/components/AuthGate";
import { useState, useEffect } from "react";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

interface ConversionStats {
  product_id: number;
  total_conversions: number;
  total_revenue: number;
  total_affiliate_paid: number;
  total_blitz_fee: number;
  total_developer_net: number;
}

interface Product {
  id: number;
  product_name: string;
  thumbnail_image_url?: string;
}

export default function ConversionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      // Get products where current user is the creator
      const response = await api.get("/api/products?my_products=true");
      setProducts(response.data);

      // Auto-select first product if available
      if (response.data.length > 0) {
        setSelectedProductId(response.data[0].id);
        fetchStats(response.data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (productId: number) => {
    try {
      setStatsLoading(true);
      const response = await api.get(`/api/tracking/stats/${productId}`);
      setStats(response.data);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      // Don't show error toast - may just be no conversions yet
      setStats({
        product_id: productId,
        total_conversions: 0,
        total_revenue: 0,
        total_affiliate_paid: 0,
        total_blitz_fee: 0,
        total_developer_net: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
    fetchStats(productId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Conversion Tracking
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track sales and affiliate commissions for your products
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="card rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
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
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No Products Found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Add products to the Product Library to start tracking conversions.
            </p>
          </div>
        ) : (
          <>
            {/* Product Selector */}
            <div className="card rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Select Product
              </label>
              <select
                value={selectedProductId || ""}
                onChange={(e) => handleProductChange(Number(e.target.value))}
                className="w-full md:w-64 px-4 py-2 border rounded-lg"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name || `Product #${product.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats Cards */}
            {statsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Conversions */}
                <div className="card rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Total Conversions
                      </p>
                      <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {stats.total_conversions}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="card rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Total Revenue
                      </p>
                      <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(stats.total_revenue)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Your Net Earnings */}
                <div className="card rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your Net Earnings
                      </p>
                      <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400">
                        {formatCurrency(stats.total_developer_net)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Affiliate Commissions Paid */}
                <div className="card rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Affiliate Commissions
                      </p>
                      <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(stats.total_affiliate_paid)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Revenue Breakdown */}
            {stats && stats.total_revenue > 0 && (
              <div className="card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Revenue Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>Total Sales</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(stats.total_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Affiliate Commissions ({((stats.total_affiliate_paid / stats.total_revenue) * 100).toFixed(0)}%)
                    </span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      - {formatCurrency(stats.total_affiliate_paid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Blitz Platform Fee (5%)
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      - {formatCurrency(stats.total_blitz_fee)}
                    </span>
                  </div>
                  <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Your Net Earnings
                      </span>
                      <span className="font-bold text-xl text-green-600 dark:text-green-400">
                        {formatCurrency(stats.total_developer_net)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for no conversions */}
            {stats && stats.total_conversions === 0 && (
              <div className="card rounded-lg p-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-30"
                  style={{ color: 'var(--text-secondary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Conversions Yet
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Make sure you've added the tracking code to your website.
                  Conversions will appear here once affiliates start driving sales.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Go to Product Library → Your Product → View the "Conversion Tracking Code" section
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGate>
  );
}
