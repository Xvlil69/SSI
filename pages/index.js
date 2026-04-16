import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const WHATSAPP = '221777042635'

function ImageViewer({ src, alt, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>✕</button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', animation: 'zoomIn 0.25s ease' }} />
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

function ProductModal({ product, onClose, onImageClick }) {
  if (!product) return null
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])
  const msg = encodeURIComponent(`Bonjour Seye Senghor Informatique\nJe suis intéressé par :\n*${product.name}*${product.storage ? '\n📦 ' + product.storage : ''}${product.color ? '\n🎨 ' + product.color : ''}\n💰 *${product.price.toLocaleString('fr-FR')} FCFA*\n\nEst-il disponible ?`)
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', maxWidth: 520, borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflowY: 'auto', position: 'relative', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#1a56db,#16a34a)' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(0,0,0,0.08)', color: '#333', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        {/* Clickable image */}
        <div onClick={() => product.image_url && onImageClick(product.image_url, product.name)}
          style={{ height: 300, overflow: 'hidden', background: '#f0f4f8', position: 'relative', cursor: product.image_url ? 'zoom-in' : 'default' }}>
          {product.image_url
            ? <>
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: '0.72rem', fontWeight: 600, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  🔍 Agrandir
                </div>
              </>
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: '4rem', opacity: 0.15 }}>💻</span>
                <span style={{ fontSize: '0.78rem', color: '#aaa' }}>Pas d'image</span>
              </div>}
        </div>

        <div style={{ padding: '24px 24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', lineHeight: 1.25, flex: 1, paddingRight: 16 }}>{product.name}</h2>
            <span style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>✅ Disponible</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
            {[product.brand, product.storage, product.color].filter(Boolean).map(t => (
              <span key={t} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>

          {product.description && (
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.75, marginBottom: 20, borderLeft: '3px solid #e2e8f0', paddingLeft: 14 }}>{product.description}</p>
          )}

          <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Prix</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#1a56db', letterSpacing: '-0.02em' }}>{product.price.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: 600 }}>FCFA</span></div>
            </div>
            <div style={{ fontSize: '2.5rem', opacity: 0.15 }}>💰</div>
          </div>

          <a href={`https://wa.me/${product.whatsapp_number || WHATSAPP}?text=${msg}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', borderRadius: 14, padding: '15px 20px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(22,163,74,0.35)', transition: 'transform 0.15s,box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(22,163,74,0.35)' }}>
            <span style={{ fontSize: '1.2rem' }}>💬</span> Contacter sur WhatsApp
          </a>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}

function ProductCard({ product, onClick, onImageClick, index }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8eef4', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.22s', animation: `fadeUp 0.4s ease ${index * 0.05}s both`, cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,86,219,0.14)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
      onClick={() => onClick(product)}>

      {/* Image — clickable to zoom */}
      <div style={{ position: 'relative', height: 200, background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', overflow: 'hidden', flexShrink: 0 }}
        onClick={e => { if (product.image_url) { e.stopPropagation(); onImageClick(product.image_url, product.name) } }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
          : null}
        <div style={{ width: '100%', height: '100%', display: product.image_url ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: '2.5rem', opacity: 0.2 }}>💻</span>
          <span style={{ fontSize: '0.72rem', color: '#ccc', fontWeight: 500 }}>Pas d'image</span>
        </div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.06em', boxShadow: '0 2px 6px rgba(22,163,74,0.4)' }}>DISPO</span>
        </div>
        {product.image_url && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: 6, padding: '3px 8px', fontSize: '0.62rem', fontWeight: 600, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 3, opacity: 0, transition: 'opacity 0.2s' }}
            className="zoom-hint">
            🔍 Zoom
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111', lineHeight: 1.35, margin: 0 }}>{product.name}</h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {product.brand && <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{product.brand}</span>}
          {product.storage && <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{product.storage}</span>}
          {product.color && <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{product.color}</span>}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1a56db', letterSpacing: '-0.01em', marginBottom: 10 }}>
            {product.price.toLocaleString('fr-FR')} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>FCFA</span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation()
              const msg = encodeURIComponent(`Bonjour SSI 👋\nJe suis intéressé par *${product.name}*${product.storage ? ' ' + product.storage : ''} à *${product.price.toLocaleString('fr-FR')} FCFA*.\n\nEst-il disponible ?`)
              window.open(`https://wa.me/${product.whatsapp_number || WHATSAPP}?text=${msg}`, '_blank')
            }}
            style={{ width: '100%', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'transform 0.15s,box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,163,74,0.3)' }}>
            <span>💬</span> Contacter sur WhatsApp
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

  const load = async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('ordre'),
      supabase.from('produits').select('*').eq('status', 'publie').order('created_at', { ascending: false })
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ width: 56, height: 56, border: '3px solid #e2e8f0', borderTop: '3px solid #1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chargement du catalogue...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const sidebar = (
    <aside style={{ width: 230, minWidth: 230, background: '#fff', borderRight: '1px solid #e8eef4', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid #e2e8f0', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src="/logo.png" alt="SSI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#111', letterSpacing: '-0.01em' }}>S.S.I</div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>INFORMATIQUE</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 6px' }}>Navigation</div>
        <button onClick={() => { setShowHero(true); setActiveCategory(categories[0]?.id); setSidebarOpen(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: showHero ? 'linear-gradient(135deg,#eff6ff,#e0f2fe)' : 'none', border: showHero ? '1px solid #bfdbfe' : '1px solid transparent', color: showHero ? '#1d4ed8' : '#64748b', fontSize: '0.875rem', fontWeight: showHero ? 700 : 500, cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 2, transition: 'all 0.15s' }}>
          <span style={{ fontSize: '1.1rem' }}>🏪</span> Boutique
        </button>

        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 8px 6px', marginTop: 4 }}>Catégories</div>
        {categories.filter(c => catCount(c.id) > 0).map(cat => {
          const isActive = activeCategory === cat.id && !showHero
          return (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowHero(false); setSidebarOpen(false); setSearch('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: isActive ? 'linear-gradient(135deg,#eff6ff,#e0f2fe)' : 'none', border: isActive ? '1px solid #bfdbfe' : '1px solid transparent', color: isActive ? '#1d4ed8' : '#64748b', fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 2, transition: 'all 0.15s' }}>
              <span style={{ fontSize: '1rem', width: 22, textAlign: 'center' }}>{cat.icon}</span>
              <span style={{ flex: 1 }}>{cat.label}</span>
              <span style={{ background: isActive ? '#1d4ed8' : '#f1f5f9', color: isActive ? '#fff' : '#94a3b8', borderRadius: 20, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{catCount(cat.id)}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}>
          <span>💬</span> WhatsApp
        </a>
        <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.6, background: '#fafafa', borderRadius: 10 }}>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
        <div className="sidebar-wrap">{sidebar}</div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* Mobile topbar */}
          <div className="mobile-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e8eef4', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#333', cursor: 'pointer', padding: 4 }}>☰</button>
              <img src="/logo.png" alt="SSI" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#111' }}>SEYE SENGHOR INFORMATIQUE</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>💻 Keur Massar · Dakar</div>
              </div>
            </div>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}>
              💬 WhatsApp
            </a>
          </div>

          {/* Desktop header */}
          <div className="desktop-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid #e8eef4', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid #e2e8f0', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="/logo.png" alt="SSI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', letterSpacing: '-0.01em' }}>SEYE SENGHOR INFORMATIQUE</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>💻 Vente ordinateur et accessoires Informatique</div>
              </div>
            </div>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', borderRadius: 12, padding: '11px 22px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,0.35)', transition: 'transform 0.15s,box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.35)' }}>
              <span>💬</span> WhatsApp
            </a>
          </div>

          {/* Search */}
          <div style={{ padding: '14px 28px', borderBottom: '1px solid #e8eef4', background: '#fafbfc' }}>
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none', color: '#94a3b8' }}>🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setShowHero(false) }}
                placeholder="Rechercher un produit, une marque..."
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px 11px 40px', fontSize: '0.9rem', background: '#fff', outline: 'none', color: '#334155', transition: 'border-color 0.2s,box-shadow 0.2s', fontFamily: 'inherit' }}
                onFocus={e => { e.target.style.borderColor = '#1a56db'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '' }} />
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', padding: '0 28px', borderBottom: '2px solid #f1f5f9', background: '#fff', gap: 0 }}>
            {categories.filter(c => catCount(c.id) > 0).map(cat => {
              const isActive = activeCategory === cat.id && !showHero
              return (
                <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowHero(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', background: 'none', border: 'none', borderBottom: `2.5px solid ${isActive ? '#1a56db' : 'transparent'}`, marginBottom: -2, color: isActive ? '#1a56db' : '#64748b', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                  <span>{cat.icon}</span> {cat.label}
                  <span style={{ background: isActive ? '#1a56db' : '#f1f5f9', color: isActive ? '#fff' : '#94a3b8', borderRadius: 20, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>{catCount(cat.id)}</span>
                </button>
              )
            })}
          </div>

          {/* Hero */}
          {showHero && (
            <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f2d1a 100%)', margin: '20px 28px', borderRadius: 20, padding: '36px 36px 32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(26,86,219,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -20, left: '40%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', filter: 'blur(30px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#93c5fd', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>BIENVENUE CHEZ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid rgba(255,255,255,0.25)', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                    <img src="/logo.png" alt="SSI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>SEYE SENGHOR<br />INFORMATIQUE</h1>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>
                  Votre magasin de matériel informatique à Keur Massar :<br />
                  <strong style={{ color: '#fff' }}>💻 Ordinateurs · Smartphones · Accessoires</strong>
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {['Large choix d\'ordinateurs et accessoires disponibles', 'Produits testés, garantis et prêts à l\'utilisation', 'Livraison et installation disponibles', 'Meilleurs prix du marché à Dakar'].map(t => (
                    <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>✔</span> {t}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>📍 Keur Massar au rond-point, Dakar</span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>☎️ +221 777042635</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, padding: '6px 14px', borderRadius: 20, marginBottom: 24 }}>
                  🔥 Nouveaux arrivages chaque semaine
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => setShowHero(false)}
                    style={{ flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1.6, textAlign: 'center', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                    🗂 Catalogue<br /><small style={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>Parcourez votre modèle</small>
                  </button>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
                    style={{ flex: 1, minWidth: 160, background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1.6, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}>
                    💬 WhatsApp<br /><small style={{ fontWeight: 400, color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>Commandez directement</small>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Count */}
          <div style={{ padding: '10px 28px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            {filtered.length} article{filtered.length > 1 ? 's' : ''}
            {search && <span style={{ color: '#94a3b8', fontWeight: 400 }}> pour « {search} »</span>}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.4 }}>📦</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Aucun produit disponible</p>
              <p style={{ fontSize: '0.85rem' }}>Revenez bientôt pour de nouveaux arrivages</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 18, padding: '4px 28px 48px' }}>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i}
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
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>SEYE SENGHOR INFORMATIQUE</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📍 Keur Massar au rond-point · ☎️ +221 777042635</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
                  style={{ background: '#16a34a', color: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>💬 WhatsApp</a>
                <a href="/login" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none' }}>🔐 Admin</a>
              </div>
            </div>
          </footer>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setSidebarOpen(false)}>
            <div style={{ width: 260 }} onClick={e => e.stopPropagation()}>{sidebar}</div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
          </div>
        )}
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onImageClick={(src, alt) => setZoomedImage({ src, alt })} />}
      {zoomedImage && <ImageViewer src={zoomedImage.src} alt={zoomedImage.alt} onClose={() => setZoomedImage(null)} />}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans',system-ui,sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
        .sidebar-wrap { display: none; }
        .mobile-topbar { display: flex !important; }
        .desktop-header { display: none !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (min-width: 769px) {
          .sidebar-wrap { display: block; }
          .mobile-topbar { display: none !important; }
          .desktop-header { display: flex !important; }
        }
        div:hover .zoom-hint { opacity: 1 !important; }
      `}</style>
    </>
  )
}
