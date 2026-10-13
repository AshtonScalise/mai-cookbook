import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRecipes, type RecipeRow } from '../lib/recipes'
import { AI_PROMPT } from '../data/prompt'

export function RecipeList() {
  const [rows, setRows] = useState<RecipeRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    listRecipes().then(setRows).catch((e) => setError(e.message))
  }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.data.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.data.ingredients.some((i) => i.name.toLowerCase().includes(q)),
    )
  }, [rows, query])

  async function copyPrompt() {
    await navigator.clipboard.writeText(AI_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="search title, tag, ingredient"
          className="flex-1 min-w-[12rem]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link to="/new" className="btn btn-primary">
          New
        </Link>
        <Link to="/new?mode=json" className="btn btn-ghost">
          Import JSON
        </Link>
        <button className="btn btn-ghost" onClick={copyPrompt} title="Prompt that makes ChatGPT return recipes in this app's JSON">
          {copied ? 'Copied!' : 'Copy AI prompt'}
        </button>
      </div>

      {error && <p className="text-red-300 text-sm">{error}</p>}
      {rows === null && !error && <p className="text-stone-500 text-sm">Loading…</p>}
      {rows && rows.length === 0 && (
        <p className="text-stone-400 text-sm">
          No recipes yet. Copy the AI prompt, paste a recipe into ChatGPT, then Import JSON.
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => (
          <li key={r.id}>
            <Link
              to={`/r/${r.id}`}
              className="block rounded-lg border border-stone-800 bg-stone-900/60 p-4 hover:border-amber-500/60 transition-colors"
            >
              <div className="font-display text-lg leading-tight">{r.title}</div>
              <div className="mt-1 text-xs text-stone-500">
                {r.data.ingredients.length} ingredients
                {r.data.anchor && <> · by {r.data.anchor}</>}
              </div>
              {r.data.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.data.tags.map((t) => (
                    <span key={t} className="rounded bg-stone-800 px-1.5 py-0.5 text-xs text-stone-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
