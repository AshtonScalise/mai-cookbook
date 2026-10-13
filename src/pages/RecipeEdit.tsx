import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getRecipe, saveRecipe } from '../lib/recipes'
import { emptyRecipe, parseRecipe, parseRecipeJson, tidyRecipe, type Ingredient, type Recipe } from '../lib/schema'
import { guessGPerTsp } from '../lib/units'
import { JsonEditor } from '../components/JsonEditor'
import { EXAMPLE_RECIPE } from '../data/prompt'

type Tab = 'form' | 'json'

export function RecipeEdit() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>(params.get('mode') === 'json' ? 'json' : 'form')
  const [recipe, setRecipe] = useState<Recipe>(emptyRecipe)
  const [stepsText, setStepsText] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loaded, setLoaded] = useState(!id)
  const [saving, setSaving] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    if (!id) return
    getRecipe(id)
      .then((row) => {
        load(row.data)
        setIsPublic(row.is_public)
        setLoaded(true)
      })
      .catch((e) => setErrors([e.message]))
  }, [id])

  function load(r: Recipe) {
    setRecipe(r)
    setStepsText(r.steps.join('\n'))
    setTagsText(r.tags.join(', '))
    setJsonText(JSON.stringify(tidyRecipe(r), null, 2))
  }

  /** Form state → Recipe object. */
  function assemble(): Recipe {
    return tidyRecipe({
      ...recipe,
      steps: stepsText.split('\n').map((s) => s.trim()),
      tags: tagsText.split(',').map((t) => t.trim()),
    })
  }

  function switchTab(next: Tab) {
    if (next === tab) return
    setErrors([])
    if (next === 'json') {
      setJsonText(JSON.stringify(assemble(), null, 2))
      setTab('json')
    } else {
      const parsed = parseRecipeJson(jsonText)
      if (!parsed.ok) return setErrors(parsed.errors)
      load(parsed.recipe)
      setTab('form')
    }
  }

  function formatJson() {
    const parsed = parseRecipeJson(jsonText)
    if (!parsed.ok) return setErrors(parsed.errors)
    setErrors([])
    setJsonText(JSON.stringify(tidyRecipe(parsed.recipe), null, 2))
  }

  async function save() {
    const parsed = tab === 'json' ? parseRecipeJson(jsonText) : parseRecipe(assemble())
    if (!parsed.ok) return setErrors(parsed.errors)
    setErrors([])
    setSaving(true)
    try {
      const row = await saveRecipe(tidyRecipe(parsed.recipe), isPublic, id)
      navigate(`/r/${row.id}`)
    } catch (e) {
      setErrors([(e as Error).message])
      setSaving(false)
    }
  }

  function updateIngredient(i: number, patch: Partial<Ingredient>) {
    setRecipe((r) => ({ ...r, ingredients: r.ingredients.map((ing, j) => (j === i ? { ...ing, ...patch } : ing)) }))
  }

  function removeIngredient(i: number) {
    setRecipe((r) => ({ ...r, ingredients: r.ingredients.filter((_, j) => j !== i) }))
  }

  function addIngredient() {
    setRecipe((r) => ({ ...r, ingredients: [...r.ingredients, { name: '', grams: 0 }] }))
  }

  if (!loaded && errors.length === 0) return <p className="text-stone-500 text-sm">Loading…</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Link to={id ? `/r/${id}` : '/'} className="text-xs text-stone-500 hover:text-stone-300">
          ← back
        </Link>
        <div className="flex rounded-md bg-stone-900 p-0.5 text-sm">
          {(['form', 'json'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`px-3 py-1 rounded cursor-pointer ${tab === t ? 'bg-stone-700 text-stone-100' : 'text-stone-400'}`}
              onClick={() => switchTab(t)}
            >
              {t === 'form' ? 'Form' : 'JSON'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'json' ? (
        <>
          <JsonEditor value={jsonText} onChange={setJsonText} errors={errors} onFormat={formatJson} />
          {!jsonText.trim() && (
            <button className="btn btn-ghost" onClick={() => setJsonText(JSON.stringify(EXAMPLE_RECIPE, null, 2))}>
              Paste example
            </button>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <input
            className="w-full font-display text-2xl"
            placeholder="Title"
            value={recipe.title}
            onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
          />
          <input
            className="w-full"
            placeholder="Description (optional)"
            value={recipe.description ?? ''}
            onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
          />
          <div className="grid sm:grid-cols-3 gap-2">
            <input
              placeholder="tags, comma separated"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
            <input
              placeholder="servings (optional)"
              value={recipe.servings ?? ''}
              onChange={(e) => setRecipe({ ...recipe, servings: e.target.value })}
            />
            <select
              value={recipe.anchor ?? ''}
              onChange={(e) => setRecipe({ ...recipe, anchor: e.target.value || undefined })}
              title="The ingredient everything else is a ratio of"
            >
              <option value="">anchor: heaviest</option>
              {recipe.ingredients
                .filter((i) => i.name)
                .map((i, idx) => (
                  <option key={idx} value={i.name}>
                    anchor: {i.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_5rem_4.5rem_1fr_2rem] gap-2 text-xs uppercase tracking-wide text-stone-500 px-1">
              <span>Ingredient</span>
              <span>Grams</span>
              <span title="grams per teaspoon; auto-guessed from the name">g/tsp</span>
              <span>Note</span>
              <span />
            </div>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-[1fr_5rem_4.5rem_1fr_2rem] gap-2 items-center">
                <input
                  placeholder="kosher salt"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, { name: e.target.value })}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={ing.grams === 0 ? '' : ing.grams}
                  onChange={(e) => updateIngredient(i, { grams: e.target.value === '' ? 0 : Number(e.target.value) })}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder={guessGPerTsp(ing.name)?.toString() ?? '—'}
                  value={ing.g_per_tsp ?? ''}
                  onChange={(e) =>
                    updateIngredient(i, { g_per_tsp: e.target.value === '' ? undefined : Number(e.target.value) })
                  }
                />
                <input
                  placeholder="note"
                  value={ing.note ?? ''}
                  onChange={(e) => updateIngredient(i, { note: e.target.value })}
                />
                <button
                  type="button"
                  className="text-stone-500 hover:text-red-300 cursor-pointer text-lg leading-none"
                  onClick={() => removeIngredient(i)}
                  title="remove"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addIngredient}>
              + ingredient
            </button>
          </div>

          <textarea
            className="w-full min-h-[8rem]"
            placeholder="Steps, one per line (optional)"
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
          />
          <textarea
            className="w-full min-h-[4rem]"
            placeholder="Notes (optional)"
            value={recipe.notes ?? ''}
            onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
          />
          {errors.length > 0 && (
            <ul className="text-sm text-red-300 space-y-1">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer w-fit">
        <input
          type="checkbox"
          className="size-4 accent-amber-500"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public
        <span className="text-stone-500">
          {isPublic ? 'anyone can view it, no sign-in needed' : 'only you can see it'}
        </span>
      </label>

      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <Link to={id ? `/r/${id}` : '/'} className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </div>
  )
}
