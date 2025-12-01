"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { Sparkles, Zap, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        email,
        full_name: fullName,
        password,
      });
      toast.success("Account created successfully!");
      r.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-600/30 rounded-full px-6 py-2 mb-6">
              <Sparkles className="text-purple-400" size={20} />
              <span className="text-purple-300 font-semibold">Get Started Today</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-3">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Blitz
              </span>
            </h1>

            <p className="text-xl bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent font-semibold">
              AI-Powered Marketing
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl">
            <form onSubmit={submit}>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold mb-2 text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-2 text-gray-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold mb-2 text-gray-300"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="At least 8 characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-6 py-3.5 font-semibold rounded-xl text-white transition-all duration-300 ${
                    loading
                      ? "opacity-50 cursor-not-allowed bg-gray-700"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus size={18} />
                      Create Account
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-center text-gray-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition"
                >
                  Login →
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2024 Blitz. Simplify marketing, amplify results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
