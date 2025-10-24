import { AuthGate } from "src/components/AuthGate";

export default function SettingsPage() {
  return (
    <AuthGate>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600 mt-2">Coming soon.</p>
      </div>
    </AuthGate>
  );
}
