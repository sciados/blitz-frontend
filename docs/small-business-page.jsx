import React from 'react';
import { Zap, TrendingUp, Users, DollarSign, Clock, Shield, Sparkles, CheckCircle2, ArrowRight, Target } from 'lucide-react';

export default function SmallBusinessPage() {
  const painPoints = [
    {
      emoji: "💸",
      problem: "Marketing agencies cost $3K-10K/month",
      solution: "Get professional campaigns for a fraction of the cost"
    },
    {
      emoji: "⏰",
      problem: "No time to create content consistently",
      solution: "AI generates months of content in minutes"
    },
    {
      emoji: "🤷",
      problem: "Don't know how to reach new customers",
      solution: "Access a network of affiliates ready to promote you"
    },
    {
      emoji: "📉",
      problem: "Marketing efforts aren't converting",
      solution: "AI-optimized content proven to drive results"
    }
  ];

  const features = [
    {
      emoji: "🤖",
      title: "AI Marketing Team",
      description: "Get copywriters, designers, and strategists—all powered by AI. No hiring, no management, no overhead."
    },
    {
      emoji: "📢",
      title: "Affiliate Network",
      description: "Connect with marketers who promote your product on commission. Only pay for results, not promises."
    },
    {
      emoji: "🎨",
      title: "Complete Content Suite",
      description: "Blog posts, emails, social media, ads, landing pages—all created automatically and on-brand."
    },
    {
      emoji: "📊",
      title: "Real-Time Analytics",
      description: "See exactly what's working. Track clicks, conversions, and ROI across all campaigns."
    },
    {
      emoji: "⚡",
      title: "Launch in Minutes",
      description: "Add your product URL and go live. No complex setup, no technical knowledge required."
    },
    {
      emoji: "🛡️",
      title: "Compliance Built-In",
      description: "All content is FTC-compliant automatically. Legal peace of mind included."
    }
  ];

  const benefits = [
    "Save $5K-10K/month vs hiring an agency",
    "Launch marketing campaigns in hours, not weeks",
    "Get professional content without hiring writers",
    "Only pay affiliates when they drive sales",
    "Scale your marketing without scaling your team",
    "Track every dollar spent and earned",
    "Generate unlimited content variations",
    "No long-term contracts or commitments"
  ];

  const comparison = [
    { 
      category: "Monthly Cost",
      traditional: "$5,000 - $10,000",
      blitz: "Starting at $0",
      emoji: "💰"
    },
    {
      category: "Time to Launch",
      traditional: "2-4 weeks",
      blitz: "Same day",
      emoji: "⚡"
    },
    {
      category: "Content Creation",
      traditional: "Hours per piece",
      blitz: "Minutes per piece",
      emoji: "⏱️"
    },
    {
      category: "Team Needed",
      traditional: "5-10 people",
      blitz: "Just you + AI",
      emoji: "👥"
    }
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
              Your Marketing Team.<br />Powered by AI.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Blitz gives small businesses the marketing power of enterprise companies—without the enterprise budget. Launch campaigns, create content, and reach customers on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg border border-gray-700 transition-all duration-300">
                See Demo 🎬
              </button>
            </div>
            <p className="text-gray-400 text-sm">No credit card required • Setup in 5 minutes</p>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">We Solve Real Business Problems</h2>
          <p className="text-xl text-gray-400">Stop struggling with marketing. Start growing.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painPoints.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
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
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">90%</div>
            <div className="text-gray-400 mt-2">Lower Cost vs Agencies</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">⚡</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">24/7</div>
            <div className="text-gray-400 mt-2">AI Working For You</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="text-5xl mb-3">📈</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">5 min</div>
            <div className="text-gray-400 mt-2">To Launch Campaigns</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Traditional vs Blitz</h2>
          <p className="text-xl text-gray-400">See the difference for yourself</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-800/50 border-b border-gray-700 font-bold">
            <div className="text-gray-400"></div>
            <div className="text-center text-gray-400">Traditional Marketing</div>
            <div className="text-center text-blue-400">Blitz ✨</div>
          </div>
          
          {comparison.map((row, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 p-6 border-b border-gray-700/50 last:border-b-0 items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{row.emoji}</span>
                <span className="font-semibold">{row.category}</span>
              </div>
              <div className="text-center text-gray-400">{row.traditional}</div>
              <div className="text-center text-green-400 font-bold">{row.blitz}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Grow</h2>
          <p className="text-xl text-gray-400">Your complete marketing automation platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Get Started in 3 Steps</h2>
          <p className="text-xl text-gray-400">From signup to sales in under an hour</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-8 border border-blue-700/50 h-full">
              <div className="text-6xl mb-6">1️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Add Your Product</h3>
              <p className="text-gray-300">
                Paste your website URL. Our AI analyzes your product, extracts key info, and creates your marketing profile.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-8 border border-purple-700/50 h-full">
              <div className="text-6xl mb-6">2️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Generate Content</h3>
              <p className="text-gray-300">
                Choose what you need—blog posts, emails, social media, ads. AI creates professional content instantly.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-8 border border-green-700/50 h-full">
              <div className="text-6xl mb-6">3️⃣</div>
              <h3 className="text-2xl font-bold mb-4">Deploy & Grow</h3>
              <p className="text-gray-300">
                Publish content, activate affiliates, track results. Watch your business grow while you focus on what you do best.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-12 border border-blue-700/30">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Small Businesses Choose Blitz</h2>
            <p className="text-xl text-gray-300">Marketing shouldn't be complicated or expensive</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 flex-shrink-0 mt-1" size={24} />
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
              Most small businesses spend $60K-120K/year on marketing. With Blitz, you get better results for a fraction of the cost.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-8 border border-red-700/30">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">Traditional Approach</h3>
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
              <h3 className="text-2xl font-bold mb-4 text-green-400">Blitz Approach</h3>
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
            <p className="text-2xl font-bold text-green-400">Save over $150,000 per year 💰</p>
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
            Join thousands of small businesses growing faster with AI-powered marketing automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl">
              Start Free Trial →
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Talk to Sales 📞
            </button>
          </div>
          <p className="text-white/80 mt-6 text-sm">Free forever plan • No credit card needed • Setup in 5 minutes</p>
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