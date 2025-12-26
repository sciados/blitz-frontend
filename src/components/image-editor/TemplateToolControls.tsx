"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  category: string;
  aspectRatio: string;
  width: number;
  height: number;
  thumbnail: string;
  description: string;
  elements: TemplateElement[];
}

interface TemplateElement {
  type: "text" | "image" | "shape" | "background";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  placeholder?: string;
  editable?: boolean;
  borderRadius?: number;
  opacity?: number;
}

interface TemplateToolControlsProps {
  isProcessing: boolean;
  currentImageUrl?: string;
  onApplyTemplate: (templateData: any) => void;
}

const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates", icon: "📋" },
  { id: "instagram-post", name: "Instagram Post", icon: "📸" },
  { id: "instagram-story", name: "Instagram Story", icon: "📱" },
  { id: "facebook", name: "Facebook", icon: "👥" },
  { id: "twitter", name: "Twitter/X", icon: "🐦" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "youtube", name: "YouTube", icon: "▶️" },
  { id: "promotional", name: "Promotional", icon: "🎯" },
  { id: "quote", name: "Quote", icon: "💬" },
];

const TEMPLATES: Template[] = [
  // Instagram Post - Product Showcase
  {
    id: "ig-product-1",
    name: "Product Showcase",
    category: "instagram-post",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    thumbnail: "🛍️",
    description: "Clean product showcase with brand colors",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        backgroundColor: "#F8F9FA",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 90,
        y: 90,
        width: 900,
        height: 600,
        placeholder: "Product Image",
        editable: true,
        borderRadius: 20,
      },
      {
        type: "text",
        id: "title",
        x: 90,
        y: 730,
        width: 900,
        height: 120,
        content: "New Product Launch",
        fontSize: 56,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#1A1A1A",
        editable: true,
      },
      {
        type: "text",
        id: "subtitle",
        x: 90,
        y: 870,
        width: 900,
        height: 80,
        content: "Available Now",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#666666",
        editable: true,
      },
    ],
  },

  // Instagram Post - Sale/Promo
  {
    id: "ig-sale-1",
    name: "Flash Sale",
    category: "instagram-post",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    thumbnail: "🔥",
    description: "Eye-catching sale announcement",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        backgroundColor: "#FF3B30",
        editable: false,
      },
      {
        type: "shape",
        id: "accent",
        x: 0,
        y: 0,
        width: 1080,
        height: 400,
        backgroundColor: "#FF6B6B",
        opacity: 0.3,
        editable: false,
      },
      {
        type: "text",
        id: "emoji",
        x: 90,
        y: 150,
        width: 200,
        height: 200,
        content: "🔥",
        fontSize: 160,
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 300,
        y: 180,
        width: 690,
        height: 140,
        content: "FLASH SALE",
        fontSize: 72,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "discount",
        x: 90,
        y: 450,
        width: 900,
        height: 200,
        content: "50% OFF",
        fontSize: 120,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "subtitle",
        x: 90,
        y: 680,
        width: 900,
        height: 100,
        content: "Limited Time Only",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "image",
        id: "product-img",
        x: 90,
        y: 820,
        width: 900,
        height: 180,
        placeholder: "Product Image (Optional)",
        editable: true,
        borderRadius: 15,
        opacity: 0.9,
      },
    ],
  },

  // Instagram Story - Quote
  {
    id: "ig-story-quote-1",
    name: "Motivational Quote",
    category: "instagram-story",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    thumbnail: "💭",
    description: "Inspirational quote template",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        backgroundColor: "#4A5568",
        editable: false,
      },
      {
        type: "image",
        id: "bg-img",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        placeholder: "Background Image",
        editable: true,
        opacity: 0.4,
      },
      {
        type: "text",
        id: "quote",
        x: 90,
        y: 700,
        width: 900,
        height: 520,
        content: '"Your inspirational quote goes here"',
        fontSize: 64,
        fontFamily: "Georgia",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "author",
        x: 90,
        y: 1280,
        width: 900,
        height: 100,
        content: "— Author Name",
        fontSize: 42,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        opacity: 0.8,
        editable: true,
      },
    ],
  },

  // Facebook Post - Announcement
  {
    id: "fb-announce-1",
    name: "Big Announcement",
    category: "facebook",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 628,
    thumbnail: "📢",
    description: "Professional announcement template",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 628,
        backgroundColor: "#1877F2",
        editable: false,
      },
      {
        type: "shape",
        id: "left-panel",
        x: 0,
        y: 0,
        width: 600,
        height: 628,
        backgroundColor: "#0D47A1",
        editable: false,
      },
      {
        type: "image",
        id: "main-img",
        x: 650,
        y: 64,
        width: 500,
        height: 500,
        placeholder: "Main Image",
        editable: true,
        borderRadius: 20,
      },
      {
        type: "text",
        id: "label",
        x: 60,
        y: 120,
        width: 480,
        height: 60,
        content: "ANNOUNCEMENT",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        opacity: 0.7,
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 60,
        y: 200,
        width: 480,
        height: 200,
        content: "Big News Coming Soon",
        fontSize: 56,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "subtitle",
        x: 60,
        y: 420,
        width: 480,
        height: 100,
        content: "Stay tuned for updates",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        opacity: 0.9,
        editable: true,
      },
    ],
  },

  // Twitter/X Post
  {
    id: "twitter-tip-1",
    name: "Quick Tip",
    category: "twitter",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    thumbnail: "💡",
    description: "Helpful tip or fact card",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 675,
        backgroundColor: "#14171A",
        editable: false,
      },
      {
        type: "text",
        id: "label",
        x: 80,
        y: 80,
        width: 300,
        height: 80,
        content: "💡 QUICK TIP",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#1DA1F2",
        editable: true,
      },
      {
        type: "text",
        id: "tip",
        x: 80,
        y: 200,
        width: 1040,
        height: 300,
        content: "Your helpful tip or interesting fact goes here",
        fontSize: 52,
        fontFamily: "Inter",
        fontWeight: "600",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "footer",
        x: 80,
        y: 560,
        width: 1040,
        height: 60,
        content: "@YourBrand",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#8899A6",
        editable: true,
      },
    ],
  },

  // LinkedIn Post
  {
    id: "linkedin-insight-1",
    name: "Professional Insight",
    category: "linkedin",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 628,
    thumbnail: "📊",
    description: "Professional content template",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 628,
        backgroundColor: "#FFFFFF",
        editable: false,
      },
      {
        type: "shape",
        id: "accent-bar",
        x: 0,
        y: 0,
        width: 20,
        height: 628,
        backgroundColor: "#0A66C2",
        editable: false,
      },
      {
        type: "text",
        id: "category",
        x: 80,
        y: 80,
        width: 400,
        height: 60,
        content: "INDUSTRY INSIGHTS",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#0A66C2",
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 80,
        y: 170,
        width: 1040,
        height: 200,
        content: "Key Takeaway or Insight",
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#000000",
        editable: true,
      },
      {
        type: "text",
        id: "subtitle",
        x: 80,
        y: 400,
        width: 1040,
        height: 120,
        content: "Supporting detail or statistic",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#666666",
        editable: true,
      },
    ],
  },

  // YouTube Thumbnail
  {
    id: "youtube-thumb-1",
    name: "Bold Thumbnail",
    category: "youtube",
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    thumbnail: "▶️",
    description: "Eye-catching video thumbnail",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        backgroundColor: "#FF0000",
        editable: false,
      },
      {
        type: "image",
        id: "thumbnail-img",
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        placeholder: "Thumbnail Image",
        editable: true,
        opacity: 0.6,
      },
      {
        type: "shape",
        id: "text-bg",
        x: 80,
        y: 480,
        width: 1120,
        height: 160,
        backgroundColor: "#000000",
        opacity: 0.7,
        borderRadius: 20,
        editable: false,
      },
      {
        type: "text",
        id: "title",
        x: 120,
        y: 510,
        width: 1040,
        height: 100,
        content: "CLICKABLE VIDEO TITLE",
        fontSize: 72,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // Promotional - Limited Offer
  {
    id: "promo-limited-1",
    name: "Limited Time Offer",
    category: "promotional",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    thumbnail: "⏰",
    description: "Urgency-driven promotional template",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        backgroundColor: "#FFA500",
        editable: false,
      },
      {
        type: "shape",
        id: "circle",
        x: 240,
        y: 240,
        width: 600,
        height: 600,
        backgroundColor: "#FFFFFF",
        borderRadius: 300,
        editable: false,
      },
      {
        type: "text",
        id: "percentage",
        x: 340,
        y: 380,
        width: 400,
        height: 180,
        content: "30%",
        fontSize: 120,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFA500",
        editable: true,
      },
      {
        type: "text",
        id: "off-label",
        x: 340,
        y: 560,
        width: 400,
        height: 80,
        content: "OFF",
        fontSize: 56,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#333333",
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 90,
        y: 90,
        width: 900,
        height: 100,
        content: "LIMITED TIME OFFER",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "subtitle",
        x: 90,
        y: 900,
        width: 900,
        height: 80,
        content: "Ends This Weekend",
        fontSize: 42,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },
];

export function TemplateToolControls({
  isProcessing,
  currentImageUrl,
  onApplyTemplate,
}: TemplateToolControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [customizations, setCustomizations] = useState<Record<string, any>>({});

  const filteredTemplates =
    selectedCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // Initialize customizations with template defaults
    const initial: Record<string, any> = {};
    template.elements.forEach((el) => {
      if (el.editable) {
        initial[el.id] = {
          content: el.content || el.placeholder || "",
          color: el.color,
          fontSize: el.fontSize,
          backgroundColor: el.backgroundColor,
        };
      }
    });
    setCustomizations(initial);
  };

  const handleCustomizationChange = (
    elementId: string,
    field: string,
    value: any
  ) => {
    setCustomizations((prev) => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        [field]: value,
      },
    }));
  };

  const handleApply = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    // Merge customizations with template
    const finalTemplate = {
      ...selectedTemplate,
      elements: selectedTemplate.elements.map((el) => ({
        ...el,
        ...(customizations[el.id] || {}),
      })),
      currentImage: currentImageUrl,
    };

    onApplyTemplate(finalTemplate);
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Category Selector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Category</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {!selectedTemplate ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Templates ({filteredTemplates.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition text-left"
              >
                <div className="text-3xl mb-2 text-center">
                  {template.thumbnail}
                </div>
                <div className="text-xs font-semibold text-gray-900">
                  {template.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.aspectRatio}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Template Customization */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedTemplate.name}
            </h3>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              ← Back
            </button>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
            <p className="font-semibold mb-1">📝 Customize Your Template</p>
            <p>{selectedTemplate.description}</p>
            <p className="mt-1 text-blue-600">
              Size: {selectedTemplate.width} × {selectedTemplate.height}px
            </p>
          </div>

          {/* Editable Elements */}
          <div className="space-y-3">
            {selectedTemplate.elements
              .filter((el) => el.editable)
              .map((element) => (
                <div
                  key={element.id}
                  className="p-3 border border-gray-200 rounded-lg space-y-2"
                >
                  <label className="block text-xs font-semibold text-gray-700">
                    {element.type === "text"
                      ? `Text: ${element.id}`
                      : `Image: ${element.placeholder || element.id}`}
                  </label>

                  {element.type === "text" && (
                    <>
                      <textarea
                        value={
                          customizations[element.id]?.content || element.content
                        }
                        onChange={(e) =>
                          handleCustomizationChange(
                            element.id,
                            "content",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={
                            customizations[element.id]?.color || element.color
                          }
                          onChange={(e) =>
                            handleCustomizationChange(
                              element.id,
                              "color",
                              e.target.value
                            )
                          }
                          className="w-10 h-8 rounded border border-gray-300"
                        />
                        <input
                          type="number"
                          value={
                            customizations[element.id]?.fontSize ||
                            element.fontSize
                          }
                          onChange={(e) =>
                            handleCustomizationChange(
                              element.id,
                              "fontSize",
                              Number(e.target.value)
                            )
                          }
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Font size"
                        />
                      </div>
                    </>
                  )}

                  {element.type === "image" && (
                    <div className="text-xs text-gray-500">
                      Image will be placed at: {element.width} ×{" "}
                      {element.height}px
                      <br />
                      Upload your image when applying the template
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t border-gray-200 py-3">
            <button
              onClick={() => setSelectedTemplate(null)}
              disabled={isProcessing}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {isProcessing ? "Creating..." : "Apply Template"}
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      {!selectedTemplate && (
        <div className="p-3 bg-blue-50 rounded text-xs text-blue-800">
          <p className="font-semibold mb-1">💡 Template Tips:</p>
          <ul className="space-y-1">
            <li>• Select a template to customize text and colors</li>
            <li>• Templates are optimized for each platform</li>
            <li>• All elements are editable after selection</li>
            <li>• Save as custom template (coming soon)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
