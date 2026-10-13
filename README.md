# mAI Cookbook

Recipes by weight. Every recipe is a list of ingredients in grams with one **anchor** (the meat, the flour). Hit **Scale**, type how much anchor you actually have, and every line recomputes by ratio.

Each line shows grams, plus pounds when it's at least half a pound, plus tsp/tbsp when it's a small amount (density is guessed from the ingredient name and can be overridden per ingredient with `g_per_tsp`).

Recipes are stored as JSON, so you can edit them in a form or as raw JSON, and import straight from ChatGPT using the **Copy AI prompt** button.

## Stack

Vite + React + TypeScript + Tailwind v4. Supabase for auth and storage (one `recipes` table with a `jsonb` column, row-level security so each user only sees their own). Hosted on Vercel.

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env` and fill in **Project URL** and **anon public key** from *Project Settings → API*.
4. (Optional, for faster dev) *Authentication → Providers → Email*: turn off **Confirm email** so sign-up logs you in immediately.

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project**, import the repo. Framework preset: Vite.
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` already rewrites all routes to `index.html` for client-side routing.
5. In Supabase, *Authentication → URL Configuration*, set **Site URL** to your Vercel URL so magic links and email confirmations redirect correctly.

## Recipe JSON

```json
{
  "title": "Smash Burger Seasoning",
  "tags": ["beef", "seasoning"],
  "anchor": "ground beef",
  "ingredients": [
    { "name": "ground beef", "grams": 907, "note": "80/20" },
    { "name": "kosher salt", "grams": 11 },
    { "name": "black pepper", "grams": 3, "g_per_tsp": 2.3 }
  ],
  "steps": ["Divide beef into balls.", "Smash, season, flip."]
}
```

Optional fields: `description`, `servings`, `notes`, `source`, and per-ingredient `note`, `group`, `g_per_tsp`.
