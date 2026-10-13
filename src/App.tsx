import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './lib/auth-context'
import { supabaseConfigured } from './lib/supabase'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Setup } from './pages/Setup'
import { RecipeList } from './pages/RecipeList'
import { RecipeView } from './pages/RecipeView'
import { RecipeEdit } from './pages/RecipeEdit'

/** Pages that change data need a session; browsing and viewing do not. */
function Protected({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="text-sm text-stone-500">Loading…</p>
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  if (!supabaseConfigured) return <Setup />
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<RecipeList />} />
        <Route path="r/:id" element={<RecipeView />} />
        <Route
          path="new"
          element={
            <Protected>
              <RecipeEdit />
            </Protected>
          }
        />
        <Route
          path="r/:id/edit"
          element={
            <Protected>
              <RecipeEdit />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
