import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import CategoriesAdmin from './CategoriesAdmin'
import ProductsAdmin from './ProductsAdmin'

export default function AdminDashboard() {
  const { signOut, session } = useAuth()
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('products').select('*').order('display_order'),
    ])
    setCategories(cats ?? [])
    setProducts(prods ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="container" style={{ paddingBlock: 32, maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div className="eyebrow">L'Épicurienne</div>
          <h1 style={{ fontSize: 24, marginTop: 4 }}>Espace administrateur</h1>
        </div>
        <button onClick={signOut} style={ghostButtonStyle}>
          Déconnexion
        </button>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0 }}>{session?.user?.email}</p>

      <div style={{ display: 'flex', gap: 8, marginBlock: 20 }}>
        <button onClick={() => setTab('products')} style={tab === 'products' ? tabActiveStyle : tabStyle}>
          Produits
        </button>
        <button onClick={() => setTab('categories')} style={tab === 'categories' ? tabActiveStyle : tabStyle}>
          Catégories
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Chargement…</p>
      ) : tab === 'products' ? (
        <ProductsAdmin categories={categories} products={products} onChanged={load} />
      ) : (
        <CategoriesAdmin categories={categories} onChanged={load} />
      )}
    </div>
  )
}

const tabStyle = {
  padding: '8px 18px',
  border: '1px solid var(--rule)',
  borderRadius: 999,
  background: 'transparent',
  color: 'var(--ink)',
  fontSize: 14,
  cursor: 'pointer',
}

const tabActiveStyle = {
  ...tabStyle,
  background: 'var(--gold)',
  color: '#201a10',
  border: 'none',
}

const ghostButtonStyle = {
  padding: '8px 14px',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  background: 'transparent',
  color: 'var(--ink)',
  fontSize: 13,
  cursor: 'pointer',
  alignSelf: 'flex-start',
}
