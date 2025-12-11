"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function TextContentRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const campaignId = searchParams.get("campaign");
    const params = new URLSearchParams();

    if (campaignId) {
      params.set("campaign", campaignId);
    }
    params.set("type", "text");

    router.replace(`/content?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  return (
    <div className="p-6 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p style={{ color: "var(--text-secondary)" }}>Redirecting to Content Studio...</p>
    </div>
  );
}
