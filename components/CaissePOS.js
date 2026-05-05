import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import s from '../styles/shared.module.css';

export default function CaissePOS({ addVente }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paiement, setPaiement] = useState('especes');
  const [clientNom, setClientNom] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('produits')
        .select('*, categories(label,icon)')
        .eq('status', 'publie')
        .order('name');
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.categories?.label?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const processVente = () => {
    if (cart.length === 0) return;
    const vente = {
      id: Date.now(),
      articles: cart,
      total,
      clientNom: clientNom || 'Client anonyme',
      paiement,
      date: new Date().toISOString(),
      numero: 'V-' + Date.now().toString().slice(-6),
    };
    addVente(vente);
    setReceipt(vente);
    setCart([]);
    setClientNom('');
  };

  if (receipt) return (
    <div style={{ padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>✅</div>
        <h2 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Vente enregistrée !</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 20 }}>Reçu #{receipt.numero}</div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>S.S.I — Seye Senghor Informatique</div>
          {receipt.articles.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '4px 0', borderBottom: '1px dashed var(--border)', color: 'var(--text)' }}>
              <span>{a.name} x{a.qty}</span>
              <span>{(a.price * a.qty).toLocaleString('fr-FR')} F</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>
            <span>TOTAL</span>
            <span style={{ color: 'var(--primary)' }}>{receipt.total.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text3)' }}>Client: {receipt.clientNom} · {receipt.paiement}</div>
        </div>
        <button className={s.btnPrimary} onClick={() => setReceipt(null)} style={{ width: '100%', justifyContent: 'center' }}>
          + Nouvelle vente
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 0, height: 'calc(100vh - 72px)' }}>
      {/* Products panel */}
      <div style={{ padding: 20, overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 14 }}>
          <input className={s.formInput} placeholder="🔍 Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
            <p>Chargement des produits...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
            <p>Aucun produit trouvé</p> b b



































            
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s,transform 0.15s', display: 'flex', flexDirection: 'column', gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: '100%', height: 90, background: 'var(--bg3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', opacity: 0.3 }}>💻</div>
                )}
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{p.name}</div>
                {p.storage && <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>{p.storage}</div>}
                {p.categories && <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{p.categories.icon} {p.categories.label}</div>}
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>{p.price.toLocaleString('fr-FR')} F</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart panel */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
          🛒 Panier ({cart.length} article{cart.length > 1 ? 's' : ''})
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: '0.875rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛒</div>
              Cliquez sur un produit pour l'ajouter
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, background: 'var(--bg3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>💻</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{(item.price * item.qty).toLocaleString('fr-FR')} F</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 16, textAlign: 'center', color: 'var(--text)' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', border: 'none', color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}>✕</button>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className={s.formInput} placeholder="Nom du client (optionnel)" value={clientNom} onChange={e => setClientNom(e.target.value)} />
          <select className={s.formInput} value={paiement} onChange={e => setPaiement(e.target.value)}>
            <option value="especes">💵 Espèces</option>
            <option value="wave">📱 Wave</option>
            <option value="orange_money">🔶 Orange Money</option>
            <option value="carte">💳 Carte bancaire</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <button onClick={processVente} disabled={cart.length === 0}
            style={{ width: '100%', background: cart.length === 0 ? 'var(--border)' : 'var(--green)', color: cart.length === 0 ? 'var(--text3)' : '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: '1rem', fontWeight: 700, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>
            ✅ Valider la vente
          </button>
          {cart.length > 0 && <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.8rem', cursor: 'pointer' }}>🗑 Vider le panier</button>}
        </div>
      </div>
    </div>
  );
}