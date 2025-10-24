"use client";
import { AuthGate } from "src/components/AuthGate";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type Campaign = {
  id: number;
  name: string;
  product_url: string;
  affiliate_network: string;
  status: string;
  created_at: string;
};

export default function CampaignsPage() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => (await api.get<Campaign[]>("/api/campaigns")).data,
  });

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [network, setNetwork] = useState("");

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/api/campaigns", {
        name,
        product_url: productUrl,
        affiliate_network: network,
      });
      toast.success("Campaign created");
      setName("");
      setProductUrl("");
      setNetwork("");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AuthGate>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Campaigns</h1>
        </div>

        <form
          onSubmit={createCampaign}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded p-4"
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Product URL"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Affiliate Network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            required
          />
          <button
            className="bg-black text-white rounded px-4"
            disabled={creating}
          >
            {creating ? "..." : "Create"}
          </button>
        </form>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Network</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">
                      <Link href={`/campaigns/${c.id}`} className="underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="p-2">{c.affiliate_network}</td>
                    <td className="p-2">{c.status}</td>
                    <td className="p-2">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!data?.length && (
                  <tr>
                    <td className="p-2" colSpan={4}>
                      No campaigns yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
