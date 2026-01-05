"use client";
import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { marketingPlanData } from "src/config/marketingPlanData";
import { toast } from "sonner";

export default function MarketingCalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCampaignId = searchParams.get("campaign");
  const urlCompletedDay = searchParams.get("completedDay");

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  // Load completed days from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("completedDays");
    if (saved) {
      try {
        const daysArray = JSON.parse(saved);
        setCompletedDays(new Set(daysArray));
      } catch (e) {
        console.error("Failed to parse completed days from localStorage");
      }
    }
  }, []);

  // Handle URL parameter for newly completed day
  useEffect(() => {
    if (urlCompletedDay) {
      const dayNumber = Number(urlCompletedDay);
      if (dayNumber && !completedDays.has(dayNumber)) {
        const newCompleted = new Set(completedDays).add(dayNumber);
        setCompletedDays(newCompleted);
        localStorage.setItem("completedDays", JSON.stringify([...newCompleted]));
        toast.success(`Day ${dayNumber} marked as completed! 🎉`, {
          duration: 3000,
        });
      }
      // Clean up URL parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete("completedDay");
      router.replace(`/marketing-calendar?${params.toString()}`, { scroll: false });
    }
  }, [urlCompletedDay, completedDays, router, searchParams]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleGenerateContent = (
    campaignId: number | null,
    contentType: string,
    marketingAngle: string,
    day: number,
    details: string
  ) => {
    if (!campaignId) {
      toast.error("Please select a campaign first");
      return;
    }

    // Map content types to the appropriate type parameter
    let typeParam = "text";
    let specificType = contentType.toLowerCase();

    if (contentType === "Image") {
      typeParam = "images";
      specificType = "image";
    } else if (contentType === "Video") {
      typeParam = "video";
      specificType = "video_script";
    } else {
      typeParam = "text";
      // Map content type names to the format expected by the content generator
      if (contentType === "Email") specificType = "email";
      if (contentType === "Social Post") specificType = "social_post";
      if (contentType === "Article") specificType = "article";
    }

    // Build URL with parameters
    const params = new URLSearchParams({
      campaign: campaignId.toString(),
      type: typeParam,
      contentType: specificType,
      marketingAngle: marketingAngle.toLowerCase().replace(/\s+/g, "_"),
      day: day.toString(),
      context: details,
    });

    // Navigate to content page with pre-populated parameters
    router.push(`/content?${params.toString()}`);
  };

  const handleGenerateAll = (campaignId: number | null, day: number, dayData: any) => {
    if (!campaignId) {
      toast.error("Please select a campaign first");
      return;
    }

    // Build queue parameter with all content pieces
    const contentQueue = dayData.contentToCreate.map((content: any) => ({
      type: content.type,
      details: content.details,
    }));

    const params = new URLSearchParams({
      campaign: campaignId.toString(),
      day: day.toString(),
      marketingAngle: dayData.marketingAngle.toLowerCase().replace(/\s+/g, "_"),
      context: dayData.description,
      queue: JSON.stringify(contentQueue),
    });

    // Navigate to content page with queue
    router.push(`/content?${params.toString()}`);
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
          {completedDays.size > 0 && (
            <div className="text-right">
              <div className="text-sm text-[var(--text-secondary)]">Progress</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedDays.size}/21
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Days Completed</div>
            </div>
          )}
        </div>

        {/* Campaign Selection */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Select Campaign
          </h2>
          <CampaignSelector
            selectedCampaignId={selectedCampaignId}
            onSelect={(id) => {
              setSelectedCampaignId(id);
              if (id) {
                toast.success("Campaign selected for marketing calendar");
              }
            }}
            label="Campaign *"
            placeholder="Select a campaign to generate specific content..."
            showAllOption={false}
          />
          {selectedCampaignId && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold">✓ Campaign selected!</span>{" "}
                Click "Generate" on any content suggestion below to auto-create content using this campaign's intelligence data.
              </p>
            </div>
          )}
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
              const isCompleted = completedDays.has(dayData.day);

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

              // Add subtle overlay for completed days
              if (isCompleted) {
                bgColor = isLaunch
                  ? "bg-green-100 dark:bg-green-800/40"
                  : isPostLaunch
                  ? "bg-orange-100 dark:bg-orange-800/40"
                  : "bg-blue-100 dark:bg-blue-800/40";
              }

              return (
                <button
                  key={dayData.day}
                  onClick={() => handleDayClick(dayData.day)}
                  className={`
                    ${bgColor}
                    ${borderColor}
                    border-2 rounded-lg p-4 transition-all duration-200 relative
                    ${isSelected ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900" : ""}
                    ${isCompleted ? "opacity-90" : ""}
                    hover:scale-105 hover:shadow-md
                  `}
                >
                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className={`text-sm font-semibold ${textColor} mb-1`}>
                    {isLaunch ? "🚀" : isPostLaunch ? "🔥" : "📝"}
                  </div>
                  <div className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    Day {dayData.day}
                    {isCompleted && <span className="ml-1 text-green-600 dark:text-green-400">✓</span>}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] text-left">
                    {dayData.title}
                  </div>
                  {isCompleted && (
                    <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                      ✓ Completed
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <DayDetails
            day={selectedDay}
            data={marketingPlanData[selectedDay - 1]}
            selectedCampaignId={selectedCampaignId}
            onGenerateContent={handleGenerateContent}
            onGenerateAll={handleGenerateAll}
          />
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

function DayDetails({
  day,
  data,
  selectedCampaignId,
  onGenerateContent,
  onGenerateAll,
}: {
  day: number;
  data: any;
  selectedCampaignId: number | null;
  onGenerateContent: (
    campaignId: number | null,
    contentType: string,
    marketingAngle: string,
    day: number,
    details: string
  ) => void;
  onGenerateAll: (
    campaignId: number | null,
    day: number,
    dayData: any
  ) => void;
}) {
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center">
              <span className="mr-2">📋</span>
              Content to Create
            </h3>
            {selectedCampaignId && (
              <button
                onClick={() => onGenerateAll(selectedCampaignId, day, data)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <span>Generate All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
          <div className="space-y-3">
            {data.contentToCreate.map((content: any, idx: number) => (
              <div key={idx} className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)] flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)] text-sm mb-1">
                    {content.type}
                  </div>
                  <div className="text-[var(--text-secondary)] text-sm">{content.details}</div>
                </div>
                <button
                  onClick={() =>
                    onGenerateContent(
                      selectedCampaignId,
                      content.type,
                      data.marketingAngle,
                      day,
                      content.details
                    )
                  }
                  disabled={!selectedCampaignId}
                  className={`
                    ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${selectedCampaignId
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  Generate
                </button>
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
