"use client";
import { AuthGate } from "src/components/AuthGate";
import { useState } from "react";
import { marketingPlanData } from "src/config/marketingPlanData";

export default function MarketingCalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              📅 21-Day Marketing Campaign Calendar
            </h1>
            <p className="text-[var(--text-secondary)]">
              Select any day to view detailed content recommendations and marketing strategies
            </p>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Campaign Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">
                Pre-Launch Phase
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">Days 1-13</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Build Awareness → Interest → Desire
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-1">
                Launch Day
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">Day 14</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Maximum Conversion Push
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-orange-600 dark:text-orange-400 font-semibold mb-1">
                Post-Launch Phase
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">Days 15-21</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Urgency → Scarcity → Final Conversion
              </div>
            </div>
          </div>
        </div>

        {/* 21-Day Calendar Grid */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Select a Day
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {marketingPlanData.map((dayData) => {
              const isSelected = selectedDay === dayData.day;
              const isPreLaunch = dayData.day <= 13;
              const isLaunch = dayData.day === 14;
              const isPostLaunch = dayData.day >= 15;

              let bgColor = "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40";
              let borderColor = "border-blue-200 dark:border-blue-800";
              let textColor = "text-blue-600 dark:text-blue-400";

              if (isLaunch) {
                bgColor = "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40";
                borderColor = "border-green-200 dark:border-green-800";
                textColor = "text-green-600 dark:text-green-400";
              } else if (isPostLaunch) {
                bgColor = "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40";
                borderColor = "border-orange-200 dark:border-orange-800";
                textColor = "text-orange-600 dark:text-orange-400";
              }

              if (isSelected) {
                bgColor = isLaunch
                  ? "bg-green-200 dark:bg-green-800/60"
                  : isPostLaunch
                  ? "bg-orange-200 dark:bg-orange-800/60"
                  : "bg-blue-200 dark:bg-blue-800/60";
              }

              return (
                <button
                  key={dayData.day}
                  onClick={() => handleDayClick(dayData.day)}
                  className={`
                    ${bgColor}
                    ${borderColor}
                    border-2 rounded-lg p-4 transition-all duration-200
                    ${isSelected ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900" : ""}
                    hover:scale-105 hover:shadow-md
                  `}
                >
                  <div className={`text-sm font-semibold ${textColor} mb-1`}>
                    {isLaunch ? "🚀" : isPostLaunch ? "🔥" : "📝"}
                  </div>
                  <div className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    Day {dayData.day}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] text-left">
                    {dayData.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <DayDetails day={selectedDay} data={marketingPlanData[selectedDay - 1]} />
        )}

        {/* Marketing Angles Reference */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Marketing Angles Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Problem/Solution", icon: "🎯", desc: "Identify pain, present fix" },
              { name: "Transformation", icon: "✨", desc: "Show before/after results" },
              { name: "Social Proof", icon: "👥", desc: "Build credibility with testimonials" },
              { name: "Authority", icon: "👑", desc: "Establish expertise and trust" },
              { name: "Comparison", icon: "⚖️", desc: "Show why this product wins" },
              { name: "Story", icon: "📖", desc: "Create emotional connection" },
              { name: "Scarcity", icon: "⏰", desc: "Create urgency and FOMO" },
              { name: "Value", icon: "💎", desc: "Show total value received" },
              { name: "Trust", icon: "🤝", desc: "Address objections" },
            ].map((angle) => (
              <div
                key={angle.name}
                className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">{angle.icon}</span>
                  <span className="font-semibold text-[var(--text-primary)] text-sm">
                    {angle.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{angle.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Pro Tips for Success
          </h2>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Follow the sequence - each day builds on the previous</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Customize content with your product's specific details</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Track metrics daily to optimize your campaign</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Always include affiliate disclosures for compliance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Engage personally with your audience throughout</span>
            </li>
          </ul>
        </div>
      </div>
    </AuthGate>
  );
}

function DayDetails({ day, data }: { day: number; data: any }) {
  const isPreLaunch = day <= 13;
  const isLaunch = day === 14;
  const isPostLaunch = day >= 15;

  const phaseColor = isLaunch
    ? "text-green-600 dark:text-green-400"
    : isPostLaunch
    ? "text-orange-600 dark:text-orange-400"
    : "text-blue-600 dark:text-blue-400";

  const phaseBg = isLaunch
    ? "bg-green-50 dark:bg-green-900/20"
    : isPostLaunch
    ? "bg-orange-50 dark:bg-orange-900/20"
    : "bg-blue-50 dark:bg-blue-900/20";

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`text-2xl ${isLaunch ? "🚀" : isPostLaunch ? "🔥" : "📝"}`}></span>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Day {day}: {data.title}
            </h2>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${phaseBg} ${phaseColor}`}>
            {isPreLaunch ? "Pre-Launch Phase" : isLaunch ? "Launch Day" : "Post-Launch Phase"}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${phaseBg} ${phaseColor}`}>
          {data.journeyStage}
        </div>
      </div>

      <p className="text-[var(--text-secondary)] mb-6">{data.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content to Create */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <span className="mr-2">📋</span>
            Content to Create
          </h3>
          <div className="space-y-3">
            {data.contentToCreate.map((content: any, idx: number) => (
              <div key={idx} className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
                <div className="font-semibold text-[var(--text-primary)] text-sm mb-1">
                  {content.type}
                </div>
                <div className="text-[var(--text-secondary)] text-sm">{content.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Angle */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Marketing Angle
          </h3>
          <div className={`${phaseBg} p-4 rounded-lg mb-4`}>
            <div className={`font-semibold ${phaseColor} mb-2`}>{data.marketingAngle}</div>
            <div className="text-[var(--text-secondary)] text-sm">{data.marketingAngleDesc}</div>
          </div>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Primary Goal
          </h3>
          <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
            <div className="text-[var(--text-primary)] text-sm">{data.primaryGoal}</div>
          </div>
        </div>
      </div>

      {/* CTA Direction */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
          <span className="mr-2">➡️</span>
          CTA Direction
        </h3>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-[var(--text-primary)] font-medium">{data.ctaDirection}</div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Success Metrics
        </h3>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.successMetrics).map(([key, value]) => (
              <div key={key}>
                <div className="text-xs text-[var(--text-secondary)] mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{value as string}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
