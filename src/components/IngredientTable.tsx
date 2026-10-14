import type { Ingredient } from '../lib/schema'
import { formatGrams, formatPounds, formatSpoons, guessGPerTsp } from '../lib/units'
import { ingredientKcal } from '../lib/nutrition'

type Props = { ingredients: Ingredient[]; basisIndex: number }

export function IngredientTable({ ingredients, basisIndex }: Props) {
  const basisGrams = ingredients[basisIndex]?.grams ?? 0
  const grouped = ingredients.some((i) => i.group)
  // Show each section once: ingredients are gathered under their group in order of first appearance,
  // so a recipe that lists a section's ingredients apart still renders one block per section.
  const groupRank = new Map<string | undefined, number>()
  ingredients.forEach((ing) => {
    if (!groupRank.has(ing.group)) groupRank.set(ing.group, groupRank.size)
  })
  const order = ingredients
    .map((_, i) => i)
    .sort((a, b) => groupRank.get(ingredients[a].group)! - groupRank.get(ingredients[b].group)! || a - b)

  return (
    <table className="w-full text-sm">
      <thead className="text-xs uppercase tracking-wide text-stone-500">
        <tr>
          <th className="text-left font-medium pb-2">Ingredient</th>
          <th className="text-right font-medium pb-2">Grams</th>
          <th className="text-right font-medium pb-2 hidden sm:table-cell">Also</th>
          <th className="text-right font-medium pb-2 hidden sm:table-cell">kcal</th>
          <th className="text-right font-medium pb-2">%</th>
        </tr>
      </thead>
      <tbody>
        {order.flatMap((i, pos) => {
          const ing = ingredients[i]
          const rows = []
          if (grouped && (pos === 0 || ing.group !== ingredients[order[pos - 1]].group)) {
            rows.push(
              <tr key={`g${i}`}>
                <td colSpan={5} className="pt-4 pb-1 text-xs uppercase tracking-wide text-amber-400">
                  {ing.group ?? 'Other'}
                </td>
              </tr>,
            )
          }
          const lb = formatPounds(ing.grams)
          const spoons = formatSpoons(ing.grams, ing.g_per_tsp ?? guessGPerTsp(ing.name))
          const also = [lb, spoons].filter(Boolean).join(' · ')
          const k = ingredientKcal(ing)
          const kcalText = k ? Math.round(k.kcal).toLocaleString() : '—'
          const kcalTitle = k
            ? k.estimated
              ? 'estimated from the ingredient name'
              : 'from the recipe'
            : 'no calorie data for this ingredient'
          const pct = basisGrams ? (ing.grams / basisGrams) * 100 : 0
          const isBasis = i === basisIndex
          rows.push(
            <tr key={i} className={`border-t border-stone-800 ${isBasis ? 'bg-amber-500/10' : ''}`}>
              <td className="py-2 pr-2">
                <div className={isBasis ? 'text-amber-300 font-medium' : ''}>{ing.name}</div>
                {ing.note && <div className="text-xs text-stone-500">{ing.note}</div>}
                <div className="text-xs text-stone-400 sm:hidden">
                  {[also, k && `${kcalText} kcal`].filter(Boolean).join(' · ')}
                </div>
              </td>
              <td className="py-2 text-right font-semibold tabular-nums whitespace-nowrap">{formatGrams(ing.grams)}</td>
              <td className="py-2 text-right text-stone-400 tabular-nums whitespace-nowrap hidden sm:table-cell">{also}</td>
              <td
                className={`py-2 pl-2 text-right tabular-nums hidden sm:table-cell ${k?.estimated ? 'text-stone-500' : 'text-stone-300'}`}
                title={kcalTitle}
              >
                {kcalText}
              </td>
              <td className="py-2 pl-2 text-right text-stone-500 tabular-nums">
                {pct >= 10 ? Math.round(pct) : pct.toFixed(1)}
              </td>
            </tr>,
          )
          return rows
        })}
      </tbody>
    </table>
  )
}
