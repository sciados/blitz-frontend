"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getProxiedImageUrl } from "src/utils/imageProxy";

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

  // ========== AD TEMPLATES ==========

  // Facebook Ad - Square
  {
    id: "fb-ad-square",
    name: "Facebook Ad - Square",
    category: "promotional",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    thumbnail: "📱",
    description: "Facebook/Meta square ad format",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        backgroundColor: "#1877F2",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 90,
        y: 90,
        width: 900,
        height: 500,
        placeholder: "Product Image",
        editable: true,
        borderRadius: 15,
      },
      {
        type: "text",
        id: "headline",
        x: 90,
        y: 620,
        width: 900,
        height: 100,
        content: "Your Product Headline",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 90,
        y: 740,
        width: 900,
        height: 100,
        content: "Compelling description that drives action",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#E3F2FD",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 340,
        y: 880,
        width: 400,
        height: 100,
        backgroundColor: "#FFFFFF",
        borderRadius: 50,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 340,
        y: 895,
        width: 400,
        height: 70,
        content: "Learn More",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#1877F2",
        editable: true,
      },
    ],
  },

  // Facebook Ad - Landscape
  {
    id: "fb-ad-landscape",
    name: "Facebook Ad - Landscape",
    category: "promotional",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 628,
    thumbnail: "🖼️",
    description: "Facebook landscape ad format",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 628,
        backgroundColor: "#1C1C1C",
        editable: false,
      },
      {
        type: "image",
        id: "main-img",
        x: 0,
        y: 0,
        width: 600,
        height: 628,
        placeholder: "Product Image",
        editable: true,
      },
      {
        type: "text",
        id: "label",
        x: 640,
        y: 80,
        width: 520,
        height: 60,
        content: "ADVERTISEMENT",
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFD700",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 640,
        y: 160,
        width: 520,
        height: 120,
        content: "Catchy Headline That Converts",
        fontSize: 42,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 640,
        y: 300,
        width: 520,
        height: 120,
        content: "Describe the value proposition and benefits of your product or service",
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#CCCCCC",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 640,
        y: 460,
        width: 200,
        height: 80,
        backgroundColor: "#FFD700",
        borderRadius: 40,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 640,
        y: 475,
        width: 200,
        height: 50,
        content: "Shop Now",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#1C1C1C",
        editable: true,
      },
    ],
  },

  // Google Display Ad - Leaderboard
  {
    id: "gdn-leaderboard",
    name: "Google Display - Leaderboard",
    category: "promotional",
    aspectRatio: "728:90",
    width: 728,
    height: 90,
    thumbnail: "📏",
    description: "Google Display Network banner (728x90)",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 728,
        height: 90,
        backgroundColor: "#4A90E2",
        editable: false,
      },
      {
        type: "text",
        id: "headline",
        x: 20,
        y: 20,
        width: 400,
        height: 50,
        content: "Your Brand Name",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "cta",
        x: 580,
        y: 25,
        width: 128,
        height: 40,
        content: "Click Here",
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#4A90E2",
        editable: true,
      },
    ],
  },

  // Google Display Ad - Medium Rectangle
  {
    id: "gdn-rectangle",
    name: "Google Display - Medium Rectangle",
    category: "promotional",
    aspectRatio: "300:250",
    width: 300,
    height: 250,
    thumbnail: "▢",
    description: "Google Display medium rectangle (300x250)",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 300,
        height: 250,
        backgroundColor: "#E74C3C",
        editable: false,
      },
      {
        type: "text",
        id: "discount",
        x: 20,
        y: 20,
        width: 260,
        height: 60,
        content: "50% OFF",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 20,
        y: 90,
        width: 260,
        height: 60,
        content: "Limited Time Deal",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 20,
        y: 160,
        width: 260,
        height: 50,
        content: "Don't miss out!",
        fontSize: 20,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // Twitter/X Ad - Promoted Post
  {
    id: "twitter-ad",
    name: "Twitter Ad - Promoted",
    category: "promotional",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    thumbnail: "🐦",
    description: "Twitter/X promoted post format",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 675,
        backgroundColor: "#000000",
        editable: false,
      },
      {
        type: "image",
        id: "main-img",
        x: 0,
        y: 0,
        width: 1200,
        height: 675,
        placeholder: "Content Image",
        editable: true,
      },
      {
        type: "shape",
        id: "overlay",
        x: 0,
        y: 450,
        width: 1200,
        height: 225,
        backgroundColor: "#000000",
        opacity: 0.7,
        editable: false,
      },
      {
        type: "text",
        id: "headline",
        x: 80,
        y: 480,
        width: 1040,
        height: 100,
        content: "Your compelling tweet or message",
        fontSize: 56,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // LinkedIn Ad - Sponsored Content
  {
    id: "linkedin-ad",
    name: "LinkedIn Ad - Sponsored",
    category: "promotional",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 628,
    thumbnail: "💼",
    description: "LinkedIn sponsored content format",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 628,
        backgroundColor: "#0077B5",
        editable: false,
      },
      {
        type: "text",
        id: "label",
        x: 80,
        y: 80,
        width: 1040,
        height: 60,
        content: "Promoted",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 80,
        y: 160,
        width: 1040,
        height: 140,
        content: "Professional Headline That Drives Engagement",
        fontSize: 52,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 80,
        y: 320,
        width: 1040,
        height: 120,
        content: "Brief description of your product, service, or value proposition",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#E3F2FD",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 80,
        y: 480,
        width: 200,
        height: 70,
        backgroundColor: "#FFFFFF",
        borderRadius: 35,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 80,
        y: 492,
        width: 200,
        height: 50,
        content: "Learn More",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#0077B5",
        editable: true,
      },
    ],
  },

  // Instagram Story Ad
  {
    id: "ig-story-ad",
    name: "Instagram Story Ad",
    category: "promotional",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    thumbnail: "📖",
    description: "Instagram Story advertisement",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        backgroundColor: "#E1306C",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 0,
        y: 300,
        width: 1080,
        height: 1080,
        placeholder: "Product Image",
        editable: true,
      },
      {
        type: "text",
        id: "swipe-up",
        x: 90,
        y: 150,
        width: 900,
        height: 100,
        content: "SWIPE UP",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 240,
        y: 1620,
        width: 600,
        height: 100,
        backgroundColor: "#FFFFFF",
        borderRadius: 50,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 240,
        y: 1635,
        width: 600,
        height: 70,
        content: "Shop Now",
        fontSize: 40,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#E1306C",
        editable: true,
      },
    ],
  },

  // Pinterest Pin
  {
    id: "pinterest-pin",
    name: "Pinterest Pin",
    category: "promotional",
    aspectRatio: "2:3",
    width: 1000,
    height: 1500,
    thumbnail: "📌",
    description: "Standard Pinterest pin format",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1000,
        height: 1500,
        backgroundColor: "#BD081C",
        editable: false,
      },
      {
        type: "image",
        id: "pin-img",
        x: 50,
        y: 50,
        width: 900,
        height: 900,
        placeholder: "Pin Image",
        editable: true,
        borderRadius: 10,
      },
      {
        type: "text",
        id: "title",
        x: 50,
        y: 980,
        width: 900,
        height: 120,
        content: "Pin Title Goes Here",
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 50,
        y: 1120,
        width: 900,
        height: 200,
        content: "Description that entices users to click and engage",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // YouTube Ad - Overlay
  {
    id: "youtube-overlay",
    name: "YouTube Overlay Ad",
    category: "promotional",
    aspectRatio: "468:60",
    width: 468,
    height: 60,
    thumbnail: "▶️",
    description: "YouTube overlay advertisement",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 468,
        height: 60,
        backgroundColor: "#000000",
        opacity: 0.8,
        editable: false,
      },
      {
        type: "text",
        id: "headline",
        x: 10,
        y: 15,
        width: 300,
        height: 30,
        content: "Your Ad Headline",
        fontSize: 20,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "cta",
        x: 380,
        y: 15,
        width: 78,
        height: 30,
        content: "Visit",
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FF0000",
        editable: true,
      },
    ],
  },

  // Email Header Banner
  {
    id: "email-banner",
    name: "Email Header Banner",
    category: "promotional",
    aspectRatio: "600:200",
    width: 600,
    height: 200,
    thumbnail: "✉️",
    description: "Email newsletter header banner",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 600,
        height: 200,
        backgroundColor: "#2C3E50",
        editable: false,
      },
      {
        type: "image",
        id: "logo-img",
        x: 30,
        y: 50,
        width: 150,
        height: 100,
        placeholder: "Logo",
        editable: true,
        borderRadius: 10,
      },
      {
        type: "text",
        id: "headline",
        x: 200,
        y: 60,
        width: 370,
        height: 80,
        content: "Your Email Newsletter Title",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // General Promotional - Banner
  {
    id: "promo-banner",
    name: "Promotional Banner",
    category: "promotional",
    aspectRatio: "3:1",
    width: 1200,
    height: 400,
    thumbnail: "🎯",
    description: "General promotional banner",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 400,
        backgroundColor: "#8E44AD",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 50,
        y: 50,
        width: 300,
        height: 300,
        placeholder: "Product",
        editable: true,
        borderRadius: 20,
      },
      {
        type: "text",
        id: "discount",
        x: 400,
        y: 60,
        width: 750,
        height: 80,
        content: "SPECIAL OFFER",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFD700",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 400,
        y: 150,
        width: 750,
        height: 100,
        content: "Save Big on Quality Products",
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 400,
        y: 280,
        width: 250,
        height: 80,
        backgroundColor: "#FFD700",
        borderRadius: 40,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 400,
        y: 292,
        width: 250,
        height: 60,
        content: "Shop Now",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#8E44AD",
        editable: true,
      },
    ],
  },

  // Event Promotion
  {
    id: "event-promo",
    name: "Event Promotion",
    category: "promotional",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    thumbnail: "🎪",
    description: "Event announcement template",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        backgroundColor: "#1A1A1A",
        editable: false,
      },
      {
        type: "shape",
        id: "accent",
        x: 0,
        y: 0,
        width: 1080,
        height: 300,
        backgroundColor: "#E74C3C",
        editable: false,
      },
      {
        type: "text",
        id: "event-label",
        x: 90,
        y: 80,
        width: 900,
        height: 80,
        content: "LIVE EVENT",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "event-name",
        x: 90,
        y: 340,
        width: 900,
        height: 150,
        content: "Annual Tech Conference 2025",
        fontSize: 72,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "event-details",
        x: 90,
        y: 520,
        width: 900,
        height: 100,
        content: "Date • Time • Location",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#CCCCCC",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 340,
        y: 700,
        width: 400,
        height: 100,
        backgroundColor: "#E74C3C",
        borderRadius: 50,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 340,
        y: 715,
        width: 400,
        height: 70,
        content: "Register Now",
        fontSize: 40,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // Newsletter Signup
  {
    id: "newsletter-signup",
    name: "Newsletter Signup",
    category: "promotional",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    thumbnail: "📬",
    description: "Newsletter subscription promotion",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 675,
        backgroundColor: "#3498DB",
        editable: false,
      },
      {
        type: "text",
        id: "icon",
        x: 550,
        y: 120,
        width: 100,
        height: 100,
        content: "✉️",
        fontSize: 80,
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 200,
        y: 250,
        width: 800,
        height: 100,
        content: "Stay Updated",
        fontSize: 72,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 300,
        y: 370,
        width: 600,
        height: 80,
        content: "Get the latest news and updates",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#E3F2FD",
        editable: true,
      },
    ],
  },

  // ========== MORE LAYOUT VARIATIONS ==========

  // Facebook Ad - Split Layout
  {
    id: "fb-ad-split",
    name: "Facebook Ad - Split Layout",
    category: "promotional",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 628,
    thumbnail: "↔️",
    description: "Facebook split-screen layout",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 628,
        backgroundColor: "#2C3E50",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 40,
        y: 40,
        width: 520,
        height: 548,
        placeholder: "Product Image",
        editable: true,
        borderRadius: 15,
      },
      {
        type: "text",
        id: "label",
        x: 600,
        y: 80,
        width: 560,
        height: 60,
        content: "SPONSORED",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#95A5A6",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 600,
        y: 160,
        width: 560,
        height: 120,
        content: "Premium Product That Changes Everything",
        fontSize: 44,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "price",
        x: 600,
        y: 300,
        width: 560,
        height: 80,
        content: "$99.99",
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#E74C3C",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 600,
        y: 400,
        width: 560,
        height: 100,
        content: "High-quality product with amazing benefits",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#BDC3C7",
        editable: true,
      },
    ],
  },

  // Google Display - Skyscraper
  {
    id: "gdn-skyscraper",
    name: "Google Display - Skyscraper",
    category: "promotional",
    aspectRatio: "160:600",
    width: 160,
    height: 600,
    thumbnail: "📐",
    description: "Google Display tall banner (160x600)",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 160,
        height: 600,
        backgroundColor: "#9B59B6",
        editable: false,
      },
      {
        type: "text",
        id: "logo",
        x: 20,
        y: 30,
        width: 120,
        height: 40,
        content: "BRAND",
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 20,
        y: 100,
        width: 120,
        height: 120,
        content: "Amazing Product",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 20,
        y: 240,
        width: 120,
        height: 200,
        content: "Description text goes here",
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "shape",
        id: "cta-bg",
        x: 30,
        y: 480,
        width: 100,
        height: 50,
        backgroundColor: "#FFFFFF",
        borderRadius: 25,
        editable: false,
      },
      {
        type: "text",
        id: "cta",
        x: 30,
        y: 490,
        width: 100,
        height: 30,
        content: "Click",
        fontSize: 18,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#9B59B6",
        editable: true,
      },
    ],
  },

  // Instagram Post - Before/After
  {
    id: "ig-before-after",
    name: "Instagram Before/After",
    category: "promotional",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    thumbnail: "⚡",
    description: "Before and after comparison post",
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
        id: "before-img",
        x: 90,
        y: 90,
        width: 400,
        height: 400,
        placeholder: "Before",
        editable: true,
        borderRadius: 15,
      },
      {
        type: "image",
        id: "after-img",
        x: 590,
        y: 90,
        width: 400,
        height: 400,
        placeholder: "After",
        editable: true,
        borderRadius: 15,
      },
      {
        type: "text",
        id: "before-label",
        x: 90,
        y: 510,
        width: 400,
        height: 60,
        content: "BEFORE",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#95A5A6",
        editable: true,
      },
      {
        type: "text",
        id: "after-label",
        x: 590,
        y: 510,
        width: 400,
        height: 60,
        content: "AFTER",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#27AE60",
        editable: true,
      },
      {
        type: "text",
        id: "arrow",
        x: 490,
        y: 250,
        width: 100,
        height: 100,
        content: "→",
        fontSize: 80,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#E74C3C",
        editable: true,
      },
    ],
  },

  // Twitter/X Ad - Text Heavy
  {
    id: "twitter-ad-text",
    name: "Twitter Ad - Text Focus",
    category: "promotional",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    thumbnail: "📝",
    description: "Twitter ad with text-focused design",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 675,
        backgroundColor: "#1DA1F2",
        editable: false,
      },
      {
        type: "text",
        id: "quote",
        x: 120,
        y: 120,
        width: 960,
        height: 200,
        content: '"This product changed my life! Amazing results!"',
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "author",
        x: 120,
        y: 340,
        width: 960,
        height: 60,
        content: "— Happy Customer",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "handle",
        x: 120,
        y: 420,
        width: 960,
        height: 50,
        content: "@yourbrand",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#E3F2FD",
        editable: true,
      },
    ],
  },

  // LinkedIn Ad - Minimalist
  {
    id: "linkedin-ad-minimal",
    name: "LinkedIn Ad - Minimalist",
    category: "promotional",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 628,
    thumbnail: "◻️",
    description: "Clean minimalist LinkedIn ad",
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
        width: 1200,
        height: 8,
        backgroundColor: "#0A66C2",
        editable: false,
      },
      {
        type: "text",
        id: "company",
        x: 80,
        y: 80,
        width: 1040,
        height: 60,
        content: "Your Company Name",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#000000",
        editable: true,
      },
      {
        type: "text",
        id: "headline",
        x: 80,
        y: 160,
        width: 1040,
        height: 120,
        content: "Professional Solution for Modern Business",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "600",
        color: "#000000",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 80,
        y: 300,
        width: 1040,
        height: 120,
        content: "Streamline your workflow and boost productivity with our enterprise solution",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#666666",
        editable: true,
      },
    ],
  },

  // Instagram Story - Testimonial
  {
    id: "ig-story-testimonial",
    name: "Instagram Story - Testimonial",
    category: "promotional",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    thumbnail: "💬",
    description: "Customer testimonial story",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        backgroundColor: "#FFFFFF",
        editable: false,
      },
      {
        type: "shape",
        id: "avatar-bg",
        x: 390,
        y: 200,
        width: 300,
        height: 300,
        backgroundColor: "#F0F0F0",
        borderRadius: 150,
        editable: false,
      },
      {
        type: "image",
        id: "avatar",
        x: 430,
        y: 240,
        width: 220,
        height: 220,
        placeholder: "Avatar",
        editable: true,
        borderRadius: 110,
      },
      {
        type: "text",
        id: "name",
        x: 90,
        y: 550,
        width: 900,
        height: 80,
        content: "Sarah Johnson",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#000000",
        editable: true,
      },
      {
        type: "text",
        id: "role",
        x: 90,
        y: 630,
        width: 900,
        height: 60,
        content: "CEO, Tech Startup",
        fontSize: 28,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#666666",
        editable: true,
      },
      {
        type: "text",
        id: "quote",
        x: 90,
        y: 750,
        width: 900,
        height: 400,
        content: '"This product has transformed our business. Incredible results and amazing support!"',
        fontSize: 42,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#000000",
        editable: true,
      },
    ],
  },

  // Pinterest Ad - Vertical Promo
  {
    id: "pinterest-ad-vertical",
    name: "Pinterest Ad - Vertical",
    category: "promotional",
    aspectRatio: "2:3",
    width: 1000,
    height: 1500,
    thumbnail: "📊",
    description: "Vertical Pinterest advertisement",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1000,
        height: 1500,
        backgroundColor: "#F8F9FA",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 50,
        y: 50,
        width: 900,
        height: 700,
        placeholder: "Product Image",
        editable: true,
        borderRadius: 20,
      },
      {
        type: "shape",
        id: "discount-badge",
        x: 700,
        y: 50,
        width: 250,
        height: 100,
        backgroundColor: "#E74C3C",
        borderRadius: 50,
        editable: false,
      },
      {
        type: "text",
        id: "discount-text",
        x: 700,
        y: 70,
        width: 250,
        height: 60,
        content: "50% OFF",
        fontSize: 40,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 50,
        y: 800,
        width: 900,
        height: 120,
        content: "Must-Have Product for 2025",
        fontSize: 56,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#000000",
        editable: true,
      },
      {
        type: "text",
        id: "price",
        x: 50,
        y: 940,
        width: 900,
        height: 80,
        content: "$49.99",
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#E74C3C",
        editable: true,
      },
    ],
  },

  // YouTube Thumbnail - Split Screen
  {
    id: "youtube-split-thumb",
    name: "YouTube Thumb - Split Screen",
    category: "promotional",
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    thumbnail: "⚖️",
    description: "YouTube thumbnail with split comparison",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        backgroundColor: "#000000",
        editable: false,
      },
      {
        type: "image",
        id: "left-img",
        x: 0,
        y: 0,
        width: 640,
        height: 720,
        placeholder: "Before",
        editable: true,
      },
      {
        type: "image",
        id: "right-img",
        x: 640,
        y: 0,
        width: 640,
        height: 720,
        placeholder: "After",
        editable: true,
      },
      {
        type: "shape",
        id: "vs-circle",
        x: 590,
        y: 310,
        width: 100,
        height: 100,
        backgroundColor: "#FF0000",
        borderRadius: 50,
        editable: false,
      },
      {
        type: "text",
        id: "vs-text",
        x: 590,
        y: 340,
        width: 100,
        height: 40,
        content: "VS",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 80,
        y: 560,
        width: 1120,
        height: 100,
        content: "You Won't Believe This Transformation!",
        fontSize: 64,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
    ],
  },

  // Email - Product Showcase
  {
    id: "email-product-showcase",
    name: "Email - Product Showcase",
    category: "promotional",
    aspectRatio: "600:400",
    width: 600,
    height: 400,
    thumbnail: "🛍️",
    description: "Email product showcase banner",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 600,
        height: 400,
        backgroundColor: "#ECF0F1",
        editable: false,
      },
      {
        type: "image",
        id: "product-img",
        x: 30,
        y: 50,
        width: 250,
        height: 300,
        placeholder: "Product",
        editable: true,
        borderRadius: 15,
      },
      {
        type: "text",
        id: "label",
        x: 310,
        y: 60,
        width: 260,
        height: 50,
        content: "NEW ARRIVAL",
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#E74C3C",
        editable: true,
      },
      {
        type: "text",
        id: "title",
        x: 310,
        y: 120,
        width: 260,
        height: 100,
        content: "Featured Product Name",
        fontSize: 36,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#2C3E50",
        editable: true,
      },
      {
        type: "text",
        id: "description",
        x: 310,
        y: 230,
        width: 260,
        height: 80,
        content: "Short description of the product",
        fontSize: 20,
        fontFamily: "Inter",
        fontWeight: "normal",
        color: "#7F8C8D",
        editable: true,
      },
    ],
  },

  // Sale Banner - Diagonal
  {
    id: "sale-banner-diagonal",
    name: "Sale Banner - Diagonal",
    category: "promotional",
    aspectRatio: "3:1",
    width: 1200,
    height: 400,
    thumbnail: "💥",
    description: "Dynamic diagonal sale banner",
    elements: [
      {
        type: "background",
        id: "bg-1",
        x: 0,
        y: 0,
        width: 1200,
        height: 400,
        backgroundColor: "#C0392B",
        editable: false,
      },
      {
        type: "shape",
        id: "diagonal-shape",
        x: -100,
        y: 0,
        width: 500,
        height: 400,
        backgroundColor: "#E74C3C",
        opacity: 0.8,
        editable: false,
      },
      {
        type: "text",
        id: "sale-text",
        x: 50,
        y: 100,
        width: 400,
        height: 200,
        content: "SALE",
        fontSize: 120,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "percentage",
        x: 480,
        y: 150,
        width: 200,
        height: 100,
        content: "UP TO",
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#FFFFFF",
        editable: true,
      },
      {
        type: "text",
        id: "discount",
        x: 480,
        y: 200,
        width: 300,
        height: 100,
        content: "70% OFF",
        fontSize: 80,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#F39C12",
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
  const [currentImageDimensions, setCurrentImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [filterBySize, setFilterBySize] = useState(true);

  // Load image dimensions when currentImageUrl changes
  useEffect(() => {
    if (!currentImageUrl) {
      setCurrentImageDimensions(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setCurrentImageDimensions({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      console.error("Failed to load image for template filtering");
      setCurrentImageDimensions(null);
    };
    img.src = getProxiedImageUrl(currentImageUrl);
  }, [currentImageUrl]);

  // Filter templates by category
  const categoryFilteredTemplates =
    selectedCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  // Filter templates by image size (aspect ratio match)
  const sizeMatchedTemplates = filterBySize && currentImageDimensions
    ? categoryFilteredTemplates.filter((template) => {
        const templateAspect = template.width / template.height;
        const imageAspect = currentImageDimensions.width / currentImageDimensions.height;

        // Consider it a match if aspect ratios are close (within 10% tolerance)
        const aspectDifference = Math.abs(templateAspect - imageAspect);
        const aspectTolerance = 0.1;

        return aspectDifference <= aspectTolerance;
      })
    : categoryFilteredTemplates;

  const filteredTemplates = sizeMatchedTemplates;

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
      currentImage: currentImageUrl ? getProxiedImageUrl(currentImageUrl) : null,
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

      {/* Image Size Info */}
      {currentImageDimensions && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold">
            📐 Selected Image: {currentImageDimensions.width} × {currentImageDimensions.height}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            {filterBySize && " (filtered by size)"}
          </p>
        </div>
      )}

      {/* Filter Toggle */}
      {currentImageDimensions && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-700">Filter by image size</span>
          <button
            onClick={() => setFilterBySize(!filterBySize)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              filterBySize ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                filterBySize ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

      {/* No Matches Message */}
      {filteredTemplates.length === 0 && currentImageDimensions && filterBySize && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm text-yellow-800 font-semibold mb-2">
            No templates match this image size
          </p>
          <p className="text-xs text-yellow-700">
            Try disabling the size filter or selecting a different category
          </p>
          <button
            onClick={() => setFilterBySize(false)}
            className="mt-3 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-xs font-medium"
          >
            Show All Templates
          </button>
        </div>
      )}

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
