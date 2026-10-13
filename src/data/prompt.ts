import type { Recipe } from '../lib/schema'

export const EXAMPLE_RECIPE: Recipe = {
  title: 'Smash Burger Seasoning',
  description: 'Season by weight of ground beef. Scale to however much meat you bought.',
  tags: ['beef', 'seasoning'],
  anchor: 'ground beef',
  ingredients: [
    { name: 'ground beef', grams: 907, note: '80/20' },
    { name: 'kosher salt', grams: 11, note: 'Diamond Crystal' },
    { name: 'black pepper', grams: 3 },
    { name: 'garlic powder', grams: 3 },
    { name: 'onion powder', grams: 2 },
  ],
  steps: [
    'Divide beef into balls, keep cold.',
    'Smash onto a ripping-hot pan, season the top immediately.',
    'Flip once the edges are lacy and brown.',
  ],
}

/** Paste this into ChatGPT (or any model) to get recipes back in the exact JSON the app accepts. */
export const AI_PROMPT = `Return this recipe as a single JSON object and nothing else, in exactly this shape:

{
  "title": string,
  "description": string (optional),
  "tags": string[],
  "servings": string (optional),
  "anchor": string,
  "ingredients": [
    { "name": string, "grams": number, "note": string (optional), "group": string (optional) }
  ],
  "steps": string[],
  "notes": string (optional)
}

Rules:
- Every ingredient amount MUST be in grams (convert cups/tsp/tbsp using the ingredient's real density).
- Use lowercase generic ingredient names ("kosher salt", "all-purpose flour", "ground beef").
- "anchor" is the ingredient everything else is a ratio of (the meat, the flour). It must match an ingredient name exactly.
- No markdown fences, no commentary.

Recipe: `
