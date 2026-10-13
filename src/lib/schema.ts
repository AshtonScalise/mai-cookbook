import { z } from 'zod'

export const IngredientSchema = z.object({
  name: z.string().min(1, 'name is required'),
  grams: z.number().nonnegative('grams must be ≥ 0'),
  g_per_tsp: z.number().positive().optional(),
  note: z.string().optional(),
  group: z.string().optional(),
})

export const RecipeSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  servings: z.string().optional(),
  /** name of the ingredient everything else is a ratio of (the meat, the flour) */
  anchor: z.string().optional(),
  ingredients: z.array(IngredientSchema).min(1, 'at least one ingredient'),
  steps: z.array(z.string()).default([]),
  notes: z.string().optional(),
  source: z.string().optional(),
})

export type Ingredient = z.infer<typeof IngredientSchema>
export type Recipe = z.infer<typeof RecipeSchema>

export type ParseResult = { ok: true; recipe: Recipe } | { ok: false; errors: string[] }

export function parseRecipe(input: unknown): ParseResult {
  const result = RecipeSchema.safeParse(input)
  if (result.success) return { ok: true, recipe: result.data }
  return {
    ok: false,
    errors: result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
  }
}

export function parseRecipeJson(text: string): ParseResult {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${(e as Error).message}`] }
  }
  return parseRecipe(value)
}

export function emptyRecipe(): Recipe {
  return { title: '', tags: [], ingredients: [{ name: '', grams: 0 }], steps: [] }
}

/** Recipe JSON from the database, with defaults filled in. Falls back to the raw value if it no longer validates. */
export function normalizeRecipe(input: unknown): Recipe {
  const result = RecipeSchema.safeParse(input)
  if (result.success) return result.data
  const raw = input as Partial<Recipe>
  return { ...raw, title: raw.title ?? '', tags: raw.tags ?? [], ingredients: raw.ingredients ?? [], steps: raw.steps ?? [] }
}

/** Strip empty optional fields so the JSON view stays clean. Arrays are kept so the shape stays stable. */
export function tidyRecipe(r: Recipe): Recipe {
  const clean = <T extends object>(o: T): T =>
    Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as T
  return clean({
    ...r,
    ingredients: r.ingredients.map((i) => clean(i)),
    steps: r.steps.filter((s) => s.trim() !== ''),
    tags: r.tags.map((t) => t.trim()).filter(Boolean),
  })
}
