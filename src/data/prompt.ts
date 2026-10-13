import type { Recipe } from '../lib/schema'

export const EXAMPLE_RECIPE: Recipe = {
  title: 'Smash Burger Seasoning',
  description: 'Season by weight of ground beef. Scale to however much meat you bought.',
  tags: ['beef', 'seasoning'],
  servings: '4',
  anchor: 'ground beef',
  ingredients: [
    { name: 'ground beef', grams: 907, kcal_per_100g: 254, note: '80/20' },
    { name: 'diamond crystal kosher salt', grams: 11, kcal_per_100g: 0 },
    { name: 'black pepper', grams: 3, kcal_per_100g: 251 },
    { name: 'garlic powder', grams: 3, kcal_per_100g: 331 },
    { name: 'onion powder', grams: 2, kcal_per_100g: 341 },
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
  "servings": string (optional, start with a number, e.g. "4"),
  "anchor": string,
  "ingredients": [
    {
      "name": string,
      "grams": number,
      "kcal_per_100g": number,
      "note": string (optional),
      "group": string (optional),
      "g_per_tsp": number (optional)
    }
  ],
  "steps": string[],
  "notes": string (optional),
  "source": string (optional),
  "base_variant": string (optional),
  "variants": [ (optional)
    {
      "name": string,
      "ingredients": [ same shape as above, only the ingredients that change ],
      "steps": string[] (optional),
      "notes": string (optional),
      "description": string (optional)
    }
  ]
}

Rules:
- Every ingredient amount MUST be in grams (convert cups/tsp/tbsp using the ingredient's real density).
- "kcal_per_100g" is calories per 100 g of that ingredient as it goes into the recipe (raw unless the recipe says cooked). Use standard USDA values. Salt and water are 0.
- Use lowercase generic ingredient names ("kosher salt", "all-purpose flour", "ground beef").
- "anchor" is the ingredient everything else is a ratio of (the meat, the flour). It must match an ingredient name exactly.
- "group" is for sections like "dough" or "sauce". Omit it if the recipe has no sections.
- "g_per_tsp" is grams per teaspoon. Include it only for small-amount ingredients that are unusual (not salt, sugar, common spices, oils, or sauces).
- Only use "variants" when the recipe has real alternatives (e.g. with or without yogurt). The main fields describe one version, named by "base_variant". Each variant lists only the ingredients that differ: same name replaces it, grams 0 removes it, a new name adds it. Give a variant its own full "steps" if any step changes.
- No markdown fences, no commentary.

Example of a correct answer:
${JSON.stringify(EXAMPLE_RECIPE, null, 2)}

Recipe: `
