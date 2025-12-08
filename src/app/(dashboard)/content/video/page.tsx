"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "src/components/AuthGate";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  product_url: string;
  affiliate_network: string;
}

export default function VideoGenerationPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [generationMode, setGenerationMode] = useState<"text_to_video" | "image_to_video" | "slide_video">("text_to_video");
  const [script, setScript] = useState("");
  const [style, setStyle] = useState("marketing");
  const [duration, setDuration] = useState(20);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [imageUrl, setImageUrl] = useState("");
  const [motionIntensity, setMotionIntensity] = useState("medium");
  const [slides, setSlides] = useState<Array<{text: string; image_url?: string}>>([
    { text: "" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user's campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery<{
    campaigns: Campaign[];
  }>({
    queryKey: ["campaigns"],
    queryFn: async () => (await api.get("/api/campaigns")).data,
  });

  const campaigns = campaignsData?.campaigns || [];

  const handleGenerate = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }

    // Validate based on generation mode
    if (generationMode === "text_to_video" && !script.trim()) {
      toast.error("Please enter a video script");
      return;
    }

    if (generationMode === "image_to_video" && !imageUrl.trim()) {
      toast.error("Please upload an image");
      return;
    }

    if (generationMode === "slide_video") {
      const validSlides = slides.filter(slide => slide.text.trim());
      if (validSlides.length === 0) {
        toast.error("Please add at least one slide with text");
        return;
      }
    }

    setIsGenerating(true);

    try {
      const requestData: any = {
        campaign_id: selectedCampaign,
        generation_mode: generationMode,
        style,
        duration,
        aspect_ratio: aspectRatio,
        motion_intensity: motionIntensity,
      };

      // Add mode-specific parameters
      if (generationMode === "text_to_video") {
        requestData.script = script;
      } else if (generationMode === "image_to_video") {
        requestData.image_url = imageUrl;
        if (script.trim()) {
          requestData.script = script;
        }
      } else if (generationMode === "slide_video") {
        requestData.slides = slides;
        if (script.trim()) {
          requestData.script = script;
        }
      }

      const response = await api.post("/api/video/generate", requestData);

      toast.success("Video generation started!");
      console.log("Generation response:", response.data);

      // TODO: Navigate to video status page or show status modal
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const cost = duration * 0.05; // Luma AI pricing: $0.05 per second (short-form)

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Generate Short-Form Videos</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Create engaging 5-20 second videos from your scripts using AI (Perfect for TikTok, Reels, Shorts)
          </p>
        </div>

        <div className="card rounded-lg p-6">
          <div className="space-y-6">
            {/* Campaign Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Select Campaign *
              </label>
              {campaignsLoading ? (
                <div className="text-center py-4">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: "var(--text-secondary)" }}>
                    No campaigns found. Create a campaign first.
                  </p>
                  <Link
                    href="/campaigns"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Campaigns
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <option value="">Select a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} - {campaign.affiliate_network}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Generation Mode Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Generation Mode
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setGenerationMode("text_to_video")}
                  className={`p-4 rounded-lg border-2 transition ${
                    generationMode === "text_to_video"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="text-lg font-semibold mb-1">📝 Text-to-Video</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Generate video from script
                  </div>
                </button>
                <button
                  onClick={() => setGenerationMode("image_to_video")}
                  className={`p-4 rounded-lg border-2 transition ${
                    generationMode === "image_to_video"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="text-lg font-semibold mb-1">🖼️ Image-to-Video</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Animate static images
                  </div>
                </button>
                <button
                  onClick={() => setGenerationMode("slide_video")}
                  className={`p-4 rounded-lg border-2 transition ${
                    generationMode === "slide_video"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="text-lg font-semibold mb-1">🎬 Slide Video</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Convert slides to video
                  </div>
                </button>
              </div>
            </div>

            {/* Image Upload (for image_to_video) */}
            {generationMode === "image_to_video" && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Upload Image *
                </label>
                <div className="space-y-4">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL (or use the file upload below)"
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "var(--card-border)" }}
                  />
                  <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: "var(--card-border)" }}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // TODO: Upload to R2 and get URL
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImageUrl(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 mb-2" style={{ color: "var(--text-secondary)" }} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Click to upload an image or drag and drop
                      </p>
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Preview:</p>
                      <img src={imageUrl} alt="Preview" className="max-h-48 rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slides Editor (for slide_video) */}
            {generationMode === "slide_video" && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Slides *
                </label>
                <div className="space-y-4">
                  {slides.map((slide, index) => (
                    <div key={index} className="border rounded-lg p-4" style={{ borderColor: "var(--card-border)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Slide {index + 1}
                        </span>
                        {slides.length > 1 && (
                          <button
                            onClick={() => setSlides(slides.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        value={slide.text}
                        onChange={(e) => {
                          const newSlides = [...slides];
                          newSlides[index].text = e.target.value;
                          setSlides(newSlides);
                        }}
                        placeholder="Enter slide text or description..."
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg"
                        style={{ borderColor: "var(--card-border)" }}
                      />
                      <input
                        type="url"
                        value={slide.image_url || ""}
                        onChange={(e) => {
                          const newSlides = [...slides];
                          newSlides[index].image_url = e.target.value;
                          setSlides(newSlides);
                        }}
                        placeholder="Optional: Image URL for this slide"
                        className="w-full mt-2 px-4 py-2 border rounded-lg"
                        style={{ borderColor: "var(--card-border)" }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setSlides([...slides, { text: "" }])}
                    className="w-full px-4 py-2 border-2 border-dashed rounded-lg hover:border-blue-500 transition"
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    + Add Another Slide
                  </button>
                </div>
              </div>
            )}

            {/* Motion Intensity (for image_to_video and slide_video) */}
            {(generationMode === "image_to_video" || generationMode === "slide_video") && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Motion Intensity
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {["low", "medium", "high"].map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setMotionIntensity(intensity)}
                      className={`p-3 rounded-lg border transition capitalize ${
                        motionIntensity === intensity
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Style Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Video Style
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setStyle("marketing")}
                  className={`p-4 rounded-lg border-2 transition ${
                    style === "marketing"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="text-lg font-semibold mb-1">📢 Marketing</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Professional, engaging marketing videos
                  </div>
                </button>
                <button
                  onClick={() => setStyle("educational")}
                  className={`p-4 rounded-lg border-2 transition ${
                    style === "educational"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="text-lg font-semibold mb-1">🎓 Educational</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Clear, informative educational content
                  </div>
                </button>
                <button
                  onClick={() => setStyle("social")}
                  className={`p-4 rounded-lg border-2 transition ${
                    style === "social"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="text-lg font-semibold mb-1">📱 Social</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Dynamic, eye-catching social media
                  </div>
                </button>
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Duration: {duration} seconds
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                <span>5s</span>
                <span>20s</span>
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setAspectRatio("16:9")}
                  className={`p-3 rounded-lg border transition ${
                    aspectRatio === "16:9"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  16:9 (Landscape)
                </button>
                <button
                  onClick={() => setAspectRatio("9:16")}
                  className={`p-3 rounded-lg border transition ${
                    aspectRatio === "9:16"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  9:16 (Portrait)
                </button>
                <button
                  onClick={() => setAspectRatio("1:1")}
                  className={`p-3 rounded-lg border transition ${
                    aspectRatio === "1:1"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  1:1 (Square)
                </button>
              </div>
            </div>

            {/* Script Input (optional for image_to_video and slide_video) */}
            {(generationMode === "text_to_video" || generationMode === "image_to_video" || generationMode === "slide_video") && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {generationMode === "text_to_video" ? "Video Script *" : "Additional Script (Optional)"}
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={
                    generationMode === "text_to_video"
                      ? "Enter your video script with timestamps (e.g., [0-10s] Introduction...)"
                      : "Optional: Add guidance for the video generation..."
                  }
                  rows={generationMode === "text_to_video" ? 12 : 6}
                  className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                  style={{ borderColor: "var(--card-border)" }}
                />
                <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                  {generationMode === "text_to_video"
                    ? "Include timestamps like [0-10s], [10-30s], etc. for better organization"
                    : "Provide additional context or specific instructions for the video generation"}
                </p>
              </div>
            )}

            {/* Cost Display */}
            <div
              className="p-4 rounded-lg border"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Estimated Cost
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    ${cost.toFixed(2)} for {duration}s video
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${cost.toFixed(2)}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Powered by Luma AI
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                !selectedCampaign ||
                (generationMode === "text_to_video" && !script.trim()) ||
                (generationMode === "image_to_video" && !imageUrl.trim()) ||
                (generationMode === "slide_video" && slides.filter(s => s.text.trim()).length === 0)
              }
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <span>Generating Video...</span>
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
        </div>

        {/* Tips */}
        <div className="mt-6 card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            💡 Tips for Great Videos
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li>• Start with a hook in the first 3 seconds to grab attention</li>
            <li>• Include clear timestamps to organize your content flow</li>
            <li>• End with a strong call-to-action</li>
            <li>• Use descriptive language for better visual generation</li>
            <li>• Keep scripts concise - aim for 150-200 words per minute</li>
          </ul>
        </div>
      </div>
    </AuthGate>
  );
}
