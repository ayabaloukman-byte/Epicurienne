import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const emptyForm = { name: '', description: '' }

export default function CategoriesAdmin({ categories, onChanged }) {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startEdit(cat) {
    setEditingId(cat.id)
    setForm({ name: cat.name, description: cat.description ?? '' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    let failed = false

    if (editingId) {
      const { error: updateError } = await supabase
        .from('categories')
        .update({ name: form.name, description: form.description || null })
        .eq('id', editingId)
      if (updateError) {
        setError(updateError.message)
        failed = true
      }
    } else {
      const nextOrder = categories.length ? Math.max(...categories.map((c) => c.display_order)) + 1 : 1
      const { error: insertError } = await supabase
        .from('categories')
        .insert({ name: form.name, description: form.description || null, display_order: nextOrder })
      if (insertError) {
        setError(insertError.message)
        failed = true
      }
    }

    setSaving(false)
    if (!failed) {
      cancelEdit()
      onChanged()
    }
  }

  async function toggleActive(cat) {
    await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id)
    onChanged()
  }

  async function move(cat, direction) {
    const sorted = [...categories].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((c) => c.id === cat.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]

    await Promise.all([
      supabase.from('categories').update({ display_order: other.display_order }).eq('id', cat.id),
      supabase.from('categories').update({ display_order: cat.display_order }).eq('id', other.id),
    ])
    onChanged()
  }

  async function remove(cat) {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" et tous ses produits ?`)) return
    await supabase.from('categories').delete().eq('id', cat.id)
    onChanged()
  }

  const sorted = [...categories].sort((a, b) => a.display_order - b.display_order)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>
          {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            required
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
          <textarea
            placeholder="Description (optionnelle)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={buttonStyle}>
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={ghostButtonStyle}>
                Annuler
              </button>
            )}
          </div>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((cat, i) => (
          <div key={cat.id} style={{ ...cardStyle, opacity: cat.active ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <strong>{cat.name}</strong>
                {!cat.active && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)' }}>masquée</span>}
                {cat.description && (
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>{cat.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => move(cat, -1)} disabled={i === 0} style={iconButtonStyle} title="Monter">
                  ↑
                </button>
                <button
                  onClick={() => move(cat, 1)}
                  disabled={i === sorted.length - 1}
                  style={iconButtonStyle}
                  title="Descendre"
                >
                  ↓
                </button>
                <button onClick={() => startEdit(cat)} style={iconButtonStyle} title="Modifier">
                  ✎
                </button>
                <button onClick={() => toggleActive(cat)} style={iconButtonStyle} title={cat.active ? 'Masquer' : 'Réactiver'}>
                  {cat.active ? '⏸' : '▶'}
                </button>
                <button onClick={() => remove(cat)} style={{ ...iconButtonStyle, color: 'var(--danger)' }} title="Supprimer">
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--rule)',
  borderRadius: 6,
  padding: 16,
}

const inputStyle = {
  padding: '9px 11px',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--bg)',
  color: 'var(--ink)',
}

const buttonStyle = {
  padding: '9px 16px',
  border: 'none',
  borderRadius: 4,
  background: 'var(--gold)',
  color: '#201a10',
  fontSize: 14,
  cursor: 'pointer',
}

const ghostButtonStyle = {
  padding: '9px 16px',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  background: 'transparent',
  color: 'var(--ink)',
  fontSize: 14,
  cursor: 'pointer',
}

const iconButtonStyle = {
  width: 30,
  height: 30,
  border: '1px solid var(--rule)',
  borderRadius: 4,
  background: 'var(--bg)',
  cursor: 'pointer',
  fontSize: 13,
}
