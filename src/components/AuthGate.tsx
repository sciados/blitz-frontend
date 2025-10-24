"use client";
import { getToken } from "src/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const r = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      r.replace("/login");
    } else {
      setOk(true);
    }
  }, [r]);

  if (!ok) return null;
  return <div className="min-h-screen">{children}</div>;
}
