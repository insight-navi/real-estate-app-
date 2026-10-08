import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { AuthProvider } from './contexts/AuthContext'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Properties from './pages/Properties'
import './App.css'

// 画面の切り替え（ルーティング）
export default function App() {
  // 接続情報が未設定のときは、真っ白にせず原因を表示する
  if (!isSupabaseConfigured) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <h1>設定エラー</h1>
          <p className="message error">
            Supabase の接続情報が未設定です。環境変数 VITE_SUPABASE_URL と VITE_SUPABASE_PUBLISHABLE_KEY
            を設定してください（ローカルは .env、Vercel はダッシュボードで設定後に再デプロイ）。
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
          {/* それ以外のURLは物件一覧へ（未ログインならさらにログイン画面へ） */}
          <Route path="*" element={<Navigate to="/properties" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
