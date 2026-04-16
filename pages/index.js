import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const WHATSAPP = '221777042635'

function ImageViewer({ src, alt, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, fontSize: '1.1rem', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>✕</button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', animation: 'zoomIn 0.25s ease' }} />
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

function ProductModal({ product, onClose, onImageClick, dark }) {
  if (!product) return null
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])
  const msg = encodeURIComponent(`Bonjour SSI,\nJe suis intéressé par :\n*${product.name}*${product.storage ? '\nCapacité : ' + product.storage : ''}${product.color ? '\nCouleur : ' + product.color : ''}\nPrix : *${product.price.toLocaleString('fr-FR')} FCFA*\n\nEst-il disponible ?`)
  const bg = dark ? '#1e2130' : '#fff'
  const text = dark ? '#f1f5f9' : '#111'
  const text2 = dark ? '#94a3b8' : '#64748b'
  const border = dark ? '#2d3148' : '#e2e8f0'
  const tag = dark ? '#2d3148' : '#f1f5f9'
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, width: '100%', maxWidth: 520, borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflowY: 'auto', position: 'relative', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#1a56db,#16a34a)' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: dark ? '#fff' : '#333', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: '0.9rem', cursor: 'pointer' }}>✕</button>
        <div onClick={() => product.image_url && onImageClick(product.image_url, product.name)} style={{ height: 300, overflow: 'hidden', background: dark ? '#0f1117' : '#f0f4f8', cursor: product.image_url ? 'zoom-in' : 'default' }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.04)'} onMouseLeave={e => e.target.style.transform = ''} />
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.15 }}>💻</div>}
          {product.image_url && <div style={{ position: 'absolute', bottom: 310 - 40, right: 12, background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}></div>}
        </div>
        <div style={{ padding: '24px 24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: text, lineHeight: 1.25, flex: 1, paddingRight: 16 }}>{product.name}</h2>
            <span style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>✅ Disponible</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
            {[product.brand, product.storage, product.color].filter(Boolean).map(t => (
              <span key={t} style={{ background: tag, border: `1px solid ${border}`, color: text2, fontSize: '0.8rem', fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>
          {product.description && <p style={{ fontSize: '0.9rem', color: text2, lineHeight: 1.75, marginBottom: 20, borderLeft: `3px solid ${border}`, paddingLeft: 14 }}>{product.description}</p>}
          <div style={{ background: dark ? 'linear-gradient(135deg,rgba(26,86,219,0.15),rgba(22,163,74,0.1))' : 'linear-gradient(135deg,#eff6ff,#f0fdf4)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Prix</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#1a56db', letterSpacing: '-0.02em' }}>{product.price.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: 600 }}>FCFA</span></div>
            </div>
            <div style={{ fontSize: '2.5rem', opacity: 0.15 }}>💰</div>
          </div>
          <a href={`https://wa.me/${product.whatsapp_number || WHATSAPP}?text=${msg}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', borderRadius: 14, padding: '15px 20px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}>
            <span style={{ fontSize: '1.2rem' }}>💬</span> Contacter sur WhatsApp
          </a>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}

function ProductCard({ product, onClick, onImageClick, index, dark }) {
  const border = dark ? '#2d3148' : '#e8eef4'
  const bg = dark ? '#1a1d27' : '#fff'
  const text = dark ? '#f1f5f9' : '#111'
  const tag = dark ? '#2d3148' : '#f1f5f9'
  const tag2 = dark ? '#94a3b8' : '#64748b'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.22s,box-shadow 0.22s', animation: `fadeUp 0.4s ease ${index * 0.05}s both`, cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = dark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(26,86,219,0.14)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}
      onClick={() => onClick(product)}>
      <div style={{ position: 'relative', height: 200, background: dark ? '#0f1117' : 'linear-gradient(135deg,#f8fafc,#f1f5f9)', overflow: 'hidden', flexShrink: 0 }}
        onClick={e => { if (product.image_url) { e.stopPropagation(); onImageClick(product.image_url, product.name) } }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', display: 'block' }} onMouseEnter={e => e.target.style.transform = 'scale(1.07)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.2 }}>💻</span>
              <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 500 }}>Pas d'image</span>
            </div>}
        <span style={{ position: 'absolute', top: 10, left: 10, background: product.status === 'rupture' ? '#dc2626' : '#16a34a', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.06em', boxShadow: product.status === 'rupture' ? '0 2px 6px rgba(220,38,38,0.4)' : '0 2px 6px rgba(22,163,74,0.4)' }}>{product.status === 'rupture' ? 'RUPTURE' : 'DISPO'}</span>
      </div>
      <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: text, lineHeight: 1.35, margin: 0 }}>{product.name}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {product.brand && <span style={{ fontSize: '0.68rem', color: tag2, background: tag, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{product.brand}</span>}
          {product.storage && <span style={{ fontSize: '0.68rem', color: tag2, background: tag, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{product.storage}</span>}
          {product.color && <span style={{ fontSize: '0.68rem', color: tag2, background: tag, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{product.color}</span>}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1a56db', letterSpacing: '-0.01em', marginBottom: 10 }}>
            {product.price.toLocaleString('fr-FR')} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: tag2 }}>FCFA</span>
          </div>
          <button onClick={e => { e.stopPropagation(); if (product.status === 'rupture') return; const msg = encodeURIComponent(`Bonjour SSI,\nJe suis intéressé par *${product.name}*${product.storage ? ' - ' + product.storage : ''} à *${product.price.toLocaleString('fr-FR')} FCFA*.\n\nEst-il disponible ?`); window.open(`https://wa.me/${product.whatsapp_number || WHATSAPP}?text=${msg}`, '_blank') }}
            style={{ width: '100%', background: product.status === 'rupture' ? '#e2e8f0' : 'linear-gradient(135deg,#16a34a,#15803d)', color: product.status === 'rupture' ? '#94a3b8' : '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: product.status === 'rupture' ? 'not-allowed' : 'pointer', boxShadow: product.status === 'rupture' ? 'none' : '0 2px 8px rgba(22,163,74,0.3)', transition: 'transform 0.15s' }}>
            {product.status === 'rupture' ? '🔴 Rupture de stock' : <><span>💬</span> Contacter sur WhatsApp</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Catalogue() {
  const [categories, setCategories] = useState([])
  const [produits, setProduits] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showHero, setShowHero] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    try { const d = localStorage.getItem('ssi_dark_client'); if (d !== null) setDark(JSON.parse(d)) } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('ssi_dark_client', JSON.stringify(dark)) } catch {}
  }, [dark])

  const load = async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('ordre'),
      supabase.from('produits').select('*').in('status', ['publie', 'rupture']).order('created_at', { ascending: false })
    ])
    setCategories(cats || [])
    setProduits(prods || [])
    if (cats && cats.length > 0) setActiveCategory(cats[0].id)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase.channel('realtime-produits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produits' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = useMemo(() => {
    let list = activeCategory && !showHero ? produits.filter(p => p.category_id === activeCategory) : produits
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.storage?.toLowerCase().includes(q))
    }
    return list
  }, [produits, activeCategory, search, showHero])

  const catCount = id => produits.filter(p => p.category_id === id).length

  // Dark mode colors
  const D = {
    bg: dark ? '#0f1117' : '#f8fafc',
    surface: dark ? '#1a1d27' : '#fff',
    surface2: dark ? '#1e2130' : '#fafbfc',
    border: dark ? '#2d3148' : '#e8eef4',
    border2: dark ? '#3d4160' : '#f1f5f9',
    text: dark ? '#f1f5f9' : '#111',
    text2: dark ? '#94a3b8' : '#64748b',
    text3: dark ? '#64748b' : '#94a3b8',
    tabBg: dark ? '#2d3148' : '#f1f5f9',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: D.bg }}>
      <div style={{ textAlign: 'center', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ width: 56, height: 56, border: `3px solid ${D.border}`, borderTop: '3px solid #1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: D.text3, fontSize: '0.9rem' }}>Chargement du catalogue...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const sidebar = (
    <aside style={{ width: 230, minWidth: 230, background: D.surface, borderRight: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', transition: 'background 0.25s,border-color 0.25s' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${D.border2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${D.border}`, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src="/logo.png" alt="SSI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: D.text, letterSpacing: '-0.01em' }}>S.S.I</div>
            <div style={{ fontSize: '0.62rem', color: D.text3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>INFORMATIQUE</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: D.text3, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 6px' }}>Navigation</div>
        <button onClick={() => { setShowHero(true); setActiveCategory(categories[0]?.id); setSidebarOpen(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: showHero ? (dark ? 'rgba(26,86,219,0.2)' : 'linear-gradient(135deg,#eff6ff,#e0f2fe)') : 'none', border: showHero ? '1px solid #bfdbfe' : '1px solid transparent', color: showHero ? '#3b82f6' : D.text2, fontSize: '0.875rem', fontWeight: showHero ? 700 : 500, cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 2, transition: 'all 0.15s' }}>
          <span style={{ fontSize: '1.1rem' }}>🏪</span> Boutique
        </button>

        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: D.text3, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 8px 6px', marginTop: 4 }}>Catégories</div>
        {categories.filter(c => catCount(c.id) > 0).map(cat => {
          const isActive = activeCategory === cat.id && !showHero
          return (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowHero(false); setSidebarOpen(false); setSearch('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: isActive ? (dark ? 'rgba(26,86,219,0.2)' : 'linear-gradient(135deg,#eff6ff,#e0f2fe)') : 'none', border: isActive ? '1px solid #bfdbfe' : '1px solid transparent', color: isActive ? '#3b82f6' : D.text2, fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 2, transition: 'all 0.15s' }}>
              <span style={{ fontSize: '1rem', width: 22, textAlign: 'center' }}>{cat.icon}</span>
              <span style={{ flex: 1 }}>{cat.label}</span>
              <span style={{ background: isActive ? '#1d4ed8' : D.tabBg, color: isActive ? '#fff' : D.text3, borderRadius: 20, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{catCount(cat.id)}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: `1px solid ${D.border2}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Dark mode toggle */}
        <button onClick={() => setDark(d => !d)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: dark ? 'rgba(251,191,36,0.1)' : 'rgba(0,0,0,0.04)', border: `1px solid ${D.border}`, color: dark ? '#fbbf24' : D.text2, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
          <span style={{ fontSize: '1.1rem' }}>{dark ? '☀️' : '🌙'}</span>
          {dark ? 'Mode clair' : 'Mode sombre'}
          <span style={{ marginLeft: 'auto', width: 36, height: 20, background: dark ? '#fbbf24' : D.border, borderRadius: 20, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: dark ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
          </span>
        </button>
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: dark ? 'rgba(22,163,74,0.15)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}>
          <span>💬</span> WhatsApp
        </a>
        <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: D.text3, lineHeight: 1.6, background: dark ? 'rgba(255,255,255,0.03)' : '#fafafa', borderRadius: 10, border: `1px solid ${D.border2}` }}>
          📍 Keur Massar, rond-point<br />☎️ +221 777042635
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <Head>
        <title>S.S.I — Seye Senghor Informatique</title>
        <meta name="description" content="Vente ordinateur et accessoires Informatique — Keur Massar, Dakar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: D.bg, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", transition: 'background 0.25s' }}>
        <div className="sidebar-wrap">{sidebar}</div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: D.surface, transition: 'background 0.25s' }}>
          {/* Mobile topbar */}
          <div className="mobile-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: D.surface, borderBottom: `1px solid ${D.border}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: D.text, cursor: 'pointer', padding: 4 }}>☰</button>
              <img src="/logo.png" alt="SSI" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${D.border}` }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: D.text }}>SEYE SENGHOR INFORMATIQUE</div>
                <div style={{ fontSize: '0.62rem', color: D.text3 }}>💻 Keur Massar · Dakar</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setDark(d => !d)} style={{ background: dark ? 'rgba(251,191,36,0.15)' : D.border2, border: 'none', borderRadius: 8, padding: '7px 10px', fontSize: '1rem', cursor: 'pointer' }}>
                {dark ? '☀️' : '🌙'}
              </button>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Desktop header */}
          <div className="desktop-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${D.border}`, background: D.surface }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${D.border}`, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="/logo.png" alt="SSI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: D.text, letterSpacing: '-0.01em' }}>SEYE SENGHOR INFORMATIQUE</div>
                <div style={{ fontSize: '0.78rem', color: D.text2 }}>💻 Vente ordinateur et accessoires Informatique</div>
              </div>
            </div>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', borderRadius: 12, padding: '11px 22px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
              <span>💬</span> WhatsApp
            </a>
          </div>

          {/* Search */}
          <div style={{ padding: '14px 28px', borderBottom: `1px solid ${D.border}`, background: D.surface2 }}>
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none', color: D.text3 }}>🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setShowHero(false) }}
                placeholder="Rechercher un produit, une marque..."
                style={{ width: '100%', border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '11px 14px 11px 40px', fontSize: '0.9rem', background: D.surface, outline: 'none', color: D.text, fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#1a56db'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.1)' }}
                onBlur={e => { e.target.style.borderColor = D.border; e.target.style.boxShadow = '' }} />
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', padding: '0 28px', borderBottom: `2px solid ${D.border2}`, background: D.surface, gap: 0 }}>
            {categories.filter(c => catCount(c.id) > 0).map(cat => {
              const isActive = activeCategory === cat.id && !showHero
              return (
                <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowHero(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', background: 'none', border: 'none', borderBottom: `2.5px solid ${isActive ? '#1a56db' : 'transparent'}`, marginBottom: -2, color: isActive ? '#3b82f6' : D.text2, fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                  <span>{cat.icon}</span> {cat.label}
                  <span style={{ background: isActive ? '#1a56db' : D.tabBg, color: isActive ? '#fff' : D.text3, borderRadius: 20, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>{catCount(cat.id)}</span>
                </button>
              )
            })}
          </div>

          {/* Hero */}
          {showHero && (
            <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f2d1a 100%)', margin: '20px 28px', borderRadius: 20, padding: '36px 36px 32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(26,86,219,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#93c5fd', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>BIENVENUE CHEZ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
                    <img src="/logo.png" alt="SSI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>SEYE SENGHOR<br />INFORMATIQUE</h1>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: 14 }}>
                  Votre magasin de matériel informatique à Keur Massar :<br />
                  <strong style={{ color: '#fff' }}>💻 Ordinateurs · Smartphones · Accessoires</strong>
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {['Large choix d\'ordinateurs et accessoires', 'Produits testés, garantis et prêts à l\'utilisation', 'Livraison et installation disponibles', 'Meilleurs prix du marché à Dakar'].map(t => (
                    <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>✔</span> {t}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📍 Keur Massar au rond-point, Dakar</span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>☎️ +221 777042635</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, padding: '6px 14px', borderRadius: 20, marginBottom: 24 }}>
                  🔥 Nouveaux arrivages chaque semaine
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => setShowHero(false)} style={{ flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1.6, textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                    🗂 Catalogue<br /><small style={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>Parcourez votre modèle</small>
                  </button>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 160, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1.6, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}>
                    💬 WhatsApp<br /><small style={{ fontWeight: 400, color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>Commandez directement</small>
                  </a>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '10px 28px', fontSize: '0.82rem', color: D.text2, fontWeight: 600 }}>
            {filtered.length} article{filtered.length > 1 ? 's' : ''}
            {search && <span style={{ color: D.text3, fontWeight: 400 }}> pour « {search} »</span>}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: D.text3 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.4 }}>📦</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Aucun produit disponible</p>
              <p style={{ fontSize: '0.85rem' }}>Revenez bientôt pour de nouveaux arrivages</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 18, padding: '4px 28px 48px' }}>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} dark={dark}
                  onClick={setSelected}
                  onImageClick={(src, alt) => setZoomedImage({ src, alt })} />
              ))}
            </div>
          )}

          <footer style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', color: '#fff', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/logo.png" alt="SSI" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>SEYE SENGHOR INFORMATIQUE</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📍 Keur Massar au rond-point · ☎️ +221 777042635</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ background: '#16a34a', color: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>💬 WhatsApp</a>
                <a href="/login" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>🔐 Admin</a>
              </div>
            </div>
          </footer>
        </div>

        {sidebarOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setSidebarOpen(false)}>
            <div style={{ width: 260 }} onClick={e => e.stopPropagation()}>{sidebar}</div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
          </div>
        )}
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onImageClick={(src, alt) => setZoomedImage({ src, alt })} dark={dark} />}
      {zoomedImage && <ImageViewer src={zoomedImage.src} alt={zoomedImage.alt} onClose={() => setZoomedImage(null)} />}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans',system-ui,sans-serif; transition: background 0.25s; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${D.border}; border-radius: 3px; }
        input::placeholder { color: ${D.text3}; }
        .sidebar-wrap { display: none; }
        .mobile-topbar { display: flex !important; }
        .desktop-header { display: none !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (min-width: 769px) {
          .sidebar-wrap { display: block; }
          .mobile-topbar { display: none !important; }
          .desktop-header { display: flex !important; }
        }
      `}</style>
    </>
  )
}
