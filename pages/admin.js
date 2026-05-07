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
import {
  LayoutGrid, FolderOpen, Eye, Monitor, Zap, ShoppingCart,
  FileText, Users, Wallet, BarChart2, ClipboardList, Moon, Sun,
  LogOut, Menu, Package, Search, Pencil, Trash2, Plus, Upload, X, Save
} from 'lucide-react'

// ---------- GESTION PRODUITS ----------
function GestionProduits({ categories }) {
  const [produits, setProduits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '', category_id: '', brand: '', storage: '', color: '',
    price: '', description: '', image_url: '', whatsapp_number: '221777042635',
    status: 'brouillon', stock: '0', stock_alerte: '3'
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [extraImages, setExtraImages] = useState([]) // [{url, file, preview}]
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('produits').select('*, categories(label,icon)').order('created_at', { ascending: false })
    setProduits(data || [])
  }

  useEffect(() => { load() }, [])

  const openForm = (product = null) => {
    if (product) {
      setForm({
        name: product.name, category_id: product.category_id || '',
        brand: product.brand || '', storage: product.storage || '',
        color: product.color || '', price: product.price,
        description: product.description || '', image_url: product.image_url || '',
        whatsapp_number: product.whatsapp_number || '221777042635',
        status: product.status, stock: product.stock || '0',
        stock_alerte: product.stock_alerte || '3'
      })
      setImagePreview(product.image_url || '')
      setEditProduct(product)
      // Load extra images
      const extras = Array.isArray(product.images) ? product.images.map(url => ({ url, file: null, preview: url })) : []
      setExtraImages(extras)
    } else {
      setForm({
        name: '', category_id: categories[0]?.id || '', brand: '', storage: '',
        color: '', price: '', description: '', image_url: '',
        whatsapp_number: '221777042635', status: 'brouillon', stock: '0', stock_alerte: '3'
      })
      setImagePreview('')
      setEditProduct(null)
      setExtraImages([])
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

  const handleExtraImage = (e) => {
    const files = Array.from(e.target.files)
    const remaining = 4 - extraImages.length
    const toAdd = files.slice(0, remaining)
    const newEntries = toAdd.map(file => ({ file, url: '', preview: URL.createObjectURL(file) }))
    setExtraImages(prev => [...prev, ...newEntries])
    e.target.value = ''
  }

  const removeExtraImage = (index) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    // Upload main image
    let imageUrl = form.image_url
    if (imageFile) {
      try { imageUrl = await uploadImage(imageFile) } catch (e) { alert('Erreur upload image: ' + e.message); setSaving(false); return }
    }
    // Upload extra images
    const uploadedExtras = []
    for (const img of extraImages) {
      if (img.file) {
        try {
          const url = await uploadImage(img.file)
          uploadedExtras.push(url)
        } catch (e) { console.error('Extra image upload error', e) }
      } else if (img.url) {
        uploadedExtras.push(img.url)
      }
    }
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      stock_alerte: parseInt(form.stock_alerte) || 3,
      image_url: imageUrl,
      images: uploadedExtras,
      updated_at: new Date().toISOString()
    }
    if (editProduct) {
      await supabase.from('produits').update(payload).eq('id', editProduct.id)
    } else {
      await supabase.from('produits').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setExtraImages([])
    load()
  }

  const del = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      await supabase.from('produits').delete().eq('id', id)
      load()
    }
  }

  const filtered = produits.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const getStockColor = (stock) => {
    if (!stock || stock === 0) return '#dc2626'
    if (stock <= 3) return '#d97706'
    return '#16a34a'
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LayoutGrid size={20} /> Gestion des produits
        </h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: '0.875rem', color: 'var(--text)', width: 200 }} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', color: 'var(--text)', cursor: 'pointer' }}>
            <option value="all">Tous ({produits.length})</option>
            <option value="publie">✅ Publiés ({produits.filter(p => p.status === 'publie').length})</option>
            <option value="rupture">🔴 Rupture ({produits.filter(p => p.status === 'rupture').length})</option>
            <option value="brouillon">📝 Brouillons ({produits.filter(p => p.status === 'brouillon').length})</option>
          </select>
          <button onClick={() => openForm()}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Nouveau produit
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 170, background: 'var(--bg3)' }}>
              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Monitor size={40} style={{ opacity: 0.15 }} /></div>}
              <span style={{ position: 'absolute', top: 8, right: 8, background: p.status === 'publie' ? '#16a34a' : p.status === 'rupture' ? '#dc2626' : '#d97706', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                {p.status === 'publie' ? '✅ PUBLIÉ' : p.status === 'rupture' ? '🔴 RUPTURE' : '📝 BROUILLON'}
              </span>
              <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.65)', color: getStockColor(p.stock), fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Package size={11} /> {p.stock || 0} en stock
              </span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8 }}>{p.categories?.icon} {p.categories?.label} · {p.brand}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>{p.price.toLocaleString('fr-FR')} FCFA</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <select value={p.status} onChange={async e => {
                  await supabase.from('produits').update({ status: e.target.value }).eq('id', p.id); load()
                  if (e.target.value === 'publie') {
                    const msg = encodeURIComponent(`Nouveau produit disponible chez SSI !\n\n*${p.name}*${p.storage ? '\nCapacité : ' + p.storage : ''}\nPrix : *${p.price.toLocaleString('fr-FR')} FCFA*\n\nKeur Massar au rond-point\nTel : +221 777042635`)
                    window.open(`https://wa.me/?text=${msg}`, '_blank')
                  }
                }} style={{ flex: 1, background: p.status === 'publie' ? '#f0fdf4' : p.status === 'rupture' ? '#fef2f2' : '#fffbeb', border: `1px solid ${p.status === 'publie' ? '#bbf7d0' : p.status === 'rupture' ? '#fecaca' : '#fde68a'}`, color: p.status === 'publie' ? '#16a34a' : p.status === 'rupture' ? '#dc2626' : '#d97706', borderRadius: 6, padding: '6px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <option value="brouillon">📝 Brouillon</option>
                  <option value="publie">✅ Publié</option>
                  <option value="rupture">🔴 Rupture</option>
                </select>
                <button onClick={() => openForm(p)}
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => del(p.id)}
                  style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>Aucun produit trouvé</div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              {editProduct ? <><Pencil size={18} /> Modifier le produit</> : <><Plus size={18} /> Nouveau produit</>}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                Images du produit <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(1 principale + jusqu'à 4 secondaires)</span>
              </label>

              {/* Main image */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image principale</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 90, height: 90, border: '2px dashed var(--border2)', borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Upload size={24} style={{ opacity: 0.3 }} />}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Upload size={14} /> Choisir une image
                      <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                    </label>
                    <input value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }}
                      placeholder="Ou coller une URL d'image..."
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text)', width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Extra images */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Photos supplémentaires ({extraImages.length}/4)</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {extraImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <img src={img.preview} alt={`extra-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => removeExtraImage(i)}
                        style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(220,38,38,0.85)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {extraImages.length < 4 && (
                    <label style={{ width: 80, height: 80, border: '2px dashed var(--border2)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', background: 'var(--bg3)', flexShrink: 0, transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
                      <Plus size={18} style={{ opacity: 0.4 }} />
                      <span style={{ fontSize: '0.6rem', color: 'var(--text3)', fontWeight: 600 }}>Ajouter</span>
                      <input type="file" accept="image/*" multiple onChange={handleExtraImage} style={{ display: 'none' }} />
                    </label>
                  )}
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
                { label: 'Stock initial', key: 'stock', placeholder: '0', type: 'number' },
                { label: 'Alerte stock faible', key: 'stock_alerte', placeholder: '3', type: 'number' },
              ].map(f => (
                <div key={f.key} style={f.full ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
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
                  <option value="rupture">🔴 Rupture de stock</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                placeholder="Décrivez le produit..."
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '10px 18px', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={15} /> Annuler
              </button>
              <button onClick={save} disabled={saving}
                style={{ background: saving ? '#94a3b8' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
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
    if (!confirm('Supprimer cette rubrique ?')) return
    await supabase.from('categories').delete().eq('id', id)
    refreshCategories()
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={20} /> Rubriques du catalogue
        </h1>
        <button onClick={() => setShowForm(true)}
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Nouvelle rubrique
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{cat.label}</span>
            </div>
            <button onClick={() => del(cat.id)}
              style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 20, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderOpen size={18} /> Nouvelle rubrique
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Nom *', key: 'label', placeholder: 'Ex: Tablettes' },
                { label: 'Icône (emoji)', key: 'icon', placeholder: '📦' },
                { label: "Ordre d'affichage", key: 'ordre', placeholder: '0', type: 'number' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    type={f.type || 'text'} placeholder={f.placeholder}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text)' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '9px 16px', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={14} /> Annuler
              </button>
              <button onClick={save}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={14} /> Créer
              </button>
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

  useEffect(() => { document.body.classList.toggle('dark', darkMode) }, [darkMode])

  const refreshCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('ordre')
    setCategories(data || [])
  }

  useEffect(() => {
    if (!loading) {
      refreshCategories()
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

  useEffect(() => { try { localStorage.setItem('ssi_clients', JSON.stringify(clients)) } catch {} }, [clients])
  useEffect(() => { try { localStorage.setItem('ssi_factures', JSON.stringify(factures)) } catch {} }, [factures])
  useEffect(() => { try { localStorage.setItem('ssi_devis', JSON.stringify(devis)) } catch {} }, [devis])
  useEffect(() => { try { localStorage.setItem('ssi_depenses', JSON.stringify(depenses)) } catch {} }, [depenses])
  useEffect(() => { try { localStorage.setItem('ssi_ventes', JSON.stringify(ventes)) } catch {} }, [ventes])
  useEffect(() => { try { localStorage.setItem('ssi_events', JSON.stringify(events)) } catch {} }, [events])

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const addVente = (v) => setVentes(prev => [v, ...prev])

  const menuItems = [
    { id: 'produits',    label: 'Produits',    Icon: LayoutGrid,   color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { id: 'categories', label: 'Rubriques',   Icon: FolderOpen,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { id: 'caisse',     label: 'Caisse POS',  Icon: Monitor,      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { id: 'action',     label: 'Actions',     Icon: Zap,          color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    { id: 'events',     label: 'Évents',      Icon: ShoppingCart, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { id: 'factures',   label: 'Factures',    Icon: FileText,     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { id: 'clients',    label: 'Clients',     Icon: Users,        color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { id: 'depenses',   label: 'Dépenses',    Icon: Wallet,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { id: 'rapports',   label: 'Rapports',    Icon: BarChart2,    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { id: 'devis',      label: 'Devis',       Icon: ClipboardList,color: '#84cc16', bg: 'rgba(132,204,22,0.12)' },
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'produits': return <GestionProduits categories={categories} />
      case 'categories': return <GestionCategories categories={categories} setCategories={setCategories} refreshCategories={refreshCategories} />
      case 'caisse': return <CaissePOS addVente={addVente} />
      case 'action': return <Actions setActiveMenu={setActiveMenu} ventes={ventes} clients={clients} factures={factures} depenses={depenses} />
      case 'events': return <Events events={events} setEvents={setEvents} />
      case 'factures': return <Factures factures={factures} setFactures={setFactures} clients={clients} ventes={ventes} />
      case 'clients': return <Clients clients={clients} setClients={setClients} />
      case 'depenses': return <Depenses depenses={depenses} setDepenses={setDepenses} />
      case 'rapports': return <Rapports />
      case 'devis': return <Devis devis={devis} setDevis={setDevis} setFactures={setFactures} clients={clients} />
      default: return null
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
        <Monitor size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
        <p>Vérification...</p>
      </div>
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

      <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {menuItems.map(({ id, label, Icon, color, bg }) => {
          const isActive = activeMenu === id
          return (
            <button key={id} onClick={() => { setActiveMenu(id); setSidebarOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: isActive ? 'var(--primary-light)' : 'none', border: 'none', color: isActive ? 'var(--primary)' : 'var(--text2)', fontSize: '0.855rem', fontWeight: isActive ? 700 : 500, width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: isActive ? color : bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                <Icon size={14} style={{ color: isActive ? '#fff' : color }} />
              </span>
              {label}
            </button>
          )
        })}
        <a href="/" target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'none', color: 'var(--text2)', fontSize: '0.855rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s', marginTop: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(14,165,233,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Eye size={14} style={{ color: '#0ea5e9' }} />
          </span>
          Voir boutique
        </a>
      </nav>

      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <button onClick={() => setDarkMode(d => !d)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'none', border: 'none', color: 'var(--text2)', fontSize: '0.855rem', fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {darkMode ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} style={{ color: '#fbbf24' }} />}
          </span>
          {darkMode ? 'Mode clair' : 'Mode sombre'}
        </button>
        <button onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.855rem', fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogOut size={14} style={{ color: 'var(--red)' }} />
          </span>
          Déconnexion
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
              <button onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Menu size={22} />
              </button>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>S.S.I Admin</span>
            </div>
            <a href="/" target="_blank"
              style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} /> Boutique
            </a>
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