"use client";

import { AuthGate } from "src/components/AuthGate";
import Link from "next/link";
import { Check } from "lucide-react";

export default function SubscribePage() {
  return (
    <AuthGate requiredRole="user">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upgrade to Pro Affiliate
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Unlock the full potential of Blitz with Pro features designed for
              serious Marketers
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-blue-500 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Pro Affiliate</h2>
                <div className="mb-4">
                  <span className="text-5xl font-bold">$29</span>
                  <span className="text-xl">/month</span>
                </div>
                <p className="text-blue-100">Billed monthly • Cancel anytime</p>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Create campaigns from any product URL
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Access to all affiliate platforms
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Priority support
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Advanced analytics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Unlimited campaigns
                    </span>
                  </li>
                </ul>

                {/* Coming Soon Badge */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Coming Soon
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Billing system is currently being integrated
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  disabled
                  className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg cursor-not-allowed opacity-75"
                >
                  Subscribe - Coming Soon
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Need immediate access? Contact support to join the waitlist
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Standard vs Pro Comparison
            </h3>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-gray-700 dark:text-gray-300">
                      Feature
                    </th>
                    <th className="pb-3 text-center text-gray-700 dark:text-gray-300">
                      Standard
                    </th>
                    <th className="pb-3 text-center text-gray-700 dark:text-gray-300">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      Campaigns from Product Library
                    </td>
                    <td className="py-3 text-center text-green-600 dark:text-green-400">
                      ✓
                    </td>
                    <td className="py-3 text-center text-green-600 dark:text-green-400">
                      ✓
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      Campaigns from Any URL
                    </td>
                    <td className="py-3 text-center text-red-600 dark:text-red-400">
                      ✗
                    </td>
                    <td className="py-3 text-center text-green-600 dark:text-green-400">
                      ✓
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      Affiliate Platforms
                    </td>
                    <td className="py-3 text-center text-red-600 dark:text-red-400">
                      Limited
                    </td>
                    <td className="py-3 text-center text-green-600 dark:text-green-400">
                      All
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      Support
                    </td>
                    <td className="py-3 text-center text-gray-600 dark:text-gray-400">
                      Standard
                    </td>
                    <td className="py-3 text-center text-green-600 dark:text-green-400">
                      Priority
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
