export function Setup() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg space-y-4">
        <h1 className="font-display text-3xl">
          m<span className="text-amber-400">AI</span> Cookbook
        </h1>
        <p className="text-stone-300">Supabase isn't configured yet.</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-stone-400">
          <li>
            Create a project at <span className="text-stone-200">supabase.com</span>.
          </li>
          <li>
            Run <code className="text-amber-300">supabase/schema.sql</code> in the SQL editor.
          </li>
          <li>
            Copy <code className="text-amber-300">.env.example</code> to <code className="text-amber-300">.env</code>{' '}
            and fill in the project URL and anon key from Project Settings → API.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </div>
  )
}
