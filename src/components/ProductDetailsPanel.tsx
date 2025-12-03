"use client";

import { useState, useEffect } from "react";
import { api } from "src/lib/appClient";
import { ProductDetails, ComplianceResult } from "src/lib/types";
import { useRouter } from "next/navigation";
import { getRoleFromToken } from "src/lib/auth";
import { toast } from "sonner";
import { TrackingCodeSection } from "./TrackingCodeSection";

interface ProductDetailsPanelProps {
  productId: number;
  onClose: () => void;
  onComplianceCheck?: () => void;
}

export function ProductDetailsPanel({
  productId,
  onClose,
  onComplianceCheck,
}: ProductDetailsPanelProps) {
  const router = useRouter();
  const isAdmin = getRoleFromToken() === "admin";
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<
    string | null
  >(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Partial<ProductDetails>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceResult | null>(null);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);

  useEffect(() => {
    // Fetch current user info to get user ID
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/api/auth/me");
        setCurrentUserId(response.data.id);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // Update countdown every minute
  useEffect(() => {
    if (!product?.launch_date) return;

    const interval = setInterval(() => {
      // Force re-render by updating a state variable
      // This will recalculate the countdown
      setProduct({ ...product });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [product?.launch_date]);

  // Auto-hide countdown banner after 15 seconds
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    if (!product?.launch_date) return;

    // Check if countdown info exists (within 30 days)
    const countdownInfo = getCountdownInfo();
    if (!countdownInfo) return;

    const timer = setTimeout(() => {
      setShowCountdown(false);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [product?.launch_date]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/products/${productId}`);
      setProduct(response.data);

      // Initialize compliance result from product data if available
      if (response.data.compliance) {
        setComplianceResult(response.data.compliance);
      }

      // Check if description exists, if not, generate one
      if (!response.data.product_description && !isGeneratingDesc) {
        generateDescription(response.data.id);
      }
    } catch (err: any) {
      console.error("Failed to fetch product details:", err);
      setError("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async (prodId: number) => {
    setIsGeneratingDesc(true);
    try {
      const response = await api.post(
        `/api/products/${prodId}/generate-description`
      );
      const generatedDesc = response.data.description;

      // Save the generated description to the backend
      const saveResponse = await api.patch(`/api/products/${prodId}`, {
        product_description: generatedDesc,
      });

      // Update the product object with the generated description
      setGeneratedDescription(generatedDesc);
      setProduct(saveResponse.data);
    } catch (err) {
      console.error("Failed to generate description:", err);
      // Silent fail - will show "No description available"
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleCreateCampaign = () => {
    if (product) {
      // Navigate to campaigns page with this product pre-selected
      router.push(`/campaigns?productId=${product.id}`);
    }
  };

  const handleTogglePublic = async () => {
    if (!product) return;

    setIsTogglingPublic(true);
    try {
      // Convert to boolean properly (handle both string and boolean values)
      const currentStatus = String((product as any).is_public) === "true";
      const newPublicStatus = !currentStatus;

      const response = await api.patch(`/api/products/${product.id}`, {
        is_public: newPublicStatus,
      });
      setProduct(response.data);
      toast.success(
        `Product ${newPublicStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err: any) {
      console.error("Failed to toggle product visibility:", err);
      toast.error(
        err.response?.data?.detail || "Failed to update product visibility"
      );
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleEdit = () => {
    if (product) {
      setEditedProduct({
        product_name: product.product_name || "",
        product_category: product.product_category || "",
        affiliate_network: product.affiliate_network || "",
        commission_rate: product.commission_rate || "",
        affiliate_link_url: product.affiliate_link_url || "",
        product_description: product.product_description || "",
        is_recurring: product.is_recurring || false,
        launch_date: product.launch_date || "",
      });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedProduct({});
  };

  const handleSaveEdit = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const response = await api.patch(
        `/api/products/${product.id}`,
        editedProduct
      );
      setProduct(response.data);
      // Clear generated description since we got it from API
      setGeneratedDescription(null);
      setIsEditMode(false);
      setEditedProduct({});
      toast.success("Product updated successfully");
    } catch (err: any) {
      console.error("Failed to update product:", err);
      toast.error(err.response?.data?.detail || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecompileIntelligence = async () => {
    if (!product) return;

    setIsRecompiling(true);
    toast.info(
      "Starting intelligence recompilation... This may take 30-60 seconds."
    );

    try {
      const response = await api.post(
        `/api/admin/products/${product.id}/compile`
      );

      // Refresh product details to get updated intelligence
      await fetchProductDetails();

      toast.success(
        "Intelligence recompiled successfully! All data has been refreshed."
      );
    } catch (err: any) {
      console.error("Failed to recompile intelligence:", err);
      toast.error(
        err.response?.data?.detail || "Failed to recompile intelligence"
      );
    } finally {
      setIsRecompiling(false);
    }
  };

  const handleCheckCompliance = async () => {
    if (!product) return;

    setIsCheckingCompliance(true);
    toast.info("Checking product compliance...");

    try {
      const response = await api.post(
        `/api/products/${product.id}/check-compliance`
      );
      setComplianceResult(response.data);

      if (response.data.status === "compliant") {
        toast.success(
          `Compliance check complete! Score: ${response.data.score}/100`
        );
      } else if (response.data.status === "warning") {
        toast.warning(
          `Compliance needs review. Score: ${response.data.score}/100`
        );
      } else {
        toast.error(
          `Non-compliant content detected. Score: ${response.data.score}/100`
        );
      }

      // Refresh product list to show updated compliance badges
      if (onComplianceCheck) {
        onComplianceCheck();
      }
    } catch (err: any) {
      console.error("Failed to check compliance:", err);
      toast.error(err.response?.data?.detail || "Failed to check compliance");
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card rounded-lg p-8 max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Use product description from database, generated description, or show status message
  const productDescription =
    product.product_description ||
    generatedDescription ||
    (isGeneratingDesc ? "Generating description..." : "");

  // Normalize is_public value to boolean (handles both string and boolean from API)
  const isProductPublic = String((product as any).is_public) === "true";

  // Check if current user is the product owner
  const isProductOwner = currentUserId && product.created_by_user_id === currentUserId;

  // Show publish toggle for Admins or Product Owners
  const canTogglePublish = isAdmin || isProductOwner;

  // Calculate countdown to launch date
  const getCountdownInfo = () => {
    if (!product.launch_date) return null;

    const launchDate = new Date(product.launch_date);
    const now = new Date();
    const diff = launchDate.getTime() - now.getTime();

    if (diff <= 0) {
      return {
        status: "launched",
        text: `Launched on ${launchDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Only show countdown if launch is within 30 days
    if (days > 30) {
      return null;
    }

    return {
      status: "upcoming",
      text: `Launches in ${days} Days, ${hours} Hours, ${minutes} Minutes`,
      days,
      hours,
      minutes
    };
  };

  const countdownInfo = getCountdownInfo();

  return (
    <div className="h-full flex flex-col animate-slide-in">
      {/* Countdown Banner - Show if launch date exists, within 30 days, and auto-hide hasn't been triggered */}
      {countdownInfo && showCountdown && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 relative ${
            countdownInfo.status === "upcoming"
              ? "bg-gradient-to-r from-orange-500 to-red-600 border-orange-600 animate-pulse"
              : "bg-gradient-to-r from-green-600 to-teal-600 border-green-600"
          }`}
        >
          <button
            onClick={() => setShowCountdown(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
            aria-label="Dismiss countdown"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="text-center pr-8">
            <div className="text-white text-2xl font-bold mb-1">
              {countdownInfo.text}
            </div>
            {countdownInfo.status === "upcoming" && (
              <div className="text-orange-100 text-sm">
                Don't miss out - prepare your campaigns now!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--hover-bg)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Product Details
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          {isEditMode ? (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center space-x-2 font-medium disabled:opacity-50"
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
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center space-x-2 font-medium disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Publish Toggle - For Admins and Product Owners */}
              {canTogglePublish && product && (
                <button
                  onClick={handleTogglePublic}
                  disabled={isTogglingPublic}
                  className={`px-6 py-3 font-medium rounded-lg transition flex items-center space-x-2 ${
                    isProductPublic
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                  title={
                    isProductPublic
                      ? "Click to deactivate (hide from affiliates)"
                      : "Click to activate/publish (make visible to affiliates)"
                  }
                >
                  {isTogglingPublic ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : isProductPublic ? (
                    <>
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Active</span>
                    </>
                  ) : (
                    <>
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
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Inactive</span>
                    </>
                  )}
                </button>
              )}

              {/* Show edit controls for admins OR product owners */}
              {(isAdmin ||
                (currentUserId &&
                  product &&
                  product.created_by_user_id === currentUserId)) && (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2 font-medium"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Product</span>
                  </button>

                  {/* Show different buttons based on whether intelligence exists */}
                  {product.intelligence_data &&
                  Object.keys(product.intelligence_data).length > 0 ? (
                    // Intelligence EXISTS - Show "Refresh Intelligence" button
                    <button
                      onClick={handleRecompileIntelligence}
                      disabled={isRecompiling}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center space-x-2 font-medium"
                      title="Recompile all intelligence data including RAG research"
                    >
                      {isRecompiling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Recompiling...</span>
                        </>
                      ) : (
                        <>
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Refresh Intelligence</span>
                        </>
                      )}
                    </button>
                  ) : (
                    // Intelligence DOES NOT EXIST - Show "Compile Intelligence" button
                    <button
                      onClick={handleRecompileIntelligence}
                      disabled={isRecompiling}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center space-x-2 font-medium shadow-lg"
                      title="Generate intelligence data for this product including RAG research"
                    >
                      {isRecompiling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Compiling...</span>
                        </>
                      ) : (
                        <>
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
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>Compile Intelligence</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Check Compliance Button */}
                  <button
                    onClick={handleCheckCompliance}
                    disabled={isCheckingCompliance}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center space-x-2 font-medium"
                    title="Check product description for FTC compliance"
                  >
                    {isCheckingCompliance ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>Check Compliance</span>
                      </>
                    )}
                  </button>
                </>
              )}
              {product.affiliate_link_url && (
                <a
                  href={product.affiliate_link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2 font-medium"
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>Get Affiliate Link</span>
                </a>
              )}
              <button
                onClick={handleCreateCampaign}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center space-x-2 font-medium"
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
            </>
          )}
        </div>
      </div>

      {/* Content - Multi-column layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Product Overview */}
          <div className="space-y-6">
            {/* Product Image */}
            {product.thumbnail_image_url ? (
              <div className="card rounded-lg overflow-hidden">
                <img
                  src={product.thumbnail_image_url}
                  alt={product.product_name || "Product"}
                  className="w-full h-64 object-contain"
                />
              </div>
            ) : (
              <div className="card rounded-lg h-64 flex items-center justify-center">
                <svg
                  className="w-24 h-24 opacity-30"
                  style={{ color: "var(--text-secondary)" }}
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

            {/* Product Name & Target Audience */}
            <div className="card rounded-lg p-6">
              {isEditMode ? (
                <div className="mb-4">
                  <label
                    className="text-xs font-medium mb-2 block"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editedProduct.product_name || ""}
                    onChange={(e) =>
                      setEditedProduct({
                        ...editedProduct,
                        product_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xl font-bold rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
                    style={{ color: "var(--text-primary)" }}
                    placeholder="Product Name"
                  />
                </div>
              ) : (
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.product_name || "Unknown Product"}
                </h3>
              )}

              {/* Target Audience */}
              {product.intelligence_data?.market?.target_audience ? (
                <div>
                  <div
                    className="text-sm font-semibold mb-2 flex items-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Target Audience
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {typeof product.intelligence_data.market.target_audience ===
                    "string" ? (
                      <p>{product.intelligence_data.market.target_audience}</p>
                    ) : typeof product.intelligence_data.market
                        .target_audience === "object" ? (
                      <div className="space-y-1">
                        {Object.entries(
                          product.intelligence_data.market.target_audience
                        ).map(([key, value]) => (
                          <div key={key} className="flex items-start">
                            <span className="font-medium capitalize mr-2">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span>
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>
                        {String(
                          product.intelligence_data.market.target_audience
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Target audience information not available
                </p>
              )}
            </div>

            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 rounded-lg">
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Category
                </div>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProduct.product_category || ""}
                    onChange={(e) =>
                      setEditedProduct({
                        ...editedProduct,
                        product_category: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 font-semibold text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)]"
                    style={{ color: "var(--text-primary)" }}
                    placeholder="Category"
                  />
                ) : (
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.product_category || "Uncategorized"}
                  </div>
                )}
              </div>

              <div className="card p-4 rounded-lg">
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Affiliate Network
                </div>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProduct.affiliate_network || ""}
                    onChange={(e) =>
                      setEditedProduct({
                        ...editedProduct,
                        affiliate_network: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 font-semibold text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)]"
                    style={{ color: "var(--text-primary)" }}
                    placeholder="Affiliate Network"
                  />
                ) : (
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.affiliate_network || "Unknown"}
                  </div>
                )}
              </div>

              <div className="card p-4 rounded-lg">
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Commission Rate
                </div>
                {isEditMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedProduct.commission_rate || ""}
                      onChange={(e) =>
                        setEditedProduct({
                          ...editedProduct,
                          commission_rate: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 font-semibold text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)]"
                      style={{ color: "var(--text-primary)" }}
                      placeholder="e.g. 50% or $37/sale"
                    />
                    {/* Recurring Commission Toggle */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedProduct.is_recurring || false}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            is_recurring: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 bg-[var(--bg-primary)] border-[var(--border-color)] rounded focus:ring-purple-500"
                      />
                      <span
                        className="ml-2 text-xs font-medium flex items-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <svg
                          className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Recurring Commission
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="font-semibold text-sm text-green-600 dark:text-green-400 flex items-center">
                    {product.commission_rate || "Not specified"}
                    {product.is_recurring && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        <svg
                          className="w-3 h-3 mr-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Recurring
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="card p-4 rounded-lg">
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Times Used
                </div>
                <div
                  className="font-semibold text-sm flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {product.times_used} campaigns
                </div>
              </div>
            </div>

            {/* Affiliate Link - Edit Mode Only (view mode button is in header) */}
            {isEditMode && (
              <div className="card rounded-lg p-6">
                <div
                  className="text-sm font-medium mb-2 flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Affiliate Signup URL
                </div>
                <input
                  type="url"
                  value={editedProduct.affiliate_link_url || ""}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      affiliate_link_url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
                  style={{ color: "var(--text-primary)" }}
                  placeholder="https://example.com/affiliate-signup"
                />
              </div>
            )}

            {/* Launch Date - Edit Mode */}
            {isEditMode && (
              <div className="card rounded-lg p-6">
                <div
                  className="text-sm font-medium mb-2 flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Launch Date
                </div>
                <input
                  type="date"
                  value={
                    editedProduct.launch_date
                      ? new Date(editedProduct.launch_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      launch_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
                  style={{ color: "var(--text-primary)" }}
                />
                <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  Affiliates will see when this product is launching or was launched
                </p>
              </div>
            )}

            {/* Product URL */}
            <div className="card rounded-lg p-6">
              <div
                className="text-sm font-medium mb-2 flex items-center"
                style={{ color: "var(--text-primary)" }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Sales Page URL
              </div>
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
              >
                {product.product_url}
              </a>
            </div>

            {/* Launch Date */}
            {product.launch_date && (
              <div className="card rounded-lg p-6">
                <div
                  className="text-sm font-medium mb-2 flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Launch Date
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {new Date(product.launch_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div
              className="card rounded-lg p-4 text-xs space-y-1"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              <div className="flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Intelligence compiled:{" "}
                {new Date(product.compiled_at).toLocaleString()}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Version: {product.compilation_version}
              </div>
            </div>
          </div>

          {/* Right Column - Product Description & Intelligence Data */}
          <div className="space-y-6">
            {/* Product Description */}
            <div className="card rounded-lg p-6">
              <div
                className="text-lg font-semibold mb-3 flex items-center"
                style={{ color: "var(--text-primary)" }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                Product Description
              </div>
              {isEditMode ? (
                <textarea
                  value={editedProduct.product_description || ""}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      product_description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] min-h-[100px]"
                  style={{ color: "var(--text-primary)" }}
                  placeholder="Enter product description..."
                  rows={4}
                />
              ) : productDescription ? (
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {productDescription}
                </p>
              ) : (
                <p
                  className="text-sm italic"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No description available. Click "Edit Product" to add one.
                </p>
              )}
            </div>

            {/* Compliance Results */}
            {complianceResult && (
              <div className="card rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className="text-lg font-semibold flex items-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Compliance Check
                  </h4>
                  <button
                    onClick={() => setComplianceResult(null)}
                    className="p-1 rounded hover:bg-[var(--hover-bg)]"
                    style={{ color: "var(--text-secondary)" }}
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

                {/* Score Display */}
                <div className="mb-4 text-center">
                  <div
                    className={`text-5xl font-bold mb-2 ${
                      complianceResult.score >= 90
                        ? "text-green-600 dark:text-green-400"
                        : complianceResult.score >= 70
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {complianceResult.score}
                  </div>
                  <div
                    className="text-sm mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    out of 100
                  </div>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
                      complianceResult.status === "compliant"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                        : complianceResult.status === "warning"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                    }`}
                  >
                    {complianceResult.status === "compliant" && "✓ Compliant"}
                    {complianceResult.status === "warning" &&
                      "⚠ Warning"}
                    {complianceResult.status === "violation" &&
                      "✗ Violation"}
                  </div>
                </div>

                {/* Issues List */}
                {complianceResult.issues &&
                  complianceResult.issues.length > 0 && (
                    <div className="mb-4">
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Issues Found ({complianceResult.issues.length})
                      </div>
                      <div className="space-y-2">
                        {complianceResult.issues.map((issue, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border text-xs ${
                              issue.severity === "critical"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700"
                                : issue.severity === "high"
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700"
                            }`}
                          >
                            <div className="flex items-start">
                              <span className="mr-2">
                                {issue.severity === "critical"
                                  ? "🔴"
                                  : issue.severity === "high"
                                  ? "🟠"
                                  : "🟡"}
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold uppercase mb-1">
                                  {issue.severity}
                                </div>
                                <div className="mb-1">{issue.message}</div>
                                {issue.suggestion && (
                                  <div className="mt-1 opacity-90">
                                    <strong>Fix:</strong> {issue.suggestion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Summary */}
                {complianceResult.summary && (
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {complianceResult.summary}
                  </div>
                )}
              </div>
            )}

            {product.intelligence_data ? (
              <>
                <div className="card rounded-lg p-6">
                  <h4
                    className="text-xl font-semibold mb-4 flex items-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Product Intelligence
                  </h4>

                  {/* Product Features */}
                  {product.intelligence_data.product?.features &&
                    Array.isArray(product.intelligence_data.product.features) &&
                    product.intelligence_data.product.features.length > 0 && (
                      <div className="mb-6">
                        <div
                          className="text-sm font-semibold mb-3 flex items-center"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Key Features
                        </div>
                        <ul
                          className="space-y-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {product.intelligence_data.product.features.map(
                            (feature: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start text-sm"
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
                                <span>{feature}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Product Benefits */}
                  {product.intelligence_data.product?.benefits &&
                    Array.isArray(product.intelligence_data.product.benefits) &&
                    product.intelligence_data.product.benefits.length > 0 && (
                      <div className="mb-6">
                        <div
                          className="text-sm font-semibold mb-3 flex items-center"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                            />
                          </svg>
                          Key Benefits
                        </div>
                        <ul
                          className="space-y-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {product.intelligence_data.product.benefits.map(
                            (benefit: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start text-sm"
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></span>
                                <span>{benefit}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Pain Points */}
                {product.intelligence_data.market?.pain_points &&
                  Array.isArray(product.intelligence_data.market.pain_points) &&
                  product.intelligence_data.market.pain_points.length > 0 && (
                    <div className="card rounded-lg p-6">
                      <div
                        className="text-sm font-semibold mb-3 flex items-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Customer Pain Points
                      </div>
                      <ul
                        className="space-y-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {product.intelligence_data.market.pain_points.map(
                          (pain: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start text-sm"
                            >
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 mr-2 flex-shrink-0"></span>
                              <span>{pain}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <div className="card rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-30"
                  style={{ color: "var(--text-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p style={{ color: "var(--text-secondary)" }}>
                  No intelligence data available for this product yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Tracking Section - Full Width, Only for Product Owners */}
        {isProductOwner && (
          <div className="mt-6">
            <div className="card rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h4
                  className="text-xl font-semibold flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-6 h-6 mr-2"
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
                  Conversion Tracking Setup
                </h4>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  Essential for Affiliate Attribution
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Tracking Code Snippets */}
                <div>
                  <TrackingCodeSection productId={product.id} />
                </div>

                {/* Right Column - Detailed Instructions */}
                <div className="space-y-6">
                  {/* Why Use This Section */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.05)",
                      borderColor: "rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-3 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h5
                          className="font-semibold mb-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Why You Need This
                        </h5>
                        <ul
                          className="text-sm space-y-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <li>• Track which affiliates drive actual sales</li>
                          <li>• Automatically calculate affiliate commissions</li>
                          <li>• Get credit for the entire sales funnel (main + upsells)</li>
                          <li>• 60-day cookie attribution window</li>
                          <li>• Session-based tracking for complete customer journey</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* How to Implement - Step by Step */}
                  <div>
                    <h5
                      className="font-semibold mb-3 flex items-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Implementation Steps
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          1
                        </span>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Add Script to ALL Pages
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Copy Step 1 code to your website's &lt;head&gt; section or before &lt;/body&gt; on
                            every page (sales page, upsells, thank you pages).
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          2
                        </span>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Add Conversion Code to Order Page
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Copy Step 2 code and add it ONLY to your order confirmation/thank you page.
                            Replace YOUR_ORDER_ID and 0.00 with actual values.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          3
                        </span>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Track Upsells & Downsells
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Use the "Tracking Upsells & Downsells" example for additional offers.
                            Set parentOrderId to link upsells to the main order.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          4
                        </span>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Test & Monitor
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Test by visiting your site with ?aff=123, then making a purchase.
                            Check the Conversions page to verify tracking works.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: "rgba(251, 191, 36, 0.05)",
                      borderColor: "rgba(251, 191, 36, 0.2)",
                    }}
                  >
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-3 mt-0.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <h5
                          className="font-semibold mb-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Important Notes
                        </h5>
                        <ul
                          className="text-sm space-y-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <li>• The tracking script is invisible to customers</li>
                          <li>• Session-based tracking = affiliates get credit for entire funnel</li>
                          <li>• Cookie lasts 60 days for follow-up purchases</li>
                          <li>• Revenue split: Affiliate % + 5% Blitz + Your Net</li>
                          <li>• Missing tracking = lost affiliate commissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Where to Find Help */}
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        style={{ color: "var(--text-primary)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Need more help?
                      </span>
                    </div>
                    <a
                      href="/tracking-code"
                      target="_blank"
                      className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                      View Detailed Guide
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
