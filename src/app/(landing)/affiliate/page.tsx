"use client";

import {
  Sparkles,
  DollarSign,
  Zap,
  Image,
  FileText,
  Mail,
  Video,
  Share2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { EmailSignupForm } from "src/components/EmailSignupForm";

export default function AffiliateMarketersPage() {
  const contentTypes = [
    { emoji: "📝", title: "Articles", description: "SEO-optimized blog posts" },
    {
      emoji: "📧",
      title: "Email Campaigns",
      description: "High-converting sequences",
    },
    {
      emoji: "🎬",
      title: "Video Scripts",
      description: "Engaging video content",
    },
    { emoji: "📱", title: "Social Posts", description: "Multi-platform ready" },
    { emoji: "🎯", title: "Landing Pages", description: "Conversion-focused" },
    { emoji: "💰", title: "Ad Copy", description: "Paid campaign ready" },
    { emoji: "🖼️", title: "AI Images", description: "Premium visuals" },
    {
      emoji: "✅",
      title: "FTC Compliant",
      description: "Auto-checked content",
    },
  ];

  const features = [
    {
      emoji: "🤖",
      title: "AI Content Generator",
      description:
        "Create professional marketing content in seconds. Articles, emails, video scripts, social posts - all optimized for conversions.",
    },
    {
      emoji: "🎨",
      title: "Image Generation & Editing",
      description:
        "Generate premium AI images, overlay product images, add text overlays. Complete visual content toolkit included.",
    },
    {
      emoji: "📚",
      title: "Product Library Access",
      description:
        "Browse hundreds of products ready to promote. Filter by category, commission rate, and niche.",
    },
    {
      emoji: "🔗",
      title: "Auto-Tracked Links",
      description:
        "Every piece of content gets tracked links with UTM parameters. Know exactly what converts.",
    },
    {
      emoji: "⚖️",
      title: "Compliance Automation",
      description:
        "FTC-compliant disclosures added automatically. Never worry about legal issues again.",
    },
    {
      emoji: "📊",
      title: "Performance Analytics",
      description:
        "Track clicks, conversions, and earnings. Data-driven insights to optimize your campaigns.",
    },
  ];

  const benefits = [
    "Generate a month's content in minutes, not days",
    "Access products with verified commission rates",
    "AI-powered research for each product you promote",
    "Professional images without designer costs",
    "Automatic FTC compliance on all content",
    "Scale to multiple products effortlessly",
    "Track performance across all campaigns",
    "No technical skills required - just ideas",
  ];

  const workflow = [
    {
      step: "1",
      emoji: "🔍",
      title: "Browse Products",
      desc: "Find profitable products in your niche",
    },
    {
      step: "2",
      emoji: "✨",
      title: "Generate Content",
      desc: "AI creates campaigns in seconds",
    },
    {
      step: "3",
      emoji: "🎨",
      title: "Add Visuals",
      desc: "Generate & customize images",
    },
    {
      step: "4",
      emoji: "🚀",
      title: "Deploy & Earn",
      desc: "Publish and track your results",
    },
  ];

  const detailedSteps = [
    {
      step: 1,
      icon: "🔑",
      title: "Login & Dashboard",
      time: "2 minutes",
      description: "Sign in to your personalized dashboard",
      details: [
        "See your quick stats (campaigns, content, performance)",
        "Quick action buttons for common tasks",
        "Upgrade prompt if on Standard tier (visible in header)",
      ],
      proTip:
        "Marketers can create campaigns from Product Library. Pro Marketers can create campaigns with ANY product URL.",
    },
    {
      step: 2,
      icon: "📚",
      title: "Browse Products",
      time: "10 minutes",
      description: "Find products with great commission rates",
      details: [
        "Browse products with thumbnails, names, and commission rates",
        "Filter by commission type (recurring vs one-time), network, popularity",
        "Sort by recent additions, commission rate, or most popular",
        "Click product to view full details",
      ],
      proTip:
        "Products with recurring commissions are goldmines - they pay you monthly for referred customers!",
    },
    {
      step: 3,
      icon: "🎯",
      title: "Create Campaign",
      time: "5 minutes",
      description: "Set up your marketing campaign for the product",
      details: [
        "Click 'Create Campaign' on any product",
        "Add your unique affiliate link from the network",
        "Add relevant keywords for your target audience",
        "Name your campaign (e.g., 'Supplement Review - Molityn')",
        "Campaign auto-links to product intelligence",
      ],
      proTip:
        "Use descriptive campaign names so you can easily identify them later!",
    },
    {
      step: 4,
      icon: "🧠",
      title: "Generate Intelligence",
      time: "1 minute",
      description: "AI compiles product insights and target audience data",
      details: [
        "Go to Intelligence → Select your campaign",
        "Click 'Compile Intelligence'",
        "Wait 30-60 seconds while AI analyzes the product",
        "Get: Target audience, pain points, benefits, competitor analysis",
      ],
      proTip:
        "Campaigns with intelligence generate 3x better content because AI knows exactly who to target!",
    },
    {
      step: 5,
      icon: "✨",
      title: "Create Content",
      time: "3 minutes",
      description: "Generate high-converting marketing content",
      details: [
        "Go to Content → Choose Text or Image content",
        "Select your campaign and content type (article, email, video, etc.)",
        "Set parameters: marketing angle, tone, length",
        "Click 'Generate' and AI creates content based on campaign intelligence",
        "Automatic FTC compliance checking included",
      ],
      proTip: "Generate 3-5 variations and A/B test to see what converts best!",
    },
    {
      step: 6,
      icon: "✅",
      title: "Review & Download",
      time: "5 minutes",
      description: "Review content and prepare for deployment",
      details: [
        "Check compliance score (Green = compliant, Red = needs fixing)",
        "Click 'Fix Compliance' to auto-add required disclosures",
        "Edit any specific details",
        "Create variations for A/B testing",
        "Download or copy to your marketing channels",
      ],
      proTip:
        "Always check compliance before publishing - FTC violations can be costly!",
    },
    {
      step: 7,
      icon: "📈",
      title: "Track Performance",
      time: "Ongoing",
      description: "Monitor clicks, conversions, and earnings",
      details: [
        "Check Analytics dashboard weekly",
        "Identify top-performing content",
        "Double down on winning strategies",
        "Fix or retire underperforming content",
      ],
      proTip: "Focus 80% of your effort on content types driving actual sales!",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="text-6xl">💰</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Create. Promote.
              <br />
              Get Paid.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Blitz gives you AI-powered tools to create professional marketing
              campaigns in minutes. Browse products, generate content, and earn
              commissions—all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-2">
                Start Earning Free
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </button>
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg border border-gray-700 transition-all duration-300">
                See It In Action 🎥
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Signup Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Ai Marketing Revolution
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be among the first Marketers to use AI-powered content creation.
            Sign up for early access.
          </p>
          <EmailSignupForm
            audienceType="affiliate"
            source="affiliate-marketers-page"
            buttonText="Start Earning Free"
            placeholder="Enter your affiliate email"
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
              10x
            </div>
            <div className="text-gray-400 mt-2">Faster Content Creation</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              8
            </div>
            <div className="text-gray-400 mt-2">Content Types Generated</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">✅</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              100%
            </div>
            <div className="text-gray-400 mt-2">FTC Compliant</div>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Marketing Workflow, Simplified
          </h2>
          <p className="text-xl text-gray-400">
            From product discovery to profit in 4 easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {workflow.map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-green-500/50 transition-all duration-300 h-full text-center">
                <div className="text-6xl mb-4">{item.emoji}</div>
                <div className="text-sm font-bold text-green-400 mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
              {index < workflow.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-green-500 text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Workflow Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Complete Marketing Walkthrough
          </h2>
          <p className="text-xl text-gray-400">
            From login to profitable content in 7 simple steps
          </p>
        </div>

        <div className="space-y-6">
          {detailedSteps.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-5xl">{item.icon}</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                          STEP {item.step}
                        </span>
                        <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                          <Clock size={16} />
                          {item.time}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                      <p className="text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-3">
                    What you'll do:
                  </h4>
                  <ul className="space-y-2">
                    {item.details.map((detail, i) => (
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

                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="flex items-start gap-3">
                    <Sparkles
                      className="text-yellow-400 flex-shrink-0 mt-1"
                      size={18}
                    />
                    <div>
                      <span className="font-semibold text-yellow-400">
                        Pro Tip:{" "}
                      </span>
                      <span className="text-gray-300">{item.proTip}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-700/30 text-center">
          <h3 className="text-2xl font-bold mb-4">Total Time: ~25 minutes</h3>
          <p className="text-lg text-gray-300 mb-4">
            From product selection to ready-to-publish content
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div>
              <span className="text-green-400 font-bold">vs Traditional:</span>{" "}
              4-6 hours
            </div>
            <div>
              <span className="text-green-400 font-bold">Time Saved:</span> 90%
            </div>
            <div>
              <span className="text-green-400 font-bold">Quality:</span>{" "}
              Professional
            </div>
          </div>
        </div>
      </div>

      {/* Real Example Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Real Example: Promoting a Supplement
            </h2>
            <p className="text-xl text-gray-300">
              See exactly how easy it is to create a profitable campaign
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/30">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold mb-2">Day 1: Setup</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Login → Browse Product Library</li>
                <li>• Find "Mitolyn Supplement" (50% recurring)</li>
                <li>• Create Campaign → Add affiliate link</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-700/30">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-xl font-bold mb-2">Day 2-3: Content</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Generate intelligence (1 min)</li>
                <li>• Create review article (3 min)</li>
                <li>• Auto-check compliance ✅</li>
                <li>• Download ready-to-publish</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-700/30">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-bold mb-2">Week 1: Results</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Publish article on blog</li>
                <li>• Share on social media</li>
                <li>• Build email sequence</li>
                <li>• Conversions starting!</li>
              </ul>
            </div>
          </div>

          <div className="text-center bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold mb-3">
              Time Investment Comparison
            </h4>
            <div className="flex items-center justify-center gap-12">
              <div>
                <div className="text-3xl font-bold text-red-400 mb-1">
                  4-6 hrs
                </div>
                <div className="text-sm text-gray-400">Traditional Method</div>
              </div>
              <div className="text-4xl text-green-400">→</div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  25 min
                </div>
                <div className="text-sm text-gray-400">With Blitz</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Types Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Every Content Type You Need
          </h2>
          <p className="text-xl text-gray-400">
            AI-generated, ready to deploy, fully compliant
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contentTypes.map((type, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 text-center"
            >
              <div className="text-5xl mb-3">{type.emoji}</div>
              <h3 className="font-bold mb-1">{type.title}</h3>
              <p className="text-sm text-gray-400">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Tools for Marketers
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to create and scale campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
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
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-3xl p-12 border border-green-700/30">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Marketers Love Blitz
            </h2>
            <p className="text-xl text-gray-300">
              Work smarter, not harder. Earn more, stress less.
            </p>
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

      {/* Proof Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-4xl font-bold mb-4">From Hours to Minutes</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Traditional affiliate marketing means hours writing articles,
              designing graphics, crafting emails. With Blitz, AI handles the
              heavy lifting while you focus on strategy and growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                2 mins
              </div>
              <p className="text-gray-400">To generate a full article</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                5 mins
              </div>
              <p className="text-gray-400">To create email sequence</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🎨</div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                30 secs
              </div>
              <p className="text-gray-400">To generate custom images</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Affiliate Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join marketers who are scaling their income with AI-powered content
            creation. No credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl">
              Get Started Free →
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Browse Products 🔍
            </button>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            Free forever • No credit card • Cancel anytime
          </p>
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
