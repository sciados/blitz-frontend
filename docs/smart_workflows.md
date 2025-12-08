Based on the analysis, here's a comprehensive plan to simplify Blitz workflows:

  ---
  Blitz UI/Workflow Simplification Plan

  Current Problems

  | Issue                                  | Impact                               |
  |----------------------------------------|--------------------------------------|
  | 21+ pages for marketers                | Cognitive overload                   |
  | 9 clicks to go from product → content  | Too many steps                       |
  | Content split across 6 sub-pages       | Fragmented experience                |
  | Campaign selection lost on page change | Frustrating re-selection             |
  | Compliance hidden under "More"         | Critical feature buried              |
  | Intelligence page is read-only         | Forces navigation to campaign detail |

  ---
  Proposed Simplified Structure

  New Navigation (Marketers)

  Dashboard
  Campaigns          ← Single source of truth
  Content Studio     ← Unified generation + library
  Intelligence       ← Now actionable
  Compliance         ← Promoted to top-level
  Analytics
  Settings

  Reduction: 8 menu items → 6 menu items

  ---
  Phase 1: Unified Content Studio

  Current State (6 pages)

  /content           → Hub (campaign selector)
  /content/text      → Text generation
  /content/images    → Image generation
  /content/video     → Video generation
  /content/video/library → Video library
  /content/video/slide-to-video → Slide workflow
  /library           → Content library

  Proposed State (1 page with tabs)

  /content           → Unified Content Studio
    ├── Tab: Generate (Text | Images | Video sub-tabs)
    ├── Tab: Library (All content with filters)
    └── Campaign selector persisted in URL

  Benefits:

- Campaign context persists across all operations
- No page navigation to switch content types
- Library accessible without leaving context
- Single mental model

  Mockup Layout

  ┌─────────────────────────────────────────────────────────┐
  │  Content Studio                [Campaign: AquaSculpt ▼] │
  ├─────────────────────────────────────────────────────────┤
  │  [Generate]  [Library]                                  │
  ├─────────────────────────────────────────────────────────┤
  │  [Text] [Images] [Video]                                │
  ├─────────────────────────────────────────────────────────┤
  │  ┌─────────────────┐  ┌──────────────────────────────┐  │
  │  │ Settings Panel  │  │ Generated Content / Preview  │  │
  │  │ - Content Type  │  │                              │  │
  │  │ - Angle         │  │                              │  │
  │  │ - Tone          │  │                              │  │
  │  │ [Generate]      │  │                              │  │
  │  └─────────────────┘  └──────────────────────────────┘  │
  └─────────────────────────────────────────────────────────┘

  ---
  Phase 2: Campaign-Centric Design

  Current Issues

- Campaigns page is just a list
- Campaign detail page has too much (content gen + links + analytics +
  intelligence)
- Content generation happens in multiple places

  Proposed Changes

  Campaign Detail Page becomes a dashboard:
  /campaigns/[id]
    ├── Overview (status, metrics, quick stats)
    ├── Intelligence (compiled data + compile button)
    ├── Quick Actions:
        └── [Generate Content] → Opens Content Studio with campaign pre-selected
        └── [View Content] → Opens Content Studio Library tab
        └── [Check Compliance] → Opens Compliance with campaign filter

  Remove inline content generation from Campaign Detail - redirect to Content Studio
  instead.

  ---
  Phase 3: Intelligence Page Enhancement

  Current State

- Read-only display
- Must go to Campaign Detail to compile intelligence
- No actions available

  Proposed State

  /intelligence
    ├── Campaign selector (same as Content Studio)
    ├── [Compile Intelligence] button (direct action)
    ├── Compiled data display
    └── Quick links: [Generate Content with this Intel] → Content Studio

  ---
  Phase 4: Promote Compliance

  Current State

- Hidden under "More" dropdown
- Not connected to campaign context

  Proposed State

- Top-level navigation item
- Campaign selector to filter content for checking
- Integration with Content Studio (button to check compliance from generated
  content)

  ---
  Phase 5: Simplified User Journeys

  Journey A: New Campaign Content (Before: 9 clicks)

  After: 4 clicks

  1. Dashboard → Click campaign quick action OR
  2. Campaigns → Click "Generate Content" on any campaign card
  3. Content Studio opens with campaign pre-selected
  4. Select content type + Generate

  Journey B: Quick Content Generation (Before: 4 clicks)

  After: 2 clicks

  1. Content Studio (campaign persisted from last session OR select)
  2. Configure + Generate

  Journey C: Video from Script (Before: 6 clicks)

  After: 3 clicks

  1. Content Studio → Library tab → View video script
  2. Click "Generate Video" button (already implemented!)
  3. Video tab opens with script pre-loaded

  ---
  Implementation Priority

  | Phase                             | Effort | Impact    | Priority    |
  |-----------------------------------|--------|-----------|-------------|
  | Phase 1: Unified Content Studio   | High   | Very High | 1           |
  | Phase 2: Campaign-Centric Design  | Medium | High      | 2           |
  | Phase 3: Intelligence Enhancement | Low    | Medium    | 3           |
  | Phase 4: Promote Compliance       | Low    | Medium    | 3           |
  | Phase 5: Journey Optimization     | Low    | High      | 4 (ongoing) |

  ---
  Technical Approach

  Phase 1 Implementation

  1. Create new unified Content Studio page (/content/page.tsx)
  - Add horizontal tabs: Generate | Library
  - Add sub-tabs for Generate: Text | Images | Video
  - Move all generation logic into tabbed components
  - Persist campaign ID in URL: /content?campaign=123&tab=generate&type=text
  2. Create reusable tab components:
  - ContentStudioTextTab.tsx (extract from current /content/text/page.tsx)
  - ContentStudioImagesTab.tsx (extract from current /content/images/page.tsx)
  - ContentStudioVideoTab.tsx (extract from current /content/video/page.tsx)
  - ContentStudioLibraryTab.tsx (extract from current library)
  3. Update routing:
  - Keep old routes temporarily with redirects
  - /content/text?campaign=X → /content?campaign=X&tab=generate&type=text
  4. Campaign persistence:
  - Store last selected campaign in localStorage
  - Auto-restore on page load if no URL param

  ---
  Metrics to Track

  | Metric                              | Current | Target |
  |-------------------------------------|---------|--------|
  | Clicks to generate first content    | 9       | 4      |
  | Pages in Content flow               | 6       | 1      |
  | Navigation menu items               | 8+      | 6      |
  | Time to complete content generation | ~2 min  | <1 min |

  ---
  Summary

  The core philosophy is "Campaign-centric, tab-based consolidation":

  1. Everything flows from Campaigns - they're the organizing principle
  2. Content Studio is ONE page - tabs replace page navigation
  3. Context persists - campaign selection survives navigation
  4. Actions are accessible - no hiding critical features in dropdowns
  5. Workflows are linear - minimal back-and-forth navigation

  ---
  Want me to proceed with implementing Phase 1 (Unified Content Studio)?
