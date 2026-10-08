import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { createProperty, deleteProperty, fetchProperties, updateProperty } from '../lib/propertiesApi'
import { useAuth } from '../contexts/AuthContext'
import PropertyForm from '../components/PropertyForm'

// 家賃を「¥185,000 / 月」の形にする
const formatRent = (rent) => `¥${rent.toLocaleString('ja-JP')} / 月`

// 物件一覧画面（ログイン必須）
export default function Properties() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  // 新規登録フォームを開いているか
  const [showCreateForm, setShowCreateForm] = useState(false)
  // 編集中の物件の id（編集していなければ null）
  const [editingId, setEditingId] = useState(null)
  // 削除処理中の物件の id
  const [deletingId, setDeletingId] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  // 画面を開いたときに物件一覧を読み込む
  useEffect(() => {
    let ignore = false

    fetchProperties()
      .then((data) => {
        if (!ignore) setProperties(data)
      })
      .catch((err) => {
        if (!ignore) setLoadError(`物件一覧の取得に失敗しました：${err.message}`)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    // 画面を離れた後に結果が届いても反映しない
    return () => {
      ignore = true
    }
  }, [])

  // 新規登録：登録した物件を一覧の先頭に追加する
  const handleCreate = async (property) => {
    const created = await createProperty(user.id, property)
    setProperties((prev) => [created, ...prev])
    setShowCreateForm(false)
  }

  // 編集：更新後の内容で一覧を置き換える
  const handleUpdate = async (id, property) => {
    const updated = await updateProperty(id, property)
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setEditingId(null)
  }

  // 削除：確認してから削除し、一覧から取り除く
  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？`)) return

    setDeletingId(property.id)
    try {
      await deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
    } catch (err) {
      window.alert(`削除に失敗しました：${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

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
        <section className="create-section">
          {showCreateForm ? (
            <div className="create-panel">
              <h2>物件を登録</h2>
              <PropertyForm
                submitLabel="登録する"
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          ) : (
            <button type="button" className="primary-button" onClick={() => setShowCreateForm(true)}>
              ＋ 物件を登録
            </button>
          )}
        </section>

        {loading && <p className="count">読み込み中...</p>}
        {loadError && <p className="message error">{loadError}</p>}

        {!loading && !loadError && (
          <>
            <p className="count">{properties.length}件の物件</p>
            {properties.length === 0 && (
              <p className="empty">まだ物件が登録されていません。「物件を登録」から追加してください。</p>
            )}

            <ul className="property-list">
              {properties.map((property) => (
                <li key={property.id} className="property-card">
                  {editingId === property.id ? (
                    // 編集中のカードはフォームに切り替える
                    <PropertyForm
                      initialValues={property}
                      submitLabel="保存する"
                      onSubmit={(values) => handleUpdate(property.id, values)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <h2 className="property-name">{property.name}</h2>
                      <p className="property-rent">{formatRent(property.rent)}</p>
                      <p className="property-area">
                        {property.area}
                        <span className="property-layout">{property.layout}</span>
                      </p>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setEditingId(property.id)}
                          disabled={deletingId === property.id}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDelete(property)}
                          disabled={deletingId === property.id}
                        >
                          {deletingId === property.id ? '削除中...' : '削除'}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}
