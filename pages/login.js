import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/admin')
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false) }
    else router.push('/admin')
  }

  return (
    <>
      <Head><title>Connexion Admin — S.S.I</title></Head>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e2a4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.png" alt="SSI" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb', marginBottom: 16 }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>SEYE SENGHOR INFORMATIQUE</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>Espace Administration</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@ssi.sn"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: '0.9rem', outline: 'none', background: '#f9fafb' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: '0.9rem', outline: 'none', background: '#f9fafb' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', color: '#dc2626' }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: loading ? '#94a3b8' : '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a href="/" style={{ color: '#1a56db', fontSize: '0.85rem', textDecoration: 'none' }}>← Retour à la boutique</a>
          </div>
        </div>
      </div>
    </>
  )
}
