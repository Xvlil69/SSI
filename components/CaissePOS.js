import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import s from '../styles/shared.module.css';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, Package } from 'lucide-react';

export default function CaissePOS({ addVente }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paiement, setPaiement] = useState('especes');
  const [clientNom, setClientNom] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('produits').select('*, categories(label,icon)').eq('status', 'publie').order('name');
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel('caisse-stock')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'produits' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    if ((product.stock || 0) === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= (product.stock || 0)) return prev;
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    const product = products.find(p => p.id === id);
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = i.qty + delta;
      if (newQty < 1) return i;
      if (product && newQty > (product.stock || 0)) return i;
      return { ...i, qty: newQty };
    }));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const getStockColor = (stock, alerte) => {
    if (!stock || stock === 0) return '#dc2626';
    if (stock <= (alerte || 3)) return '#d97706';
    return '#16a34a';
  };

  const getStockBg = (stock, alerte) => {
    if (!stock || stock === 0) return 'rgba(220,38,38,0.1)';
    if (stock <= (alerte || 3)) return 'rgba(217,119,6,0.1)';
    return 'rgba(22,163,74,0.08)';
  };

  const getStockLabel = (stock) => {
    if (!stock || stock === 0) return 'Rupture';
    if (stock === 1) return '1 restant';
    if (stock <= 3) return `${stock} restants`;
    return `${stock} en stock`;
  };

  const processVente = async () => {
    if (cart.length === 0 || saving) return;
    setSaving(true);
    const numero = 'V-' + Date.now().toString().slice(-6);
    const vente = {
      numero,
      articles: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, storage: i.storage })),
      total,
      client_nom: clientNom || 'Client anonyme',
      paiement,
    };
    const { error } = await supabase.from('ventes').insert(vente);
    if (error) { console.error(error); setSaving(false); alert('Erreur: ' + error.message); return; }
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.qty);
        const newStatus = newStock === 0 ? 'rupture' : 'publie';
        await supabase.from('produits').update({ stock: newStock, status: newStatus }).eq('id', item.id);
      }
    }
    addVente && addVente({ ...vente, id: Date.now(), date: new Date().toISOString(), clientNom: vente.client_nom });
    setReceipt({ ...vente, clientNom: vente.client_nom, date: new Date().toISOString() });
    setCart([]); setClientNom(''); setSaving(false); setShowCart(false); load();
  };

  if (receipt) return (
    <div style={{ padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
        <CheckCircle size={48} style={{ color: 'var(--green)', marginBottom: 12 }} />
        <h2 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Vente enregistrée !</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 20 }}>Reçu #{receipt.numero}</div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>S.S.I — Seye Senghor Informatique</div>
          {receipt.articles.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '5px 0', borderBottom: '1px dashed var(--border)', color: 'var(--text)' }}>
              <span>{a.name} ×{a.qty}</span>
              <span style={{ fontWeight: 600 }}>{(a.price * a.qty).toLocaleString('fr-FR')} F</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
            <span>TOTAL</span>
            <span style={{ color: 'var(--primary)' }}>{receipt.total.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text3)' }}>Client : {receipt.clientNom} · {receipt.paiement}</div>
        </div>
        <button className={s.btnPrimary} onClick={() => setReceipt(null)} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>
          <Plus size={16} /> Nouvelle vente
        </button>
      </div>
    </div>
  );

  const CartPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', height: '100%' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingCart size={16} /> Panier</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
            <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ fontSize: '0.875rem' }}>Cliquez sur un produit</p>
          </div>
        ) : cart.map(item => {
          const product = products.find(p => p.id === item.id);
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                : <div style={{ width: 40, height: 40, background: 'var(--bg3)', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} style={{ opacity: 0.3 }} /></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                  {item.price.toLocaleString('fr-FR')} × {item.qty} = <strong style={{ color: 'var(--primary)' }}>{(item.price * item.qty).toLocaleString('fr-FR')} F</strong>
                </div>
                {product && <div style={{ fontSize: '0.62rem', color: getStockColor(product.stock, product.stock_alerte) }}>Stock restant: {product.stock}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: 20, textAlign: 'center', color: 'var(--text)' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: '50%', background: product && item.qty >= (product.stock || 0) ? 'var(--border)' : 'var(--primary)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className={s.formInput} placeholder="Nom du client (optionnel)" value={clientNom} onChange={e => setClientNom(e.target.value)} />
        <select className={s.formInput} value={paiement} onChange={e => setPaiement(e.target.value)}>
          <option value="especes">💵 Espèces</option>
          <option value="wave">📱 Wave</option>
          <option value="orange_money">🔶 Orange Money</option>
          <option value="carte">💳 Carte bancaire</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)' }}>{total.toLocaleString('fr-FR')} <small style={{ fontSize: '0.7rem', fontWeight: 600 }}>FCFA</small></span>
        </div>
        <button onClick={processVente} disabled={cart.length === 0 || saving}
          style={{ width: '100%', background: cart.length === 0 || saving ? 'var(--border)' : 'var(--green)', color: cart.length === 0 || saving ? 'var(--text3)' : '#fff', border: 'none', borderRadius: 10, padding: 13, fontSize: '0.95rem', fontWeight: 700, cursor: cart.length === 0 || saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <CheckCircle size={18} /> {saving ? 'Enregistrement...' : 'Valider la vente'}
        </button>
        {cart.length > 0 && <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Trash2 size={12} /> Vider le panier</button>}
      </div>
    </div>
  );

  const ProductsPanel = () => (
    <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
          <input className={s.formInput} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{filtered.length}</span>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Chargement...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {filtered.map(p => {
            const inCart = cart.find(i => i.id === p.id);
            const stock = p.stock || 0;
            const isOut = stock === 0;
            return (
              <button key={p.id} onClick={() => addToCart(p)} disabled={isOut}
                style={{ background: 'var(--surface)', border: `2px solid ${inCart ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, padding: 10, textAlign: 'left', cursor: isOut ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', gap: 5, opacity: isOut ? 0.5 : 1, position: 'relative' }}>
                {inCart && <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, zIndex: 1 }}>{inCart.qty}</div>}
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, filter: isOut ? 'grayscale(60%)' : 'none' }} />
                  : <div style={{ width: '100%', height: 80, background: 'var(--bg3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} style={{ opacity: 0.2 }} /></div>}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{p.name}</div>
                {p.storage && <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{p.storage}</div>}
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{p.price.toLocaleString('fr-FR')} F</div>
                <div style={{ background: getStockBg(stock, p.stock_alerte), color: getStockColor(stock, p.stock_alerte), borderRadius: 5, padding: '2px 6px', fontSize: '0.62rem', fontWeight: 700, textAlign: 'center' }}>
                  {getStockLabel(stock)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="caisse-desktop" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 72px)' }}>
        <div style={{ overflowY: 'auto', borderRight: '1px solid var(--border)' }}><ProductsPanel /></div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><CartPanel /></div>
      </div>

      {/* Mobile */}
      <div className="caisse-mobile" style={{ display: 'none', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <button onClick={() => setShowCart(false)}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${!showCart ? 'var(--primary)' : 'transparent'}`, marginBottom: -2, color: !showCart ? 'var(--primary)' : 'var(--text2)', fontWeight: !showCart ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Package size={15} /> Produits ({filtered.length})
          </button>
          <button onClick={() => setShowCart(true)}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${showCart ? 'var(--primary)' : 'transparent'}`, marginBottom: -2, color: showCart ? 'var(--primary)' : 'var(--text2)', fontWeight: showCart ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ShoppingCart size={15} /> Panier
            {totalItems > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {showCart ? <CartPanel /> : <ProductsPanel />}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .caisse-desktop { display: none !important; }
          .caisse-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}