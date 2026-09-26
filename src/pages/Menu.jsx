import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function formatPrice(price) {
  return `${price.toLocaleString('fr-FR')} FCFA`
}

export default function Menu() {
  const [categories, setCategories] = useState([])
  const [productsByCategory, setProductsByCategory] = useState({})
  const [status, setStatus] = useState('loading')
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('active', true)
        .order('display_order')

      if (catError) {
        if (!cancelled) setStatus('error')
        return
      }

      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, category_id, name, description, price, is_signature')
        .eq('available', true)
        .order('display_order')

      if (prodError) {
        if (!cancelled) setStatus('error')
        return
      }

      if (cancelled) return

      const grouped = {}
      for (const p of products) {
        if (!grouped[p.category_id]) grouped[p.category_id] = []
        grouped[p.category_id].push(p)
      }

      setCategories(cats)
      setProductsByCategory(grouped)
      setActiveCategory(cats[0]?.id ?? null)
      setStatus('ready')
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="container" style={{ paddingBlock: 64, textAlign: 'center', color: 'var(--muted)' }}>
        Chargement de la carte…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container" style={{ paddingBlock: 64, textAlign: 'center', color: 'var(--danger)' }}>
        Impossible de charger la carte pour le moment.
        <br />
        Merci de réessayer dans un instant.
      </div>
    )
  }

  return (
    <div>
      <header style={{ paddingBlock: '40px 24px', textAlign: 'center' }}>
        <div className="container">
          <div
            style={{
              width: 44,
              height: 44,
              margin: '0 auto 14px',
              border: '1px solid var(--gold)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Playfair Display', serif",
              color: 'var(--gold-deep)',
            }}
          >
            É
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 7vw, 34px)' }}>L'Épicurienne</h1>
          <p style={{ margin: '6px 0 0', fontStyle: 'italic', color: 'var(--muted)' }}>
            L'art de vivre, à toute heure
          </p>
        </div>
      </header>

      <nav
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--rule)',
          overflowX: 'auto',
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', gap: 8, paddingBlock: 10, width: 'max-content', minWidth: '100%' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                flexShrink: 0,
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 13,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                background: activeCategory === cat.id ? 'var(--gold)' : 'transparent',
                color: activeCategory === cat.id ? '#201a10' : 'var(--ink)',
                border: activeCategory === cat.id ? 'none' : '1px solid var(--rule)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="container" style={{ paddingBlock: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
        {categories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} style={{ scrollMarginTop: 60 }}>
            <div className="eyebrow">Catégorie</div>
            <h2 style={{ fontSize: 22, marginTop: 4 }}>{cat.name}</h2>
            {cat.description && (
              <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 15 }}>{cat.description}</p>
            )}
            <hr className="rule" style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {(productsByCategory[cat.id] ?? []).map((product) => (
                <div key={product.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                      {product.is_signature && <span className="badge-signature">Signature</span>}
                    </div>
                    <span className="price" style={{ color: 'var(--gold-deep)' }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.description && (
                    <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.5 }}>
                      {product.description}
                    </p>
                  )}
                </div>
              ))}
              {(productsByCategory[cat.id] ?? []).length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>Aucun produit disponible pour le moment.</p>
              )}
            </div>
          </section>
        ))}
      </main>

      <footer style={{ textAlign: 'center', paddingBlock: 32, color: 'var(--muted)', fontSize: 12.5 }}>
        L'Épicurienne · Cotonou
      </footer>
    </div>
  )
}
