import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { properties } from '../data/properties'

// 家賃を「¥185,000 / 月」の形にする
const formatRent = (rent) => `¥${rent.toLocaleString('ja-JP')} / 月`

// 物件一覧画面（ログイン必須）
export default function Properties() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="properties-page">
      <header className="header">
        <h1>物件一覧</h1>
        <div className="header-user">
          <span className="user-email">{user?.email}</span>
          <button type="button" className="logout-button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </div>
      </header>

      <main>
        <p className="count">{properties.length}件の物件</p>
        <ul className="property-list">
          {properties.map((property) => (
            <li key={property.id} className="property-card">
              <h2 className="property-name">{property.name}</h2>
              <p className="property-rent">{formatRent(property.rent)}</p>
              <p className="property-area">{property.area}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
