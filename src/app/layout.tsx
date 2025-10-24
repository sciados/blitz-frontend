import "./globals.css";
import type { Metadata } from "next";
import { QueryProvider } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Blitz",
  description: "AI-Powered SaaS for Affiliate Marketers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Toaster richColors />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
