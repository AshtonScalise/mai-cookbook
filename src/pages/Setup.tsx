import { RecipeScaler } from '../components/RecipeScaler'
import { EXAMPLE_RECIPE } from '../data/prompt'

export function Setup() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <div className="space-y-4">
        <h1 className="font-display text-3xl">
          m<span className="text-amber-400">AI</span> Cookbook
        </h1>
        <p className="text-stone-300">Supabase isn't configured yet.</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-stone-400">
          <li>
            Create a project at <span className="text-stone-200">supabase.com</span>.
          </li>
          <li>
            Connect this GitHub repo under Project Settings → Integrations → GitHub, or paste <code className="text-amber-300">supabase/migrations/*.sql</code> into the SQL editor.
          </li>
          <li>
            Copy <code className="text-amber-300">.env.example</code> to <code className="text-amber-300">.env</code>{' '}
            and fill in the project URL and anon key from Project Settings → API.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-stone-500">Preview</div>
        <h2 className="font-display text-2xl">{EXAMPLE_RECIPE.title}</h2>
        <p className="text-stone-400 text-sm">{EXAMPLE_RECIPE.description}</p>
        <RecipeScaler recipe={EXAMPLE_RECIPE} />
      </div>
    </div>
  )
}
