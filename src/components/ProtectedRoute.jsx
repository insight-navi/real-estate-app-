import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログイン済みのときだけ中身を表示し、未ログインならログイン画面へリダイレクトする
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="loading">読み込み中...</p>
  if (!user) return <Navigate to="/login" replace />

  return children
}

// ログイン済みのときはログイン・会員登録画面を見せず、物件一覧へ移動する
export function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="loading">読み込み中...</p>
  if (user) return <Navigate to="/properties" replace />

  return children
}
