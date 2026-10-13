import { useMemo, useState } from 'react'
import type { Recipe } from '../lib/schema'
import { anchorIndex, scaleFactor, scaleIngredients } from '../lib/scale'
import { G_PER_LB, toGrams, type MassUnit } from '../lib/units'
import { IngredientTable } from './IngredientTable'
import { ScalePanel } from './ScalePanel'
import { CalorieSummary } from './CalorieSummary'
import { parseServings } from '../lib/nutrition'

/** The ingredient table plus the "I have…" scaling panel. Everything below the title lives here. */
export function RecipeScaler({ recipe }: { recipe: Recipe }) {
  const [scaling, setScaling] = useState(false)
  // Basis is tracked by ingredient name so it survives switching between variants.
  const [basis, setBasis] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<MassUnit>('g')

  const named = basis ? recipe.ingredients.findIndex((i) => i.name === basis) : -1
  const basisIndex = named >= 0 ? named : anchorIndex(recipe)

  const factor = useMemo(() => {
    if (!scaling) return 1
    return scaleFactor(recipe, basisIndex, toGrams(parseFloat(amount), unit))
  }, [recipe, scaling, basisIndex, amount, unit])

  const scaled = useMemo(() => scaleIngredients(recipe.ingredients, factor), [recipe, factor])

  function prefill(index: number) {
    const g = recipe.ingredients[index].grams
    if (g >= G_PER_LB / 2) {
      setUnit('lb')
      setAmount(String(Math.round((g / G_PER_LB) * 100) / 100))
    } else {
      setUnit('g')
      setAmount(String(Math.round(g)))
    }
  }

  function openScale() {
    prefill(basisIndex)
    setScaling(true)
  }

  function changeBasis(i: number) {
    setBasis(recipe.ingredients[i].name)
    prefill(i)
  }

  function reset() {
    setScaling(false)
    setBasis(null)
    setAmount('')
  }

  return (
    <div className="space-y-4">
      {scaling ? (
        <ScalePanel
          ingredients={recipe.ingredients}
          basisIndex={basisIndex}
          onBasisChange={changeBasis}
          amount={amount}
          onAmountChange={setAmount}
          unit={unit}
          onUnitChange={setUnit}
          factor={factor}
          onReset={reset}
        />
      ) : (
        <button className="btn btn-primary" onClick={openScale}>
          Scale
        </button>
      )}

      <CalorieSummary ingredients={scaled} servings={parseServings(recipe.servings)} factor={factor} />

      <IngredientTable ingredients={scaled} basisIndex={basisIndex} />

      {recipe.steps.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-stone-400 hover:text-stone-200">
            Steps ({recipe.steps.length})
          </summary>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-stone-200">
            {recipe.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </details>
      )}

      {recipe.notes && (
        <div className="text-sm text-stone-400 whitespace-pre-wrap border-l-2 border-stone-800 pl-3">{recipe.notes}</div>
      )}
      {recipe.source && <div className="text-xs text-stone-600">source: {recipe.source}</div>}
    </div>
  )
}
