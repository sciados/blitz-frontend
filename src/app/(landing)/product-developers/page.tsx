"use client";

import {
  Zap,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { EmailSignupForm } from "src/components/EmailSignupForm";

export default function ProductDevelopersPage() {
  const features = [
    {
      emoji: "🚀",
      title: "Instant Product Intelligence",
      description:
        "Just paste your sales page URL. We automatically scrape features, benefits, pain points, and product images.",
    },
    {
      emoji: "🤖",
      title: "AI-Powered Research",
      description:
        "Our RAG system performs competitor analysis and market positioning research automatically.",
    },
    {
      emoji: "📊",
      title: "Performance Analytics",
      description:
        "Track which affiliates are promoting your products and monitor real-time performance metrics.",
    },
    {
      emoji: "🎯",
      title: "Affiliate Network",
      description:
        "Get your products in front of motivated Marketers ready to promote.",
    },
    {
      emoji: "⚡",
      title: "One-Click Publishing",
      description:
        "Publish or unpublish products to the library instantly. Full control over visibility.",
    },
    {
      emoji: "💰",
      title: "Commission Management",
      description:
        "Set custom commission rates and track affiliate performance effortlessly.",
    },
  ];

  const benefits = [
    "Zero manual data entry - AI does the heavy lifting",
    "Reach hundreds of Marketers instantly",
    "Professional product descriptions generated automatically",
    "Real-time analytics on affiliate activity",
    "FTC-compliant content generation for all promotions",
    "Expand your reach without expanding your team",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="text-6xl">🎯</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Your Products.
              <br />
              Endless Promotion.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Blitz connects your products with a network of Marketers who
              create AI-powered campaigns to drive your sales. Set it up once,
              watch it scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2">
                Start Free Trial
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </button>
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg border border-gray-700 transition-all duration-300">
                Watch Demo ▶️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Signup Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Reach More Customers with AI
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join product developers scaling their reach through automated
            affiliate marketing.
          </p>
          <EmailSignupForm
            audienceType="product-dev"
            source="product-developers-page"
            buttonText="Get Early Access"
            placeholder="Enter your product email"
            variant="default"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">⚡</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              2 Min
            </div>
            <div className="text-gray-400 mt-2">Average Setup Time</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">📈</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              10x
            </div>
            <div className="text-gray-400 mt-2">Promotion Reach</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">🤖</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              100%
            </div>
            <div className="text-gray-400 mt-2">AI-Automated</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">
            Get your products promoted in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-8 border border-purple-700/50 h-full">
              <div className="text-6xl mb-6">1️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Add Your Product</h3>
              <p className="text-gray-300">
                Paste your sales page URL, set commission rates, and let our AI
                automatically compile product intelligence, images, and
                descriptions.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-8 border border-blue-700/50 h-full">
              <div className="text-6xl mb-6">2️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Publish to Library</h3>
              <p className="text-gray-300">
                One click to publish your product to our marketplace where
                Marketers can discover and promote it.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-8 border border-green-700/50 h-full">
              <div className="text-6xl mb-6">3️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Track & Scale</h3>
              <p className="text-gray-300">
                Watch affiliates create campaigns, monitor performance
                analytics, and see your sales grow on autopilot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to scale your product promotion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="text-5xl mb-4">{feature.emoji}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl p-12 border border-purple-700/30">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Product Developers Choose Blitz
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2
                  className="text-green-400 flex-shrink-0 mt-1"
                  size={24}
                />
                <p className="text-lg text-gray-200">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Scale Your Product?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join product developers who are reaching more customers through
            AI-powered affiliate marketing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl">
              Start Free Trial →
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Schedule Demo 📅
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500">
          <p>© 2024 Blitz. Simplify marketing, amplify results.</p>
        </div>
      </div>
    </div>
  );
}
