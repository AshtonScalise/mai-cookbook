import type { Ingredient, Recipe } from './schema'

/** Labels for every version of a recipe, base first; empty when the recipe has no variants. */
export function variantLabels(recipe: Recipe): string[] {
  if (!recipe.variants?.length) return []
  return [recipe.base_variant || 'Original', ...recipe.variants.map((v) => v.name)]
}

/** The recipe as cooked in version `index` (0 = base). */
export function resolveVariant(recipe: Recipe, index: number): Recipe {
  const variant = index > 0 ? recipe.variants?.[index - 1] : undefined
  if (!variant) return { ...recipe, ingredients: recipe.ingredients.filter((i) => i.grams > 0) }

  const key = (name: string) => name.trim().toLowerCase()
  const overrides = new Map(variant.ingredients.map((i) => [key(i.name), i]))
  const ingredients: Ingredient[] = []
  // Where a removed base ingredient sat, per group, so its replacements land in the same spot.
  const removedAt = new Map<string | undefined, number>()
  for (const base of recipe.ingredients) {
    const o = overrides.get(key(base.name))
    overrides.delete(key(base.name))
    const merged = o ? { ...base, ...o } : base
    if (merged.grams > 0) ingredients.push(merged)
    else if (!removedAt.has(base.group)) removedAt.set(base.group, ingredients.length)
  }
  // New ingredients take the slot of a removed one in their group, else go after the group's last
  // ingredient, else at the end, so grouped tables stay together.
  for (const added of overrides.values()) {
    if (added.grams <= 0) continue
    let at = removedAt.get(added.group)
    if (at === undefined) {
      const last = ingredients.findLastIndex((ing) => ing.group === added.group)
      at = last >= 0 ? last + 1 : ingredients.length
    }
    ingredients.splice(at, 0, added)
    for (const [g, i] of removedAt) if (i >= at) removedAt.set(g, i + 1)
  }

  return {
    ...recipe,
    ingredients,
    steps: variant.steps ?? recipe.steps,
    notes: variant.notes ?? recipe.notes,
    description: variant.description ?? recipe.description,
  }
}
