"use client";

import {
  Zap,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  DollarSign,
} from "lucide-react";
import { EmailSignupForm } from "src/components/EmailSignupForm";

export default function ProductDevelopersPage() {
  const detailedWorkflow = [
    {
      step: 1,
      icon: "🔑",
      title: "Login & Product Dashboard",
      time: "2 minutes",
      description: "Access your personalized product developer dashboard",
      details: [
        "View all your products and their promotion status",
        "Quick stats on views, clicks, and conversions",
        "Navigation to Products, Analytics, Settings, and Billing",
        "Overview of affiliate performance across your catalog"
      ],
      proTip: "The product dashboard gives you complete visibility into how your products are performing across the entire affiliate network."
    },
    {
      step: 2,
      icon: "📦",
      title: "Add Product to Library",
      time: "2 minutes",
      description: "Upload your product details for affiliate discovery",
      details: [
        "Paste your sales page URL or product link",
        "AI automatically extracts product information",
        "Upload product images (or let AI capture them)",
        "Add category tags for better discoverability",
        "Set product status (draft, published, or hidden)"
      ],
      proTip: "Use high-quality product images—the better your visuals, the more attractive your product appears to affiliates!"
    },
    {
      step: 3,
      icon: "🤖",
      title: "AI Compiles Intelligence",
      time: "1-2 minutes",
      description: "AI analyzes your product and creates marketing assets",
      details: [
        "Extracts key features, benefits, and unique selling points",
        "Identifies target audience and pain points",
        "Conducts competitor research and positioning",
        "Generates compelling product descriptions",
        "Creates affiliate marketing materials automatically"
      ],
      proTip: "Review the AI-generated intelligence—accurate product info leads to better affiliate promotions and higher conversions!"
    },
    {
      step: 4,
      icon: "💰",
      title: "Set Commission Structure",
      time: "3 minutes",
      description: "Configure affiliate commission rates and terms",
      details: [
        "Choose commission type (percentage or fixed amount)",
        "Set commission rate (industry standard: 30-50%)",
        "Enable recurring commissions for subscription products",
        "Configure bonus structures for top performers",
        "Set minimum payout thresholds"
      ],
      proTip: "Higher commission rates (40-50%) attract premium affiliates. Recurring commissions are especially effective for SaaS and subscription products!"
    },
    {
      step: 5,
      icon: "🚀",
      title: "Publish to Marketplace",
      time: "30 seconds",
      description: "Make your product visible to the affiliate network",
      details: [
        "One-click publish to the product library",
        "Affiliates can now discover and promote your product",
        "Set visibility (public, approved affiliates only, or hidden)",
        "Receive notifications when affiliates show interest",
        "Monitor initial views and engagement"
      ],
      proTip: "Start with a 'public' listing to build momentum, then you can switch to 'approved only' to curate your affiliate network."
    },
    {
      step: 6,
      icon: "📊",
      title: "Monitor Affiliate Activity",
      time: "5 minutes daily",
      description: "Track which affiliates are promoting your products",
      details: [
        "View real-time analytics dashboard",
        "Track clicks, conversions, and revenue by affiliate",
        "Monitor which products are getting the most promotion",
        "Identify top-performing affiliates and campaigns",
        "Review commission payouts and outstanding balances"
      ],
      proTip: "Check analytics daily. Reach out to high-performing affiliates with exclusive bonuses to strengthen those relationships!"
    },
    {
      step: 7,
      icon: "🎯",
      title: "Optimize & Scale",
      time: "Ongoing",
      description: "Continuously improve and expand your reach",
      details: [
        "A/B test commission rates to attract better affiliates",
        "Provide additional resources to top performers",
        "Launch new products to your active affiliate network",
        "Create affiliate-exclusive promotions and bonuses",
        "Expand into new niches with complementary products"
      ],
      proTip: "Your top 20% of affiliates typically drive 80% of your sales. Focus on nurturing these relationships with special perks and higher rates!"
    }
  ];
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

      {/* Detailed Workflow Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Complete Product Developer Walkthrough
          </h2>
          <p className="text-xl text-gray-400">
            From product upload to affiliate sales—in under 10 minutes total
          </p>
        </div>

        <div className="space-y-6">
          {detailedWorkflow.map((step, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-5xl">{step.icon}</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                          STEP {step.step}
                        </span>
                        <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                          <Clock size={16} />
                          {step.time}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-gray-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-3">What you'll do:</h4>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <CheckCircle2
                          className="text-green-400 flex-shrink-0 mt-1"
                          size={18}
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700/30">
                  <div className="flex items-start gap-3">
                    <Sparkles
                      className="text-yellow-400 flex-shrink-0 mt-1"
                      size={18}
                    />
                    <div>
                      <span className="font-semibold text-yellow-400">
                        Pro Tip:{" "}
                      </span>
                      <span className="text-gray-300">{step.proTip}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl p-12 border border-purple-700/30">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              Real Example: SaaS Tool Launch
            </h3>
            <p className="text-gray-300">
              How one developer got 100+ affiliates promoting their product in 14 days
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-3">📦</div>
              <h4 className="font-bold mb-2">Day 1</h4>
              <p className="text-sm text-gray-400">
                Added project management SaaS to library<br />
                Set 45% recurring commission<br />
                AI generated product intelligence<br />
                Published to marketplace
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-3">👥</div>
              <h4 className="font-bold mb-2">Week 1</h4>
              <p className="text-sm text-gray-400">
                37 affiliates promoting<br />
                12 published review articles<br />
                8 email sequences created<br />
                247 clicks generated
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-3">📈</div>
              <h4 className="font-bold mb-2">Day 14</h4>
              <p className="text-sm text-gray-400">
                103 active affiliates<br />
                $89K in attributed sales<br />
                $40K in commissions paid<br />
                23% conversion rate
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Product Developer Success Formula
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <Target className="text-purple-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold mb-1">
                  Competitive commissions (40-50%)
                </h4>
                <p className="text-gray-400 text-sm">
                  Premium rates attract top-tier affiliates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="text-blue-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold mb-1">
                  High-quality product images
                </h4>
                <p className="text-gray-400 text-sm">
                  Visual appeal drives affiliate interest
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign
                className="text-green-400 flex-shrink-0 mt-1"
                size={24}
              />
              <div>
                <h4 className="font-bold mb-1">
                  Recurring commissions for SaaS
                </h4>
                <p className="text-gray-400 text-sm">
                  Long-term value for affiliates and you
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3
                className="text-orange-400 flex-shrink-0 mt-1"
                size={24}
              />
              <div>
                <h4 className="font-bold mb-1">
                  Monitor and optimize daily
                </h4>
                <p className="text-gray-400 text-sm">
                  Data-driven decisions drive growth
                </p>
              </div>
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
