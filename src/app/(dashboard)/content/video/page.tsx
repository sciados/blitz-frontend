"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  product_url: string;
  affiliate_network: string;
}

export default function VideoGenerationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCampaignId = searchParams.get("campaign");
  const urlScript = searchParams.get("script");
  const urlScriptId = searchParams.get("scriptId");

  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );
  const [generationMode, setGenerationMode] = useState<string>("text_to_video");
  const [script, setScript] = useState<string>(
    urlScript ? decodeURIComponent(urlScript) : ""
  );
  const [style, setStyle] = useState<string>("marketing");
  const [duration, setDuration] = useState<number>(10);
  const [userTier, setUserTier] = useState<string>("free"); // TODO: Get from user profile
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [motionIntensity, setMotionIntensity] = useState<string>("medium");
  const [useExistingScript, setUseExistingScript] = useState<boolean>(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [useExistingImage, setUseExistingImage] = useState<boolean>(false);
  const [selectedImageId, setSelectedImageId] = useState<string>("");
  const [useSlideImages, setUseSlideImages] = useState<boolean>(false);
  const [selectedSlideImages, setSelectedSlideImages] = useState<string[]>([]);

  // Fetch campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await api.get("/api/campaigns");
      return response.data;
    },
  });

  const campaigns = campaignsData?.campaigns || [];

  // Fetch content library when campaign is selected
  const { data: contentData } = useQuery({
    queryKey: ["content", "unified", selectedCampaign],
    queryFn: async () => {
      if (!selectedCampaign) return { contents: [] };
      const response = await api.get(
        `/api/content/unified/campaign/${selectedCampaign}/all`
      );
      return response.data;
    },
    enabled: !!selectedCampaign && (useExistingScript || useExistingImage),
  });

  // Filter video scripts from content
  const videoScripts =
    contentData?.contents?.filter(
      (item: any) =>
        item.type === "text" && item.data.content_type === "video_script"
    ) || [];

  // Filter images from content
  const campaignImages =
    contentData?.contents?.filter(
      (item: any) => item.type === "image"
    ) || [];

  // Auto-fill script when selecting from library
  useEffect(() => {
    if (useExistingScript && selectedScriptId) {
      const selectedScript = videoScripts.find(
        (item: any) => item.data.id.toString() === selectedScriptId
      );
      if (selectedScript) {
        setScript(selectedScript.data.content_data.text);
      }
    }
  }, [selectedScriptId, useExistingScript, videoScripts]);

  // Auto-fill image URL when selecting from library
  useEffect(() => {
    if (useExistingImage && selectedImageId) {
      const selectedImage = campaignImages.find(
        (item: any) => item.data.id.toString() === selectedImageId
      );
      if (selectedImage) {
        setImageUrl(selectedImage.data.image_url);
      }
    }
  }, [selectedImageId, useExistingImage, campaignImages]);

  // Auto-select campaign from URL parameter
  useEffect(() => {
    if (urlCampaignId) {
      setSelectedCampaign(Number(urlCampaignId));
    }
  }, [urlCampaignId]);

  // Auto-fill script from URL parameter
  useEffect(() => {
    if (urlScript) {
      setScript(decodeURIComponent(urlScript));
      setGenerationMode("text_to_video");
    }
  }, [urlScript]);

  // Auto-fill script from script ID parameter (from Content Library "Generate Video" button)
  useEffect(() => {
    const fetchScriptById = async () => {
      if (urlScriptId && selectedCampaign) {
        try {
          const response = await api.get(`/api/content/${urlScriptId}`);
          if (response.data && response.data.content_data?.text) {
            setScript(response.data.content_data.text);
            setGenerationMode("text_to_video");
            toast.success("Video script loaded from Content Library");
          }
        } catch (error) {
          console.error("Failed to fetch script:", error);
          toast.error("Failed to load video script");
        }
      }
    };
    fetchScriptById();
  }, [urlScriptId, selectedCampaign]);

  // Generate video mutation
  const generateVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/video/generate", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        "Video generation started! You can check the status in your video library."
      );
      router.push("/content/video/library");
    },
    onError: (error: any) => {
      const errorData = error.response?.data?.detail;
      if (errorData?.error === 'TIER_LIMIT_EXCEEDED') {
        toast.error(
          `${errorData.message}`,
          {
            description: "Upgrade your plan to unlock longer videos",
            action: {
              label: "Upgrade",
              onClick: () => router.push('/settings' as any)
            }
          }
        );
      } else {
        toast.error(errorData?.message || errorData || "Failed to generate video");
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }

    if (generationMode === "text_to_video" && !script.trim()) {
      if (useExistingScript && !selectedScriptId) {
        toast.error("Please select a video script from the library");
      } else if (!useExistingScript) {
        toast.error("Script is required for text-to-video generation");
      }
      return;
    }

    if (generationMode === "image_to_video" && !imageUrl.trim()) {
      if (useExistingImage && !selectedImageId) {
        toast.error("Please select an image from the library");
      } else if (!useExistingImage) {
        toast.error("Image URL is required for image-to-video generation");
      }
      return;
    }

    if (generationMode === "slide_video" && selectedSlideImages.length === 0) {
      toast.error("Please select at least one image for slide video");
      return;
    }

    // Prepare slides data for slide_video mode
    let slides = undefined;
    if (generationMode === "slide_video" && selectedSlideImages.length > 0) {
      slides = selectedSlideImages.map((id) => {
        const imageItem = campaignImages.find((item: any) => item.data.id.toString() === id);
        return {
          image_url: imageItem?.data.image_url || "",
          text: imageItem?.data.prompt || "",
        };
      });
    }

    const requestData = {
      campaign_id: selectedCampaign.toString(),
      generation_mode: generationMode,
      script: script || undefined,
      style,
      duration,
      aspect_ratio: aspectRatio,
      image_url: imageUrl || undefined,
      motion_intensity: motionIntensity,
      slides: slides,
    };

    generateVideoMutation.mutate(requestData);
  };

  const getModeDescription = (mode: string) => {
    const descriptions = {
      text_to_video:
        "Generate videos directly from your script text with AI visuals",
      image_to_video: "Animate existing images into dynamic video content",
      slide_video:
        "Create videos using 2 images as start and end key frames",
    };
    return descriptions[mode as keyof typeof descriptions] || "";
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Generate Short-Form Videos
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Create engaging 5-20 second videos using Luma AI. Perfect for social
            media marketing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Selection */}
          <div className="card rounded-lg p-6">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Campaign Selection
            </h2>
            <CampaignSelector
              selectedCampaignId={selectedCampaign}
              onSelect={(id) => setSelectedCampaign(id)}
              label="Campaign *"
              placeholder="Select a campaign..."
              showAllOption={false}
            />
            {selectedCampaign && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  <span className="font-semibold">✓ Campaign selected!</span>{" "}
                  Video will be generated using this campaign's intelligence
                  data.
                </p>
              </div>
            )}
          </div>

          {/* Generation Mode */}
          <div className="card rounded-lg p-6">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Generation Mode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "text_to_video", label: "Text-to-Video", icon: "📝" },
                {
                  value: "image_to_video",
                  label: "Image-to-Video",
                  icon: "🖼️",
                },
                { value: "slide_video", label: "Slide-to-Video", icon: "🎞️" },
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    setGenerationMode(mode.value);
                    // Clear slide images when switching away from slide_video mode
                    if (mode.value !== "slide_video") {
                      setSelectedSlideImages([]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    generationMode === mode.value
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-red-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{mode.icon}</div>
                  <div
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {mode.label}
                  </div>
                </button>
              ))}
            </div>
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {getModeDescription(generationMode)}
            </p>
          </div>

          {/* Script (for text_to_video and slide_video) */}
          {(generationMode === "text_to_video" ||
            generationMode === "slide_video") && (
            <div className="card rounded-lg p-6">
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Video Script {generationMode === "text_to_video" && "*"}
              </h2>

              {/* Script Source Toggle */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useExistingScript}
                      onChange={() => {
                        setUseExistingScript(false);
                        setSelectedScriptId("");
                      }}
                      className="w-4 h-4"
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Enter new script
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useExistingScript}
                      onChange={() => setUseExistingScript(true)}
                      className="w-4 h-4"
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Use existing script from library
                    </span>
                  </label>
                </div>
              </div>

              {/* Existing Script Selector */}
              {useExistingScript && selectedCampaign && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Select Video Script *
                  </label>
                  <select
                    value={selectedScriptId}
                    onChange={(e) => setSelectedScriptId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">Choose a video script...</option>
                    {videoScripts.length > 0 ? (
                      videoScripts.map((item: any) => (
                        <option key={item.data.id} value={item.data.id}>
                          {item.data.content_data.subject ||
                            `Script ${item.data.id}`}{" "}
                          -{" "}
                          {new Date(item.data.created_at).toLocaleDateString()}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No video scripts found for this campaign
                      </option>
                    )}
                  </select>
                  {videoScripts.length === 0 && (
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ No video scripts found in your content library for this
                      campaign.
                    </p>
                  )}
                </div>
              )}

              {/* Manual Script Input */}
              {!useExistingScript && (
                <>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Enter your video script with timestamps. Include scene
                    descriptions, narration, and visual cues.
                  </p>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Example: [0-5s] Opening shot of product on desk
[5-10s] Show key features with text overlays
[10-15s] Customer testimonial clip
[15-20s] Call-to-action with logo"
                    className="w-full h-40 px-4 py-3 rounded-lg border"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <div
                    className="mt-2 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Tip: Keep total duration between {duration} seconds. Use
                    timestamps like [0-5s], [5-10s], etc.
                  </div>
                </>
              )}

              {/* Script Preview */}
              {useExistingScript && script && (
                <div className="mt-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Script Preview
                  </label>
                  <div
                    className="w-full h-40 px-4 py-3 rounded-lg border overflow-y-auto"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <pre
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {script}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slide Images (for slide_video) */}
          {generationMode === "slide_video" && (
            <div className="card rounded-lg p-6">
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Slide Images
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Select up to 2 images from your library to create a video with key frames. First image = start frame, second image = end frame.
              </p>

              {selectedCampaign && campaignImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {campaignImages.map((item: any) => (
                    <div
                      key={item.data.id}
                      onClick={() => {
                        setSelectedSlideImages((prev) => {
                          if (prev.includes(item.data.id.toString())) {
                            return prev.filter((id) => id !== item.data.id.toString());
                          } else if (prev.length < 2) {
                            // Limit to 2 images (PiAPI supports frame0 and frame1)
                            return [...prev, item.data.id.toString()];
                          }
                          return prev;
                        });
                      }}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        selectedSlideImages.includes(item.data.id.toString())
                          ? "border-red-500 ring-2 ring-red-200 dark:ring-red-800"
                          : "border-gray-200 dark:border-gray-700 hover:border-red-300"
                      }`}
                    >
                      <img
                        src={item.data.image_url}
                        alt={`Slide ${item.data.id}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        {selectedSlideImages.includes(item.data.id.toString()) && (
                          <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-primary)" }}
                          title={item.data.prompt}
                        >
                          {item.data.prompt?.substring(0, 30) ||
                            `${item.data.image_type} ${item.data.id}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No images found in your content library for this campaign.
                  </p>
                </div>
              )}

              {selectedSlideImages.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedSlideImages.length} image{selectedSlideImages.length > 1 ? "s" : ""} selected
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    First selected image = start frame (frame0), second selected = end frame (frame1)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Image Source (for image_to_video) */}
          {generationMode === "image_to_video" && (
            <div className="card rounded-lg p-6">
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Source Image *
              </h2>

              {/* Image Source Toggle */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useExistingImage}
                      onChange={() => {
                        setUseExistingImage(false);
                        setSelectedImageId("");
                        setImageUrl("");
                      }}
                      className="w-4 h-4"
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Enter image URL
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useExistingImage}
                      onChange={() => setUseExistingImage(true)}
                      className="w-4 h-4"
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Use existing image from library
                    </span>
                  </label>
                </div>
              </div>

              {/* Existing Image Selector */}
              {useExistingImage && selectedCampaign && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Select Image *
                  </label>
                  <select
                    value={selectedImageId}
                    onChange={(e) => setSelectedImageId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">Choose an image...</option>
                    {campaignImages.length > 0 ? (
                      campaignImages.map((item: any) => (
                        <option key={item.data.id} value={item.data.id}>
                          {item.data.prompt?.substring(0, 50) ||
                            `${item.data.image_type} ${item.data.id}`}{" "}
                          - {new Date(item.data.created_at).toLocaleDateString()}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No images found for this campaign
                      </option>
                    )}
                  </select>
                  {campaignImages.length === 0 && (
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ No images found in your content library for this campaign.
                    </p>
                  )}
                </div>
              )}

              {/* Manual Image URL Input */}
              {!useExistingImage && (
                <>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Enter the URL of the image you want to animate into a video.
                  </p>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </>
              )}

              {/* Image Preview */}
              {useExistingImage && imageUrl && (
                <div className="mt-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Image Preview
                  </label>
                  <div
                    className="w-full h-64 rounded-lg border overflow-hidden"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Selected image"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Settings */}
          <div className="card rounded-lg p-6">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Video Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Style */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="marketing">Marketing</option>
                  <option value="educational">Educational</option>
                  <option value="social">Social Media</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value={5}>5 seconds - Quick Hook</option>
                  <option value={10}>10 seconds - Short Promo</option>
                  <option value={15} disabled={userTier === 'free' || userTier === 'starter'}>
                    15 seconds - Extended Story {userTier === 'free' || userTier === 'starter' ? '🔒 Pro+' : ''}
                  </option>
                  <option value={20} disabled={userTier === 'free' || userTier === 'starter'}>
                    20 seconds - Full Promo {userTier === 'free' || userTier === 'starter' ? '🔒 Pro+' : ''}
                  </option>
                </select>
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {userTier === 'free' || userTier === 'starter' ? (
                    <span>
                      ⚠️ Your {userTier} tier supports up to 10s. Upgrade to Pro/Enterprise for 15-20s videos.
                    </span>
                  ) : (
                    <span>
                      Luma AI (5-10s) or Veo AI (15-20s) based on duration
                    </span>
                  )}
                </p>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>

              {/* Motion Intensity */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Motion Intensity
                </label>
                <select
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Credit Estimate */}
          <div className="card rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3
              className="font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Credit Usage
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Video generation will use approximately{" "}
              {duration <= 10
                ? (duration * 0.05).toFixed(2)
                : (duration * 0.10).toFixed(2)
              } credits
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {duration <= 10
                ? "Luma AI Ray 2 (5-10s): ~$0.05/second"
                : "Veo AI (15-20s): ~$0.10/second"
              }
            </p>
            {duration > 10 && (userTier === 'free' || userTier === 'starter') && (
              <p
                className="text-xs mt-2 text-yellow-600 dark:text-yellow-400"
              >
                🔒 15-20s videos require Pro or Enterprise tier
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/content")}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            >
              ← Back to Content Hub
            </button>

            <button
              type="submit"
              disabled={generateVideoMutation.isPending || !selectedCampaign}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex items-center space-x-2"
            >
              {generateVideoMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthGate>
  );
}
