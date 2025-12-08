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

  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  // Auto-select campaign from URL parameter
  useEffect(() => {
    if (urlCampaignId) {
      setSelectedCampaign(urlCampaignId);
    }
  }, [urlCampaignId]);
