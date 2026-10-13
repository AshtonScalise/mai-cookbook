import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRecipe, getRecipe, type RecipeRow } from '../lib/recipes'
import { anchorIndex, scaleFactor, scaleIngredients } from '../lib/scale'
import { G_PER_LB, toGrams, type MassUnit } from '../lib/units'
import { tidyRecipe } from '../lib/schema'
import { IngredientTable } from '../components/IngredientTable'
import { ScalePanel } from '../components/ScalePanel'

export function RecipeView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState<RecipeRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scaling, setScaling] = useState(false)
  const [basis, setBasis] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<MassUnit>('g')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getRecipe(id).then(setRow).catch((e) => setError(e.message))
  }, [id])

  const recipe = row?.data
  const basisIndex = recipe ? (basis ?? anchorIndex(recipe)) : 0

  const factor = useMemo(() => {
    if (!recipe || !scaling) return 1
    return scaleFactor(recipe, basisIndex, toGrams(parseFloat(amount), unit))
  }, [recipe, scaling, basisIndex, amount, unit])

  const scaled = useMemo(() => (recipe ? scaleIngredients(recipe.ingredients, factor) : []), [recipe, factor])

  if (error) return <p className="text-red-300 text-sm">{error}</p>
  if (!recipe) return <p className="text-stone-500 text-sm">Loading…</p>

  function prefill(index: number) {
    const g = recipe!.ingredients[index].grams
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
    setBasis(i)
    prefill(i)
  }

  function reset() {
    setScaling(false)
    setBasis(null)
    setAmount('')
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(tidyRecipe(recipe!), null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function remove() {
    if (!confirm(`Delete "${recipe!.title}"?`)) return
    await deleteRecipe(id)
    navigate('/')
  }

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="text-xs text-stone-500 hover:text-stone-300">
          ← all recipes
        </Link>
        <h1 className="font-display text-3xl mt-1">{recipe.title}</h1>
        {recipe.description && <p className="mt-1 text-stone-400">{recipe.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          {recipe.servings && <span>{recipe.servings}</span>}
          {recipe.tags.map((t) => (
            <span key={t} className="rounded bg-stone-800 px-1.5 py-0.5 text-stone-300">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!scaling ? (
          <button className="btn btn-primary" onClick={openScale}>
            Scale
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={reset}>
            Original
          </button>
        )}
        <Link to={`/r/${id}/edit`} className="btn btn-ghost">
          Edit
        </Link>
        <button className="btn btn-ghost" onClick={copyJson}>
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <button className="btn btn-danger ml-auto" onClick={remove}>
          Delete
        </button>
      </div>

      {scaling && (
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
      )}

      <IngredientTable ingredients={scaled} basisIndex={basisIndex} />

      {recipe.steps.length > 0 && (
        <details className="group">
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
