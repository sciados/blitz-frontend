"use client";
import { AuthGate } from "src/components/AuthGate";
import { useState } from "react";
import { api } from "src/lib/appClient";

export default function CompliancePage() {
  const [content, setContent] = useState("");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await api.post("/api/compliance/check", {
      content,
      content_type: "article",
    });
    console.log(data);
  }

  return (
    <AuthGate>
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold">Compliance</h1>
        <form onSubmit={check} className="space-y-3">
          <textarea
            className="w-full border rounded p-3 min-h-[160px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="bg-black text-white rounded px-4">Check</button>
        </form>
      </div>
    </AuthGate>
  );
}
