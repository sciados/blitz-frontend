// (dashboard)/layout.tsx
// Layout for all authenticated pages (dashboard, campaigns, content, etc.)
import Layout from "src/components/Layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
