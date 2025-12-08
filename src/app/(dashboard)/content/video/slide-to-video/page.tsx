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
  product_intelligence_id?: number;
}

interface CampaignIntelligence {
  productName: string;
  productCategory: string;
  description: string;
  ingredients?: string[];
  features?: string[];
  benefits?: string[];
  marketing_angles?: string[];
}

interface GeneratedImage {
  id: string;
  image_url: string;
  thumbnail_url: string;
  prompt: string;
  style: string;
  aspect_ratio: string;
}

export default function SlideToVideoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCampaignId = searchParams.get("campaign");

  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );

  // Step 1: Image Generation State
  const [numImages, setNumImages] = useState<number>(3);
  const [imageType, setImageType] = useState<string>("Hero");
  const [style, setStyle] = useState<string>("marketing");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [campaignIntelligence, setCampaignIntelligence] =
    useState<CampaignIntelligence | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<{
    ingredients: string[];
    features: string[];
    benefits: string[];
    custom: string[];
  }>({
    ingredients: [],
    features: [],
    benefits: [],
    custom: [],
  });
  const [customKeyword, setCustomKeyword] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Step 2: Edit Images (Optional)
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  // Step 3: Video Generation State
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(10);

  // Generate prompt based on intelligence and keywords
  const generatePrompt = () => {
    if (!campaignIntelligence) return "";

    const base = `${campaignIntelligence.productName} - ${campaignIntelligence.description}`;

    const allKeywords = [
      ...selectedKeywords.ingredients,
      ...selectedKeywords.features,
      ...selectedKeywords.benefits,
      ...selectedKeywords.custom,
    ].filter(Boolean);

    const keywordString = allKeywords.join(", ");

    const imageTypePrompts: Record<string, string> = {
      Hero: "Professional hero banner image",
      Social: "Social media square image",
      Ad: "Advertisement image with compelling visuals",
      "Product Shot": "Clean product showcase",
    };

    const stylePrompts: Record<string, string> = {
      marketing: "Professional, engaging marketing style",
      educational: "Clean, informative educational style",
      social: "Dynamic, eye-catching social media style",
    };

    const imageTypePrompt = imageTypePrompts[imageType] || "Marketing image";
    const stylePrompt = stylePrompts[style] || "Professional marketing style";

    return `${imageTypePrompt} of ${base}${
      keywordString ? ` featuring ${keywordString}` : ""
    }. ${stylePrompt}. High quality, professional photography style.`;
  };

  // Update prompt when dependencies change
  useEffect(() => {
    const prompt = generatePrompt();
    setGeneratedPrompt(prompt);
  }, [
    campaignIntelligence,
    selectedKeywords,
    imageType,
    style,
    numImages,
  ]);

  // Fetch campaign intelligence when campaign is selected
  const { data: intelligenceData, isLoading: intelligenceLoading } = useQuery({
    queryKey: ["campaign-intelligence", selectedCampaign],
    queryFn: async () => {
      if (!selectedCampaign) return null;
      const response = await api.get(
        `/api/intelligence/campaigns/${selectedCampaign}/intelligence`
      );
      return response.data;
    },
    enabled: !!selectedCampaign,
  });

  // Extract intelligence data when loaded
  useEffect(() => {
    if (intelligenceData?.intelligence_data?.product) {
      const product = intelligenceData.intelligence_data.product;
      setCampaignIntelligence({
        productName: product.product_name || "",
        productCategory: product.category || "",
        description: product.description || "",
        ingredients: product.ingredients || [],
        features: product.features || [],
        benefits: product.benefits || [],
        marketing_angles: product.marketing_angles || [],
      });
    }
  }, [intelligenceData]);

  // Generate images mutation
  const generateImagesMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/images/generate", {
        campaign_id: selectedCampaign,
        num_images: numImages,
        prompt: generatedPrompt,
        style: style,
        aspect_ratio: aspectRatio,
        image_type: imageType,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedImages(data.images || []);
      toast.success(`Generated ${data.images?.length || 0} images successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to generate images"
      );
    },
  });

  // Generate video mutation
  const generateVideoMutation = useMutation({
    mutationFn: async () => {
      const slides = selectedImageIds.map((imageId) => {
        const image = generatedImages.find((img) => img.id === imageId);
        return {
          image_url: image?.image_url,
          text: campaignIntelligence?.productName || "",
        };
      });

      const response = await api.post("/api/video/generate", {
        campaign_id: selectedCampaign,
        generation_mode: "slide_video",
        slides: slides,
        style: style,
        duration: videoDuration,
        aspect_ratio: aspectRatio,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Video generation started successfully!");
      router.push("/content/video");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to generate video"
      );
    },
  });

  // Add custom keyword
  const addCustomKeyword = () => {
    if (customKeyword.trim()) {
      setSelectedKeywords((prev) => ({
        ...prev,
        custom: [...prev.custom, customKeyword.trim()],
      }));
      setCustomKeyword("");
    }
  };

  // Remove keyword
  const removeKeyword = (
    type: "ingredients" | "features" | "benefits" | "custom",
    keyword: string
  ) => {
    setSelectedKeywords((prev) => ({
      ...prev,
      [type]: prev[type].filter((k) => k !== keyword),
    }));
  };

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      } else if (prev.length < 2) {
        return [...prev, imageId];
      } else {
        toast.error("You can select up to 2 images for slide video");
        return prev;
      }
    });
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Generate Slide-to-Video
          </h1>
          <p className="text-[var(--text-secondary)]">
            Generate images from campaign intelligence, edit them, and create a
            slide video
          </p>
        </div>

        {/* Campaign Selection */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Select Campaign
          </h2>
          <CampaignSelector
            selectedCampaignId={selectedCampaign}
            onSelect={setSelectedCampaign}
          />
        </div>

        {/* Step 1: Generate Images */}
        {selectedCampaign && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              STEP 1: Generate Images
            </h2>

            {/* Campaign Intelligence Display */}
            {campaignIntelligence && (
              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  Campaign Intelligence
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  <span className="font-medium">Product:</span>{" "}
                  {campaignIntelligence.productName}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-medium">Category:</span>{" "}
                  {campaignIntelligence.productCategory}
                </p>
              </div>
            )}

            {/* Image Generation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Number of Images
                </label>
                <select
                  value={numImages}
                  onChange={(e) => setNumImages(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Image" : "Images"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Image Type
                </label>
                <select
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="Hero">Hero Image</option>
                  <option value="Social">Social Media</option>
                  <option value="Ad">Advertisement</option>
                  <option value="Product Shot">Product Shot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="marketing">Marketing</option>
                  <option value="educational">Educational</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>
            </div>

            {/* Keyword Selection */}
            {campaignIntelligence && (
              <div className="mb-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                  Select Keywords
                </h3>

                {/* Ingredients */}
                {campaignIntelligence.ingredients &&
                  campaignIntelligence.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Ingredients:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {campaignIntelligence.ingredients.map((ingredient) => (
                          <button
                            key={ingredient}
                            onClick={() => {
                              setSelectedKeywords((prev) => ({
                                ...prev,
                                ingredients: prev.ingredients.includes(
                                  ingredient
                                )
                                  ? prev.ingredients.filter(
                                      (i) => i !== ingredient
                                    )
                                  : [...prev.ingredients, ingredient],
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              selectedKeywords.ingredients.includes(ingredient)
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
                            }`}
                          >
                            {ingredient}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Features */}
                {campaignIntelligence.features &&
                  campaignIntelligence.features.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Features:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {campaignIntelligence.features.map((feature) => (
                          <button
                            key={feature}
                            onClick={() => {
                              setSelectedKeywords((prev) => ({
                                ...prev,
                                features: prev.features.includes(feature)
                                  ? prev.features.filter((f) => f !== feature)
                                  : [...prev.features, feature],
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              selectedKeywords.features.includes(feature)
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Benefits */}
                {campaignIntelligence.benefits &&
                  campaignIntelligence.benefits.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Benefits:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {campaignIntelligence.benefits.map((benefit) => (
                          <button
                            key={benefit}
                            onClick={() => {
                              setSelectedKeywords((prev) => ({
                                ...prev,
                                benefits: prev.benefits.includes(benefit)
                                  ? prev.benefits.filter((b) => b !== benefit)
                                  : [...prev.benefits, benefit],
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              selectedKeywords.benefits.includes(benefit)
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
                            }`}
                          >
                            {benefit}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Custom Keywords */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Custom Keywords:
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={customKeyword}
                      onChange={(e) => setCustomKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomKeyword()}
                      placeholder="Add custom keyword..."
                      className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                    />
                    <button
                      onClick={addCustomKeyword}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                  {selectedKeywords.custom.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedKeywords.custom.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-3 py-1 rounded-full text-sm bg-blue-500 text-white flex items-center gap-2"
                        >
                          {keyword}
                          <button onClick={() => removeKeyword("custom", keyword)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Prompt */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Generated Prompt ({generatedPrompt.length} characters)
              </label>
              <textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                placeholder="Describe the images you want to generate..."
              />
            </div>

            {/* Generate Images Button */}
            <button
              onClick={() => generateImagesMutation.mutate()}
              disabled={generateImagesMutation.isPending || !generatedPrompt}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generateImagesMutation.isPending
                ? "Generating Images..."
                : "Generate Images"}
            </button>

            {/* Generated Images Grid */}
            {generatedImages.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                  Generated Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {generatedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group bg-[var(--bg-secondary)] rounded-lg overflow-hidden"
                    >
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt={image.prompt}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingImageId(image.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement delete
                            toast.info("Delete functionality coming soon");
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue to Video Button */}
                <button
                  onClick={() => {
                    document
                      .getElementById("step-3")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full mt-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  Continue to Video Generation →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select & Generate Video */}
        {generatedImages.length > 0 && (
          <div id="step-3" className="card mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              STEP 3: Select & Generate Video
            </h2>

            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Select up to 2 images for your slide video (PiAPI limit):
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => toggleImageSelection(image.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                    selectedImageIds.includes(image.id)
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image.thumbnail_url || image.image_url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover"
                  />
                  {selectedImageIds.includes(image.id) && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedImageIds.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  Selected {selectedImageIds.length} of 2 images
                </p>
              </div>
            )}

            {/* Video Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Duration
                </label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="marketing">Marketing</option>
                  <option value="educational">Educational</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </div>

            {/* Generate Video Button */}
            <button
              onClick={() => generateVideoMutation.mutate()}
              disabled={
                generateVideoMutation.isPending ||
                selectedImageIds.length === 0
              }
              className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generateVideoMutation.isPending
                ? "Generating Video..."
                : "Generate Video"}
            </button>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
