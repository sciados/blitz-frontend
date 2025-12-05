"use client";

import {
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Target,
} from "lucide-react";
import { EmailSignupForm } from "src/components/EmailSignupForm";

export default function SmallBusinessPage() {
  const painPoints = [
    {
      emoji: "💸",
      problem: "Marketing agencies cost $3K-10K/month",
      solution: "Get professional campaigns for a fraction of the cost",
    },
    {
      emoji: "⏰",
      problem: "No time to create content consistently",
      solution: "AI generates months of content in minutes",
    },
    {
      emoji: "🤷",
      problem: "Don't know how to reach new customers",
      solution: "Access a network of affiliates ready to promote you",
    },
    {
      emoji: "📉",
      problem: "Marketing efforts aren't converting",
      solution: "AI-optimized content proven to drive results",
    },
  ];

  const features = [
    {
      emoji: "🤖",
      title: "AI Marketing Team",
      description:
        "Get copywriters, designers, and strategists—all powered by AI. No hiring, no management, no overhead.",
    },
    {
      emoji: "📢",
      title: "Affiliate Network",
      description:
        "Connect with marketers who promote your product on commission. Only pay for results, not promises.",
    },
    {
      emoji: "🎨",
      title: "Complete Content Suite",
      description:
        "Blog posts, emails, social media, ads, landing pages—all created automatically and on-brand.",
    },
    {
      emoji: "📊",
      title: "Real-Time Analytics",
      description:
        "See exactly what's working. Track clicks, conversions, and ROI across all campaigns.",
    },
    {
      emoji: "⚡",
      title: "Launch in Minutes",
      description:
        "Add your product URL and go live. No complex setup, no technical knowledge required.",
    },
    {
      emoji: "🛡️",
      title: "Compliance Built-In",
      description:
        "All content is FTC-compliant automatically. Legal peace of mind included.",
    },
  ];

  const benefits = [
    "Save $5K-10K/month vs hiring an agency",
    "Launch marketing campaigns in hours, not weeks",
    "Get professional content without hiring writers",
    "Only pay affiliates when they drive sales",
    "Scale your marketing without scaling your team",
    "Track every dollar spent and earned",
    "Generate unlimited content variations",
    "No long-term contracts or commitments",
  ];

  const comparison = [
    {
      category: "Monthly Cost",
      traditional: "$5,000 - $10,000",
      blitz: "Starting at $0",
      emoji: "💰",
    },
    {
      category: "Time to Launch",
      traditional: "2-4 weeks",
      blitz: "Same day",
      emoji: "⚡",
    },
    {
      category: "Content Creation",
      traditional: "Hours per piece",
      blitz: "Minutes per piece",
      emoji: "⏱️",
    },
    {
      category: "Team Needed",
      traditional: "5-10 people",
      blitz: "Just you + AI",
      emoji: "👥",
    },
  ];

  const detailedWorkflow = [
    {
      step: 1,
      icon: "🔑",
      title: "Login & Business Dashboard",
      time: "2 minutes",
      description: "Access your personalized business dashboard",
      details: [
        "See overview of all your products and performance",
        "Quick stats on affiliates, conversions, and revenue",
        "Navigation to Products, Affiliates, Analytics, and Settings",
        "Overview of commission payouts and pending conversions",
      ],
      proTip:
        "The business dashboard gives you a 360° view of your entire affiliate marketing operation in one place.",
    },
    {
      step: 2,
      icon: "📦",
      title: "Add Products to Library",
      time: "5 minutes per product",
      description:
        "Add your products to the Blitz library for affiliates to discover",
      details: [
        "Enter your product URL or sales page",
        "Set commission rate (percentage or fixed amount)",
        "Choose commission type (one-time or recurring)",
        "Specify affiliate networks (JVZoo, WarriorForum, etc.)",
        "Add product description and key benefits",
      ],
      proTip:
        "Higher commission rates (30-50%) attract more affiliates. Recurring commissions are especially popular!",
    },
    {
      step: 3,
      icon: "🤖",
      title: "AI Compiles Intelligence",
      time: "1-2 minutes",
      description: "AI analyzes your sales page and creates marketing assets",
      details: [
        "AI extracts product benefits, features, and key messaging",
        "Analyzes target audience and pain points",
        "Conducts competitor research",
        "Generates marketing hooks and angles",
        "Creates intelligence profile for affiliates to use",
      ],
      proTip:
        "Accurate intelligence = better affiliate performance. Review and update product info whenever you change your sales page!",
    },
    {
      step: 4,
      icon: "👥",
      title: "Browse Affiliate Network",
      time: "10 minutes",
      description: "See who wants to promote your products",
      details: [
        "Browse profiles of affiliates in your niche",
        "View affiliate stats (followers, engagement, past performance)",
        "Filter by audience type, platform, or geography",
        "Check which affiliates are actively promoting similar products",
      ],
      proTip:
        "Reach out to high-performing affiliates with exclusive offers or higher commission rates to build stronger partnerships.",
    },
    {
      step: 5,
      icon: "🎯",
      title: "Connect & Recruit",
      time: "15 minutes",
      description: "Build relationships with quality affiliates",
      details: [
        "Send messages to promising affiliates",
        " exclusive commissionOffer rates or bonuses",
        "Provide affiliate resources (banners, email swipe files)",
        "Set up custom tracking for top partners",
        "Create affiliate-exclusive promotions",
      ],
      proTip:
        "Personal relationships drive results. The affiliates who make the most money are the ones you build real partnerships with.",
    },
    {
      step: 6,
      icon: "📊",
      title: "Monitor Performance",
      time: "10 minutes daily",
      description: "Track clicks, conversions, and revenue in real-time",
      details: [
        "View detailed analytics dashboard",
        "Track clicks by affiliate and campaign",
        "Monitor conversion rates and revenue",
        "Identify top-performing affiliates and content",
        "Review commission payouts and outstanding balances",
      ],
      proTip:
        "Check analytics daily. Identify what's working (double down) and what's not (optimize or stop).",
    },
    {
      step: 7,
      icon: "🚀",
      title: "Scale & Optimize",
      time: "Ongoing",
      description: "Grow your affiliate program systematically",
      details: [
        "Increase commission rates for top performers",
        "Launch new products to your affiliate network",
        "Provide additional resources to high-performers",
        "Recruit more affiliates in profitable niches",
        "A/B test commission structures and incentives",
      ],
      proTip:
        "Your top 20% of affiliates typically drive 80% of your revenue. Focus on nurturing these relationships!",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="text-6xl">🚀</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Your Marketing Team.
              <br />
              Powered by AI.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Blitz gives small businesses the marketing power of enterprise
              companies—without the enterprise budget. Launch campaigns, create
              content, and reach customers on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2">
                Start Free Trial
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </button>
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg border border-gray-700 transition-all duration-300">
                See Demo 🎬
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              No credit card required • Setup in 5 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Email Signup Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Early Access to Blitz
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the waitlist for small business owners. Be the first to know
            when we launch.
          </p>
          <EmailSignupForm
            audienceType="business"
            source="small-business-page"
            buttonText="Join the Waitlist"
            placeholder="Enter your business email"
            variant="default"
          />
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            We Solve Real Business Problems
          </h2>
          <p className="text-xl text-gray-400">
            Stop struggling with marketing. Start growing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painPoints.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700"
            >
              <div className="text-5xl mb-4">{item.emoji}</div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">✗</span>
                  <p className="text-gray-400 line-through">{item.problem}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <p className="text-white font-semibold">{item.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">💰</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              90%
            </div>
            <div className="text-gray-400 mt-2">Lower Cost vs Agencies</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">⚡</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-gray-400 mt-2">AI Working For You</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">📈</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              5 min
            </div>
            <div className="text-gray-400 mt-2">To Launch Campaigns</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Traditional vs Blitz
          </h2>
          <p className="text-xl text-gray-400">
            See the difference for yourself
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-800/50 border-b border-gray-700 font-bold">
            <div className="text-gray-400"></div>
            <div className="text-center text-gray-400">
              Traditional Marketing
            </div>
            <div className="text-center text-blue-400">Blitz ✨</div>
          </div>

          {comparison.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 p-6 border-b border-gray-700/50 last:border-b-0 items-center"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{row.emoji}</span>
                <span className="font-semibold">{row.category}</span>
              </div>
              <div className="text-center text-gray-400">{row.traditional}</div>
              <div className="text-center text-green-400 font-bold">
                {row.blitz}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-gray-400">
            Your complete marketing automation platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-5xl mb-4">{feature.emoji}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Started in 3 Steps
          </h2>
          <p className="text-xl text-gray-400">
            From signup to sales in under an hour
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-8 border border-blue-700/50 h-full">
              <div className="text-6xl mb-6">1️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Add Your Product</h3>
              <p className="text-gray-300">
                Paste your website URL. Our AI analyzes your product, extracts
                key info, and creates your marketing profile.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-8 border border-purple-700/50 h-full">
              <div className="text-6xl mb-6">2️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Generate Content</h3>
              <p className="text-gray-300">
                Choose what you need—blog posts, emails, social media, ads. AI
                creates professional content instantly.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-8 border border-green-700/50 h-full">
              <div className="text-6xl mb-6">3️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Deploy & Grow</h3>
              <p className="text-gray-300">
                Publish content, activate affiliates, track results. Watch your
                business grow while you focus on what you do best.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Workflow Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Complete Business Walkthrough
          </h2>
          <p className="text-xl text-gray-400">
            From first login to scaling your affiliate program—in under 2 hours
            total
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
                        <span className="text-sm font-bold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
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
                  <h4 className="font-semibold text-white mb-3">
                    What you'll do:
                  </h4>
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

                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-700/30">
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

        <div className="mt-16 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-3xl p-12 border border-green-700/30">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              Real Example: SaaS Product Launch
            </h3>
            <p className="text-gray-300">
              How one business owner built a 6-figure affiliate program in 30
              days
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-3">📦</div>
              <h4 className="font-bold mb-2">Day 1</h4>
              <p className="text-sm text-gray-400">
                Added project management tool to library
                <br />
                Set 40% recurring commission
                <br />
                AI compiled intelligence
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-3">👥</div>
              <h4 className="font-bold mb-2">Week 1</h4>
              <p className="text-sm text-gray-400">
                Recruited 15 affiliates
                <br />
                Provided custom landing pages
                <br />
                Launched affiliate exclusive promo
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-3">📈</div>
              <h4 className="font-bold mb-2">Day 30</h4>
              <p className="text-sm text-gray-400">
                45 active affiliates
                <br />
                $127K in attributed sales
                <br />
                $50K in commissions paid
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Business Success Formula
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <Target className="text-blue-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold mb-1">
                  Set competitive commissions (30-50%)
                </h4>
                <p className="text-gray-400 text-sm">
                  Higher rates attract top performers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="text-purple-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold mb-1">
                  Build relationships with top 20%
                </h4>
                <p className="text-gray-400 text-sm">
                  Your best affiliates drive 80% of revenue
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
                  Recurring commissions or one-time
                </h4>
                <p className="text-gray-400 text-sm">
                  Long-term affiliates = predictable income
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp
                className="text-orange-400 flex-shrink-0 mt-1"
                size={24}
              />
              <div>
                <h4 className="font-bold mb-1">Monitor analytics daily</h4>
                <p className="text-gray-400 text-sm">
                  Double down on what's working
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-12 border border-blue-700/30">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Small Businesses Choose Blitz
            </h2>
            <p className="text-xl text-gray-300">
              Marketing shouldn't be complicated or expensive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2
                  className="text-blue-400 flex-shrink-0 mt-1"
                  size={24}
                />
                <p className="text-lg text-gray-200">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">💡</div>
            <h2 className="text-4xl font-bold mb-4">Calculate Your Savings</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Most small businesses spend $60K-120K/year on marketing. With
              Blitz, you get better results for a fraction of the cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-8 border border-red-700/30">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">
                Traditional Approach
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Marketing Agency: $5K-10K/mo</li>
                <li>• Content Writer: $3K-5K/mo</li>
                <li>• Graphic Designer: $3K-5K/mo</li>
                <li>• Ad Management: $2K-4K/mo</li>
                <li className="pt-3 border-t border-red-700/30 font-bold text-xl">
                  Total: $13K-24K/mo
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl p-8 border border-green-700/30">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-4 text-green-400">
                Blitz Approach
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li>• AI Content Generation: Included</li>
                <li>• Image Creation: Included</li>
                <li>• Affiliate Network: Pay on results</li>
                <li>• Analytics & Tracking: Included</li>
                <li className="pt-3 border-t border-green-700/30 font-bold text-xl">
                  Total: Starting at $0/mo
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-green-400">
              Save over $150,000 per year 💰
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of small businesses growing faster with AI-powered
            marketing automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl">
              Start Free Trial →
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Talk to Sales 📞
            </button>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            Free forever plan • No credit card needed • Setup in 5 minutes
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
