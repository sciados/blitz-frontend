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
  Facebook,
  Instagram,
} from "lucide-react";
import { EmailSignupForm } from "src/components/EmailSignupForm";

export default function SmallBusinessPage() {
  const painPoints = [
    {
      emoji: "💸",
      problem: "Marketing agencies cost $3K-10K/month",
      solution: "Get professional campaigns for just $147/month",
    },
    {
      emoji: "⏰",
      problem: "No time to post on social media daily",
      solution: "Auto-publishing posts to Google, Facebook, Instagram automatically",
    },
    {
      emoji: "🤷",
      problem: "Don't know what content to create",
      solution: "AI generates 60+ posts, 4 articles, 2 videos per month for you",
    },
    {
      emoji: "📉",
      problem: "Marketing isn't generating leads",
      solution: "Lead-generation focused content with clear CTAs (call, book, quote)",
    },
  ];

  const features = [
    {
      emoji: "🤖",
      title: "AI Content Generation",
      description:
        "Generate unlimited articles, social posts, emails, and videos. Professional quality, tailored to your business.",
    },
    {
      emoji: "📱",
      title: "Auto-Publishing to Social Media",
      description:
        "Automatically posts to Google Business Profile, Facebook, and Instagram. Set it once, done automatically.",
    },
    {
      emoji: "🎨",
      title: "Complete Content Suite",
      description:
        "Blog posts, social media, emails, ads, images, videos—all created automatically and on-brand for your business.",
    },
    {
      emoji: "📊",
      title: "Lead Tracking & Analytics",
      description:
        "Track calls, clicks, form submissions, and ROI. See exactly what's driving customers to your business.",
    },
    {
      emoji: "⚡",
      title: "Launch in 4 Minutes",
      description:
        "Subscribe, connect accounts, generate content. No complex setup, no technical knowledge required.",
    },
    {
      emoji: "🛡️",
      title: "12 Business Intelligence Templates",
      description:
        "Pre-built intelligence for plumbers, electricians, dentists, restaurants, and more. Start immediately, even without a website.",
    },
    {
      emoji: "📈",
      title: "Seasonal Campaign System",
      description:
        "12 seasonal campaigns ready to activate. Winter prep, spring cleaning, summer services, fall maintenance.",
    },
    {
      emoji: "🔌",
      title: "WordPress Integration",
      description:
        "Copy/paste ready blog posts. Generate article → Paste to WordPress → Publish. It's that simple.",
    },
    {
      emoji: "🎯",
      title: "Local SEO Optimized",
      description:
        "Content optimized for local search. Rank for 'plumber near me', 'dentist in [city]', and more.",
    },
  ];

  const benefits = [
    "Save $3,000-5,000/month vs hiring an agency",
    "5 hours saved per week (worth $12,350/year)",
    "Get professional content without hiring writers",
    "Auto-publish to 3 platforms (Google, Facebook, Instagram)",
    "Generate 60+ social posts per month automatically",
    "Track leads and ROI with built-in analytics",
    "Works with or without a website",
    "No long-term contracts or commitments",
  ];

  const comparison = [
    {
      category: "Monthly Cost",
      traditional: "$3,000 - $5,000",
      blitz: "$147",
      emoji: "💰",
    },
    {
      category: "Time to Launch",
      traditional: "2-4 weeks",
      blitz: "4 minutes",
      emoji: "⚡",
    },
    {
      category: "Social Media Posting",
      traditional: "Manual daily",
      blitz: "Fully automatic",
      emoji: "📱",
    },
    {
      category: "Content Creation",
      traditional: "Hours per piece",
      blitz: "AI generates in minutes",
      emoji: "⏱️",
    },
    {
      category: "Lead Generation",
      traditional: "Hit or miss",
      blitz: "Built-in CTAs and tracking",
      emoji: "🎯",
    },
  ];

  const workflow = [
    {
      step: 1,
      icon: "💳",
      title: "Subscribe to Business Plan",
      time: "2 minutes",
      description: "Start with $147/month, full access from day one",
      details: [
        "Choose Business Owner plan ($147/month)",
        "Create your account with business details",
        "Select your business type (plumber, dentist, etc.)",
        "Add website URL (optional, works without one)",
      ],
      proTip:
        "The $147 investment pays for itself with just 1 new customer per month!",
    },
    {
      step: 2,
      icon: "🔌",
      title: "Connect Social Media Accounts",
      time: "90 seconds",
      description: "Connect Google Business, Facebook, Instagram",
      details: [
        "Connect Google Business Profile (shows in local search)",
        "Connect Facebook Page (reaches your customers)",
        "Connect Instagram (visual content for services)",
        "All with secure OAuth—one-click connection",
      ],
      proTip:
        "Google Business Profile is #1 priority—it's where customers search 'plumber near me'",
    },
    {
      step: 3,
      icon: "🤖",
      title: "Generate Your First Content",
      time: "30 seconds",
      description: "AI creates articles, posts, images, videos automatically",
      details: [
        "Choose content type (article, social post, email)",
        "Select campaign (winter prep, spring cleaning, etc.)",
        "AI generates professional content with your business info",
        "Auto-adapts for each social platform",
      ],
      proTip:
        "Generate once, auto-publishes everywhere. No manual work needed!",
    },
    {
      step: 4,
      icon: "📱",
      title: "Auto-Publishing Begins",
      time: "Automatic",
      description: "Content posts to all platforms on schedule",
      details: [
        "Posts automatically to Google Business Profile",
        "Shares on Facebook Page with engagement",
        "Publishes to Instagram with hashtags",
        "Content adapted for each platform automatically",
      ],
      proTip:
        "Save 5 hours/week. Focus on your business while Blitz handles marketing!",
    },
    {
      step: 5,
      icon: "📊",
      title: "Track Results & Leads",
      time: "5 minutes/week",
      description: "Monitor calls, clicks, and customers from your content",
      details: [
        "Dashboard shows published posts",
        "Track website clicks from social media",
        "Monitor phone calls and form submissions",
        "Calculate ROI ($2,100 revenue vs $147 cost)",
      ],
      proTip:
        "Most businesses see 10-25 new leads/month within 30 days!",
    },
  ];

  const successStories = [
    {
      business: "Metro City Plumbing",
      location: "Austin, TX",
      type: "4 plumbers, 8 years",
      results: [
        "12 articles published",
        "180 social posts auto-published",
        "25 new leads/month",
        "6 new customers/month",
        "$2,100/month revenue",
        "1,328% ROI",
      ],
      profit: "$1,953/month net profit",
      emoji: "🔧",
    },
    {
      business: "Downtown Dental",
      location: "Denver, CO",
      type: "2 dentists, family practice",
      results: [
        "24 articles published",
        "360 social posts",
        "40 leads/month",
        "12 new patients/month",
        "$18,000/month revenue",
        "3,658% ROI",
      ],
      profit: "$17,853/month net profit",
      emoji: "🦷",
    },
    {
      business: "Elite HVAC",
      location: "Phoenix, AZ",
      type: "6 technicians",
      results: [
        "48 articles published",
        "720 social posts",
        "60+ leads/month",
        "20 new customers/month",
        "$35,000/month revenue",
        "5,102% ROI",
      ],
      profit: "$34,853/month net profit",
      emoji: "❄️",
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
              Marketing Automation
              <br />
              for Local Businesses
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Generate professional content and auto-publish to Google, Facebook,
              and Instagram. Get more leads while focusing on your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2">
                Subscribe - $147/month
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
              Full access from day one • No free trial • 30-day guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Price Highlight Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-12 border border-blue-700/50 text-center">
          <div className="text-6xl mb-6">💰</div>
          <h2 className="text-4xl font-bold mb-4">
            Business Owner Plan: $147/month
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Everything you need for professional marketing automation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="text-3xl mb-2">📝</div>
              <div className="font-bold mb-1">Unlimited Content</div>
              <div className="text-sm text-gray-400">Articles, posts, emails, videos</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="text-3xl mb-2">📱</div>
              <div className="font-bold mb-1">Auto-Publishing</div>
              <div className="text-sm text-gray-400">Google, Facebook, Instagram</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold mb-1">Lead Tracking</div>
              <div className="text-sm text-gray-400">Calls, clicks, ROI analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Signup Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get More Leads?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join local business owners using Blitz to automate their marketing
            and grow their business.
          </p>
          <EmailSignupForm
            audienceType="business"
            source="small-business-page"
            buttonText="Subscribe Now - $147/month"
            placeholder="Enter your business email"
            variant="default"
          />
          <p className="text-gray-400 text-sm mt-4">
            Full access immediately • Cancel anytime • 30-day guarantee
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">💰</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              $147
            </div>
            <div className="text-gray-400 mt-2">Per Month</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">📱</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              3
            </div>
            <div className="text-gray-400 mt-2">Platforms Auto-Publish</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">⏱️</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              5hrs
            </div>
            <div className="text-gray-400 mt-2">Saved Per Week</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">📈</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
              1,328%
            </div>
            <div className="text-gray-400 mt-2">Average ROI</div>
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
            Get Started in 4 Minutes
          </h2>
          <p className="text-xl text-gray-400">
            From signup to auto-publishing in under 5 minutes
          </p>
        </div>

        <div className="space-y-6">
          {workflow.map((step, index) => (
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
      </div>

      {/* Success Stories */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Real Results from Real Businesses
          </h2>
          <p className="text-xl text-gray-400">
            See how local businesses are growing with Blitz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{story.emoji}</div>
                <h3 className="text-2xl font-bold">{story.business}</h3>
                <p className="text-gray-400">{story.location}</p>
                <p className="text-sm text-gray-500">{story.type}</p>
              </div>

              <div className="space-y-2 mb-6">
                {story.results.map((result, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="text-green-400" size={16} />
                    <span className="text-gray-300">{result}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-700/30 text-center">
                <div className="text-sm text-gray-400 mb-1">Net Profit</div>
                <div className="text-2xl font-bold text-green-400">
                  {story.profit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-12 border border-blue-700/30">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Local Businesses Choose Blitz
            </h2>
            <p className="text-xl text-gray-300">
              Marketing automation designed for service businesses
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
            <h2 className="text-4xl font-bold mb-4">Calculate Your ROI</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Most local businesses spend $3K-5K/month on marketing. With
              Blitz, you get better results for just $147/month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-8 border border-red-700/30">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">
                Traditional Approach
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Marketing Agency: $3K-5K/mo</li>
                <li>• Content Writer: $2K-3K/mo</li>
                <li>• Social Media Manager: $2K-3K/mo</li>
                <li>• Designer: $1.5K-2K/mo</li>
                <li className="pt-3 border-t border-red-700/30 font-bold text-xl">
                  Total: $8.5K-13K/mo
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
                <li>• Auto-Publishing: Included</li>
                <li>• Images & Videos: Included</li>
                <li>• Lead Tracking: Included</li>
                <li className="pt-3 border-t border-green-700/30 font-bold text-xl">
                  Total: $147/mo
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-green-400">
              Save over $100,000 per year 💰
            </p>
            <p className="text-gray-400 mt-2">
              Plus generate 1,328% ROI in additional revenue
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get More Leads?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join local businesses automating their marketing and growing faster
            with Blitz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl">
              Subscribe - $147/month →
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Talk to Sales 📞
            </button>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            Full access from day one • No free trial • Cancel anytime
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
