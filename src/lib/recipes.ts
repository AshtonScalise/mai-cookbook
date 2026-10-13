import { supabase } from './supabase'
import { normalizeRecipe, type Recipe } from './schema'

export type RecipeRow = {
  id: string
  user_id: string
  title: string
  data: Recipe
  created_at: string
  updated_at: string
}

function toRow(raw: Record<string, unknown>): RecipeRow {
  return { ...(raw as RecipeRow), data: normalizeRecipe(raw.data) }
}

export async function listRecipes(): Promise<RecipeRow[]> {
  const { data, error } = await supabase.from('recipes').select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(toRow)
}

export async function getRecipe(id: string): Promise<RecipeRow> {
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single()
  if (error) throw error
  return toRow(data)
}

export async function saveRecipe(recipe: Recipe, id?: string): Promise<RecipeRow> {
  const payload = { title: recipe.title, data: recipe }
  const query = id
    ? supabase.from('recipes').update(payload).eq('id', id)
    : supabase.from('recipes').insert(payload)
  const { data, error } = await query.select().single()
  if (error) throw error
  return toRow(data)
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}
