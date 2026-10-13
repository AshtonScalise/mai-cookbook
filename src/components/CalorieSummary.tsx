import type { Ingredient } from '../lib/schema'
import { formatKcal, recipeKcal } from '../lib/nutrition'

type Props = {
  /** ingredients at their current (possibly scaled) weights */
  ingredients: Ingredient[]
  /** servings for the original recipe, if the recipe states a number */
  servings?: number
  factor: number
}

export function CalorieSummary({ ingredients, servings, factor }: Props) {
  const { total, missing, estimated } = recipeKcal(ingredients)
  if (total === 0 && missing.length === ingredients.length) return null

  const scaledServings = servings ? servings * factor : undefined
  const servingsText = scaledServings
    ? Number.isInteger(Math.round(scaledServings * 10) / 10)
      ? String(Math.round(scaledServings))
      : scaledServings.toFixed(1)
    : undefined

  return (
    <div className="text-sm text-stone-300 space-y-0.5">
      <div>
        <span className="text-stone-500">{estimated ? '≈ ' : ''}</span>
        <span className="font-semibold">{formatKcal(total)}</span>
        <span className="text-stone-500"> total</span>
        {scaledServings && (
          <>
            <span className="text-stone-600"> · </span>
            <span className="font-semibold">{formatKcal(total / scaledServings)}</span>
            <span className="text-stone-500"> per serving ({servingsText})</span>
          </>
        )}
      </div>
      {missing.length > 0 && (
        <div className="text-xs text-stone-500">No calorie data for {missing.join(', ')}.</div>
      )}
    </div>
  )
}
