"use client";
import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { marketingPlanData } from "src/config/marketingPlanData";
import { toast } from "sonner";
import { api } from "src/lib/appClient";

// Calendar config type from backend
interface CalendarConfig {
  total_days: number;
  pre_launch_days: number;
  launch_day_index: number;
  post_launch_days: number;
  day_mapping: Array<{
    calendar_day: number;
    default_day: number;
    phase: string;
    content_focus: string;
  }>;
  computed_at: string;
}

export default function MarketingCalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCampaignId = searchParams.get("campaign");
  const urlCompletedDay = searchParams.get("completedDay");

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );
  // Track generated content per day - Map<day, Set<contentType>>
  const [generatedContentByDay, setGeneratedContentByDay] = useState<Map<number, Set<string>>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  // Dynamic calendar config
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [launchDate, setLaunchDate] = useState<string | null>(null);

  // Fetch calendar config when campaign is selected
  useEffect(() => {
    const fetchCalendarConfig = async () => {
      if (!selectedCampaignId) {
        setCalendarConfig(null);
        setLaunchDate(null);
        return;
      }

      setIsLoadingConfig(true);
      try {
        const response = await api.get(`/api/calendar/config/${selectedCampaignId}`);
        setCalendarConfig(response.data.calendar_config);
        setLaunchDate(response.data.launch_date);
        console.log("Calendar config loaded:", response.data);
      } catch (error: any) {
        console.error("Failed to load calendar config:", error);
        // Fall back to default 21-day calendar
        setCalendarConfig(null);
        setLaunchDate(null);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchCalendarConfig();
  }, [selectedCampaignId]);

  // Get effective calendar days based on config
  const getCalendarDays = () => {
    if (!calendarConfig || !calendarConfig.day_mapping) {
      // Default: use full marketingPlanData
      return marketingPlanData;
    }

    // Map calendar config to day data
    return calendarConfig.day_mapping.map((mapping) => {
      // Get the default day's content from marketingPlanData
      const defaultDayData = marketingPlanData.find(d => d.day === mapping.default_day) || marketingPlanData[0];
      return {
        ...defaultDayData,
        day: mapping.calendar_day, // Use the calendar day number
        phase: mapping.phase,
        content_focus: mapping.content_focus,
        originalDay: mapping.default_day // Track which default day this maps to
      };
    });
  };

  // Get total days for display
  const getTotalDays = () => calendarConfig?.total_days || 21;

  // Get launch day index
  const getLaunchDayIndex = () => calendarConfig?.launch_day_index || 14;

  // Get pre-launch days count
  const getPreLaunchDays = () => calendarConfig?.pre_launch_days || 13;

  // Load generated content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("generatedContentByDay");
    if (saved) {
      try {
        const contentMap = JSON.parse(saved);
        const map = new Map<number, Set<string>>();
        Object.entries(contentMap).forEach(([day, items]) => {
          map.set(Number(day), new Set(items as string[]));
        });
        setGeneratedContentByDay(map);
      } catch (e) {
        console.error("Failed to parse generated content from localStorage");
      }
    }

    // Clean up old localStorage key
    const oldKey = localStorage.getItem("completedDays");
    if (oldKey) {
      localStorage.removeItem("completedDays");
    }
  }, []);

  // Helper function to check if a day is fully completed (all 4 content items generated)
  const isDayFullyCompleted = (dayNumber: number): boolean => {
    const generatedContent = generatedContentByDay.get(dayNumber) || new Set();
    // Each day should have 4 content items: Email, Social Post, Image, Video
    return generatedContent.size >= 4;
  };

  // Helper function to add generated content for a day
  const addGeneratedContent = (dayNumber: number, contentType: string) => {
    setGeneratedContentByDay(prev => {
      const newMap = new Map(prev);
      const existing = new Set(newMap.get(dayNumber) || []);
      existing.add(contentType);
      newMap.set(dayNumber, existing);

      // Save to localStorage
      const plainObject: Record<string, string[]> = {};
      newMap.forEach((value, key) => {
        plainObject[key.toString()] = Array.from(value);
      });
      localStorage.setItem("generatedContentByDay", JSON.stringify(plainObject));

      return newMap;
    });
  };

  // Handle URL parameter for newly completed day (legacy support)
  useEffect(() => {
    if (urlCompletedDay) {
      const dayNumber = Number(urlCompletedDay);
      // For backward compatibility, mark the day as having text content generated
      // This handles old URLs from before the fix
      addGeneratedContent(dayNumber, "text_content");

      // Clean up URL parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete("completedDay");
      router.replace(`/marketing-calendar?${params.toString()}`, {
        scroll: false,
      });
    }
  }, [urlCompletedDay, router, searchParams]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  // Build an intelligent image prompt based on campaign data
  const buildImagePrompt = async (
    campaignId: number,
    contentType: string,
    marketingAngle: string,
    context: string
  ) => {
    try {
      // Fetch campaign intelligence from backend
      const response = await api.get(`/api/campaigns/${campaignId}`);
      const campaign = response.data;

      // Get campaign intelligence
      let intelligenceData: any = null;
      try {
        const intelResponse = await api.get(
          `/api/intelligence/campaigns/${campaignId}/intelligence`
        );
        intelligenceData = intelResponse.data;
      } catch (error) {
        console.log("No intelligence data available");
        toast.error(
          "No intelligence data found. Please compile campaign intelligence first.",
          { id: "build-prompt" }
        );
      }

      // Build structured prompt using universal template format
      const promptParts = [];

      // [Subject] - Make it product-specific using campaign intelligence
      let subject = "Marketing image";
      const productName = campaign?.name || intelligenceData?.product?.product_name || "Product";

      if (contentType.toLowerCase().includes("hero")) {
        subject = `Hero banner featuring ${productName}`;
      } else if (contentType.toLowerCase().includes("social")) {
        subject = `Social media post image for ${productName}`;
      } else if (contentType.toLowerCase().includes("ad")) {
        subject = `Advertisement creative showcasing ${productName}`;
      } else {
        subject = `Marketing image for ${productName}`;
      }
      promptParts.push(`[Subject]\n${subject}`);

      // [Core Content] - Include comprehensive product details
      const coreContent = [];

      // Product Information
      if (campaign?.name || intelligenceData?.product?.product_name) {
        const product = campaign?.name || intelligenceData?.product?.product_name;
        coreContent.push(`Product/Service: ${product}`);
      }

      // Product Category
      if (intelligenceData?.product?.category) {
        coreContent.push(`Category: ${intelligenceData.product.category}`);
      }

      // Key Benefits
      if (intelligenceData?.product?.benefits) {
        const topBenefits = intelligenceData.product.benefits.slice(0, 3);
        if (topBenefits.length > 0) {
          coreContent.push(`Key benefits: ${topBenefits.join(", ")}`);
        }
      }

      // Unique Selling Points
      if (intelligenceData?.product?.unique_selling_points) {
        const usps = intelligenceData.product.unique_selling_points.slice(0, 2);
        if (usps.length > 0) {
          coreContent.push(`Unique selling points: ${usps.join(", ")}`);
        }
      }

      // Pain Points Addressed
      if (intelligenceData?.market?.pain_points) {
        const topPainPoints = intelligenceData.market.pain_points.slice(0, 2);
        if (topPainPoints.length > 0) {
          coreContent.push(`Addresses: ${topPainPoints.join(", ")}`);
        }
      }

      // Target Audience
      if (intelligenceData?.market?.target_audience?.demographics) {
        coreContent.push(`Target audience: ${intelligenceData.market.target_audience.demographics}`);
      }

      // Product Features (for physical products)
      if (intelligenceData?.product?.features) {
        const topFeatures = intelligenceData.product.features.slice(0, 3);
        if (topFeatures.length > 0) {
          coreContent.push(`Key features: ${topFeatures.join(", ")}`);
        }
      }

      // Ingredients (for supplements/cosmetics)
      if (intelligenceData?.product?.ingredients) {
        const topIngredients = intelligenceData.product.ingredients.slice(0, 3);
        if (topIngredients.length > 0) {
          coreContent.push(`Key ingredients: ${topIngredients.join(", ")}`);
        }
      }

      // Marketing Focus
      if (context) {
        coreContent.push(`Focus: ${context}`);
      }

      if (coreContent.length > 0) {
        promptParts.push(`[Core Content]\n${coreContent.join("\n")}`);
      }

      // [Style & Aesthetic]
      let styleAesthetic = "Professional, modern, clean, high-quality";
      if (marketingAngle === "problem_solution") {
        styleAesthetic =
          "Professional, solution-focused, clean, trustworthy, medical-grade";
      } else if (marketingAngle === "transformation") {
        styleAesthetic =
          "Before/after style, results-focused, inspiring, dramatic transformation";
      } else if (marketingAngle === "social_proof") {
        styleAesthetic = "Clean, testimonial-style, trustworthy, authentic";
      }
      promptParts.push(`[Style & Aesthetic]\n${styleAesthetic}`);

      // [Color Palette]
      promptParts.push(
        `[Color Palette]\nProfessional color scheme with good contrast, brand-appropriate colors`
      );

      // [Composition & Layout]
      let composition =
        "Well-balanced composition, centered focal point, clear hierarchy";
      if (contentType.toLowerCase().includes("hero")) {
        composition =
          "Wide banner format, clear focal point, text-friendly layout";
      } else if (contentType.toLowerCase().includes("social")) {
        composition =
          "Square or vertical format, social media optimized, eye-catching";
      }
      promptParts.push(`[Composition & Layout]\n${composition}`);

      // [Background]
      promptParts.push(
        `[Background]\nClean, professional background that doesn't compete with main subject`
      );

      // [Technical Constraints]
      promptParts.push(
        `[Technical Constraints]\nHigh resolution, print and web ready, scalable design`
      );

      // [Negative Constraints]
      promptParts.push(
        `[Negative Constraints]\nNo cluttered design, no low-quality elements, no irrelevant imagery, NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS, NO TYPOGRAPHY, NO EMBEDDED TEXT, no text overlays, no captions, no writing of any kind`
      );

      return promptParts.join("\n\n");
    } catch (error) {
      console.error("Error building image prompt:", error);
      // Fallback to structured prompt
      return `[Subject]\nMarketing image\n\n[Core Content]\n${contentType} for ${marketingAngle.replace(
        /_/g,
        " "
      )} campaign\n\n[Style & Aesthetic]\nProfessional, modern, clean, high-quality\n\n[Color Palette]\nProfessional color scheme with good contrast\n\n[Composition & Layout]\nWell-balanced composition, centered focal point\n\n[Background]\nClean, professional background\n\n[Technical Constraints]\nHigh resolution, print and web ready\n\n[Negative Constraints]\nNo cluttered design, no low-quality elements, NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS, NO TYPOGRAPHY, NO EMBEDDED TEXT`;
    }
  };

  const handleGenerateContent = async (
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
      marketingAngle: marketingAngle
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/\//g, "_"),
      day: day.toString(),
      context: details,
    });

    // For images, build an intelligent prompt and add it to URL
    if (contentType === "Image") {
      try {
        toast.loading("Building intelligent image prompt...", {
          id: "build-prompt",
        });
        const imagePrompt = await buildImagePrompt(
          campaignId,
          contentType,
          marketingAngle,
          details
        );
        params.set("custom_prompt", imagePrompt);
        toast.success("Image prompt generated!", { id: "build-prompt" });
      } catch (error) {
        console.error("Error building image prompt:", error);
        toast.error(
          "Could not build prompt, but you can still edit it manually",
          { id: "build-prompt" }
        );
      }
    }

    // Navigate to content page with pre-populated parameters
    router.push(`/content?${params.toString()}`);
  };

  const handleGenerateAll = (
    campaignId: number | null,
    day: number,
    dayData: any
  ) => {
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
      marketingAngle: dayData.marketingAngle
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/\//g, "_"),
      context: dayData.description,
      queue: JSON.stringify(contentQueue),
    });

    // Navigate to content page with queue
    router.push(`/content?${params.toString()}`);
  };

  // New handler using calendar-driven API
  const handleAutoGenerate = async (
    campaignId: number | null,
    contentType: string,
    marketingAngle: string,
    day: number,
    details: string,
    dayData: any
  ) => {
    if (!campaignId) {
      toast.error("Please select a campaign first");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(`Generating ${contentType}...`);

    try {
      // Map content type to backend format
      let mappedContentType = contentType.toLowerCase();
      if (contentType === "Email") mappedContentType = "email";
      if (contentType === "Email Sequence")
        mappedContentType = "email_sequence";
      if (contentType === "Article") mappedContentType = "article";
      if (contentType === "Social Post") mappedContentType = "social_post";
      if (contentType === "Video") mappedContentType = "video_script";
      if (contentType === "Image") mappedContentType = "image";

      // Map marketing angle
      const mappedAngle = marketingAngle
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/\//g, "_");

      setGenerationProgress("Analyzing campaign intelligence...");
      const response = await api.post("/api/calendar/generate", {
        campaign_id: campaignId,
        day_number: day,
        content_type: mappedContentType,
        marketing_angle: mappedAngle,
        primary_goal: dayData.primaryGoal,
        context: details,
        length: "medium", // Default length
      });

      if (response.data.success) {
        toast.success(
          `✨ ${contentType} generated successfully for Day ${day}!`
        );
        // Track this content type as generated
        addGeneratedContent(day, contentType.toLowerCase());
      } else {
        throw new Error(response.data.error || "Generation failed");
      }
    } catch (error: any) {
      console.error("Auto-generation error:", error);
      toast.error(
        error?.response?.data?.detail || `Failed to generate ${contentType}`
      );
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  // New handler for batch auto-generation
  const handleAutoGenerateAll = async (
    campaignId: number | null,
    day: number,
    dayData: any
  ) => {
    if (!campaignId) {
      toast.error("Please select a campaign first");
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress("Starting batch generation...");

    try {
      // Prepare batch items
      const batchItems = dayData.contentToCreate.map((content: any) => {
        let mappedContentType = content.type.toLowerCase();
        if (content.type === "Email") mappedContentType = "email";
        if (content.type === "Email Sequence")
          mappedContentType = "email_sequence";
        if (content.type === "Article") mappedContentType = "article";
        if (content.type === "Social Post") mappedContentType = "social_post";
        if (content.type === "Video") mappedContentType = "video_script";
        if (content.type === "Image") mappedContentType = "image";

        const mappedAngle = dayData.marketingAngle
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/\//g, "_");

        return {
          campaign_id: campaignId,
          day_number: day,
          content_type: mappedContentType,
          marketing_angle: mappedAngle,
          primary_goal: dayData.primaryGoal,
          context: content.details,
          length: "medium",
        };
      });

      // Filter to only text content (images and videos need manual generation)
      const textBatchItems = batchItems.filter((item: any) => {
        const contentType = item.content_type.toLowerCase();
        return !contentType.includes("image") && contentType !== "video_script";
      });

      if (textBatchItems.length === 0) {
        toast.warning(
          "No text content available for auto-generation. Images and videos must be created manually."
        );
        return;
      }

      setGenerationProgress(
        `Generating ${textBatchItems.length} text content pieces...`
      );
      const response = await api.post("/api/calendar/generate/batch", {
        campaign_id: campaignId,
        items: textBatchItems,
      });

      if (response.data.successful === textBatchItems.length) {
        toast.success(
          `🎉 All ${textBatchItems.length} text content pieces generated successfully for Day ${day}! Images and videos can be created manually.`
        );
        // Track all text content types as generated
        textBatchItems.forEach((item: any) => {
          addGeneratedContent(day, item.content_type.toLowerCase());
        });
      } else if (response.data.successful > 0) {
        toast.warning(
          `⚠️ Generated ${response.data.successful}/${textBatchItems.length} text content pieces for Day ${day}`
        );
        // Track only the successfully generated content
        // Note: We don't have the list of successful items from the response,
        // so we'll track based on the batch items
        textBatchItems.slice(0, response.data.successful).forEach((item: any) => {
          addGeneratedContent(day, item.content_type.toLowerCase());
        });
      } else {
        throw new Error("No content was generated");
      }
    } catch (error: any) {
      console.error("Batch auto-generation error:", error);
      toast.error(
        error?.response?.data?.detail ||
          `Failed to generate content for Day ${day}`
      );
    } finally {
      setIsGeneratingAll(false);
      setGenerationProgress("");
    }
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              📅 {getTotalDays()}-Day Marketing Campaign Calendar
            </h1>
            <p className="text-[var(--text-secondary)]">
              {calendarConfig && calendarConfig.total_days < 21
                ? "Optimized calendar based on your launch timeline"
                : "Select any day to view detailed content recommendations and marketing strategies"}
            </p>
            {launchDate && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                🎯 Launch Date: {new Date(launchDate).toLocaleDateString()}
              </p>
            )}
          </div>
          {(() => {
            // Calculate completed days
            const completedDaysCount = Array.from(generatedContentByDay.entries())
              .filter(([day]) => isDayFullyCompleted(day))
              .length;

            return completedDaysCount > 0 && (
              <div className="text-right">
                <div className="text-sm text-[var(--text-secondary)]">
                  Progress
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedDaysCount}/{getTotalDays()}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Days Completed
                </div>
              </div>
            );
          })()}
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
              setSelectedDay(null); // Reset selected day when campaign changes
              if (id) {
                toast.success("Campaign selected for marketing calendar");
              }
            }}
            label="Campaign *"
            placeholder="Select a campaign to generate specific content..."
            showAllOption={false}
          />
          {isLoadingConfig && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-sm text-[var(--text-secondary)]">
                Loading calendar configuration...
              </p>
            </div>
          )}
          {selectedCampaignId && !isLoadingConfig && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold">✓ Campaign selected!</span>{" "}
                {calendarConfig && calendarConfig.total_days < 21 ? (
                  <>Your calendar has been optimized to {calendarConfig.total_days} days based on your launch date.</>
                ) : (
                  <>Click "Generate" on any content suggestion below to auto-create content using this campaign's intelligence data.</>
                )}
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
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                Days 1-{getPreLaunchDays()}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Build Awareness → Interest → Desire
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-1">
                {calendarConfig && calendarConfig.total_days < 21 ? "Pitch Day" : "Launch Day"}
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                Day {getLaunchDayIndex()}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Maximum Conversion Push
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-orange-600 dark:text-orange-400 font-semibold mb-1">
                Post-Launch Phase
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                Days {getLaunchDayIndex() + 1}-{getTotalDays()}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Urgency → Scarcity → Final Conversion
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Calendar Grid */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Select a Day
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {getCalendarDays().map((dayData: any) => {
              const isSelected = selectedDay === dayData.day;
              const launchDay = getLaunchDayIndex();
              const isPreLaunch = dayData.day < launchDay;
              const isLaunch = dayData.day === launchDay;
              const isPostLaunch = dayData.day > launchDay;
              const isCompleted = isDayFullyCompleted(dayData.day);

              let bgColor =
                "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40";
              let borderColor = "border-blue-200 dark:border-blue-800";
              let textColor = "text-blue-600 dark:text-blue-400";

              if (isLaunch) {
                bgColor =
                  "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40";
                borderColor = "border-green-200 dark:border-green-800";
                textColor = "text-green-600 dark:text-green-400";
              } else if (isPostLaunch) {
                bgColor =
                  "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40";
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
                    ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900"
                        : ""
                    }
                    ${isCompleted ? "opacity-90" : ""}
                    hover:scale-105 hover:shadow-md
                  `}
                >
                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}

                  <div className={`text-sm font-semibold ${textColor} mb-1`}>
                    {isLaunch ? "🚀" : isPostLaunch ? "🔥" : "📝"}
                  </div>
                  <div className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    Day {dayData.day}
                    {isCompleted && (
                      <span className="ml-1 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                    )}
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
            onAutoGenerate={handleAutoGenerate}
            onAutoGenerateAll={handleAutoGenerateAll}
            isGenerating={isGenerating}
            isGeneratingAll={isGeneratingAll}
            generationProgress={generationProgress}
            generatedContentByDay={generatedContentByDay}
          />
        )}

        {/* Marketing Angles Reference */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Marketing Angles Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                name: "Problem/Solution",
                icon: "🎯",
                desc: "Identify pain, present fix",
              },
              {
                name: "Transformation",
                icon: "✨",
                desc: "Show before/after results",
              },
              {
                name: "Social Proof",
                icon: "👥",
                desc: "Build credibility with testimonials",
              },
              {
                name: "Authority",
                icon: "👑",
                desc: "Establish expertise and trust",
              },
              {
                name: "Comparison",
                icon: "⚖️",
                desc: "Show why this product wins",
              },
              {
                name: "Story",
                icon: "📖",
                desc: "Create emotional connection",
              },
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
                <p className="text-xs text-[var(--text-secondary)]">
                  {angle.desc}
                </p>
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
              <span>
                Customize content with your product's specific details
              </span>
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
  onAutoGenerate,
  onAutoGenerateAll,
  isGenerating,
  isGeneratingAll,
  generationProgress,
  generatedContentByDay,
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
  onGenerateAll: (campaignId: number | null, day: number, dayData: any) => void;
  onAutoGenerate: (
    campaignId: number | null,
    contentType: string,
    marketingAngle: string,
    day: number,
    details: string,
    dayData: any
  ) => Promise<void>;
  onAutoGenerateAll: (
    campaignId: number | null,
    day: number,
    dayData: any
  ) => Promise<void>;
  isGenerating: boolean;
  isGeneratingAll: boolean;
  generationProgress: string;
  generatedContentByDay: Map<number, Set<string>>;
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
            <span
              className={`text-2xl ${
                isLaunch ? "🚀" : isPostLaunch ? "🔥" : "📝"
              }`}
            ></span>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Day {day}: {data.title}
            </h2>
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${phaseBg} ${phaseColor}`}
          >
            {isPreLaunch
              ? "Pre-Launch Phase"
              : isLaunch
              ? "Launch Day"
              : "Post-Launch Phase"}
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold ${phaseBg} ${phaseColor}`}
        >
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
              <div className="flex items-center space-x-2"></div>
            )}

            {/* Note about Auto-Generate */}
            {selectedCampaignId && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-[var(--text-primary)]">
                  <span className="font-semibold">🤖 Auto-Generate</span>{" "}
                  creates text content only (emails, articles, social posts).
                  <span className="font-semibold"> Images & videos</span> must
                  be created manually using the{" "}
                  <span className="font-semibold">Manual Mode</span> button.
                </p>
              </div>
            )}

            {/* Generation Progress Indicator */}
            {(isGeneratingAll || isGenerating || generationProgress) && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 animate-spin text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {generationProgress || "Generating..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Separate text and visual content */}
          {(() => {
            const textContent = data.contentToCreate.filter((content: any) => {
              const type = content.type.toLowerCase();
              return !type.includes("image") && type !== "video";
            });
            const visualContent = data.contentToCreate.filter(
              (content: any) => {
                const type = content.type.toLowerCase();
                return type.includes("image") || type === "video";
              }
            );

            return (
              <div className="space-y-4">
                {/* Text Content Section */}
                {textContent.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                      <span className="mr-2">📝</span>
                      Text Content (Auto-Generate Available)
                    </h4>
                    <div className="space-y-3">
                      {textContent.map((content: any, idx: number) => (
                        <ContentItem
                          key={idx}
                          content={content}
                          data={data}
                          day={day}
                          selectedCampaignId={selectedCampaignId}
                          isGenerating={isGenerating}
                          isGeneratingAll={isGeneratingAll}
                          onGenerateContent={onGenerateContent}
                          onAutoGenerate={onAutoGenerate}
                          showAutoButton={true}
                          generatedContentByDay={generatedContentByDay}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Content Section */}
                {visualContent.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                      <span className="mr-2">🎨</span>
                      Visual Content (Manual Generation with Smart Prompts)
                    </h4>
                    <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-xs text-[var(--text-primary)]">
                        💡 Clicking{" "}
                        <span className="font-semibold">Manual</span> will open
                        Content Studio with an{" "}
                        <span className="font-semibold">
                          intelligent prompt
                        </span>{" "}
                        pre-filled based on your campaign's intelligence data.
                        You can then customize the Image Type, Style & Aspect
                        Ratio!
                      </p>
                    </div>
                    <div className="space-y-3">
                      {visualContent.map((content: any, idx: number) => (
                        <ContentItem
                          key={idx}
                          content={content}
                          data={data}
                          day={day}
                          selectedCampaignId={selectedCampaignId}
                          isGenerating={isGenerating}
                          isGeneratingAll={isGeneratingAll}
                          onGenerateContent={onGenerateContent}
                          onAutoGenerate={onAutoGenerate}
                          showAutoButton={false}
                          generatedContentByDay={generatedContentByDay}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Marketing Angle */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Marketing Angle
          </h3>
          <div className={`${phaseBg} p-4 rounded-lg mb-4`}>
            <div className={`font-semibold ${phaseColor} mb-2`}>
              {data.marketingAngle}
            </div>
            <div className="text-[var(--text-secondary)] text-sm">
              {data.marketingAngleDesc}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Primary Goal
          </h3>
          <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
            <div className="text-[var(--text-primary)] text-sm">
              {data.primaryGoal}
            </div>
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
          <div className="text-[var(--text-primary)] font-medium">
            {data.ctaDirection}
          </div>
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
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {value as string}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Content item component for rendering individual content pieces
function ContentItem({
  content,
  data,
  day,
  selectedCampaignId,
  isGenerating,
  isGeneratingAll,
  onGenerateContent,
  onAutoGenerate,
  showAutoButton,
  generatedContentByDay,
}: {
  content: any;
  data: any;
  day: number;
  selectedCampaignId: number | null;
  isGenerating: boolean;
  isGeneratingAll: boolean;
  onGenerateContent: (
    campaignId: number | null,
    contentType: string,
    marketingAngle: string,
    day: number,
    details: string
  ) => void;
  onAutoGenerate: (
    campaignId: number | null,
    contentType: string,
    marketingAngle: string,
    day: number,
    details: string,
    dayData: any
  ) => Promise<void>;
  showAutoButton: boolean;
  generatedContentByDay: Map<number, Set<string>>;
}) {
  // Check if this content item is completed
  const isCompleted = generatedContentByDay.get(day)?.has(content.type.toLowerCase()) || false;
  return (
    <div className={`bg-[var(--bg-secondary)] p-3 rounded-lg border flex items-start justify-between ${
      isCompleted ? 'border-green-500 dark:border-green-600' : 'border-[var(--border-color)]'
    }`}>
      <div className="flex-1">
        <div className="font-semibold text-[var(--text-primary)] text-sm mb-1 flex items-center">
          {content.type}
          {isCompleted && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed
            </span>
          )}
        </div>
        <div className="text-[var(--text-secondary)] text-sm">
          {content.details}
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-3">
        {/* Manual Generate - opens Content Studio */}
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
          disabled={!selectedCampaignId || isGeneratingAll || isGenerating}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
            ${
              selectedCampaignId && !isGeneratingAll && !isGenerating
                ? "bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Manual
        </button>

        {/* Auto-Generate - uses calendar API with intelligence */}
        {showAutoButton && (
          <button
            onClick={() =>
              onAutoGenerate(
                selectedCampaignId,
                content.type,
                data.marketingAngle,
                day,
                content.details,
                data
              )
            }
            disabled={!selectedCampaignId || isGeneratingAll || isGenerating}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1
              ${
                selectedCampaignId && !isGeneratingAll && !isGenerating
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }
            `}
            title="Generate using campaign intelligence"
          >
            <span>🤖 Auto</span>
          </button>
        )}
      </div>
    </div>
  );
}
