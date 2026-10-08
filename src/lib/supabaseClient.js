import { createClient } from '@supabase/supabase-js'

// .env（Vercel などではダッシュボードの環境変数）から Supabase の接続情報を読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// 接続情報がそろっているか（そろっていなければ画面に設定エラーを表示する）
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// アプリ全体で共有する Supabase クライアント（未設定のときは null）
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null
