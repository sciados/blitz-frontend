export type User = {
    id: number;
    email: string;
    full_name?: string | null;
    role: string; // "user" | "business" | "affiliate" | "creator" | "admin"
    user_type?: string | null; // "Creator" | "Affiliate" | "Business" | "Admin" (for backward compatibility)
    developer_tier?: string | null; // "new" | "verified" | "premium"
    developer_tier_upgraded_at?: string | null;
    affiliate_tier?: string | null; // "standard" | "pro"
    affiliate_tier_upgraded_at?: string | null;
    stripe_subscription_id?: string | null;
    created_at: string;
};

export type Campaign = {
    id: number;
    user_id: number;
    name: string;
    product_url?: string | null; // Now optional - campaigns can be created without URL
    affiliate_network?: string | null;
    commission_rate?: string | null;
    affiliate_link?: string | null; // User's full affiliate URL
    affiliate_link_short_code?: string | null; // Auto-generated short code (e.g., "abc123")
    keywords?: string[];
    product_description?: string;
    product_type?: string;
    target_audience?: string;
    marketing_angles?: string[];
    status: "draft" | "active" | "paused" | "completed";
    product_intelligence_id?: number | null;
    intelligence_data?: any;
    thumbnail_image_url?: string | null; // Product thumbnail from ProductIntelligence
    created_at: string;
    updated_at: string;
};

export type CampaignCreate = {
    name: string;
    product_url?: string | null; // Optional - can add later or browse library
    affiliate_network?: string | null;
    commission_rate?: string | null;
    affiliate_link?: string | null; // Optional - user's affiliate URL (will be auto-shortened)
    keywords?: string[];
    product_description?: string;
    product_type?: string;
    target_audience?: string;
    marketing_angles?: string[];
    product_intelligence_id?: number | null; // Link to Product Library
};

// ============================================================================
// PRODUCT LIBRARY TYPES
// ============================================================================

export type ComplianceIssue = {
    severity: "critical" | "high" | "medium";
    type: string;
    message: string;
    suggestion?: string;
    location?: string;
};

export type ComplianceResult = {
    product_id?: number;
    product_name?: string | null;
    product_category?: string | null;
    status: "compliant" | "warning" | "violation";
    score: number;
    issues: ComplianceIssue[];
    warnings?: string[];
    summary?: string;
    compliant?: boolean;
};

export type ProductLibraryItem = {
    id: number;
    product_name: string | null;
    product_category: string | null;
    thumbnail_image_url: string | null;
    hero_media_url: string | null;
    affiliate_network: string | null;
    commission_rate: string | null;
    product_description: string | null;
    is_recurring: boolean;
    times_used: number;
    compiled_at: string;
    last_accessed_at: string | null;
    launch_date: string | null;
    // Product Developer info
    created_by_name: string | null;
    created_by_email: string | null;
    created_by_user_id: number | null;
    // Compliance info (optional)
    compliance?: ComplianceResult | null;
};

export type ProductDetails = {
    id: number;
    product_url: string;
    product_name: string | null;
    product_category: string | null;
    product_description: string | null;
    thumbnail_image_url: string | null;
    hero_media_url: string | null;
    affiliate_network: string | null;
    commission_rate: string | null;
    affiliate_link_url: string | null;
    is_recurring: boolean;
    intelligence_data: any;
    times_used: number;
    compiled_at: string;
    last_accessed_at: string | null;
    launch_date: string | null;
    compilation_version: string;
    // Product Developer info
    created_by_name: string | null;
    created_by_email: string | null;
    created_by_user_id: number | null;
    developer_tier: string | null;
    // Compliance info (optional)
    compliance?: ComplianceResult | null;
};

export type ProductLibraryStats = {
    total_products: number;
    total_categories: number;
    most_popular_category: string | null;
    newest_product: ProductLibraryItem | null;
    most_used_product: ProductLibraryItem | null;
};

export type ProductCategory = {
    category: string;
    count: number;
};

// ============================================================================
// CONTENT GENERATION TYPES
// ============================================================================

export type ContentType = "article" | "email" | "email_sequence" | "video_script" | "social_post" | "landing_page" | "ad_copy";

export type MarketingAngle =
    | "problem_solution"
    | "transformation"
    | "scarcity"
    | "authority"
    | "social_proof"
    | "comparison"
    | "story";

export type ComplianceStatus = "pending" | "compliant" | "warning" | "violation";

export type GeneratedContent = {
    id: number;
    campaign_id: number;
    content_type: ContentType;
    marketing_angle: MarketingAngle;
    content_data: {
        text: string;
        tone?: string;
        length?: string;
        // Email sequence specific fields
        subject?: string; // Email subject line
        email_number?: number; // Position in email sequence (1, 2, 3, etc.)
        metadata?: {
            prompt?: string;
            model?: string;
            context_sources?: string[];
            generation_time?: string;
            last_edited?: string;
            last_refined?: string;
            // Email sequence metadata
            total_emails?: number; // Total number of emails in sequence
            sequence_type?: string; // cold_to_hot, warm_to_hot, etc.
        };
        sections?: any[]; // For structured content like landing pages
    };
    compliance_status: ComplianceStatus;
    compliance_score?: number | null;
    compliance_notes?: string | null;
    version: number;
    parent_content_id?: number | null;
    created_at: string;
};

export type ContentGenerateRequest = {
    campaign_id: number;
    content_type: ContentType;
    marketing_angle: MarketingAngle;
    additional_context?: string;
    tone?: string;
    length?: string;
};

export type ContentRefineRequest = {
    refinement_instructions: string;
};

export type ContentVariationRequest = {
    num_variations?: number; // 1-10, default 3
    variation_type?: "tone" | "length" | "angle"; // What to vary
};

// ============================================================================
// URL SHORTENER TYPES
// ============================================================================

export type ShortenedLink = {
    id: number;
    short_code: string;
    short_url: string; // Full URL like "https://blitz.link/abc123"
    original_url: string;
    title?: string | null;
    campaign_id: number;
    total_clicks: number;
    unique_clicks: number;
    is_active: boolean;
    created_at: string;
};

export type CreateShortLinkRequest = {
    original_url: string;
    campaign_id: number;
    custom_slug?: string | null;
    title?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
};

export type LinkAnalytics = {
    short_code: string;
    total_clicks: number;
    unique_clicks: number;
    clicks_by_country: Array<{
        country_code: string | null;
        country_name: string | null;
        clicks: number;
    }>;
    clicks_by_device: {
        [key: string]: number; // mobile, tablet, desktop, bot, unknown
    };
    clicks_by_date: Array<{
        date: string;
        clicks: number;
    }>;
    period_days: number;
};

// ============================================================================
// IMAGE GENERATION TYPES
// ============================================================================

export type ImageType = "hero" | "product" | "social" | "ad" | "email" | "blog" | "infographic" | "comparison";

export type ImageStyle = "photorealistic" | "artistic" | "minimalist" | "lifestyle" | "product" | "illustration" | "retro" | "modern";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "21:9" | "4:3";

export type ImageSource = "generated" | "edited" | "uploaded" | "stock";

export type GeneratedImage = {
    id: number;
    source?: ImageSource;  // Added for unified image responses
    campaign_id: number;
    image_type: ImageType;
    style: ImageStyle;
    aspect_ratio: AspectRatio;
    prompt: string;
    image_url: string;
    thumbnail_url: string | null;
    provider: string;
    model: string;
    // Parent-child relationship for tracking image lineage
    parent_image_id?: number | null;
    // Transparency detection
    has_transparency?: boolean;
    metadata: {
        width: number;
        height: number;
        generation_time: number;
        campaign_intelligence_version: string | null;
        custom_params: any;
        is_enhanced?: boolean;  // Indicates if this is a protected seed/premium image
        has_layers?: boolean;  // Indicates if this image has overlay layers
        text_overlay?: boolean;  // Indicates if this image has text overlay
        image_overlay?: boolean;  // Indicates if this image has image overlay/composite
        is_edited?: boolean;  // Indicates if this is an edited image from the image editor
        operation_type?: string;  // Type of edit operation (inpainting, erase, etc.)
        edit_tool?: string;  // The tool used to edit the image (filters, resize, inpaint, erase, etc.)
        original_image_path?: string;  // Path to the original image
        r2_url?: string;  // Actual R2 URL for edited images (for re-editing)
    };
    ai_generation_cost?: number;
    created_at: string;
};

// Extended type for images in the content library (combines original and edited)
export type LibraryImage = GeneratedImage & {
    source: ImageSource;  // Updated from 'original' | 'edited' to use ImageSource
};

export type ImageGenerateRequest = {
    campaign_id: number;
    image_type: ImageType;
    style?: ImageStyle;
    aspect_ratio?: AspectRatio;
    custom_prompt?: string | null;
    highlight_features?: {
        ingredients: string[];
        features: string[];
        benefits: string[];
        pain_points: string[];
    };
};

export type ImageBatchRequest = {
    campaign_id: number;
    requests: Array<{
        image_type: ImageType;
        style?: ImageStyle;
        aspect_ratio?: AspectRatio;
        custom_prompt?: string | null;
    }>;
    highlight_features?: {
        ingredients: string[];
        features: string[];
        benefits: string[];
        pain_points: string[];
    };
};

export type ImageVariationRequest = {
    num_variations?: number; // 1-5, default 3
    variation_strength?: number; // 0.0-1.0, default 0.7
};

export type ImageUpgradeRequest = {
    campaign_id: number;
    draft_image_url: string;
    custom_prompt?: string;
    style?: ImageStyle;
    aspect_ratio?: AspectRatio;
    quality_boost?: boolean;
};

export type ImageSaveDraftRequest = {
    campaign_id: number;
    image_url: string;
    image_type: string;
    style?: ImageStyle;
    aspect_ratio?: AspectRatio;
    custom_prompt?: string;
    provider: string;
    model: string;
    prompt: string;
};

// ============================================================================
// PRODUCT ASSETS TYPES
// ============================================================================

export type AssetType = "product_image" | "lifestyle" | "detail" | "packaging";

export type ViewAngle = "front" | "side" | "angle" | "top" | "close_up" | "in_use" | "box" | "open";

export type ProductAsset = {
    id: number;
    campaign_id: number;
    asset_url: string;
    filename: string;
    asset_type: AssetType;
    view_angle?: ViewAngle | null;
    has_transparency: boolean;
    width: number;
    height: number;
    title?: string | null;
    description?: string | null;
    is_featured: boolean;
    display_order: number;
    times_used: number;
    created_at: string;
};

export type ProductAssetUploadRequest = {
    file: File;
    asset_type: AssetType;
    view_angle?: ViewAngle;
    title?: string;
    description?: string;
    is_featured?: boolean;
};

export type ProductAssetStats = {
    total_assets: number;
    transparent_assets: number;
    featured_assets: number;
    most_used_angle?: string | null;
    total_uses: number;
    quality_score: number;  // 0-100
};

export type AssetQualityFeedback = {
    score: number;
    rank: "bronze" | "silver" | "gold" | "platinum";
    feedback: string[];
    recommendations: string[];
};

// Helper to get quality rank from score
export function getAssetQualityRank(score: number): "bronze" | "silver" | "gold" | "platinum" {
    if (score >= 85) return "platinum";
    if (score >= 70) return "gold";
    if (score >= 50) return "silver";
    return "bronze";
}

// Helper to get feedback based on stats
export function getAssetQualityFeedback(stats: ProductAssetStats): AssetQualityFeedback {
    const feedback: string[] = [];
    const recommendations: string[] = [];

    // Quantity feedback
    if (stats.total_assets >= 15) {
        feedback.push("✅ Excellent asset library size");
    } else if (stats.total_assets >= 10) {
        feedback.push("✅ Good number of assets");
        recommendations.push("Add 5+ more assets for best results");
    } else if (stats.total_assets >= 5) {
        feedback.push("⚠️ Getting started");
        recommendations.push("Add 10+ more assets to improve affiliate creativity");
    } else {
        feedback.push("⚠️ Limited assets");
        recommendations.push("Need at least 5-10 transparent product images");
    }

    // Quality feedback
    if (stats.transparent_assets === stats.total_assets) {
        feedback.push("✅ All assets have transparency");
    } else {
        feedback.push("⚠️ Some assets missing transparency");
        recommendations.push("Ensure all product images have transparent backgrounds");
    }

    // Usage feedback
    if (stats.total_uses > 50) {
        feedback.push(`🔥 Assets used ${stats.total_uses} times by affiliates!`);
    } else if (stats.total_uses > 10) {
        feedback.push(`📈 Assets used ${stats.total_uses} times`);
    }

    const rank = getAssetQualityRank(stats.quality_score);

    return {
        score: stats.quality_score,
        rank,
        feedback,
        recommendations
    };
}

// ============================================================================
// EDITED IMAGE TYPES (for image editor results)
// ============================================================================

export type EditedImage = {
    id: number;
    source: "edited";
    campaign_id: number;
    image_url: string;
    thumbnail_url?: string | null;
    operation_type: string;
    parent_image_id?: number | null;
    has_transparency?: boolean;
    processing_time_ms?: number;
    api_cost_credits?: number;
    created_at: string;
    // Optional generated image fields (for edited AI images)
    image_type?: ImageType;
    style?: ImageStyle;
    aspect_ratio?: AspectRatio;
    prompt?: string;
    provider?: string;
    model?: string;
};

// Unified image type that can be either generated or edited
export type UnifiedImage = GeneratedImage | EditedImage;

// Type guard to check if image is generated
export function isGeneratedImage(image: UnifiedImage): image is GeneratedImage {
    return !image.source || image.source === "generated";
}

// Type guard to check if image is edited
export function isEditedImage(image: UnifiedImage): image is EditedImage {
    return image.source === "edited";
}

// Helper to get display info for image source
export function getImageSourceInfo(image: UnifiedImage) {
    const source = image.source || "generated";

    const config = {
        generated: {
            icon: "🎨",
            label: "AI Generated",
            badgeText: "Generated",
            color: "blue" as const,
        },
        edited: {
            icon: "✏️",
            label: "Edited",
            badgeText: isEditedImage(image)
                ? `Edited · ${formatOperationType(image.operation_type)}`
                : "Edited",
            color: "purple" as const,
        },
        uploaded: {
            icon: "📤",
            label: "Uploaded",
            badgeText: "Uploaded",
            color: "green" as const,
        },
        stock: {
            icon: "📚",
            label: "Stock",
            badgeText: "Stock",
            color: "gray" as const,
        },
    };

    return config[source];
}

// Format operation type for display
function formatOperationType(operationType?: string): string {
    if (!operationType) return "Unknown";

    const formatted = operationType
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return formatted;
}