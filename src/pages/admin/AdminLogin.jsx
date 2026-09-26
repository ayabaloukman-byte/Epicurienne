import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

export default function AdminLogin() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError('Identifiants incorrects.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="container" style={{ maxWidth: 380, paddingBlock: 80 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="eyebrow">L'Épicurienne</div>
        <h1 style={{ fontSize: 26, marginTop: 6 }}>Espace administrateur</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          Mot de passe
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  fontSize: 15,
  fontFamily: 'inherit',
  background: 'var(--surface)',
  color: 'var(--ink)',
}

const buttonStyle = {
  marginTop: 8,
  padding: '12px 20px',
  border: 'none',
  borderRadius: 4,
  background: 'var(--gold)',
  color: '#201a10',
  fontSize: 15,
  fontFamily: "'Cormorant', serif",
  cursor: 'pointer',
}
