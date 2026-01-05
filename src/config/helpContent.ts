// Centralized help content configuration for all pages
// This provides context-sensitive help in the right sidebar
//
// ⚠️ IMPORTANT: Every new page MUST have help content added here!
//
// When creating a new page:
// 1. Add a new entry to the helpContent object below
// 2. Use the page route as the key (e.g., "/your-page")
// 3. Include: title, description, steps (3-6), and tips (3-5)
// 4. For dynamic routes, use pattern syntax (e.g., "/campaigns/[id]")
//
// See CLAUDE.md for complete documentation and templates

export type HelpContent = {
  title: string;
  description: string;
  steps?: {
    number: number;
    title: string;
    description: string;
  }[];
  tips?: string[];
  links?: {
    label: string;
    href: string;
  }[];
};

export const helpContent: Record<string, HelpContent> = {
  // Dashboard - Product Developer
  "/dashboard/product-developer": {
    title: "Product Developer Dashboard",
    description: "Your central hub for managing products and tracking affiliate performance. Focus on growing your affiliate network and maximizing product sales.",
    steps: [
      {
        number: 1,
        title: "Add Products",
        description: "Click 'Add Product' to submit new products to the library. Provide sales page URL, commission structure, and product details.",
      },
      {
        number: 2,
        title: "Set Up Tracking",
        description: "Add conversion tracking code to your sales pages so you can attribute sales to affiliates and track revenue.",
      },
      {
        number: 3,
        title: "Publish Products",
        description: "Go to Products → Edit → Set Status to 'Active' to make products visible to affiliates.",
      },
      {
        number: 4,
        title: "Monitor Affiliate Activity",
        description: "Check Product Analytics and Conversions to see which affiliates are promoting your products and track sales.",
      },
      {
        number: 5,
        title: "Connect with Affiliates",
        description: "Browse the Affiliates page to find quality promoters and reach out with collaboration offers.",
      },
    ],
    tips: [
      "Add launch dates to create urgency - affiliates see countdown timers!",
      "Competitive commission rates (30-50%) attract more affiliates",
      "Add conversion tracking IMMEDIATELY after publishing - don't miss sales attribution",
      "Recurring commission products are highly sought after by affiliates",
      "Use Product Analytics to identify your top-performing affiliates",
      "Message top affiliates with exclusive offers or higher rates",
      "Monitor the affiliate leaderboard to find your best partners",
      "Check the Conversions page for detailed revenue breakdown",
    ],
  },

  // Dashboard - Marketer
  "/dashboard/affiliate-marketer": {
    title: "Marketer Dashboard",
    description: "Your central hub for building campaigns, generating content, and tracking performance. Focus on promoting products and driving conversions.",
    steps: [
      {
        number: 1,
        title: "Browse Products",
        description: "Visit the Product Library to find products with good commission rates and compliance checks.",
      },
      {
        number: 2,
        title: "Create Campaigns",
        description: "Click 'Create Campaign' for products you want to promote. Fill in your affiliate link and keywords.",
      },
      {
        number: 3,
        title: "Generate Intelligence",
        description: "Compile intelligence for your campaigns to get product insights, target audience, and marketing hooks.",
      },
      {
        number: 4,
        title: "Create Content",
        description: "Generate articles, emails, social posts, and images using your campaign's intelligence data.",
      },
      {
        number: 5,
        title: "Check Compliance",
        description: "Verify all content meets FTC guidelines before publishing to avoid violations.",
      },
      {
        number: 6,
        title: "Track Performance",
        description: "Monitor Analytics to see which campaigns and content are driving the most clicks and conversions.",
      },
    ],
    tips: [
      "Sort products by 'Launch Date (Soonest)' to find new opportunities",
      "Look for products with high commission rates and recurring income",
      "Generate multiple content variations and test what converts best",
      "Always check compliance before publishing - use the 'Fix Compliance' button",
      "Connect with product developers for exclusive deals",
      "Focus on products with proven conversion rates",
      "Use the Conversions page to track your earnings",
      "Build relationships with quality product developers",
    ],
  },

  // Dashboard - Generic (fallback)
  "/dashboard": {
    title: "Dashboard Overview",
    description: "Your personalized dashboard with quick access to relevant features.",
    steps: [
      {
        number: 1,
        title: "Explore Your Features",
        description: "Click any card to navigate to that feature.",
      },
      {
        number: 2,
        title: "Quick Actions",
        description: "Use the quick action buttons to add products, create campaigns, or generate content.",
      },
      {
        number: 3,
        title: "View Analytics",
        description: "Track your performance with comprehensive analytics.",
      },
      {
        number: 4,
        title: "Get Help",
        description: "Use the contextual help in the right sidebar for guided assistance.",
      },
    ],
    tips: [
      "Your dashboard is customized for your account type",
      "Product Developers see product management and affiliate tracking",
      "Marketers see campaign creation and content generation",
      "Check your account type in the left sidebar",
    ],
  },

  // Campaigns List
  "/campaigns": {
    title: "Campaign Management",
    description: "Create and manage your affiliate marketing campaigns. Each campaign represents a product you're promoting.",
    steps: [
      {
        number: 1,
        title: "Create Your First Campaign",
        description: "Click 'Create Campaign' and fill in the basic information about the product you're promoting.",
      },
      {
        number: 2,
        title: "Add Product Details",
        description: "Include the sales page URL, affiliate network, keywords, and product description.",
      },
      {
        number: 3,
        title: "Review and Edit",
        description: "Click on any campaign card or the Edit button to view details and make changes.",
      },
      {
        number: 4,
        title: "Generate Content",
        description: "Once your campaign is set up, use it to generate marketing content and intelligence.",
      },
    ],
    tips: [
      "Use descriptive campaign names to easily identify them later",
      "Add relevant keywords to improve content generation",
      "Keep product descriptions detailed but concise",
      "Update campaign status as you progress through your workflow",
    ],
  },

  // Campaigns List - Affiliate Marketer
  "/campaigns/affiliate": {
    title: "Your Marketing Campaigns",
    description: "Manage your campaigns to promote affiliate products. Each campaign is tied to a specific product with your affiliate link.",
    steps: [
      {
        number: 1,
        title: "Browse Products First",
        description: "Visit the Product Library to find products with good commission rates before creating campaigns.",
      },
      {
        number: 2,
        title: "Create from Product Library",
        description: "Click 'Create Campaign' on products you want to promote. Your campaign will auto-link to the product.",
      },
      {
        number: 3,
        title: "Set Your Affiliate Link",
        description: "Add your unique affiliate link for each campaign so you get credit for sales.",
      },
      {
        number: 4,
        title: "Generate Intelligence",
        description: "Compile intelligence to get target audience insights, key benefits, and marketing hooks.",
      },
      {
        number: 5,
        title: "Create Content",
        description: "Generate articles, emails, social posts, and landing pages using your campaign's intelligence.",
      },
      {
        number: 6,
        title: "Track Performance",
        description: "Monitor clicks, conversions, and earnings in the Analytics section.",
      },
    ],
    tips: [
      "Sort products by commission rate to find the most profitable opportunities",
      "Standard affiliates can only create campaigns from the Product Library",
      "Pro affiliates can create campaigns with any product URL",
      "Generate multiple content variations and test what converts best",
      "Check compliance status before publishing any content",
      "Focus on products with recurring commissions for steady income",
    ],
  },

  // Campaigns List - Product Developer
  "/campaigns/creator": {
    title: "View Affiliate Campaigns",
    description: "See which affiliates are promoting your products. You can't create campaigns here - this shows your affiliates' marketing efforts.",
    steps: [
      {
        number: 1,
        title: "Campaign Cards",
        description: "Each card shows an affiliate's campaign for your product, including campaign status and last activity.",
      },
      {
        number: 2,
        title: "Campaign Status",
        description: "View campaign status (draft, active, paused) to understand what your affiliates are working on.",
      },
      {
        number: 3,
        title: "View Campaign Details",
        description: "Click on any campaign to see what content and strategies your affiliates are using.",
      },
      {
        number: 4,
        title: "Monitor Performance",
        description: "Track conversions and revenue by visiting Analytics → Conversions.",
      },
    ],
    tips: [
      "These campaigns belong to your affiliates, not you",
      "Use this view to see what's working for your top affiliates",
      "Reach out to successful affiliates to discuss higher rates or exclusive offers",
      "Check which products are getting the most affiliate attention",
      "Use Product Analytics to see which affiliates drive the most sales",
    ],
  },

  // Campaigns List - Business
  "/campaigns/business": {
    title: "Campaign Overview",
    description: "View all affiliate marketing campaigns across your product portfolio. Track performance and identify top-performing campaigns.",
    steps: [
      {
        number: 1,
        title: "Campaign Portfolio",
        description: "See all affiliate campaigns for your products in one unified view.",
      },
      {
        number: 2,
        title: "Filter by Product",
        description: "Filter campaigns to focus on specific products or product categories.",
      },
      {
        number: 3,
        title: "Performance Metrics",
        description: "View campaign performance including clicks, conversions, and revenue.",
      },
      {
        number: 4,
        title: "Affiliate Insights",
        description: "Identify which affiliates are most active and successful.",
      },
    ],
    tips: [
      "Use filters to focus on high-performing products",
      "Reach out to top-performing affiliates for exclusive partnerships",
      "Consider increasing commissions for products with strong affiliate engagement",
      "Monitor campaign activity to identify dormant affiliates",
    ],
  },

  // Campaign Details
  "/campaigns/[id]": {
    title: "Campaign Details",
    description: "View and manage all aspects of your campaign, from basic information to generated content.",
    steps: [
      {
        number: 1,
        title: "Review Campaign Info",
        description: "Check all campaign details including product URL, keywords, and description.",
      },
      {
        number: 2,
        title: "Update Campaign Status",
        description: "Change status between Draft, Active, Paused, or Completed as your campaign progresses.",
      },
      {
        number: 3,
        title: "Edit Campaign Details",
        description: "Click the Edit button to update campaign information (Note: URL and affiliate network cannot be changed).",
      },
      {
        number: 4,
        title: "Generate Intelligence",
        description: "Use 'Compile Intelligence' to analyze the sales page and extract key information.",
      },
      {
        number: 5,
        title: "Create Content",
        description: "Generate marketing content based on your campaign and intelligence data.",
      },
      {
        number: 6,
        title: "Check Compliance",
        description: "Verify your content meets FTC guidelines and affiliate network requirements.",
      },
    ],
    tips: [
      "Set status to 'Active' when you're ready to start promoting",
      "Generate intelligence before creating content for better results",
      "Always run compliance checks before publishing content",
      "Use 'Paused' status for seasonal campaigns",
    ],
  },

  // Content Hub
  "/content": {
    title: "Content Generation Hub",
    description: "Central hub for generating AI-powered marketing content. Choose between text or image generation based on your needs.",
    steps: [
      {
        number: 1,
        title: "Select Your Campaign",
        description: "Choose the campaign you want to generate content for. All generated content will use your campaign's intelligence data.",
      },
      {
        number: 2,
        title: "Choose Content Type",
        description: "Select Text Content for articles, emails, videos, social posts, landing pages, and ads. Select Image Content for marketing visuals.",
      },
      {
        number: 3,
        title: "Configure Settings",
        description: "In the next screen, configure specific settings like tone, length, style, or aspect ratio based on your content type.",
      },
      {
        number: 4,
        title: "Generate Content",
        description: "AI will create content using your campaign's intelligence data (product info, target audience, marketing hooks, etc.).",
      },
      {
        number: 5,
        title: "Refine and Export",
        description: "Review, edit, regenerate, or download your content. All content is saved to your library for future use.",
      },
    ],
    tips: [
      "Always select a campaign first - content quality depends on campaign intelligence",
      "Use Text Content for copywriting (emails, articles, scripts)",
      "Use Image Content for visual marketing assets",
      "Generated content uses your campaign's product info, audience insights, and marketing angles",
      "All content is automatically saved to your library",
    ],
  },

  // Content Hub - Affiliate Marketer
  "/content/affiliate": {
    title: "Generate Marketing Content",
    description: "Create high-converting marketing content using AI. Content is customized based on your campaign's product and target audience.",
    steps: [
      {
        number: 1,
        title: "Select Your Campaign",
        description: "Choose the campaign you want to create content for. Each campaign has unique product intelligence.",
      },
      {
        number: 2,
        title: "Generate Intelligence (if needed)",
        description: "If your campaign doesn't have intelligence yet, compile it first to get audience insights and marketing hooks.",
      },
      {
        number: 3,
        title: "Choose Content Type",
        description: "Select Text Content (articles, emails, videos, social posts, landing pages, ads) or Image Content (visuals).",
      },
      {
        number: 4,
        title: "Customize Parameters",
        description: "Set marketing angle (problem/solution, transformation, etc.), tone (professional, casual), and desired length.",
      },
      {
        number: 5,
        title: "Generate and Review",
        description: "AI creates content using your campaign's intelligence. Check compliance score and use 'Fix Compliance' if needed.",
      },
      {
        number: 6,
        title: "Save and Export",
        description: "Download, copy, or share your content. All content is saved to your library for future use.",
      },
    ],
    tips: [
      "The more detailed your campaign, the better the content quality",
      "Generate multiple variations and A/B test to find what converts best",
      "Always check compliance before publishing - FTC violations can be costly",
      "Use the 'Fix Compliance' button to automatically add required disclosures",
      "Create a content mix: articles for SEO, emails for nurturing, social posts for engagement",
      "Landing pages and articles work best for cold traffic; emails for warm audiences",
    ],
  },

  // Content Hub - Product Developer
  "/content/creator": {
    title: "Review Affiliate Content",
    description: "View content created by your affiliates. You can't generate content here, but you can review what's being created for your products.",
    steps: [
      {
        number: 1,
        title: "View Affiliate Content",
        description: "Browse content generated by affiliates promoting your products.",
      },
      {
        number: 2,
        title: "Content Library",
        description: "See articles, emails, social posts, and other content across all affiliates and campaigns.",
      },
      {
        number: 3,
        title: "Compliance Checking",
        description: "Verify that affiliate content meets your brand standards and legal requirements.",
      },
      {
        number: 4,
        title: "Quality Assessment",
        description: "Review content quality and messaging to ensure it aligns with your product positioning.",
      },
    ],
    tips: [
      "Use this to see what marketing angles your affiliates are using",
      "Share high-performing content examples with your affiliate network",
      "Provide content guidelines to affiliates for better quality",
      "Monitor compliance to protect your brand reputation",
      "Identify top-performing content and share strategies with other affiliates",
    ],
  },

  // Content Hub - Business
  "/content/business": {
    title: "Content Portfolio Management",
    description: "Oversee content creation across your affiliate network. Monitor quality, compliance, and performance.",
    steps: [
      {
        number: 1,
        title: "Portfolio Overview",
        description: "View all content created by affiliates across your product portfolio.",
      },
      {
        number: 2,
        title: "Filter by Product",
        description: "Focus on content for specific products or product categories.",
      },
      {
        number: 3,
        title: "Quality Monitoring",
        description: "Review content quality and ensure brand compliance across all affiliate content.",
      },
      {
        number: 4,
        title: "Performance Analysis",
        description: "Identify top-performing content types and marketing angles.",
      },
    ],
    tips: [
      "Use content performance data to inform product marketing strategies",
      "Provide content templates to improve affiliate output quality",
      "Monitor compliance to mitigate legal risks",
      "Recognize top-performing affiliates with bonuses or higher rates",
    ],
  },

  // Text Content Generation
  "/content/text": {
    title: "Text Content Generation",
    description: "Create, edit, and manage all your marketing text content with automatic compliance checking.",
    steps: [
      {
        number: 1,
        title: "Verify Campaign",
        description: "Your selected campaign is shown at the top. Content will use this campaign's intelligence data.",
      },
      {
        number: 2,
        title: "Choose Content Type",
        description: "Select the type of content you need (article, email, video script, social post, landing page, ad copy).",
      },
      {
        number: 3,
        title: "Set Parameters",
        description: "Choose marketing angle (problem/solution, transformation, etc.), tone (professional, casual), and length.",
      },
      {
        number: 4,
        title: "Generate Content",
        description: "Click Generate to create AI-powered content with automatic FTC compliance checking.",
      },
      {
        number: 5,
        title: "Review and Fix Compliance",
        description: "Check compliance score, fix any issues with 'Fix Compliance' button, then copy or download your content.",
      },
    ],
    tips: [
      "Generate multiple variations to test what works best",
      "Always run compliance checks before publishing",
      "Use 'Fix Compliance' button to automatically correct FTC issues",
      "Email sequences generate multiple emails in one click",
      "Track which content performs best for future reference",
    ],
  },

  // Image Content Generation
  "/content/images": {
    title: "AI Image Generation",
    description: "Generate professional marketing images using rotating AI platforms with your campaign intelligence data.",
    steps: [
      {
        number: 1,
        title: "Verify Campaign",
        description: "Your selected campaign is shown at the top. Images will be generated using this campaign's intelligence data.",
      },
      {
        number: 2,
        title: "Choose Image Type",
        description: "Select the type of image: hero images, product shots, social media graphics, ad creatives, email headers, blog features, infographics, or comparison images.",
      },
      {
        number: 3,
        title: "Pick Style and Aspect Ratio",
        description: "Choose artistic style (photorealistic, artistic, minimalist, etc.) and aspect ratio (1:1 for Instagram, 16:9 for YouTube, 9:16 for Stories).",
      },
      {
        number: 4,
        title: "Generate Image",
        description: "Click Generate to create your image. The system rotates through multiple AI providers to optimize cost and quality.",
      },
      {
        number: 5,
        title: "Download or Regenerate",
        description: "Download images you like or regenerate to get a different result. All images are saved to your library.",
      },
    ],
    tips: [
      "Images are generated using your campaign intelligence for better relevance",
      "Leave custom prompt blank to auto-generate from campaign data",
      "Use different aspect ratios for different platforms",
      "Regenerate images to try different AI providers and styles",
      "Download high-res images directly from the library",
      "All generated images include provider, model, and cost information",
    ],
  },

  // Intelligence
  "/intelligence": {
    title: "Campaign Intelligence",
    description: "View compiled intelligence data including product information, market analysis, and marketing insights for your campaigns.",
    steps: [
      {
        number: 1,
        title: "Select a Campaign",
        description: "Use the dropdown at the top to select a campaign. Campaigns with intelligence data show a ✓ checkmark.",
      },
      {
        number: 2,
        title: "Review Product Information",
        description: "View extracted product features, benefits, and descriptions from the sales page.",
      },
      {
        number: 3,
        title: "Analyze Market Data",
        description: "Study the target audience profiles, pain points, and market positioning insights.",
      },
      {
        number: 4,
        title: "Use Marketing Intelligence",
        description: "Review marketing hooks, angles, CTAs, and testimonials to inform your content strategy.",
      },
      {
        number: 5,
        title: "Check Sales Page Analysis",
        description: "View the extracted headline, subheadline, and key messaging from the original sales page.",
      },
    ],
    tips: [
      "Intelligence data is automatically compiled when adding products to the Product Library",
      "Use the pain points and benefits to create more resonant marketing copy",
      "Reference marketing hooks and angles when generating campaign content",
      "The raw data view at the bottom shows the complete intelligence structure",
      "Campaigns without intelligence show '(No intelligence data)' in the dropdown",
    ],
  },

  // Intelligence - Affiliate Marketer
  "/intelligence/affiliate": {
    title: "Product Intelligence Insights",
    description: "Access detailed product research and marketing insights compiled from the sales page. Use this data to create high-converting marketing campaigns.",
    steps: [
      {
        number: 1,
        title: "Select Your Campaign",
        description: "Choose which campaign's intelligence you want to review from the dropdown menu.",
      },
      {
        number: 2,
        title: "Review Product Information",
        description: "Understand the product's main benefits, features, and selling points.",
      },
      {
        number: 3,
        title: "Study Target Audience",
        description: "Review pain points, demographics, and interests to better target your marketing.",
      },
      {
        number: 4,
        title: "Analyze Competitors",
        description: "See what competitors are doing and identify opportunities to differentiate.",
      },
      {
        number: 5,
        title: "Use Marketing Hooks",
        description: "Reference the suggested marketing angles and hooks when creating content.",
      },
      {
        number: 6,
        title: "Apply to Content",
        description: "Use intelligence insights to write better sales copy and marketing messages.",
      },
    ],
    tips: [
      "The more intelligence you have, the better your content will perform",
      "Use pain points to create emotional hooks in your marketing",
      "Reference competitor analysis to position your marketing differently",
      "Marketing hooks save you time - don't reinvent the wheel",
      "Combine multiple marketing angles for better conversion rates",
      "Use the raw data section to dive deeper into research details",
    ],
  },

  // Intelligence - Product Developer
  "/intelligence/creator": {
    title: "Intelligence Compilation",
    description: "View how product intelligence is compiled for affiliates. See what data is extracted and made available to your affiliate network.",
    steps: [
      {
        number: 1,
        title: "Select Your Product",
        description: "Choose a product from your catalog to view its intelligence compilation.",
      },
      {
        number: 2,
        title: "Review Compiled Data",
        description: "See how your sales page data was extracted and structured for affiliates.",
      },
      {
        number: 3,
        title: "Verify Accuracy",
        description: "Ensure product information, benefits, and claims are accurately captured.",
      },
      {
        number: 4,
        title: "Market Analysis",
        description: "Review competitor analysis and market positioning data.",
      },
      {
        number: 5,
        title: "Affiliate Insights",
        description: "See what target audience insights and marketing angles are provided to affiliates.",
      },
    ],
    tips: [
      "Accurate intelligence = better affiliate performance",
      "Update product information when you make changes to your sales page",
      "Use market analysis to identify positioning opportunities",
      "Provide clear benefit statements for better affiliate marketing",
      "Review affiliate feedback to improve intelligence quality",
    ],
  },

  // Intelligence - Business
  "/intelligence/business": {
    title: "Intelligence Portfolio",
    description: "Oversee intelligence compilation across your product portfolio. Ensure all products have comprehensive data for affiliates.",
    steps: [
      {
        number: 1,
        title: "Portfolio Overview",
        description: "View intelligence status across all products in your catalog.",
      },
      {
        number: 2,
        title: "Coverage Analysis",
        description: "Identify products missing intelligence data or needing updates.",
      },
      {
        number: 3,
        title: "Quality Review",
        description: "Ensure intelligence data accurately represents your products.",
      },
      {
        number: 4,
        title: "Affiliate Impact",
        description: "Monitor how intelligence quality affects affiliate performance.",
      },
    ],
    tips: [
      "Products without intelligence get less affiliate attention",
      "Regularly update intelligence for new product launches",
      "Use intelligence data to optimize product positioning",
      "Monitor which intelligence elements drive the most conversions",
    ],
  },

  // Compliance
  "/compliance": {
    title: "Compliance Management",
    description: "Ensure all your marketing content meets FTC guidelines and affiliate network requirements.",
    steps: [
      {
        number: 1,
        title: "Select Content to Check",
        description: "Choose the content piece you want to verify for compliance.",
      },
      {
        number: 2,
        title: "Run Compliance Scan",
        description: "The system will check for required disclosures, claims verification, and network policies.",
      },
      {
        number: 3,
        title: "Review Issues",
        description: "Check any flagged issues or warnings that need attention.",
      },
      {
        number: 4,
        title: "Make Corrections",
        description: "Fix any compliance issues and re-run the check.",
      },
      {
        number: 5,
        title: "Approve Content",
        description: "Once all checks pass, mark the content as compliant and ready to publish.",
      },
    ],
    tips: [
      "Always include proper affiliate disclosures",
      "Avoid making unsubstantiated claims",
      "Check compliance before publishing any content",
      "Stay updated on FTC guidelines and network policies",
      "Different networks may have different requirements",
    ],
  },

  // Analytics
  "/analytics": {
    title: "Analytics & Performance",
    description: "Track campaign performance, content effectiveness, and ROI metrics.",
    steps: [
      {
        number: 1,
        title: "Select Time Period",
        description: "Choose the date range you want to analyze.",
      },
      {
        number: 2,
        title: "Review Campaign Performance",
        description: "Check which campaigns are performing best.",
      },
      {
        number: 3,
        title: "Analyze Content Metrics",
        description: "See which content types and variations are most effective.",
      },
      {
        number: 4,
        title: "Identify Trends",
        description: "Look for patterns to inform future campaign strategies.",
      },
    ],
    tips: [
      "Compare performance across different campaigns",
      "Track conversion rates and ROI",
      "Identify top-performing content for replication",
      "Use data to optimize your marketing strategy",
    ],
  },

  // Settings
  "/settings": {
    title: "Account Settings",
    description: "Manage your account preferences, API keys, and system configuration.",
    steps: [
      {
        number: 1,
        title: "Update Profile",
        description: "Keep your account information up to date.",
      },
      {
        number: 2,
        title: "Configure Preferences",
        description: "Set your default options for content generation and compliance checks.",
      },
      {
        number: 3,
        title: "Manage API Keys",
        description: "Add or update API keys for AI services and affiliate networks.",
      },
      {
        number: 4,
        title: "Set Notification Preferences",
        description: "Choose how and when you want to receive notifications.",
      },
    ],
    tips: [
      "Keep your API keys secure and rotate them regularly",
      "Set up notification preferences to stay informed",
      "Configure default compliance rules for your networks",
      "Review your settings periodically",
    ],
  },

  // Product Developer Analytics
  "/product-analytics": {
    title: "Product Developer Analytics",
    description: "Track how affiliates are promoting your products and monitor affiliate performance across your product line. See traffic, clicks, conversions, and revenue by affiliate.",
    steps: [
      {
        number: 1,
        title: "Review Affiliate Performance",
        description: "Check which affiliates are promoting your products and how much traffic they're driving.",
      },
      {
        number: 2,
        title: "Analyze Product Metrics",
        description: "See which products are getting the most promotion and generating the most clicks and conversions.",
      },
      {
        number: 3,
        title: "Monitor the Leaderboard",
        description: "Track top-performing affiliates and identify your best partners in the affiliate leaderboard.",
      },
      {
        number: 4,
        title: "Track Click-Through Rates",
        description: "Monitor total clicks vs unique visitors to understand traffic quality from each affiliate.",
      },
      {
        number: 5,
        title: "View Conversion Data",
        description: "See which affiliates are actually driving sales, not just clicks. Check the Conversions page for detailed revenue breakdown.",
      },
      {
        number: 6,
        title: "Identify Top Performers",
        description: "Find your best-performing affiliates and consider offering them exclusive deals or higher commission rates.",
      },
    ],
    tips: [
      "Top affiliates deserve special attention - consider reaching out to them with exclusive offers",
      "Monitor unique click rates to identify high-quality traffic sources",
      "Products with many campaigns but low clicks might need better marketing materials or higher commissions",
      "Use the affiliate leaderboard to create performance-based incentive programs",
      "Track which products attract the most affiliates to inform future product development",
      "Compare conversion rates across affiliates to identify best practices",
      "Review the Conversions page regularly for detailed revenue and commission tracking",
      "Consider adjusting commission rates for underperforming products to attract more affiliates",
    ],
  },

  // Profile
  "/profile": {
    title: "User Profile",
    description: "Manage your account information, upload a profile image, view your statistics, and configure security settings.",
    steps: [
      {
        number: 1,
        title: "Edit Your Profile",
        description: "Click 'Edit Profile' to update your full name and upload a profile image.",
      },
      {
        number: 2,
        title: "Upload Profile Image",
        description: "Click 'Choose image file' to select a photo (JPG, PNG, GIF, or WebP, max 5MB). Preview appears instantly, then click 'Upload' to save.",
      },
      {
        number: 3,
        title: "View Your Statistics",
        description: "Scroll down to see user-type-specific statistics. Product Developers see product and affiliate metrics, while Marketers see campaign and content stats.",
      },
      {
        number: 4,
        title: "Review Account Security",
        description: "Check the Account Security section to manage your password and view active sessions.",
      },
    ],
    tips: [
      "Profile images appear in the header dropdown and throughout the platform",
      "Recommended image size is 400x400px for best results",
      "Your account type (Product Developer or Marketer) determines which statistics you see",
      "Profile information is visible to other users when you collaborate on campaigns",
      "Keep your email up to date as it's used for important notifications",
    ],
  },

  // Products
  "/products": {
    title: "Product Library",
    description: "Browse available products to promote, or add your own products for affiliates to discover. The Product Library is the central marketplace connecting Product Developers and Marketers.",
    steps: [
      {
        number: 1,
        title: "Browse Available Products",
        description: "Scroll through product cards to find items you want to promote. Click any card to view full details.",
      },
      {
        number: 2,
        title: "View Product Details",
        description: "Click a product card to open the details panel showing description, category, commission info, and marketing intelligence.",
      },
      {
        number: 3,
        title: "Create Campaign (Affiliates)",
        description: "In the product details panel, click 'Create Campaign' to start promoting that product with pre-filled information.",
      },
      {
        number: 4,
        title: "Add Your Products (Developers)",
        description: "Product Developers can add their own products by clicking 'Add Product' and filling in product details, pricing, and commission structure.",
      },
      {
        number: 5,
        title: "View Tracking Code (Developers)",
        description: "In your product details panel, scroll to 'Conversion Tracking Code' to get JavaScript snippets for tracking affiliate sales.",
      },
      {
        number: 6,
        title: "Monitor Product Performance",
        description: "Product Developers can track conversions, revenue, and affiliate performance for each of their products.",
      },
    ],
    tips: [
      "Use the search bar to find products by name or category",
      "Filter by commission type (recurring vs one-time) to match your promotion strategy",
      "Products with compiled intelligence provide better marketing insights",
      "Look for products with high commission rates and proven conversion rates",
      "Product Developers: detailed product information helps affiliates promote more effectively",
      "Creating a campaign from the Product Library auto-fills product details",
      "Add conversion tracking code to your sales pages to attribute sales to affiliates",
      "Check the Conversions page regularly to monitor affiliate performance",
    ],
  },

  // Add Product
  "/products/add": {
    title: "Add New Product",
    description: "Product Developers can add their products to the library for affiliates to discover and promote. Fill in product details and the system will automatically compile intelligence.",
    steps: [
      {
        number: 1,
        title: "Enter Product URL",
        description: "Provide the sales page URL. The system will use this to automatically compile intelligence and extract product information.",
      },
      {
        number: 2,
        title: "Fill Basic Information",
        description: "Enter product name, category, affiliate network, and commission rate. Be as detailed as possible to help affiliates promote effectively.",
      },
      {
        number: 3,
        title: "Add Description (Optional)",
        description: "Provide an optional product description to give affiliates more context about the product's benefits and target audience.",
      },
      {
        number: 4,
        title: "Set Commission Structure",
        description: "Choose between one-time or recurring commissions. Set the commission rate as a percentage (e.g., 50%) or fixed amount (e.g., $37/sale).",
      },
      {
        number: 5,
        title: "Configure Affiliate Link",
        description: "Provide the affiliate signup URL where affiliates can get their unique tracking links for this product.",
      },
      {
        number: 6,
        title: "Submit and Wait",
        description: "Click Submit. The system will automatically compile intelligence in the background (30-60 seconds). You'll receive a notification when it's complete.",
      },
      {
        number: 7,
        title: "Add Conversion Tracking",
        description: "After your product is created, go to Product Details → Conversion Tracking Code and add the tracking script to your sales pages.",
      },
    ],
    tips: [
      "Product is private by default - you can publish it later when ready",
      "Compile intelligence automatically extracts features, benefits, pain points, and marketing angles",
      "Higher commission rates attract more affiliates - consider 30-50% for competitive products",
      "Use the Product Details panel to edit details or publish your product after creation",
      "You can unpublish products to hide them from affiliates until ready",
      "Recurring commission products are highly sought after by Marketers",
      "Add conversion tracking immediately after publishing so you don't miss any affiliate sales",
    ],
  },

  // Tracking Code Guide
  "/tracking-code": {
    title: "Conversion Tracking Setup",
    description: "Add tracking code to your sales pages to automatically attribute sales to affiliates. This ensures affiliates get credit for their referrals and you can track performance.",
    steps: [
      {
        number: 1,
        title: "Get Your Tracking Code",
        description: "Go to Product Library → Your Product → Scroll to 'Conversion Tracking Code' section. You'll find three code snippets to copy.",
      },
      {
        number: 2,
        title: "Add Script to ALL Pages (Step 1)",
        description: "Copy the 'Step 1' script and add it to the <head> section or before </body> on ALL pages of your website (sales page, upsells, thank you pages).",
      },
      {
        number: 3,
        title: "Add Conversion Code to Order Page (Step 2)",
        description: "Copy the 'Step 2' conversion script and add it ONLY to your order confirmation/thank you page (where customers see 'Order Successful').",
      },
      {
        number: 4,
        title: "Replace Placeholder Values",
        description: "In the conversion script, replace YOUR_ORDER_ID with your actual order ID and 0.00 with the actual order amount (e.g., 97.00).",
      },
      {
        number: 5,
        title: "Track Upsells & Downsells",
        description: "If you have upsells or downsells, copy the 'Tracking Upsells & Downsells' example and add it to each upsell/downsell order page.",
      },
      {
        number: 6,
        title: "Link Upsells to Main Order",
        description: "For upsells, set parentOrderId to your main order ID so all purchases in the funnel are attributed to the same affiliate.",
      },
      {
        number: 7,
        title: "Test the Tracking",
        description: "Test by visiting your site with an affiliate link (?aff=123), then completing a purchase. Check the Conversions page to verify the sale is tracked.",
      },
      {
        number: 8,
        title: "Monitor Conversions",
        description: "Visit the Conversions page regularly to see affiliate sales, revenue breakdown, and commission payments.",
      },
    ],
    tips: [
      "The tracking script must be on ALL pages for affiliate cookie attribution to work",
      "The conversion script should ONLY be on order confirmation pages",
      "Session-based tracking gives affiliates credit for the entire customer journey (main + upsells + downsells)",
      "The cookie lasts 60 days, so affiliates get credit for purchases up to 2 months later",
      "Blitz automatically calculates revenue split: affiliate commission + 5% Blitz fee + your net amount",
      "Use dynamic values (PHP variables) instead of hardcoded amounts for accurate tracking",
      "Test thoroughly before going live - missing tracking means lost affiliate commissions",
      "The tracking is invisible to customers and doesn't affect page load speed",
    ],
  },

  // Content Library
  "/library": {
    title: "Content Library",
    description: "Browse, manage, and refine all your generated content and images. Access text content and premium images you've created across all campaigns.",
    steps: [
      {
        number: 1,
        title: "Switch Between Tabs",
        description: "Use the tabs at the top to switch between Text Content and Images. Each tab shows content from all your campaigns.",
      },
      {
        number: 2,
        title: "Filter Your Content",
        description: "Filter by campaign, content type, or compliance status to find exactly what you need.",
      },
      {
        number: 3,
        title: "View and Edit Content",
        description: "Click any content item to view, edit, refine, or create variations. All edits are saved automatically.",
      },
      {
        number: 4,
        title: "Manage Images",
        description: "Browse your premium images, download them, add text overlays, or layer product images on top.",
      },
      {
        number: 5,
        title: "Check Compliance",
        description: "View compliance status for each content piece. Green = compliant, Yellow = warnings, Red = violations need fixing.",
      },
    ],
    tips: [
      "Content Library shows everything you've generated across all campaigns",
      "Use filters to quickly find content for specific campaigns or purposes",
      "Refine existing content instead of starting from scratch for better results",
      "Premium images are protected from accidental deletion",
      "Add images from campaign intelligence or upload your own for overlays",
    ],
  },

  // Content Library - Affiliate Marketer
  "/library/affiliate": {
    title: "Your Content Library",
    description: "Access all your generated content and images in one place. Organize, refine, and reuse content across campaigns.",
    steps: [
      {
        number: 1,
        title: "Browse Your Content",
        description: "View all articles, emails, social posts, landing pages, and images you've created.",
      },
      {
        number: 2,
        title: "Filter by Type",
        description: "Use tabs to view All Content, Text Only, or Images Only for focused browsing.",
      },
      {
        number: 3,
        title: "Search Content",
        description: "Search across titles, campaign names, and content to quickly find what you need.",
      },
      {
        number: 4,
        title: "Download and Share",
        description: "Download content as files or copy text to paste into your marketing channels.",
      },
      {
        number: 5,
        title: "Check Compliance",
        description: "View compliance scores and use 'Fix Compliance' for any content with warnings or violations.",
      },
      {
        number: 6,
        title: "Create Variations",
        description: "Generate variations of existing content to A/B test and improve performance.",
      },
    ],
    tips: [
      "Create a content library for each niche to speed up future campaigns",
      "Organize content by product type for easy reuse",
      "Track which content types convert best in Analytics",
      "Refine and reuse high-performing content instead of creating from scratch",
      "Keep a swipe file of your best content for inspiration",
    ],
  },

  // Content Library - Product Developer
  "/library/creator": {
    title: "Monitor Affiliate Content",
    description: "Review content created by your affiliates across all campaigns. Ensure quality and compliance.",
    steps: [
      {
        number: 1,
        title: "Browse All Affiliate Content",
        description: "See content generated by affiliates promoting your products.",
      },
      {
        number: 2,
        title: "Filter by Campaign",
        description: "Focus on content for specific campaigns or products.",
      },
      {
        number: 3,
        title: "Quality Review",
        description: "Review content quality, messaging, and brand alignment.",
      },
      {
        number: 4,
        title: "Compliance Check",
        description: "Verify all content meets legal and brand standards.",
      },
      {
        number: 5,
        title: "Best Practices",
        description: "Identify top-performing content to share with other affiliates.",
      },
    ],
    tips: [
      "Share high-quality affiliate content examples with your network",
      "Provide feedback to affiliates on content quality",
      "Use compliance data to identify training needs",
      "Monitor content themes to see which angles resonate most",
      "Create content guidelines based on top-performing examples",
    ],
  },

  // Content Library - Business
  "/library/business": {
    title: "Content Portfolio Overview",
    description: "Comprehensive view of all content created by your affiliate network. Monitor volume, quality, and compliance.",
    steps: [
      {
        number: 1,
        title: "Portfolio Dashboard",
        description: "View total content volume across all affiliates and products.",
      },
      {
        number: 2,
        title: "Performance Metrics",
        description: "Identify top-performing content types and marketing angles.",
      },
      {
        number: 3,
        title: "Compliance Oversight",
        description: "Monitor compliance rates across your affiliate network.",
      },
      {
        number: 4,
        title: "Quality Assurance",
        description: "Review content quality standards and brand alignment.",
      },
    ],
    tips: [
      "Use content data to optimize commission structures",
      "Identify training opportunities for affiliates",
      "Recognize top-performing affiliates based on content quality",
      "Monitor content volume to ensure adequate marketing coverage",
    ],
  },

  // Knowledge Base
  "/knowledge-base": {
    title: "Knowledge Base Management",
    description: "Add custom content to your campaign's knowledge base. This data is used for RAG (Retrieval-Augmented Generation) to improve content quality.",
    steps: [
      {
        number: 1,
        title: "Enter Campaign ID",
        description: "Specify which campaign's knowledge base you want to add content to by entering the Campaign ID.",
      },
      {
        number: 2,
        title: "Add Your Content",
        description: "Type or paste the custom content you want to include in the knowledge base for better AI generation.",
      },
      {
        number: 3,
        title: "Submit Content",
        description: "Click 'Add' to save your content to the knowledge base. This information will be used in future content generation.",
      },
    ],
    tips: [
      "Use knowledge base to add brand voice, company info, or specific messaging",
      "Include relevant background information that should inform content generation",
      "Knowledge base content improves RAG responses for more accurate generation",
      "You can add multiple entries to build comprehensive campaign knowledge",
      "This is advanced feature - regular users may not need it",
    ],
  },

  // Messages Inbox
  "/messages": {
    title: "Messages Inbox",
    description: "View and manage all your received messages. Respond to message requests, read messages from connections, and communicate with other users.",
    steps: [
      {
        number: 1,
        title: "View Your Inbox",
        description: "All received messages appear in your inbox. Unread messages show with a blue dot and bold text.",
      },
      {
        number: 2,
        title: "Read a Message",
        description: "Click on any message to open and read it. Mark messages as read by clicking the envelope icon.",
      },
      {
        number: 3,
        title: "Reply to Messages",
        description: "Use the Reply button to respond to messages. You can only reply to users you've accepted a message request from.",
      },
      {
        number: 4,
        title: "Manage Message Requests",
        description: "Click 'Requests' tab to approve or reject connection requests from other users.",
      },
      {
        number: 5,
        title: "Send New Messages",
        description: "Click 'Compose' to send a new message or connection request to another user.",
      },
    ],
    tips: [
      "You can only send messages to users who have accepted your message request",
      "Message requests must be approved before you can message someone",
      "Use the Search bar to find specific messages",
      "Archive messages you no longer need to keep your inbox clean",
      "Only accepted connections can exchange messages",
    ],
  },

  // Message Detail
  "/messages/[id]": {
    title: "Message Detail",
    description: "View the full conversation thread and reply to messages.",
    steps: [
      {
        number: 1,
        title: "Read the Message",
        description: "View the complete message content, sender information, and timestamp.",
      },
      {
        number: 2,
        title: "Reply",
        description: "Type your reply in the text box at the bottom and click Send.",
      },
      {
        number: 3,
        title: "Mark as Read/Unread",
        description: "Use the envelope icon to toggle between read and unread status.",
      },
      {
        number: 4,
        title: "Archive Message",
        description: "Click the archive button to move this message to your archived messages folder.",
      },
    ],
    tips: [
      "Replies are sent instantly to the other person",
      "Archived messages can be found in your archived folder",
      "You can only message users who have accepted your message requests",
      "Message history is preserved for your reference",
    ],
  },

  // Compose Message
  "/messages/compose": {
    title: "Compose New Message",
    description: "Send a new message or connection request to another user.",
    steps: [
      {
        number: 1,
        title: "Search for Recipient",
        description: "Type the name or email of the user you want to message in the search box.",
      },
      {
        number: 2,
        title: "Select User",
        description: "Choose the user from the search results that appears.",
      },
      {
        number: 3,
        title: "Enter Subject",
        description: "Provide a clear, descriptive subject line for your message.",
      },
      {
        number: 4,
        title: "Write Your Message",
        description: "Compose your message explaining who you are and why you want to connect.",
      },
      {
        number: 5,
        title: "Send Request",
        description: "Click Send to submit your message request. The recipient will need to approve before you can exchange messages.",
      },
    ],
    tips: [
      "Be professional and clear about why you want to connect",
      "Mention any mutual interests or campaigns",
      "Users must approve your request before you can message them",
      "Use descriptive subject lines to improve response rates",
      "Keep initial messages concise and friendly",
    ],
  },

  // Message Requests
  "/messages/requests": {
    title: "Message Requests",
    description: "Review, approve, or reject incoming connection requests from other users.",
    steps: [
      {
        number: 1,
        title: "View Incoming Requests",
        description: "All pending message requests appear in this list with the sender's name and message.",
      },
      {
        number: 2,
        title: "Review Sender Profile",
        description: "Click on a request to view the sender's profile and understand their background.",
      },
      {
        number: 3,
        title: "Approve Request",
        description: "Click 'Approve' to accept the connection. You can now exchange messages with this user.",
      },
      {
        number: 4,
        title: "Reject Request",
        description: "Click 'Reject' to decline the connection request politely.",
      },
      {
        number: 5,
        title: "Block User",
        description: "Click 'Block' to reject the request and prevent future messages from this user.",
      },
    ],
    tips: [
      "Review the sender's profile and message carefully before approving",
      "Only approve requests from users you want to connect with",
      "Blocking a user prevents them from sending future requests",
      "You can change your mind later by finding their connection and removing it",
      "Be respectful when rejecting requests",
    ],
  },

  // Affiliates Browse
  "/affiliates": {
    title: "Browse Affiliates",
    description: "Discover and connect with other affiliates and product developers. Find partners for collaboration and networking.",
    steps: [
      {
        number: 1,
        title: "Browse Profiles",
        description: "Scroll through the list of affiliate and creator profiles to find potential partners.",
      },
      {
        number: 2,
        title: "View Profile Details",
        description: "Click on any profile to view their specialty, experience, reputation score, and mutual connections.",
      },
      {
        number: 3,
        title: "Check Mutual Products",
        description: "See which products you both promote - this indicates potential collaboration opportunities.",
      },
      {
        number: 4,
        title: "Send Message Request",
        description: "Click 'Connect' to send a message request to start a conversation.",
      },
      {
        number: 5,
        title: "Filter Results",
        description: "Use search and filters to find affiliates by specialty, experience, or user type.",
      },
    ],
    tips: [
      "Look for affiliates with high reputation scores for reliable partners",
      "Mutual products indicate shared interests and collaboration potential",
      "Product Developers can find affiliates with campaigns for their products",
      "Use filters to narrow down to relevant specialties",
      "Professional networking leads to better collaborations",
    ],
  },

  // Landing Page (Home)
  "/": {
    title: "Welcome to Blitz",
    description: "Your all-in-one affiliate marketing platform. Choose your path to get started.",
    steps: [
      {
        number: 1,
        title: "Choose Your Path",
        description: "Select whether you're a Product Developer (selling your products) or an Marketer (promoting products).",
      },
      {
        number: 2,
        title: "Explore Features",
        description: "Learn about the key features available for your user type including campaigns, content generation, and analytics.",
      },
      {
        number: 3,
        title: "Sign Up",
        description: "Create your account to start using the platform and access all features.",
      },
      {
        number: 4,
        title: "Get Started",
        description: "After registration, follow the guided setup to create your first campaign or add your products.",
      },
    ],
    tips: [
      "Product Developers: Add your products to the library for affiliates to discover",
      "Marketers: Browse the Product Library and create campaigns",
      "Both user types can use content generation and analytics",
      "Check the feature comparison to understand what each plan includes",
    ],
  },

  // Affiliate Landing Page
  "/affiliate": {
    title: "For Marketers",
    description: "Everything you need to build successful affiliate campaigns, generate content, and track performance.",
    steps: [
      {
        number: 1,
        title: "Create Campaigns",
        description: "Set up campaigns for products you want to promote with affiliate links and tracking.",
      },
      {
        number: 2,
        title: "Generate Content",
        description: "Use AI to create articles, emails, social posts, videos, and images for your campaigns.",
      },
      {
        number: 3,
        title: "Track Performance",
        description: "Monitor clicks, conversions, and ROI with comprehensive analytics.",
      },
      {
        number: 4,
        title: "Stay Compliant",
        description: "Automatically check content for FTC compliance and affiliate network requirements.",
      },
      {
        number: 5,
        title: "Build Network",
        description: "Connect with other affiliates and product developers through the messaging system.",
      },
    ],
    tips: [
      "Browse the Product Library to find high-converting products to promote",
      "Generate multiple content variations to test what works best",
      "Use analytics to identify your top-performing content and campaigns",
      "Connect with product developers for exclusive offers and partnerships",
    ],
  },

  // Product Developer Landing Page
  "/product-developers": {
    title: "For Product Developers",
    description: "Add your products to our marketplace and track how affiliates are promoting them. Build your affiliate network and earn revenue from affiliate-driven sales.",
    steps: [
      {
        number: 1,
        title: "Add Products",
        description: "Submit your product details to the Product Library for affiliates to discover. Provide complete information including URL, pricing, and commission structure.",
      },
      {
        number: 2,
        title: "Compile Intelligence",
        description: "Automatically analyze your sales page to extract features, benefits, pain points, and marketing insights that help affiliates create better content.",
      },
      {
        number: 3,
        title: "Set Up Conversion Tracking",
        description: "Add the JavaScript tracking code to your sales pages to automatically attribute sales to affiliates and track conversions. See 'Conversion Tracking Setup' in help.",
      },
      {
        number: 4,
        title: "Monitor Performance",
        description: "Check Product Analytics and Conversions pages to see which affiliates are driving traffic and sales.",
      },
      {
        number: 5,
        title: "Manage Your Affiliates",
        description: "View the affiliate leaderboard to identify your best-performing partners and track their performance metrics.",
      },
      {
        number: 6,
        title: "Communicate & Incentivize",
        description: "Connect with top-performing affiliates through the messaging system and offer exclusive deals or higher commission rates.",
      },
      {
        number: 7,
        title: "Optimize Commission Rates",
        description: "Adjust commission rates based on affiliate performance to attract more high-quality promoters.",
      },
    ],
    tips: [
      "Detailed product information and high-quality intelligence helps affiliates promote more effectively",
      "Competitive commission rates (30-50%) attract more affiliates to your products",
      "Monitor the affiliate leaderboard to identify your best partners",
      "Reach out to top affiliates with exclusive offers, higher rates, or bonus incentives",
      "Add conversion tracking immediately after publishing to avoid missed sales attribution",
      "Recurring commission products are especially attractive to Marketers",
      "Use the Conversions page to track revenue, affiliate commissions, and your net earnings",
      "Regularly review analytics to identify which products and affiliates perform best",
      "Session-based tracking ensures affiliates get credit for the entire customer journey (main + upsells + downsells)",
    ],
  },

  // Business Landing Page
  "/business": {
    title: "For Businesses",
    description: "Enterprise solutions for businesses looking to scale their affiliate marketing program.",
    steps: [
      {
        number: 1,
        title: "Enterprise Features",
        description: "Access advanced features designed for businesses with large affiliate networks.",
      },
      {
        number: 2,
        title: "White Label Options",
        description: "Customize the platform with your branding and domain.",
      },
      {
        number: 3,
        title: "API Access",
        description: "Integrate with your existing systems using our comprehensive API.",
      },
      {
        number: 4,
        title: "Dedicated Support",
        description: "Get priority support and training from our team.",
      },
    ],
    tips: [
      "Enterprise plans include custom integrations and dedicated account management",
      "White label options let you offer the platform under your brand",
      "API access enables deep integration with your existing tools",
      "Contact our sales team for custom pricing and feature requirements",
    ],
  },

  "/conversions": {
    title: "Conversion Tracking",
    description: "Track affiliate sales and commissions for your products. See revenue breakdown and monitor affiliate performance including upsells and downsells.",
    steps: [
      {
        number: 1,
        title: "Select Your Product",
        description: "Choose a product from the dropdown to view its conversion statistics.",
      },
      {
        number: 2,
        title: "View Statistics",
        description: "See total conversions, revenue, affiliate commissions, and your net earnings from main sales and upsells/downsells.",
      },
      {
        number: 3,
        title: "Revenue Breakdown",
        description: "Understand how revenue is split between affiliates, Blitz platform fee, and your net earnings.",
      },
      {
        number: 4,
        title: "Add Tracking Code",
        description: "If no conversions appear, make sure you've added the tracking code to your website. Use the advanced examples for upsells/downsells.",
      },
    ],
    tips: [
      "Add the tracking script to ALL pages of your website",
      "Add the conversion script only to your order confirmation page",
      "Session-based tracking gives affiliates credit for the entire funnel (main + upsells + downsells + bumps)",
      "Blitz takes a 5% platform fee on each sale",
      "Affiliates are automatically credited based on cookie attribution (60 days)",
      "View tracking code in Product Library → Your Product → Conversion Tracking Code",
    ],
  },

  // Google Business Profile Help
  "/help/google-business": {
    title: "Google Business Profile Setup",
    description: "Complete guide to claiming your Google Business Profile and creating content to attract local customers. Essential for local SEO and visibility.",
    steps: [
      {
        number: 1,
        title: "Search for Your Business",
        description: "Go to google.com/business and search for your business name. If it exists, click 'Claim this business'. If not, click 'Add your business'.",
      },
      {
        number: 2,
        title: "Enter Business Information",
        description: "Fill in your business name, category (e.g., 'Plumber', 'Restaurant'), and address. Choose whether customers visit your location or you visit them.",
      },
      {
        number: 3,
        title: "Verify Your Business",
        description: "Google will verify you own the business. Most common methods: postcard with code (mail), phone call, email, or instant verification for some businesses.",
      },
      {
        number: 4,
        title: "Complete Your Profile",
        description: "Add business hours, phone number, website, description, and services. Upload a logo and cover photo. The more complete, the better your visibility.",
      },
      {
        number: 5,
        title: "Add High-Quality Photos",
        description: "Upload photos of your team, work examples, storefront, or services. Businesses with photos get 42% more requests for directions and 35% more website clicks.",
      },
      {
        number: 6,
        title: "Create Your First Post",
        description: "Click 'Posts' → 'Create Post' → 'What's New'. Share an update, offer, event, or service highlight. Posts appear for 7 days and boost engagement.",
      },
      {
        number: 7,
        title: "Set Up Messaging",
        description: "Enable messaging so customers can text you directly. Add common questions to Auto-replies for faster response times.",
      },
      {
        number: 8,
        title: "Add Products/Services",
        description: "List your main services with descriptions and pricing. This helps customers understand what you offer and improves search relevance.",
      },
      {
        number: 9,
        title: "Monitor and Respond to Reviews",
        description: "Check for new reviews regularly. Respond to ALL reviews (positive and negative) within 24-48 hours. Thank customers and address concerns professionally.",
      },
      {
        number: 10,
        title: "Post Regularly",
        description: "Share updates 1-2 times per week. Use Blitz to generate posts about services, tips, customer testimonials, or seasonal promotions.",
      },
    ],
    tips: [
      "Choose the most specific category possible (e.g., 'Emergency Plumbing Service' instead of just 'Plumber')",
      "Keep business hours updated, especially during holidays",
      "Add photos weekly - before/after shots work great for service businesses",
      "Use posts to promote seasonal services (e.g., 'Winter pipe prep' for plumbers)",
      "Respond to negative reviews with empathy and offer to make it right",
      "Add your website URL to drive traffic to your main site",
      "Use Google Posts to share tips that showcase your expertise",
      "Pin your best review to the top of your profile",
      "Add all your services with detailed descriptions for better SEO",
      "Enable messaging during business hours for best response rates",
    ],
    links: [
      {
        label: "Google Business Profile Help Center",
        href: "https://support.google.com/business/",
      },
      {
        label: "Best Practices for Local SEO",
        href: "https://moz.com/learn/seo/local",
      },
    ],
  },

  // Google Business Content Strategy
  "/help/google-content": {
    title: "Google Business Content Strategy",
    description: "Create engaging content for your Google Business Profile using Blitz's AI-generated posts, photos, and updates to attract and convert local customers.",
    steps: [
      {
        number: 1,
        title: "Generate Service-Focused Posts",
        description: "Use Blitz to create posts about your services. Focus on specific services like emergency repairs, maintenance tips, or before/after showcases.",
      },
      {
        number: 2,
        title: "Create Seasonal Campaigns",
        description: "Generate seasonal content for relevant services (e.g., 'Winter plumbing prep' for plumbers, 'Tax season reminders' for accountants).",
      },
      {
        number: 3,
        title: "Share Customer Success Stories",
        description: "Use generated testimonials and success stories. Create posts highlighting specific customer outcomes and results.",
      },
      {
        number: 4,
        title: "Generate Educational Tips",
        description: "Create posts with maintenance tips, how-to advice, or warning signs customers should watch for. Establishes you as a local expert.",
      },
      {
        number: 5,
        title: "Create Promotional Posts",
        description: "Generate seasonal promotions, new service announcements, or limited-time offers to drive bookings and inquiries.",
      },
      {
        number: 6,
        title: "Add Service-Specific Photos",
        description: "Upload generated images of your work: before/after shots, team at work, equipment, or happy customers (with permission).",
      },
      {
        number: 7,
        title: "Update Services Regularly",
        description: "Keep your services list current. Generate new service descriptions when you add offerings or change pricing.",
      },
      {
        number: 8,
        title: "Monitor Post Performance",
        description: "Check Google Business Profile insights to see which posts get the most views, clicks, and engagement.",
      },
    ],
    tips: [
      "Post 1-2 times per week for best results",
      "Use generated images with posts for 3x more engagement",
      "Time posts for peak customer browsing (lunch hours, evenings, weekends)",
      "Create a content calendar: rotate between services, tips, testimonials, and promotions",
      "Use location-specific keywords in your posts ('Austin', 'Downtown', 'Northside')",
      "Include clear CTAs in posts ('Call now', 'Book online', 'Get a quote')",
      "Cross-post Google content to your other social media (Facebook, Instagram)",
      "Track which services get the most engagement and feature them more",
      "Share seasonal content 2-4 weeks before peak season",
      "Use Blitz's service-focused content for authentic, relevant posts",
    ],
  },

  // Content - Video Generation
  "/content/video": {
    title: "Video Generation",
    description: "Create professional marketing videos from your scripts using AI. Transform written content into engaging video campaigns with customizable styles and durations.",
    steps: [
      {
        number: 1,
        title: "Select Your Campaign",
        description: "Choose the campaign you want to create a video for. The video will be associated with this campaign for tracking and analytics.",
      },
      {
        number: 2,
        title: "Choose Video Style",
        description: "Select from Marketing (professional, engaging), Educational (clear, informative), or Social (dynamic, eye-catching) styles.",
      },
      {
        number: 3,
        title: "Set Duration & Format",
        description: "Choose video length (5-20 seconds (short-form)) and aspect ratio (16:9 landscape, 9:16 portrait, or 1:1 square) based on your distribution channel.",
      },
      {
        number: 4,
        title: "Write Your Script",
        description: "Enter your video script with timestamps like [0-5s], [5-10s] for better organization. Include hooks, main content, and clear CTAs.",
      },
      {
        number: 5,
        title: "Review Cost & Generate",
        description: "Check the estimated cost (based on duration) and click Generate Video. Videos typically take 2-5 minutes to process.",
      },
    ],
    tips: [
      "Start with a hook in the first 3 seconds to grab attention immediately",
      "Use timestamps [0-5s], [5-10s] to organize your content flow",
      "Keep scripts concise - aim for 75-100 words for short-form",
      "End with a strong call-to-action (CTA)",
      "Use descriptive language for better AI visual generation",
      "Test different styles (marketing/educational/social) for your audience",
      "Portrait (9:16) works best for TikTok, Instagram Reels, YouTube Shorts",
      "Landscape (16:9) is ideal for YouTube, Facebook, and websites",
    ],
  },

  // Video Library
  "/content/video/library": {
    title: "Video Library",
    description: "View and manage all your generated videos. Track processing status, view completed videos, and download high-quality files.",
    steps: [
      {
        number: 1,
        title: "Browse Your Videos",
        description: "View all your generated videos in chronological order. Each card shows status, duration, provider, and cost.",
      },
      {
        number: 2,
        title: "Check Video Status",
        description: "Videos show real-time status: Processing (with progress %), Completed (ready to view), or Failed (with error message).",
      },
      {
        number: 3,
        title: "View Completed Videos",
        description: "Click 'View Video' to watch your generated video in a new tab. Videos are stored on cloud CDN for fast loading.",
      },
      {
        number: 4,
        title: "Download High-Quality",
        description: "Click 'Download' to get the raw video file in highest quality for use in your marketing campaigns.",
      },
      {
        number: 5,
        title: "Track Costs",
        description: "Each video shows the generation cost, helping you monitor spending on AI video creation.",
      },
    ],
    tips: [
      "Videos take 2-5 minutes to process depending on duration and provider",
      "Use the pagination at the bottom to browse through many videos",
      "Completed videos are stored permanently in your library",
      "Check the thumbnail to preview your video before downloading",
      "Video URLs are permanent and won't expire",
      "Compare costs across different providers to optimize spending",
      "Failed videos show error messages to help troubleshoot issues",
    ],
  },

  // Image Editor - Object Replacement Workflow (Erase + Overlay)
  "/image-editor/object-replacement": {
    title: "Replace Objects in Images",
    description: "Professional 2-step workflow to remove unwanted objects and replace them with product images. Fast, reliable, and gives you complete creative control.",
    steps: [
      {
        number: 1,
        title: "Step 1: Erase Unwanted Object",
        description: "Select the Erase tool and paint over the object you want to remove. The AI intelligently fills the area with matching background in 5-10 seconds. No prompts needed!",
      },
      {
        number: 2,
        title: "Step 2: Add Your Product Image",
        description: "Select the Overlay tool, choose a transparent product image from Product Assets, and drag it onto the canvas. Resize, rotate, and position it perfectly.",
      },
      {
        number: 3,
        title: "Fine-Tune Position",
        description: "Use the transform controls to resize, rotate, and precisely position your product. The transparent background ensures seamless blending with your image.",
      },
      {
        number: 4,
        title: "Download Your Result",
        description: "Click 'Download' to save your professionally edited image. The system preserves quality and transparency for pixel-perfect results.",
      },
    ],
    tips: [
      "Erase first, overlay second - this workflow is 20x faster than AI generation",
      "Use Product Assets library for professional transparent product images",
      "Product Developers: Upload 15+ product angles for best affiliate creativity",
      "Adjust overlay opacity to blend naturally with your image",
      "Save frequently used overlays for quick reuse",
      "The Erase tool costs only $0.003 - 60% cheaper than alternatives",
      "Transparent PNGs work best - remove backgrounds before uploading",
      "Layer multiple overlays to create complex compositions",
      "Use guides and snap-to-grid for precise alignment",
    ],
  },

  // Image Editor - Erase Tool
  "/image-editor/erase": {
    title: "Erase Tool - AI Object Removal",
    description: "Quickly remove unwanted objects, people, or blemishes from photos. AI intelligently fills the area with matching background. No prompts needed!",
    steps: [
      {
        number: 1,
        title: "Select Erase Tool",
        description: "Click the Erase tool icon in the toolbar. This activates the brush for painting over objects to remove.",
      },
      {
        number: 2,
        title: "Paint Over Object",
        description: "Use the brush to paint over anything you want to remove. Adjust brush size (5-100px) for precision. Don't worry about being perfect - AI understands intent.",
      },
      {
        number: 3,
        title: "Apply Erase",
        description: "Click 'Apply Erase' button. The AI analyzes surrounding pixels and intelligently fills the masked area. Results appear in 5-10 seconds.",
      },
      {
        number: 4,
        title: "Review & Iterate",
        description: "Check the result. If needed, erase again on the same area or use Undo to try a different mask. The tool learns from context for natural-looking fills.",
      },
    ],
    tips: [
      "Paint completely over the object - partial masks may leave artifacts",
      "For large objects, use a bigger brush size (50-80px) for speed",
      "For fine details, use smaller brush (10-20px) and higher hardness",
      "The AI matches lighting, shadows, and texture automatically",
      "After erasing, use Overlay tool to add new content",
      "Costs only $0.003 per use - 60% cheaper than alternatives",
      "Works best on photos with clear backgrounds",
      "Multiple small erases often work better than one large erase",
    ],
  },

  // Image Editor - Overlay Tool
  "/image-editor/overlay": {
    title: "Overlay Tool - Add Images & Products",
    description: "Add transparent product images, logos, watermarks, or graphics to your photos. Perfect for product placement, branding, and creative compositions.",
    steps: [
      {
        number: 1,
        title: "Select Overlay Tool",
        description: "Click the Overlay tool icon. This opens the image selection panel where you can choose from Product Assets, uploads, or stock images.",
      },
      {
        number: 2,
        title: "Choose Your Image",
        description: "Select from: Product Assets (transparent product images from developers), My Uploads (your own images), or Stock Library. Click an image to add it to the canvas.",
      },
      {
        number: 3,
        title: "Position & Resize",
        description: "Drag the overlay to position it. Use corner handles to resize. Hold Shift while resizing to maintain aspect ratio. Rotate using the rotation handle.",
      },
      {
        number: 4,
        title: "Adjust & Fine-Tune",
        description: "Use opacity slider (0-100%) to blend naturally. Layer multiple overlays to create complex compositions. Use alignment guides for precision.",
      },
      {
        number: 5,
        title: "Finalize & Save",
        description: "Click 'Apply' to merge the overlay. Download your final image or save it to your campaign library. Transparent backgrounds are preserved.",
      },
    ],
    tips: [
      "Product Assets: Access professional transparent product images",
      "Transparent PNGs blend seamlessly - use them whenever possible",
      "Lower opacity (60-80%) for subtle, natural-looking overlays",
      "Use multiple overlays to create layered compositions",
      "Snap-to-grid and alignment guides help with precision",
      "Save your favorite overlays for quick reuse",
      "Combine with Erase tool: Remove object first, add overlay second",
      "For product placement: Erase competing product, overlay yours",
      "Match perspective and lighting for realistic results",
    ],
  },

  // Image Editor - General
  "/image-editor": {
    title: "Image Editor",
    description: "Professional AI-powered image editing toolkit. Remove objects with Erase, add products with Overlay, change backgrounds, upscale images, and more using advanced AI models.",
    steps: [
      {
        number: 1,
        title: "Choose Your Tool",
        description: "Select from Erase (remove objects), Overlay (add images/products), Background Removal, Upscale, Outpaint, or Sketch-to-Image based on your needs.",
      },
      {
        number: 2,
        title: "Upload Image",
        description: "Click 'Choose File' or drag and drop an image. Supports JPG, PNG, WebP up to 10MB.",
      },
      {
        number: 3,
        title: "Configure Settings",
        description: "Each tool has specific options. Erase uses masks, Overlay adds images, Background Removal is automatic, etc.",
      },
      {
        number: 4,
        title: "Process with AI",
        description: "Click the tool button to process. The system automatically selects the best AI platform (Replicate, FAL, or Stability) for optimal quality and cost.",
      },
      {
        number: 5,
        title: "Download or Save",
        description: "Download your edited image or save it to your campaign library for future use.",
      },
    ],
    tips: [
      "All tools use AI Platform Router for automatic platform selection",
      "Cost optimization: system routes to cheapest available platform (75% savings)",
      "Multiple fallback platforms ensure reliability if one service fails",
      "High-resolution images produce better results",
      "All images stored securely via Cloudflare R2 with proxy access",
      "Edit history is tracked for each campaign",
      "Try different tools for different effects",
      "Masks are automatically optimized for each AI platform",
    ],
  },
};

// Helper function to get help content by pathname
export function getHelpContent(pathname: string, userRole?: string | null): HelpContent | undefined {
  // If we have a user role, try to get user-type specific help first
  if (userRole) {
    // For dynamic routes like /campaigns/123, extract the base path
    const basePath = pathname.split('/').slice(0, 2).join('/');
    const userSpecificKey = `${pathname}/${userRole.toLowerCase()}`;

    // Try user-type specific version first
    if (helpContent[userSpecificKey]) {
      return helpContent[userSpecificKey];
    }

    // Try base path with user type (e.g., /campaigns/affiliate for /campaigns)
    if (helpContent[basePath]) {
      const baseWithUser = `${basePath}/${userRole.toLowerCase()}`;
      if (helpContent[baseWithUser]) {
        return helpContent[baseWithUser];
      }
    }

    // For dashboard, try user-type specific dashboard
    if (pathname === "/dashboard") {
      const dashboardKey = `/dashboard/${userRole.toLowerCase()}`;
      if (helpContent[dashboardKey]) {
        return helpContent[dashboardKey];
      }
    }
  }

  // Try exact match first
  if (helpContent[pathname]) {
    return helpContent[pathname];
  }

  // Try pattern matching for dynamic routes
  if (pathname.startsWith("/campaigns/") && pathname !== "/campaigns") {
    return helpContent["/campaigns/[id]"];
  }

  if (pathname.startsWith("/messages/") && pathname !== "/messages" && !pathname.startsWith("/messages/requests")) {
    return helpContent["/messages/[id]"];
  }

  // Add more pattern matches as needed for other dynamic routes

  return undefined;
}