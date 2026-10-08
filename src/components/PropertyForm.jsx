import { useId, useState } from 'react'

// 間取りの入力候補（候補にない間取りも自由に入力できる）
const LAYOUT_OPTIONS = ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3LDK', '4LDK']

// 空の入力値
const EMPTY_VALUES = { name: '', rent: '', area: '', layout: '' }

// 物件の登録・編集で共通して使うフォーム
// initialValues があれば編集、なければ新規登録として使う
export default function PropertyForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() =>
    initialValues ? { ...initialValues, rent: String(initialValues.rent) } : EMPTY_VALUES,
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // 登録と編集のフォームが同時に開いても重ならない、間取り候補リストの id
  const layoutListId = useId()

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 前後の空白を取り除き、家賃は数値に変換する
    const property = {
      name: values.name.trim(),
      rent: Number(values.rent),
      area: values.area.trim(),
      layout: values.layout.trim(),
    }

    if (!property.name || !property.area || !property.layout) {
      setError('物件名・エリア・間取りを入力してください。')
      return
    }
    if (!Number.isInteger(property.rent) || property.rent < 0) {
      setError('家賃は0以上の整数（円）で入力してください。')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(property)
      // 新規登録のときは、続けて入力できるようにフォームを空にする
      if (!initialValues) setValues(EMPTY_VALUES)
    } catch (err) {
      setError(`保存に失敗しました：${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <label>
        物件名
        <input name="name" value={values.name} onChange={handleChange} required />
      </label>

      <label>
        家賃（円）
        <input
          name="rent"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.rent}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        エリア
        <input name="area" value={values.area} onChange={handleChange} placeholder="例：東京都渋谷区" required />
      </label>

      <label>
        間取り
        <input
          name="layout"
          value={values.layout}
          onChange={handleChange}
          list={layoutListId}
          placeholder="例：1LDK"
          required
        />
        <datalist id={layoutListId}>
          {LAYOUT_OPTIONS.map((layout) => (
            <option key={layout} value={layout} />
          ))}
        </datalist>
      </label>

      {error && <p className="message error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? '保存中...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
