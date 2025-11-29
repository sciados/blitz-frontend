"use client";

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { EmailSignupForm } from 'src/components/EmailSignupForm';

export default function Home() {
  const [email, setEmail] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  const audiences = [
    {
      id: 'product-dev',
      emoji: '🎯',
      title: 'Product Developer',
      description: 'I want affiliates to promote my products'
    },
    {
      id: 'affiliate',
      emoji: '💰',
      title: 'Affiliate Marketer',
      description: 'I want to earn promoting products'
    },
    {
      id: 'business',
      emoji: '🚀',
      title: 'Business Owner',
      description: 'I need AI marketing automation'
    }
  ];

  const features = [
    { emoji: '🤖', text: 'AI-Powered Content Generation' },
    { emoji: '📊', text: 'Real-Time Analytics & Tracking' },
    { emoji: '🎨', text: 'Professional Image Creation' },
    { emoji: '✅', text: 'Automatic FTC Compliance' },
    { emoji: '⚡', text: 'Launch Campaigns in Minutes' },
    { emoji: '🔗', text: 'Smart Link Tracking & Attribution' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-600/30 rounded-full px-6 py-2 mb-8">
            <Sparkles className="text-purple-400" size={20} />
            <span className="text-purple-300 font-semibold">Coming Soon</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Blitz
            </span>
          </h1>

          <p className="text-2xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
            AI-Powered Marketing Automation
          </p>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
            The platform that connects Product Creators, Affiliate Marketers, and Business Owners through intelligent automation.
          </p>
        </div>

        {/* Three Columns - Who It's For */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-2xl p-8 border border-purple-700/30 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Product Developers</h3>
            <p className="text-gray-300">
              Get your products promoted by a network of affiliates. AI handles intelligence gathering and performance tracking.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-2xl p-8 border border-green-700/30 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">Affiliate Marketers</h3>
            <p className="text-gray-300">
              Create professional campaigns in minutes. AI generates articles, emails, videos, social posts, and images.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-2xl p-8 border border-blue-700/30 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-3">Business Owners</h3>
            <p className="text-gray-300">
              Your AI marketing team. Generate content, manage campaigns, and grow—without the agency price tag.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What's Inside</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
                <span className="text-4xl">{feature.emoji}</span>
                <span className="text-gray-200">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Selection */}
        {!showSignupForm ? (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 border border-gray-700 shadow-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Be First in Line
              </h2>
              <p className="text-center text-gray-300 mb-8">
                Get early access and exclusive launch bonuses. Select your role to continue.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {audiences.map((audience) => (
                  <button
                    key={audience.id}
                    onClick={() => setShowSignupForm(audience.id)}
                    className="p-6 rounded-xl border-2 border-gray-700 bg-gray-800/50 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-center"
                  >
                    <div className="text-4xl mb-3">{audience.emoji}</div>
                    <div className="font-bold text-sm mb-2">{audience.title}</div>
                    <div className="text-xs text-gray-400">{audience.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mb-12">
            <button
              onClick={() => setShowSignupForm(false)}
              className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
            >
              ← Back to audience selection
            </button>
            <EmailSignupForm
              audienceType={showSignupForm as "business" | "affiliate" | "product-dev"}
              source="coming-soon-homepage"
              buttonText="Join the Waitlist"
              variant="default"
            />
          </div>
        )}

        {/* Stats/Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">2 min</div>
            <div className="text-sm text-gray-400">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🤖</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">8+</div>
            <div className="text-sm text-gray-400">Content Types</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">90%</div>
            <div className="text-sm text-gray-400">Cost Savings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">100%</div>
            <div className="text-sm text-gray-400">FTC Compliant</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-gray-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500">
          <p className="mb-2">© 2024 Blitz. Simplify marketing, amplify results.</p>
          <p className="text-sm">Built with ❤️ for creators, marketers, and entrepreneurs</p>
        </div>
      </div>
    </div>
  );
}
