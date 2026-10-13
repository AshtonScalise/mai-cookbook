import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export function Layout() {
  const { session } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-stone-800">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl tracking-tight">
            m<span className="text-amber-400">AI</span> Cookbook
          </Link>
          <div className="flex items-center gap-3 text-sm text-stone-400">
            <span className="hidden sm:inline truncate max-w-[200px]">{session?.user.email}</span>
            <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
