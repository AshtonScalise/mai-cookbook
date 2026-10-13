import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './lib/auth-context'
import { supabaseConfigured } from './lib/supabase'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Setup } from './pages/Setup'
import { RecipeList } from './pages/RecipeList'
import { RecipeView } from './pages/RecipeView'
import { RecipeEdit } from './pages/RecipeEdit'

function Protected({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <p className="p-6 text-sm text-stone-500">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  if (!supabaseConfigured) return <Setup />
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<RecipeList />} />
        <Route path="new" element={<RecipeEdit />} />
        <Route path="r/:id" element={<RecipeView />} />
        <Route path="r/:id/edit" element={<RecipeEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
