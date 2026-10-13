import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { deleteRecipe, getRecipe, type RecipeRow } from '../lib/recipes'
import { tidyRecipe } from '../lib/schema'
import { useAuth } from '../lib/auth-context'
import { RecipeScaler } from '../components/RecipeScaler'
import { copyText } from '../lib/clipboard'
import { resolveVariant, variantLabels } from '../lib/variants'

export function RecipeView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { session, loading: authLoading } = useAuth()
  const [row, setRow] = useState<RecipeRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<{ kind: 'json' | 'link'; ok: boolean } | null>(null)

  // Wait for auth so a signed-in owner can load their private recipes.
  useEffect(() => {
    if (authLoading) return
    getRecipe(id).then(setRow).catch((e) => setError(e.message))
  }, [id, authLoading])

  if (error)
    return (
      <div className="space-y-2">
        <Link to="/" className="text-xs text-stone-500 hover:text-stone-300">
          ← all recipes
        </Link>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    )
  if (!row) return <p className="text-stone-500 text-sm">Loading…</p>
  const recipe = row.data
  const isOwner = session?.user.id === row.user_id
  const labels = variantLabels(recipe)
  const vParam = Number(params.get('v') ?? 0)
  const vIndex = Number.isInteger(vParam) && vParam >= 0 && vParam < labels.length ? vParam : 0
  const shown = resolveVariant(recipe, vIndex)

  async function copy(kind: 'json' | 'link') {
    const text = kind === 'json' ? JSON.stringify(tidyRecipe(recipe), null, 2) : window.location.href
    setCopied({ kind, ok: await copyText(text) })
    setTimeout(() => setCopied(null), 2000)
  }

  function label(kind: 'json' | 'link', idle: string) {
    if (copied?.kind !== kind) return idle
    return copied.ok ? 'Copied!' : 'Copy failed'
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
        {shown.description && <p className="mt-1 text-stone-400">{shown.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          {!row.is_public && <span className="rounded border border-stone-700 px-1.5 py-0.5">private</span>}
          {recipe.servings && <span>{recipe.servings}</span>}
          {recipe.tags.map((t) => (
            <span key={t} className="rounded bg-stone-800 px-1.5 py-0.5 text-stone-300">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {isOwner && (
          <Link to={`/r/${id}/edit`} className="btn btn-ghost">
            Edit
          </Link>
        )}
        <button className="btn btn-ghost" onClick={() => copy('json')}>
          {label('json', 'Copy JSON')}
        </button>
        {row.is_public && (
          <button className="btn btn-ghost" onClick={() => copy('link')}>
            {label('link', 'Copy link')}
          </button>
        )}
        {isOwner && (
          <button className="btn btn-danger ml-auto" onClick={remove}>
            Delete
          </button>
        )}
      </div>

      {labels.length > 0 && (
        <div className="flex flex-wrap rounded-md bg-stone-900 p-0.5 text-sm w-fit">
          {labels.map((label, i) => (
            <button
              key={label}
              className={`px-3 py-1 rounded cursor-pointer ${vIndex === i ? 'bg-amber-500 text-stone-950 font-medium' : 'text-stone-400 hover:text-stone-200'}`}
              onClick={() => setParams(i === 0 ? {} : { v: String(i) }, { replace: true })}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <RecipeScaler recipe={shown} />
    </div>
  )
}
