# Search Thala

A news/blog feed built with Next.js (App Router), MongoDB, Upstash Redis, Redux Toolkit (RTK Query), and Tailwind CSS.

- **Desktop**: card grid (always the "Top" feed, no category tabs), like button, share, and "Load More" pagination.
- **Mobile**: full-screen single-article feed with category tabs. Swipe **left/right** to change category, swipe **up/down** for the next/previous article in the current category. Every 3rd swipe shows a placeholder ad interstitial before continuing.
- **Likes**: anonymous, tracked per-device via a UUID stored in `localStorage` and persisted in MongoDB (no login required). Liking is applied optimistically via Redux/RTK Query so it feels instant.
- **Caching**: `GET /api/articles` caches its (device-agnostic) article list in Upstash Redis for 20s to keep repeated loads/swipes fast; a like toggle invalidates the affected category's cache. Falls back to querying MongoDB directly if Redis isn't configured.
- **Client data layer**: Redux Toolkit + RTK Query (`src/store/`) manages fetching, in-memory caching, and optimistic like updates.
- **Ads**: placeholder ad slots only (`src/components/AdSlot.tsx`) — swap in your ad network's SDK/script when you have one.

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI` to your MongoDB Atlas connection string. Optionally set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (from an Upstash Redis database) to enable caching.
2. Install dependencies:
   ```
   npm install
   ```
3. Seed the database with mock articles:
   ```
   npm run seed
   ```
4. Run the dev server:
   ```
   npm run dev
   ```
5. Open http://localhost:3000. Resize the browser below the `md` breakpoint (or use device toolbar) to see the mobile swipe feed.

## Data

Mock articles live in `src/data/mockArticles.json` and are the source of truth for `npm run seed`. Edit that file and re-run the seed script (it upserts by `slug`) to add or change articles — no external news API is used.
