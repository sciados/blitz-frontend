import { AuthGate } from "@/components/AuthGate";

export default function DashboardPage() {
  return (
    <AuthGate>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Welcome to Blitz. Use the sidebar to navigate.</p>
      </div>
    </AuthGate>
  );
}
