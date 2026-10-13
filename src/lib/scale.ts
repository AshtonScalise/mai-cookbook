import type { Recipe, Ingredient } from './schema'

/** Index of the anchor ingredient; falls back to the heaviest one. */
export function anchorIndex(recipe: Recipe): number {
  if (recipe.anchor) {
    const a = recipe.anchor.toLowerCase()
    const i = recipe.ingredients.findIndex((x) => x.name.toLowerCase() === a)
    if (i >= 0) return i
  }
  let best = 0
  recipe.ingredients.forEach((ing, i) => {
    if (ing.grams > recipe.ingredients[best].grams) best = i
  })
  return best
}

export function scaleFactor(recipe: Recipe, basisIndex: number, targetGrams: number): number {
  const base = recipe.ingredients[basisIndex]?.grams
  if (!base || !Number.isFinite(targetGrams) || targetGrams <= 0) return 1
  return targetGrams / base
}

export function scaleIngredients(ingredients: Ingredient[], factor: number): Ingredient[] {
  return ingredients.map((i) => ({ ...i, grams: i.grams * factor }))
}
