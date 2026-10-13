# mAI Cookbook

Recipes by weight. Every recipe is a list of ingredients in grams with one **anchor** (the meat, the flour). Hit **Scale**, type how much anchor you actually have, and every line recomputes by ratio.

Each line also shows calories, and the recipe shows a total plus a per-serving figure when `servings` starts with a number. Calories come from each ingredient's `kcal_per_100g`, or a built-in estimate by name when that's missing, so they scale with the recipe.

Each line shows grams, plus pounds when it's at least half a pound, plus tsp/tbsp when it's a small amount (density is guessed from the ingredient name and can be overridden per ingredient with `g_per_tsp`).

Recipes are public by default: anyone can browse and scale them without signing in, and owners can mark individual recipes private. Only the owner can edit or delete.

Recipes are stored as JSON, so you can edit them in a form or as raw JSON, and import straight from ChatGPT using the **Copy AI prompt** button.

## Stack

Vite + React + TypeScript + Tailwind v4. Supabase for auth and storage (one `recipes` table with a `jsonb` column, row-level security so each user only sees their own). Hosted on Vercel.

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Apply the schema in [`supabase/migrations/`](supabase/migrations). Either:
   - **GitHub integration (recommended):** *Project Settings → Integrations → GitHub*, connect this repo, Supabase directory `supabase`, production branch `main`, enable **Deploy to production**. Every push to `main` that adds a migration gets applied automatically.
   - **Manually:** paste each migration file into the **SQL Editor** and run it, oldest first.
3. Copy `.env.example` to `.env` and fill in **Project URL** and **anon public key** from *Project Settings → API*.
4. (Optional, for faster dev) *Authentication → Providers → Email*: turn off **Confirm email** so sign-up logs you in immediately.

### Changing the schema

Add a new file to `supabase/migrations/` named `YYYYMMDDHHMMSS_description.sql` and push to `main`. Never edit a migration that has already been applied; add a new one instead.

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project**, import the repo. Framework preset: Vite.
3. No environment variables needed: `.env.production` holds the Supabase URL and publishable key, which are public by design. Never put the secret or service_role key in a `VITE_` variable.
4. Deploy. `vercel.json` already rewrites all routes to `index.html` for client-side routing.
5. In Supabase, *Authentication → URL Configuration*, set **Site URL** to your Vercel URL so magic links and email confirmations redirect correctly.

## Recipe JSON

```json
{
  "title": "Smash Burger Seasoning",
  "tags": ["beef", "seasoning"],
  "anchor": "ground beef",
  "ingredients": [
    { "name": "ground beef", "grams": 907, "kcal_per_100g": 254, "note": "80/20" },
    { "name": "kosher salt", "grams": 11, "kcal_per_100g": 0 },
    { "name": "black pepper", "grams": 3, "g_per_tsp": 2.3 }
  ],
  "steps": ["Divide beef into balls.", "Smash, season, flip."]
}
```

Optional fields: `description`, `servings`, `notes`, `source`, and per-ingredient `kcal_per_100g`, `note`, `group`, `g_per_tsp`.

### Variants

A recipe can have alternate versions, shown as a switch on the recipe page. The main fields are the base version, labelled by `base_variant`. Each entry in `variants` lists only what changes: an ingredient with the same name replaces the base one (`grams: 0` drops it), a new name is added, and `steps`, `notes` or `description` replace the base ones when given.

```json
"base_variant": "With yogurt",
"variants": [
  {
    "name": "Without yogurt",
    "ingredients": [
      { "name": "5% plain yogurt", "grams": 0 },
      { "name": "warm water", "grams": 90, "kcal_per_100g": 0 }
    ]
  }
]
```
