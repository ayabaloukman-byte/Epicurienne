import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

function emptyForm(categories) {
  return {
    name: '',
    description: '',
    price: '',
    category_id: categories[0]?.id ?? '',
    is_signature: false,
  }
}

export default function ProductsAdmin({ categories, products, onChanged }) {
  const [form, setForm] = useState(() => emptyForm(categories))
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      category_id: product.category_id,
      is_signature: product.is_signature,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm(categories))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const price = Number(form.price)
    if (!Number.isFinite(price) || price < 0) {
      setError('Le prix doit être un nombre positif.')
      setSaving(false)
      return
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price,
      category_id: form.category_id,
      is_signature: form.is_signature,
    }

    let failed = false
    if (editingId) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', editingId)
      if (updateError) {
        setError(updateError.message)
        failed = true
      }
    } else {
      const sameCategory = products.filter((p) => p.category_id === form.category_id)
      const nextOrder = sameCategory.length ? Math.max(...sameCategory.map((p) => p.display_order)) + 1 : 1
      const { error: insertError } = await supabase.from('products').insert({ ...payload, display_order: nextOrder })
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

  async function toggleAvailable(product) {
    await supabase.from('products').update({ available: !product.available }).eq('id', product.id)
    onChanged()
  }

  async function remove(product) {
    if (!window.confirm(`Supprimer "${product.name}" ?`)) return
    await supabase.from('products').delete().eq('id', product.id)
    onChanged()
  }

  const visibleProducts = products.filter((p) => filterCategory === 'all' || p.category_id === filterCategory)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>
          {editingId ? 'Modifier le produit' : 'Nouveau produit'}
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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              required
              type="number"
              min="0"
              step="50"
              placeholder="Prix (FCFA)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={{ ...inputStyle, width: 140 }}
            />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              style={{ ...inputStyle, flex: 1, minWidth: 160 }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.is_signature}
              onChange={(e) => setForm({ ...form, is_signature: e.target.checked })}
            />
            Produit Signature
          </label>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Filtrer :</span>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={inputStyle}>
          <option value="all">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleProducts.map((product) => (
          <div key={product.id} style={{ ...cardStyle, opacity: product.available ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{product.name}</strong>
                  {product.is_signature && <span className="badge-signature">Signature</span>}
                  {!product.available && (
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>indisponible</span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--muted)' }}>
                  {categoryById[product.category_id]}
                </p>
                {product.description && (
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>{product.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span className="price" style={{ color: 'var(--gold-deep)', fontWeight: 600 }}>
                  {product.price.toLocaleString('fr-FR')} FCFA
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(product)} style={iconButtonStyle} title="Modifier">
                    ✎
                  </button>
                  <button
                    onClick={() => toggleAvailable(product)}
                    style={iconButtonStyle}
                    title={product.available ? 'Marquer indisponible' : 'Réactiver'}
                  >
                    {product.available ? '⏸' : '▶'}
                  </button>
                  <button onClick={() => remove(product)} style={{ ...iconButtonStyle, color: 'var(--danger)' }} title="Supprimer">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {visibleProducts.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Aucun produit dans cette catégorie.</p>
        )}
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
