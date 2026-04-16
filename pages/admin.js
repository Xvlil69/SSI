import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase, uploadImage } from '../lib/supabase'
import Clients from '../components/Clients'
import Factures from '../components/Factures'
import Devis from '../components/Devis'
import Depenses from '../components/Depenses'
import Rapports from '../components/Rapports'
import Events from '../components/Events'
import Actions from '../components/Actions'
import CaissePOS from '../components/CaissePOS'

// ---------- GESTION PRODUITS (Admin) ----------
function GestionProduits({ categories }) {
  const [produits, setProduits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', category_id: '', brand: '', storage: '', color: '', price: '', description: '', image_url: '', whatsapp_number: '221777042635', status: 'brouillon' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('produits').select('*, categories(label,icon)').order('created_at', { ascending: false })
    setProduits(data || [])
  }

  useEffect(() => { load() }, [])

  const openForm = (product = null) => {
    if (product) {
      setForm({ name: product.name, category_id: product.category_id || '', brand: product.brand || '', storage: product.storage || '', color: product.color || '', price: product.price, description: product.description || '', image_url: product.image_url || '', whatsapp_number: product.whatsapp_number || '221777042635', status: product.status })
      setImagePreview(product.image_url || '')
      setEditProduct(product)
    } else {
      setForm({ name: '', category_id: categories[0]?.id || '', brand: '', storage: '', color: '', price: '', description: '', image_url: '', whatsapp_number: '221777042635', status: 'brouillon' })
      setImagePreview('')
      setEditProduct(null)
    }
    setImageFile(null)
    setShowForm(true)
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const save = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    let imageUrl = form.image_url
    if (imageFile) {
      try { imageUrl = await uploadImage(imageFile) } catch (e) { alert('Erreur upload image: ' + e.message); setSaving(false); return }
    }
    const payload = { ...form, price: parseFloat(form.price), image_url: imageUrl, updated_at: new Date().toISOString() }
    if (editProduct) {
      await supabase.from('produits').update(payload).eq('id', editProduct.id)
    } else {
      await supabase.from('produits').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'publie' ? 'brouillon' : 'publie'
    await supabase.from('produits').update({ status: newStatus }).eq('id', product.id)
    load()
    if (newStatus === 'publie') {
      const msg = encodeURIComponent(`🆕 *Nouveau produit disponible chez SSI !*\n\n💻 *${product.name}*${product.storage ? '\n📦 ' + product.storage : ''}${product.color ? '\n🎨 ' + product.color : ''}\n💰 *${product.price.toLocaleString('fr-FR')} FCFA*\n\n📍 Keur Massar au rond-point\n☎️ +221 777042635\n\nContactez-nous pour commander !`)
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
  }

  const del = async (id) => { if (confirm('Supprimer ce produit ?')) { await supabase.from('produits').delete().eq('id', id); load() } }

  const filtered = produits.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>🗂 Gestion des produits</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..." style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', color: 'var(--text)', width: 200 }} />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', color: 'var(--text)', cursor: 'pointer' }}>
            <option value="all">Tous ({produits.length})</option>
            <option value="publie">✅ Publiés ({produits.filter(p => p.status === 'publie').length})</option>
            <option value="brouillon">📝 Brouillons ({produits.filter(p => p.status === 'brouillon').length})</option>
          </select>
          <button onClick={() => openForm()} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>+ Nouveau produit</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 170, background: 'var(--bg3)' }}>
              {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.2 }}>💻</div>}
              <span style={{ position: 'absolute', top: 8, right: 8, background: p.status === 'publie' ? '#16a34a' : '#d97706', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                {p.status === 'publie' ? '✅ PUBLIÉ' : '📝 BROUILLON'}
              </span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8 }}>{p.categories?.icon} {p.categories?.label} · {p.brand}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>{p.price.toLocaleString('fr-FR')} FCFA</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => toggleStatus(p)}
                  style={{ flex: 1, background: p.status === 'publie' ? '#fef2f2' : '#f0fdf4', color: p.status === 'publie' ? '#dc2626' : '#16a34a', border: `1px solid ${p.status === 'publie' ? '#fecaca' : '#bbf7d0'}`, borderRadius: 6, padding: '6px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  {p.status === 'publie' ? '⬇ Dépublier' : '🚀 Publier'}
                </button>
                <button onClick={() => openForm(p)} style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>✏️</button>
                <button onClick={() => del(p.id)} style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>Aucun produit trouvé</div>}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 20 }}>{editProduct ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h3>

            {/* Image upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>📸 Image du produit</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 100, height: 100, border: '2px dashed var(--border2)', borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '2rem', opacity: 0.3 }}>📷</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '9px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', display: 'block' }}>
                    📁 Choisir une image
                    <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                  </label>
                  <input value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }}
                    placeholder="Ou coller une URL d'image..." style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: '0.8rem', color: 'var(--text)', width: '100%' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Nom du produit *', key: 'name', placeholder: 'Ex: HP ProBook 450 G9', full: true },
                { label: 'Marque', key: 'brand', placeholder: 'Ex: HP, Samsung...' },
                { label: 'Stockage / Capacité', key: 'storage', placeholder: 'Ex: 256 Go SSD' },
                { label: 'Couleur', key: 'color', placeholder: 'Ex: Noir / Argent' },
                { label: 'Prix (FCFA) *', key: 'price', placeholder: '0', type: 'number' },
                { label: 'N° WhatsApp', key: 'whatsapp_number', placeholder: '221777042635' },
              ].map(f => (
                <div key={f.key} style={f.full ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    type={f.type || 'text'} placeholder={f.placeholder}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Catégorie</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)', cursor: 'pointer' }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Statut</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)', cursor: 'pointer' }}>
                  <option value="brouillon">📝 Brouillon</option>
                  <option value="publie">✅ Publié (visible clients)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Décrivez le produit..." style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '10px 18px', fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
              <button onClick={save} disabled={saving} style={{ background: saving ? '#94a3b8' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- GESTION CATEGORIES ----------
function GestionCategories({ categories, setCategories, refreshCategories }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', icon: '📦', ordre: 0 })

  const save = async () => {
    if (!form.label.trim()) return
    const { data } = await supabase.from('categories').insert({ label: form.label, icon: form.icon, ordre: parseInt(form.ordre) || 0 }).select()
    if (data) { refreshCategories(); setShowForm(false); setForm({ label: '', icon: '📦', ordre: 0 }) }
  }

  const del = async (id) => {
    if (!confirm('Supprimer cette rubrique ? Les produits liés perdront leur catégorie.')) return
    await supabase.from('categories').delete().eq('id', id)
    refreshCategories()
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>📁 Rubriques du catalogue</h1>
        <button onClick={() => setShowForm(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>+ Nouvelle rubrique</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{cat.label}</span>
            </div>
            <button onClick={() => del(cat.id)} style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>🗑</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>📁 Nouvelle rubrique</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[{ label: 'Nom de la rubrique *', key: 'label', placeholder: 'Ex: Tablettes' }, { label: 'Icône (emoji)', key: 'icon', placeholder: '📦' }, { label: 'Ordre d\'affichage', key: 'ordre', placeholder: '0', type: 'number' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} type={f.type || 'text'} placeholder={f.placeholder}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '9px 16px', fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
              <button onClick={save} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>💾 Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- MAIN ADMIN ----------
export default function Admin() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('produits')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [clients, setClients] = useState([])
  const [factures, setFactures] = useState([])
  const [devis, setDevis] = useState([])
  const [depenses, setDepenses] = useState([])
  const [ventes, setVentes] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  const refreshCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('ordre')
    setCategories(data || [])
  }

  useEffect(() => {
    if (!loading) {
      refreshCategories()
      // Load local state from localStorage
      try {
        setClients(JSON.parse(localStorage.getItem('ssi_clients') || '[]'))
        setFactures(JSON.parse(localStorage.getItem('ssi_factures') || '[]'))
        setDevis(JSON.parse(localStorage.getItem('ssi_devis') || '[]'))
        setDepenses(JSON.parse(localStorage.getItem('ssi_depenses') || '[]'))
        setVentes(JSON.parse(localStorage.getItem('ssi_ventes') || '[]'))
        setEvents(JSON.parse(localStorage.getItem('ssi_events') || '[]'))
      } catch {}
    }
  }, [loading])

  // Persist to localStorage
  useEffect(() => { try { localStorage.setItem('ssi_clients', JSON.stringify(clients)) } catch {} }, [clients])
  useEffect(() => { try { localStorage.setItem('ssi_factures', JSON.stringify(factures)) } catch {} }, [factures])
  useEffect(() => { try { localStorage.setItem('ssi_devis', JSON.stringify(devis)) } catch {} }, [devis])
  useEffect(() => { try { localStorage.setItem('ssi_depenses', JSON.stringify(depenses)) } catch {} }, [depenses])
  useEffect(() => { try { localStorage.setItem('ssi_ventes', JSON.stringify(ventes)) } catch {} }, [ventes])
  useEffect(() => { try { localStorage.setItem('ssi_events', JSON.stringify(events)) } catch {} }, [events])

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const addVente = (v) => setVentes(prev => [v, ...prev])

  const menuItems = [
    { id: 'produits', label: 'Produits', icon: '🗂' },
    { id: 'categories', label: 'Rubriques', icon: '📁' },
    { id: 'boutique_preview', label: 'Voir boutique', icon: '👁' },
    { id: 'caisse', label: 'Caisse POS', icon: '🖥' },
    { id: 'action', label: 'Actions', icon: '⚡' },
    { id: 'events', label: 'Évents', icon: '🛒' },
    { id: 'factures', label: 'Factures', icon: '📄' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'depenses', label: 'Dépenses', icon: '💰' },
    { id: 'rapports', label: 'Rapports', icon: '📊' },
    { id: 'devis', label: 'Devis', icon: '📋' },
  ]

  const renderContent = () => {
    if (activeMenu === 'boutique_preview') { window.open('/', '_blank'); setActiveMenu('produits'); return null }
    switch (activeMenu) {
      case 'produits': return <GestionProduits categories={categories} />
      case 'categories': return <GestionCategories categories={categories} setCategories={setCategories} refreshCategories={refreshCategories} />
      case 'caisse': return <CaissePOS addVente={addVente} />
      case 'action': return <Actions setActiveMenu={setActiveMenu} ventes={ventes} clients={clients} factures={factures} depenses={depenses} />
      case 'events': return <Events events={events} setEvents={setEvents} />
      case 'factures': return <Factures factures={factures} setFactures={setFactures} clients={clients} ventes={ventes} />
      case 'clients': return <Clients clients={clients} setClients={setClients} />
      case 'depenses': return <Depenses depenses={depenses} setDepenses={setDepenses} />
      case 'rapports': return <Rapports ventes={ventes} depenses={depenses} clients={clients} factures={factures} />
      case 'devis': return <Devis devis={devis} setDevis={setDevis} setFactures={setFactures} clients={clients} />
      default: return null
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>🔐</div><p>Vérification...</p></div>
    </div>
  )

  const sidebar = (
    <aside style={{ width: 220, minWidth: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: '1px solid var(--border)' }}>
        <img src="/logo.png" alt="SSI" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)' }}>S.S.I ADMIN</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 130 }}>{user?.email}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems.map(item => (
          <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: activeMenu === item.id ? 'var(--primary-light)' : 'none', border: 'none', color: activeMenu === item.id ? 'var(--primary)' : 'var(--text2)', fontSize: '0.875rem', fontWeight: activeMenu === item.id ? 700 : 500, width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: 8, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => setDarkMode(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text2)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Mode clair' : 'Mode sombre'}
        </button>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <Head><title>Admin — S.S.I</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="sidebar-wrap">{sidebar}</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="mobile-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: 'var(--text)', cursor: 'pointer' }}>☰</button>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>S.S.I Admin</span>
            </div>
            <a href="/" target="_blank" style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>👁 Boutique</a>
          </div>
          <main style={{ flex: 1, overflowY: 'auto' }}>{renderContent()}</main>
        </div>
        {sidebarOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setSidebarOpen(false)}>
            <div style={{ width: 240 }} onClick={e => e.stopPropagation()}>{sidebar}</div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
          </div>
        )}
      </div>
      <style>{`.sidebar-wrap{display:none}.mobile-topbar{display:flex}@media(min-width:769px){.sidebar-wrap{display:block}.mobile-topbar{display:none!important}}`}</style>
    </>
  )
}
