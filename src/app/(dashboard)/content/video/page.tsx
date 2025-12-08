"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { AuthGate } from "src/components/AuthGate";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  product_url: string;
  affiliate_network: string;
}

export default function VideoGenerationPage() {
  const searchParams = useSearchParams();
  const urlCampaignId = searchParams.get("campaign");
  const urlScript = searchParams.get("script");

  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  // Auto-select campaign from URL parameter
  useEffect(() => {
    if (urlCampaignId) {
      setSelectedCampaign(urlCampaignId);
    }
  }, [urlCampaignId]);

  // TODO: Implement full video generation UI
  // This is a temporary implementation to prevent build errors

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Video Generation</h1>
        <div className="card rounded-lg p-8 text-center">
          <p className="text-lg mb-4">Video generation coming soon!</p>
          <Link href="/content" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Back to Content Hub
          </Link>
        </div>
      </div>
    </AuthGate>
  );
}
