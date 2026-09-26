import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function formatPrice(price) {
  return `${price.toLocaleString('fr-FR')} FCFA`
}

// Citations éditoriales, une par catégorie (dans l'ordre de la carte source).
// Contenu éditorial fixe, non issu de la base de données.
const CATEGORY_QUOTES = [
  { text: 'Noir comme le diable, chaud comme l’enfer, pur comme un ange, doux comme l’amour.', author: 'Talleyrand' },
  { text: 'Ce n’est pas ce que nous avons, mais ce dont nous jouissons, qui fait notre abondance.', author: 'Épicure' },
  { text: 'La découverte d’un mets nouveau fait plus pour le bonheur du genre humain que la découverte d’une étoile.', author: 'Brillat-Savarin' },
  { text: 'Convier quelqu’un, c’est se charger de son bonheur tant qu’il est sous notre toit.', author: 'Brillat-Savarin' },
  { text: 'Dis-moi ce que tu manges, je te dirai ce que tu es.', author: 'Brillat-Savarin' },
  { text: 'Un dessert sans fromage est une belle à qui il manque un œil.', author: 'Brillat-Savarin' },
  { text: 'La cuisine, c’est quand les choses ont le goût de ce qu’elles sont.', author: 'Curnonsky' },
]

function DottedRow({ left, right, leftStyle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={leftStyle}>{left}</span>
      <span style={{ flex: 1, borderBottom: '1px dotted var(--rule)', transform: 'translateY(-4px)' }} />
      <span className="price" style={{ color: 'var(--gold-deep)', fontSize: 13.5, flexShrink: 0 }}>
        {right}
      </span>
    </div>
  )
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

  function scrollToCategory(id) {
    setActiveCategory(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* Couverture */}
      <header style={{ paddingBlock: '48px 40px', textAlign: 'center', borderBottom: '1px solid var(--rule)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 28,
            }}
          >
            <span>Cotonou</span>
            <span>Édition 2026</span>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 8vw, 42px)', letterSpacing: '0.02em', color: 'var(--gold-deep)' }}>
            L'Épicurienne
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, letterSpacing: '0.3em', color: 'var(--muted)' }}>CAFÉ</p>
          <p style={{ margin: '18px 0 0', fontStyle: 'italic', color: 'var(--ink)' }}>
            L'art de vivre, à toute heure
          </p>

          <p
            style={{
              margin: '22px 0 0',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
            }}
          >
            Cafés Signature · La Table Dressée · Brunchs &amp; Douceurs
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 30 }}>
            <span style={{ width: 28, height: 1, background: 'var(--rule)' }} />
            <span style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>La Carte</span>
            <span style={{ width: 28, height: 1, background: 'var(--rule)' }} />
          </div>
        </div>
      </header>

      {/* Édito */}
      <section className="container" style={{ paddingBlock: 36, borderBottom: '1px solid var(--rule)' }}>
        <div className="eyebrow">L'Édito</div>
        <h2 style={{ fontSize: 24, marginTop: 6 }}>Une parenthèse choisie</h2>
        <p style={{ marginTop: 16, lineHeight: 1.7, fontSize: 15 }}>
          L'Épicurienne n'est pas tout à fait un café. C'est une parenthèse.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.7, fontSize: 15 }}>
          Un lieu où l'on s'assoit pour le plaisir de s'asseoir, où le café se déguste comme un rituel et la
          table se raconte. Ici, l'art de vivre n'est pas un décor. C'est une manière d'être.
        </p>
        <p style={{ marginTop: 14, fontStyle: 'italic', color: 'var(--muted)' }}>
          Bienvenue chez vous. — L'Épicurienne
        </p>

        <div style={{ marginTop: 28 }}>
          <div className="eyebrow">Sommaire</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
                <DottedRow
                  left={cat.name}
                  right={String(i + 3).padStart(2, '0')}
                  leftStyle={{ fontSize: 14.5 }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation rapide (usage mobile) */}
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
              onClick={() => scrollToCategory(cat.id)}
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

      <main className="container" style={{ paddingBlock: 32, display: 'flex', flexDirection: 'column', gap: 48 }}>
        {categories.map((cat, i) => {
          const quote = CATEGORY_QUOTES[i]
          return (
            <section key={cat.id} id={`cat-${cat.id}`} style={{ scrollMarginTop: 60 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--muted)' }}>
                  {String(i + 3).padStart(2, '0')}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    marginTop: 6,
                  }}
                >
                  <span style={{ color: 'var(--gold)' }}>•</span>
                  <h2
                    style={{
                      fontSize: 20,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-deep)',
                    }}
                  >
                    {cat.name}
                  </h2>
                  <span style={{ color: 'var(--gold)' }}>•</span>
                </div>
                {cat.description && (
                  <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>{cat.description}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 26 }}>
                {(productsByCategory[cat.id] ?? []).map((product) => (
                  <div key={product.id}>
                    <DottedRow
                      left={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontWeight: 600 }}>{product.name}</strong>
                          {product.is_signature && <span className="badge-signature">Signature</span>}
                        </span>
                      }
                      right={formatPrice(product.price)}
                    />
                    {product.description && (
                      <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14, fontStyle: 'italic' }}>
                        {product.description}
                      </p>
                    )}
                  </div>
                ))}
                {(productsByCategory[cat.id] ?? []).length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>Aucun produit disponible pour le moment.</p>
                )}
              </div>

              {quote && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: 14, maxWidth: '42ch', margin: '0 auto' }}>
                    « {quote.text} »
                  </p>
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-deep)',
                    }}
                  >
                    {quote.author}
                  </p>
                </div>
              )}
            </section>
          )
        })}
      </main>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBlock: 20,
          color: 'var(--muted)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          borderTop: '1px solid var(--rule)',
        }}
        className="container"
      >
        <span>L'Épicurienne</span>
        <span>Cotonou</span>
      </footer>
    </div>
  )
}
