import { STORE } from '../data/products';
import s from '../styles/shared.module.css';

export default function Actions({ setActiveMenu, ventes, clients, factures, depenses }) {
  const actions = [
    { icon: '🛒', label: 'Nouvelle vente', desc: 'Ouvrir la caisse POS', color: '#16a34a', menu: 'caisse' },
    { icon: '👤', label: 'Ajouter un client', desc: 'Créer une fiche client', color: '#1a56db', menu: 'clients' },
    { icon: '📄', label: 'Créer une facture', desc: 'Émettre une facture', color: '#7c3aed', menu: 'factures' },
    { icon: '📋', label: 'Nouveau devis', desc: 'Préparer un devis', color: '#0891b2', menu: 'devis' },
    { icon: '💰', label: 'Enregistrer dépense', desc: 'Ajouter une dépense', color: '#dc2626', menu: 'depenses' },
    { icon: '📅', label: 'Planifier évènement', desc: 'Créer un évènement', color: '#d97706', menu: 'events' },
    { icon: '📊', label: 'Voir les rapports', desc: 'Statistiques & analyses', color: '#059669', menu: 'rapports' },
    { icon: '🏪', label: 'Ouvrir la boutique', desc: 'Parcourir le catalogue', color: '#6d28d9', menu: 'boutique' },
  ];

  const recentVentes = ventes.slice(0, 3);
  const now = new Date();
  const caMois = ventes.filter(v => {
    const d = new Date(v.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, v) => s + v.total, 0);

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle} style={{ marginBottom: 8 }}><span>⚡</span> Actions rapides</h1>
      <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginBottom: 24 }}>Accès direct aux fonctions principales</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 32 }}>
        {actions.map(a => (
          <button key={a.menu} onClick={() => setActiveMenu(a.menu)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'left', cursor: 'pointer', transition: 'box-shadow 0.2s,transform 0.15s', display: 'flex', flexDirection: 'column', gap: 10 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
          >
            <div style={{ width: 44, height: 44, background: a.color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{a.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2 }}>{a.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{a.desc}</div>
            </div>
            <div style={{ color: a.color, fontSize: '0.8rem', fontWeight: 600 }}>Ouvrir →</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className={s.card}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>📊 Résumé du jour</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Ventes ce mois', val: `${(caMois / 1000).toFixed(0)}K FCFA`, icon: '💰' },
              { label: 'Nb ventes ce mois', val: ventes.filter(v => { const d = new Date(v.date); return d.getMonth() === now.getMonth(); }).length, icon: '🛒' },
              { label: 'Total clients', val: clients.length, icon: '👥' },
              { label: 'Factures en attente', val: factures.filter(f => f.statut === 'en_attente').length, icon: '📄' },
            ].map(({ label, val, icon }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{icon} {label}</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.card}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>🕐 Dernières ventes</div>
          {recentVentes.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>Aucune vente enregistrée</div>
          ) : recentVentes.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{v.clientNom}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{new Date(v.date).toLocaleDateString('fr-FR')}</div>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{v.total.toLocaleString('fr-FR')} F</span>
            </div>
          ))}
          <button className={s.btnOutline} style={{ marginTop: 12, width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setActiveMenu('rapports')}>
            Voir tous les rapports →
          </button>
        </div>
      </div>

      <div className={s.card} style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>📞 Contact rapide</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '10px 18px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            💬 WhatsApp {STORE.phone}
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 18px', fontSize: '0.8rem', color: 'var(--text2)' }}>
            📍 {STORE.location}
          </div>
        </div>
      </div>
    </div>
  );
}
