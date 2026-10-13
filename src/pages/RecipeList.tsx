import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listMyRecipes, listPublicRecipes, type RecipeRow } from '../lib/recipes'
import { useAuth } from '../lib/auth-context'
import { AI_PROMPT } from '../data/prompt'

type View = 'mine' | 'everyone'

export function RecipeList() {
  const { session, loading: authLoading } = useAuth()
  const userId = session?.user.id
  const [params, setParams] = useSearchParams()
  const view: View = userId && params.get('view') !== 'everyone' ? 'mine' : 'everyone'

  // Results are tagged with the view they were loaded for, so switching views shows "Loading…" without resetting state.
  const loadKey = `${view}:${userId ?? ''}`
  const [result, setResult] = useState<{ key: string; rows?: RecipeRow[]; error?: string } | null>(null)
  const current = result?.key === loadKey ? result : null
  const rows = current?.rows ?? null
  const error = current?.error ?? null
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    const load = view === 'mine' && userId ? listMyRecipes(userId) : listPublicRecipes()
    load
      .then((r) => !cancelled && setResult({ key: loadKey, rows: r }))
      .catch((e) => !cancelled && setResult({ key: loadKey, error: e.message }))
    return () => {
      cancelled = true
    }
  }, [view, userId, authLoading, loadKey])

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

  function setView(v: View) {
    setParams(v === 'everyone' ? { view: 'everyone' } : {})
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(AI_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      {userId && (
        <div className="flex rounded-md bg-stone-900 p-0.5 text-sm w-fit">
          {(['mine', 'everyone'] as View[]).map((v) => (
            <button
              key={v}
              className={`px-3 py-1 rounded cursor-pointer ${view === v ? 'bg-stone-700 text-stone-100' : 'text-stone-400'}`}
              onClick={() => setView(v)}
            >
              {v === 'mine' ? 'My recipes' : 'Everyone'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="search title, tag, ingredient"
          className="flex-1 min-w-[12rem]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {userId && (
          <>
            <Link to="/new" className="btn btn-primary">
              New
            </Link>
            <Link to="/new?mode=json" className="btn btn-ghost">
              Import JSON
            </Link>
            <button
              className="btn btn-ghost"
              onClick={copyPrompt}
              title="Prompt that makes ChatGPT return recipes in this app's JSON"
            >
              {copied ? 'Copied!' : 'Copy AI prompt'}
            </button>
          </>
        )}
      </div>

      {error && <p className="text-red-300 text-sm">{error}</p>}
      {rows === null && !error && <p className="text-stone-500 text-sm">Loading…</p>}
      {rows && rows.length === 0 && (
        <p className="text-stone-400 text-sm">
          {view === 'mine'
            ? 'No recipes yet. Copy the AI prompt, paste a recipe into ChatGPT, then Import JSON.'
            : 'No public recipes yet.'}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => (
          <li key={r.id}>
            <Link
              to={`/r/${r.id}`}
              className="block rounded-lg border border-stone-800 bg-stone-900/60 p-4 hover:border-amber-500/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-lg leading-tight">{r.title}</div>
                {!r.is_public && <span className="shrink-0 text-xs text-stone-500">private</span>}
                {view === 'everyone' && r.user_id === userId && (
                  <span className="shrink-0 text-xs text-amber-400">yours</span>
                )}
              </div>
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
