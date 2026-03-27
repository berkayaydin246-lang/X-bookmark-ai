You are a senior full-stack engineer building a production-ready SaaS-quality web application. 
This is not a prototype — build it as if it will be publicly launched and used by thousands of users.

---

## PROJECT: X Bookmark Intelligence — AI-Powered Bookmark Categorizer

Users export their X (Twitter) data archive, upload the bookmarks.js file, and Claude AI automatically 
categorizes every bookmark by topic, generates tags, summaries, and presents everything in a 
beautiful, fast, filterable dashboard.

---

## TECH STACK (Non-negotiable)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (choose a premium, distinctive pairing — NOT Inter)

---

## ARCHITECTURE
/app
/page.tsx              → Landing / Hero page
/app
/layout.tsx
/page.tsx            → Main dashboard (protected by API key check)
/api
/categorize/route.ts → Claude API proxy endpoint (server-side, keeps API secure)
/components
/landing/
Hero.tsx
HowItWorks.tsx
Features.tsx
/dashboard/
FileUploader.tsx     → Drag & drop upload zone
ProgressTracker.tsx  → Real-time processing progress
CategoryGrid.tsx     → Grid of category cards
BookmarkCard.tsx     → Individual bookmark with tags, summary, link
FilterBar.tsx        → Filter by category, search by keyword
StatsBar.tsx         → Total bookmarks, categories found, processing time
ExportButton.tsx     → Export results as JSON or CSV
/lib
/parser.ts             → Parse bookmarks.js file
/categorizer.ts        → Batch processing logic
/types.ts              → All TypeScript interfaces
/store
/useBookmarkStore.ts   → Zustand global state

---

## PAGE 1 — LANDING PAGE (/)

Design a stunning, modern landing page. Dark theme preferred. Think premium SaaS product.

**Sections:**
1. **Hero**: Bold headline ("Your bookmarks, finally organized."), subtext, CTA button "Get Started Free"
2. **How It Works**: 3-step visual flow with icons
   - Step 1: Export your X data archive
   - Step 2: Upload bookmarks.js
   - Step 3: AI categorizes everything instantly
3. **Features Grid**: 
   - 🧠 AI-powered categorization
   - ⚡ Processes 500+ bookmarks in seconds
   - 🔒 Your data never leaves your browser (except Anthropic API)
   - 🏷️ Auto-tags: AI, Python, Design, Finance, etc.
   - 🔍 Full-text search across all bookmarks
   - 📤 Export to JSON/CSV

Add smooth scroll animations (Framer Motion) on all sections. Hero should have a subtle animated background (gradient mesh or particle effect).

---

## PAGE 2 — MAIN APP (/app)

### Step 1: API Key Gate
- Show a clean modal/card asking for Claude API key on first visit
- Store key in sessionStorage (not localStorage, for security)
- Explain clearly: "Your API key is only used to call Anthropic's API directly. We never store it."
- Validate key format before proceeding

### Step 2: File Upload
- Beautiful drag & drop zone with animation
- Accept only .js files
- Show file name and size after upload
- Parse the file instantly on upload:
  - Strip prefix: `window.YTD.bookmarks.part0 = `
  - Parse JSON array
  - Extract tweetIds
  - Construct URLs: `https://twitter.com/i/web/status/{tweetId}`
- Show a preview: "Found 247 bookmarks. Ready to categorize."

### Step 3: Processing
- "Start Categorizing" button
- Process in batches of 15 bookmarks per API call
- Show real-time progress bar: "Processing batch 3 of 17..."
- Animated skeleton cards while loading
- Show already-processed results as they come in (streaming UX feel)

### Step 4: Results Dashboard
**Layout**: Sidebar with category filters + main content grid

**Category Sidebar**:
- Auto-generated categories listed with count badges
- Examples: Artificial Intelligence (34), Python (18), Design (12), Finance (9), etc.
- "All" option at the top
- Click to filter

**Bookmark Cards** (in a responsive grid):
Each card shows:
- 🏷️ Category badge (color-coded)
- 📝 AI-generated 1-sentence summary
- 🔗 Original tweet URL (clickable)
- 🏷️ 2-3 tags (e.g., #MachineLearning #OpenAI)
- Hover animation (subtle lift + glow)

**Top Bar**:
- Search input (filters cards in real-time)
- Sort by: Category | Date | Relevance
- Export button (JSON / CSV)

---

## CLAUDE API INTEGRATION

**API Route** (`/api/categorize/route.ts`):
- Receives batch of tweet URLs + API key from client
- Calls Claude API server-side (never exposes API key in browser network tab)
- System prompt for Claude:
You are a bookmark categorization AI. You receive a list of X (Twitter) tweet URLs and must
analyze and categorize them. Since you cannot access the URLs, use the tweet ID and URL
structure to make intelligent guesses, and categorize based on common knowledge patterns.
For each tweet, return a JSON array with objects containing:
{
"tweetId": "string",
"category": "string (single main category like: AI & Machine Learning, Web Development, Design, Finance & Investing, Science, Politics, Health, Education, Entertainment, Business, etc.)",
"summary": "string (one sentence describing what this content is likely about, be creative but realistic)",
"tags": ["tag1", "tag2", "tag3"],
"confidence": "high | medium | low"
}
Return ONLY a valid JSON array. No explanation, no markdown, no extra text.

- Parse response, handle errors gracefully
- Return structured data to client

**Client-side batching** (`/lib/categorizer.ts`):
```typescript
async function processBatches(tweetIds: string[], apiKey: string, onBatchComplete: (results) => void) {
  const BATCH_SIZE = 15;
  const batches = chunk(tweetIds, BATCH_SIZE);
  
  for (const batch of batches) {
    const result = await fetch('/api/categorize', { ... });
    onBatchComplete(result);
    await sleep(500); // Rate limit protection
  }
}
```

---

## DESIGN REQUIREMENTS

**Color palette** (dark theme):
- Background: #0A0A0F (near black)
- Surface: #12121A
- Border: #1E1E2E
- Primary accent: A vibrant single color (NOT purple — pick electric blue, emerald, or amber)
- Text primary: #F0F0F5
- Text muted: #6E6E8A

**Typography**:
- Display/headings: A bold, characterful font (e.g., Syne, Cabinet Grotesk, Clash Display, Satoshi)
- Body: A clean readable font (e.g., DM Sans, Plus Jakarta Sans, Geist)
- NEVER use Inter, Roboto, or Arial

**Motion**:
- Page transitions: Framer Motion fade + slide
- Cards: staggered reveal on load
- Progress bar: smooth animated fill
- Hover states: subtle scale + shadow

**Polish details**:
- Loading skeleton animations on bookmark cards
- Empty states with illustration or icon
- Error states with clear messages and retry buttons
- Toast notifications for success/error (use sonner or react-hot-toast)
- Responsive: works perfectly on mobile, tablet, desktop

---

## EXPORT FUNCTIONALITY

When user clicks "Export":
- **JSON**: Full data dump of all categorized bookmarks
- **CSV**: tweetId, URL, category, summary, tags columns
- File downloads automatically in browser
- Show success toast: "247 bookmarks exported!"

---

## ERROR HANDLING (Production-grade)

Handle all these cases gracefully:
- Invalid API key → clear error message with link to get API key
- Wrong file format → "Please upload a bookmarks.js file from your X data export"
- API rate limit hit → auto-retry with exponential backoff
- Network error → retry button
- Empty bookmarks file → friendly empty state
- Partial failure → show what succeeded, report what failed

---

## ADDITIONAL REQUIREMENTS

- Add a "How to export X data" help section with step-by-step instructions and screenshots description
- Mobile responsive — the dashboard should work on phones too
- No database, no auth, no backend storage — everything is client-side except the API proxy route
- Add a GitHub link in footer (placeholder)
- SEO meta tags on landing page
- Favicon

---

## DELIVERABLE

Provide ALL files needed to run this project with `npm run dev`. 
Start with the file structure, then implement each file completely. 
Do not use placeholder comments like "// add logic here" — write the full working code.
Begin with: package.json → tailwind.config → types.ts → store → API route → components → pages.