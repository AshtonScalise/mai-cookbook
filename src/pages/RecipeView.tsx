import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRecipe, getRecipe, type RecipeRow } from '../lib/recipes'
import { tidyRecipe } from '../lib/schema'
import { RecipeScaler } from '../components/RecipeScaler'

export function RecipeView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState<RecipeRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getRecipe(id).then(setRow).catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-red-300 text-sm">{error}</p>
  if (!row) return <p className="text-stone-500 text-sm">Loading…</p>
  const recipe = row.data

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(tidyRecipe(recipe), null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function remove() {
    if (!confirm(`Delete "${recipe.title}"?`)) return
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

      <div className="flex flex-wrap gap-2 text-sm">
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

      <RecipeScaler recipe={recipe} />
    </div>
  )
}
