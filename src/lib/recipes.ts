import { supabase } from './supabase'
import { normalizeRecipe, type Recipe } from './schema'

export type RecipeRow = {
  id: string
  user_id: string
  title: string
  data: Recipe
  is_public: boolean
  created_at: string
  updated_at: string
}

function toRow(raw: Record<string, unknown>): RecipeRow {
  return { ...(raw as RecipeRow), data: normalizeRecipe(raw.data) }
}

/** Recipes owned by this user, public or private. */
export async function listMyRecipes(userId: string): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(toRow)
}

/** Every public recipe, from any user. Works without signing in. */
export async function listPublicRecipes(): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(toRow)
}

export async function getRecipe(id: string): Promise<RecipeRow> {
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Recipe not found, or it is private.')
  return toRow(data)
}

export async function saveRecipe(recipe: Recipe, isPublic: boolean, id?: string): Promise<RecipeRow> {
  const payload = { title: recipe.title, data: recipe, is_public: isPublic }
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
