"use client";
import { AuthGate } from "@/components/AuthGate";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => (await api.get(`/api/campaigns/${id}`)).data,
  });

  return (
    <AuthGate>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Campaign #{id}</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </AuthGate>
  );
}
