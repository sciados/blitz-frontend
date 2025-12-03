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
  // Dashboard
  "/dashboard": {
    title: "Dashboard Overview",
    description: "Your central hub with quick access to key features. Dashboard content varies based on your account type (Product Developer or Affiliate Marketer).",
    steps: [
      {
        number: 1,
        title: "Product Developers",
        description: "Access Product Library to add your products, and use Product Analytics to track how affiliates are promoting them.",
      },
      {
        number: 2,
        title: "Affiliate Marketers",
        description: "Create campaigns, browse the Product Library, generate content, and track your marketing performance.",
      },
      {
        number: 3,
        title: "Quick Navigation",
        description: "Click any card to navigate directly to that feature. The dashboard shows only the features relevant to your account type.",
      },
      {
        number: 4,
        title: "Getting Started Guide",
        description: "Check the 'Getting Started' section at the bottom for helpful tips and next steps.",
      },
    ],
    tips: [
      "Your dashboard is personalized based on whether you're a Product Developer or Affiliate Marketer",
      "Product Developers see: Product Library, Product Analytics, Settings",
      "Affiliate Marketers see: Campaigns, Content, Intelligence, Compliance, Analytics",
      "All users can access the Product Library - it's the shared marketplace",
      "Check your account type badge in the left sidebar (purple for Product Developers, blue for Affiliate Marketers)",
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
    description: "Track how affiliates are promoting your products and monitor affiliate performance across your product line.",
    steps: [
      {
        number: 1,
        title: "Review Affiliate Performance",
        description: "Check which affiliates are promoting your products and how much traffic they're driving.",
      },
      {
        number: 2,
        title: "Analyze Product Metrics",
        description: "See which products are getting the most promotion and generating the most clicks.",
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
    ],
    tips: [
      "Top affiliates deserve special attention - consider reaching out to them with exclusive offers",
      "Monitor unique click rates to identify high-quality traffic sources",
      "Products with many campaigns but low clicks might need better marketing materials",
      "Use the affiliate leaderboard to create performance-based incentive programs",
      "Track which products attract the most affiliates to inform future product development",
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
        description: "Scroll down to see user-type-specific statistics. Product Developers see product and affiliate metrics, while Affiliate Marketers see campaign and content stats.",
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
      "Your account type (Product Developer or Affiliate Marketer) determines which statistics you see",
      "Profile information is visible to other users when you collaborate on campaigns",
      "Keep your email up to date as it's used for important notifications",
    ],
  },

  // Products
  "/products": {
    title: "Product Library",
    description: "Browse available products to promote, or add your own products for affiliates to discover. The Product Library is the central marketplace connecting Product Developers and Affiliate Marketers.",
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
    ],
    tips: [
      "Use the search bar to find products by name or category",
      "Filter by commission type (recurring vs one-time) to match your promotion strategy",
      "Products with compiled intelligence provide better marketing insights",
      "Look for products with high commission rates and proven conversion rates",
      "Product Developers: detailed product information helps affiliates promote more effectively",
      "Creating a campaign from the Product Library auto-fills product details",
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
        title: "Set Recurring Commission",
        description: "Check 'Recurring Commission' if the affiliate program offers recurring payments. This helps affiliates filter for passive income opportunities.",
      },
      {
        number: 5,
        title: "Submit and Wait",
        description: "Click Submit. The system will automatically compile intelligence in the background (30-60 seconds). You'll receive a notification when it's complete.",
      },
    ],
    tips: [
      "Product is private by default - you can publish it later when ready",
      "Compile intelligence automatically extracts features, benefits, and pain points",
      "Detailed product information leads to better affiliate promotion",
      "Use the Product Details panel to edit or publish your product after creation",
      "You can unpublish products to hide them from affiliates until ready",
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
        description: "Select whether you're a Product Developer (selling your products) or an Affiliate Marketer (promoting products).",
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
      "Affiliate Marketers: Browse the Product Library and create campaigns",
      "Both user types can use content generation and analytics",
      "Check the feature comparison to understand what each plan includes",
    ],
  },

  // Affiliate Landing Page
  "/affiliate": {
    title: "For Affiliate Marketers",
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
    description: "Add your products to our marketplace and track how affiliates are promoting them.",
    steps: [
      {
        number: 1,
        title: "Add Products",
        description: "Submit your product details to the Product Library for affiliates to discover.",
      },
      {
        number: 2,
        title: "Compile Intelligence",
        description: "Automatically analyze your sales page to extract features, benefits, and marketing insights.",
      },
      {
        number: 3,
        title: "Track Affiliates",
        description: "Monitor which affiliates are promoting your products and driving traffic.",
      },
      {
        number: 4,
        title: "Manage Affiliates",
        description: "View the affiliate leaderboard and track performance metrics.",
      },
      {
        number: 5,
        title: "Communicate",
        description: "Connect with top-performing affiliates through the messaging system.",
      },
    ],
    tips: [
      "Detailed product information helps affiliates promote more effectively",
      "High commission rates attract more affiliates to your products",
      "Monitor the affiliate leaderboard to identify your best partners",
      "Reach out to top affiliates with exclusive offers and incentives",
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
    description: "Track affiliate sales and commissions for your products. See revenue breakdown and monitor affiliate performance.",
    steps: [
      {
        number: 1,
        title: "Select Your Product",
        description: "Choose a product from the dropdown to view its conversion statistics.",
      },
      {
        number: 2,
        title: "View Statistics",
        description: "See total conversions, revenue, affiliate commissions, and your net earnings.",
      },
      {
        number: 3,
        title: "Revenue Breakdown",
        description: "Understand how revenue is split between affiliates, Blitz platform fee, and your net earnings.",
      },
      {
        number: 4,
        title: "Add Tracking Code",
        description: "If no conversions appear, make sure you've added the tracking code to your website.",
      },
    ],
    tips: [
      "Add the tracking script to ALL pages of your website",
      "Add the conversion script only to your order confirmation page",
      "Blitz takes a 5% platform fee on each sale",
      "Affiliates are automatically credited based on cookie attribution (60 days)",
      "View tracking code in Product Library → Your Product → Conversion Tracking Code",
    ],
  },
};

// Helper function to get help content by pathname
export function getHelpContent(pathname: string): HelpContent | undefined {
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
