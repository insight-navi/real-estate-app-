import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// パスワードの最低文字数（Supabase の「Minimum password length」と合わせる）
const MIN_PASSWORD_LENGTH = 8

// 会員登録画面
export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。`)
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // 確認メールのリンクを開いたら、今開いているアプリ（ローカル or 公開先）の物件一覧に戻す
      options: { emailRedirectTo: `${window.location.origin}/properties` },
    })
    setSubmitting(false)

    if (error) {
      setError(`会員登録に失敗しました：${error.message}`)
      return
    }

    // メール確認が無効な設定ならその場でログイン状態になるので、物件一覧へ
    if (data.session) {
      navigate('/properties', { replace: true })
      return
    }

    // メール確認が有効な設定では、確認メールのリンクを押すまでログインできない
    setInfo('確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。')
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>会員登録</h1>

        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          パスワード（{MIN_PASSWORD_LENGTH}文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="message error">{error}</p>}
        {info && <p className="message info">{info}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? '登録中...' : '登録する'}
        </button>

        <p className="switch-link">
          すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </form>
    </div>
  )
}
