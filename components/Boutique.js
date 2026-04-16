import { useState, useMemo } from 'react';
import { products, categories, STORE } from '../data/products';
import s from '../styles/shared.module.css';

function ProductModal({ product, onClose }) {
  if (!product) return null;
  const msg = encodeURIComponent(`Bonjour SSI, je suis intéressé par ${product.name}${product.storage ? ' ' + product.storage : ''} à ${product.price.toLocaleString('fr-FR')} FCFA. Est-il disponible ?`);
  const waLink = `https://wa.me/${STORE.whatsapp}?text=${msg}`;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div style={{background:'var(--surface)',width:'100%',maxWidth:460,borderRadius:16,overflow:'hidden',position:'relative',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:'absolute',top:10,right:10,zIndex:10,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:'50%',width:32,height:32,fontSize:'0.9rem',cursor:'pointer'}}>✕</button>
        <div style={{height:260,overflow:'hidden',background:'var(--bg3)'}}>
          <img src={product.image} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        </div>
        <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
          <h2 style={{fontSize:'1.3rem',fontWeight:800,color:'var(--text)'}}>{product.name}</h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[product.brand, product.storage, product.color].filter(Boolean).map(t=>(
              <span key={t} style={{background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:'0.8rem',fontWeight:500,padding:'4px 12px',borderRadius:20}}>{t}</span>
            ))}
            <span style={{background:'var(--green-light)',border:'1px solid var(--green)',color:'var(--green)',fontSize:'0.8rem',fontWeight:600,padding:'4px 12px',borderRadius:20}}>Disponible</span>
          </div>
          <p style={{fontSize:'0.875rem',color:'var(--text2)',lineHeight:1.7}}>{product.description}</p>
          <div style={{fontSize:'1.6rem',fontWeight:800,color:'var(--primary)'}}>{product.price.toLocaleString('fr-FR')} FCFA</div>
          <a href={waLink} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'var(--green)',color:'#fff',borderRadius:12,padding:15,fontSize:'1rem',fontWeight:700,textDecoration:'none'}}>
            💬 Contacter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Boutique() {
  const [activeCategory, setActiveCategory] = useState('ordinateurs');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showHero, setShowHero] = useState(true);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.storage?.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, search]);

  const totalCount = products.filter(p => p.category === activeCategory).length;

  return (
    <>
      <div style={{borderBottom:'1px solid var(--border)',padding:'0 24px'}}>
        <div style={{position:'relative',padding:'12px 0'}}>
          <span style={{position:'absolute',left:2,top:'50%',transform:'translateY(-50%)',fontSize:'0.85rem',pointerEvents:'none'}}>🔍</span>
          <input style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px 10px 28px',fontSize:'0.875rem',color:'var(--text)'}} placeholder="Rechercher un produit..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{display:'flex',flexWrap:'wrap',padding:'0 24px',borderBottom:'2px solid var(--border)',gap:0}}>
        {categories.map(cat=>(
          <button key={cat.id} onClick={()=>{setActiveCategory(cat.id);setShowHero(false);}}
            style={{display:'flex',alignItems:'center',gap:6,padding:'12px 14px',background:'none',border:'none',borderBottom:`2px solid ${activeCategory===cat.id?'var(--primary)':'transparent'}`,marginBottom:-2,color:activeCategory===cat.id?'var(--primary)':'var(--text2)',fontSize:'0.82rem',fontWeight:activeCategory===cat.id?700:500,cursor:'pointer',whiteSpace:'nowrap'}}>
            <span>{cat.icon}</span>{cat.label}
            <span style={{background:activeCategory===cat.id?'var(--primary)':'var(--primary-light)',color:activeCategory===cat.id?'#fff':'var(--primary)',borderRadius:20,padding:'1px 7px',fontSize:'0.7rem',fontWeight:600}}>{cat.count}</span>
          </button>
        ))}
      </div>

      {showHero && activeCategory==='ordinateurs' && (
        <div style={{background:'linear-gradient(135deg,#1e2a4a 0%,#0f172a 70%,#0a1a0a 100%)',margin:'20px 24px',borderRadius:16,padding:32,color:'#fff'}}>
          <div style={{fontSize:'0.68rem',fontWeight:700,color:'#93c5fd',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:10}}>BIENVENUE CHEZ</div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
            <div style={{width:52,height:52,borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(255,255,255,0.3)',flexShrink:0}}>
              <img src="/logo.png" alt="SSI" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
            <h1 style={{fontSize:'1.4rem',fontWeight:800,color:'#fff',lineHeight:1.2}}>SEYE SENGHOR<br/>INFORMATIQUE</h1>
          </div>
          <p style={{fontSize:'0.875rem',color:'#cbd5e1',lineHeight:1.7,marginBottom:14}}>
            Votre magasin de matériel informatique à Keur Massar :<br/>
            <strong style={{color:'#fff'}}>💻 Ordinateurs · Smartphones · Accessoires</strong>
          </p>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {['Large choix d\'ordinateurs et accessoires','Produits testés et garantis','Livraison et installation disponibles','Meilleurs prix du marché à Dakar'].map(t=>(
              <li key={t} style={{display:'flex',alignItems:'center',gap:10,fontSize:'0.85rem',color:'#e2e8f0'}}><span style={{color:'#818cf8'}}>✔</span>{t}</li>
            ))}
          </ul>
          <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:16}}>
            <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>📍 Keur Massar au rond-point, Dakar</span>
            <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>☎️ {STORE.phone}</span>
          </div>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(217,119,6,0.2)',border:'1px solid rgba(217,119,6,0.4)',color:'#fbbf24',fontSize:'0.8rem',fontWeight:600,padding:'6px 14px',borderRadius:20,marginBottom:24}}>🔥 Nouveaux arrivages chaque semaine</div>
          <div style={{display:'flex',gap:12}}>
            <button onClick={()=>setShowHero(false)} style={{flex:1,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:14,color:'#fff',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',lineHeight:1.6}}>
              🗂 Catalogue<br/><small style={{fontWeight:400,color:'#94a3b8',fontSize:'0.72rem',display:'block'}}>Parcourez votre matériel</small>
            </button>
            <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer" style={{flex:1,background:'#16a34a',border:'1px solid #16a34a',borderRadius:10,padding:14,color:'#fff',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',lineHeight:1.6,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>
              💬 WhatsApp<br/><small style={{fontWeight:400,color:'rgba(255,255,255,0.7)',fontSize:'0.72rem'}}>Commandez directement</small>
            </a>
          </div>
        </div>
      )}

      <div style={{padding:'12px 24px',fontSize:'0.875rem',color:'var(--text2)',fontWeight:500}}>{totalCount} articles</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,padding:'0 24px 40px'}}>
        {filtered.map(product=>(
          <div key={product.id} onClick={()=>setSelectedProduct(product)} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'box-shadow 0.2s,transform 0.2s',boxShadow:'var(--shadow)'}}>
            <div style={{position:'relative',height:185,overflow:'hidden',background:'var(--bg3)'}}>
              <img src={product.image} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              {product.status==='dispo'&&<span style={{position:'absolute',top:10,left:10,background:'var(--green)',color:'#fff',fontSize:'0.62rem',fontWeight:700,padding:'3px 8px',borderRadius:4,letterSpacing:'0.05em'}}>DISPO</span>}
            </div>
            <div style={{padding:12,display:'flex',flexDirection:'column',gap:6}}>
              <h3 style={{fontSize:'0.88rem',fontWeight:700,color:'var(--text)',lineHeight:1.3}}>{product.name}</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                <span style={{fontSize:'0.7rem',color:'var(--text3)',background:'var(--bg3)',padding:'2px 7px',borderRadius:4}}>{product.brand}</span>
                {product.storage&&<span style={{fontSize:'0.7rem',color:'var(--text3)',background:'var(--bg3)',padding:'2px 7px',borderRadius:4}}>{product.storage}</span>}
              </div>
              <div style={{fontSize:'1rem',fontWeight:700,color:'var(--primary)'}}>{product.price.toLocaleString('fr-FR')} FCFA</div>
              <button onClick={e=>{e.stopPropagation();const msg=encodeURIComponent(`Bonjour SSI, je suis intéressé par ${product.name}${product.storage?' '+product.storage:''} à ${product.price.toLocaleString('fr-FR')} FCFA.`);window.open(`https://wa.me/${STORE.whatsapp}?text=${msg}`,'_blank');}}
                style={{width:'100%',background:'var(--green)',color:'#fff',border:'none',borderRadius:8,padding:9,fontSize:'0.82rem',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                💬 Contacteur
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length===0&&<div className={s.empty}><span className={s.emptyIcon}>🔍</span><p>Aucun produit trouvé</p></div>}
      {selectedProduct&&<ProductModal product={selectedProduct} onClose={()=>setSelectedProduct(null)} />}
    </>
  );
}
