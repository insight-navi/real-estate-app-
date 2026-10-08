import { supabase } from './supabaseClient'

// 画面で使う列だけを取得する
const COLUMNS = 'id, name, rent, area, layout, created_at'

// 物件一覧を新しい順に取得する（RLS により自分の物件だけが返る）
export async function fetchProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 物件を新規登録し、登録した行を返す
export async function createProperty(userId, property) {
  const { data, error } = await supabase
    .from('properties')
    .insert({ ...property, user_id: userId })
    .select(COLUMNS)
    .single()

  if (error) throw error
  return data
}

// 物件を更新し、更新後の行を返す
export async function updateProperty(id, property) {
  const { data, error } = await supabase
    .from('properties')
    .update(property)
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) throw error
  return data
}

// 物件を削除する
export async function deleteProperty(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id)

  if (error) throw error
}
