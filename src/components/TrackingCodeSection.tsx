"use client";

import { useState } from "react";
import { toast } from "sonner";

interface TrackingCodeSectionProps {
  productId: number;
}

export function TrackingCodeSection({ productId }: TrackingCodeSectionProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Use the production backend URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blitz-backend-production.up.railway.app";

  const allPagesScript = `<!-- Blitz Tracking - Add to ALL pages -->
<script src="${apiBaseUrl}/api/tracking/blitz.js?product_id=${productId}" async></script>`;

  const conversionScript = `<!-- Blitz Conversion - Add to Order Confirmation page ONLY -->
<script>
  blitz('conversion', {
    orderId: 'YOUR_ORDER_ID',  // Replace with actual order ID
    amount: 0.00,              // Replace with actual order amount
    currency: 'USD'
  });
</script>`;

  const dynamicExample = `<!-- Example with dynamic values (PHP) -->
<script>
  blitz('conversion', {
    orderId: '<?php echo $order_id; ?>',
    amount: <?php echo $order_total; ?>,
    currency: 'USD'
  });
</script>`;

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
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
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Conversion Tracking Code
        </h4>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          Product Owner Only
        </span>
      </div>

      <p
        className="text-sm mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        Add these code snippets to your website to track affiliate conversions and automatically credit affiliates for sales.
      </p>

      {/* Step 1: All Pages Script */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Step 1: Add to ALL pages (in &lt;head&gt; or before &lt;/body&gt;)
          </span>
          <button
            onClick={() => copyToClipboard(allPagesScript, "allPages")}
            className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1"
          >
            {copiedSection === "allPages" ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre
          className="p-3 rounded-lg text-xs overflow-x-auto"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)"
          }}
        >
          {allPagesScript}
        </pre>
      </div>

      {/* Step 2: Conversion Script */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Step 2: Add to Order Confirmation page ONLY
          </span>
          <button
            onClick={() => copyToClipboard(conversionScript, "conversion")}
            className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1"
          >
            {copiedSection === "conversion" ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre
          className="p-3 rounded-lg text-xs overflow-x-auto"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)"
          }}
        >
          {conversionScript}
        </pre>
      </div>

      {/* Dynamic Example */}
      <details className="mb-4">
        <summary
          className="text-sm font-medium cursor-pointer"
          style={{ color: "var(--text-primary)" }}
        >
          Example with dynamic values (PHP)
        </summary>
        <pre
          className="p-3 rounded-lg text-xs overflow-x-auto mt-2"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)"
          }}
        >
          {dynamicExample}
        </pre>
      </details>

      {/* Info Box */}
      <div
        className="p-3 rounded-lg text-xs"
        style={{
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          color: "var(--text-secondary)"
        }}
      >
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>How it works:</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Affiliates share links with <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">?aff=123</code> parameter</li>
              <li>The tracking script saves their affiliate ID in a cookie (60 days)</li>
              <li>When a sale occurs, the conversion script credits the affiliate</li>
              <li>Blitz takes a 5% platform fee, affiliates get their commission, you get the rest</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
