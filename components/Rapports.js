import s from '../styles/shared.module.css';

export default function Rapports({ ventes, depenses, clients, factures }) {
  const now = new Date();
  const thisMonth = (d) => { const dd = new Date(d); return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear(); };

  const caTotal = ventes.reduce((s, v) => s + v.total, 0);
  const caMois = ventes.filter(v => thisMonth(v.date)).reduce((s, v) => s + v.total, 0);
  const depTotal = depenses.reduce((s, d) => s + d.montant, 0);
  const depMois = depenses.filter(d => thisMonth(d.date)).reduce((s, d) => s + d.montant, 0);
  const beneficeMois = caMois - depMois;
  const nbVentesMois = ventes.filter(v => thisMonth(v.date)).length;
  const panierMoyen = nbVentesMois > 0 ? caMois / nbVentesMois : 0;

  // Top produits
  const prodCount = {};
  ventes.forEach(v => v.articles?.forEach(a => {
    prodCount[a.name] = (prodCount[a.name] || 0) + (a.qty || 1);
  }));
  const topProduits = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Ventes par jour (7 derniers jours)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const ventesByDay = last7.map(day => ({
    day,
    label: new Date(day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    total: ventes.filter(v => v.date?.slice(0, 10) === day).reduce((s, v) => s + v.total, 0),
  }));

  const maxVente = Math.max(...ventesByDay.map(v => v.total), 1);

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle} style={{ marginBottom: 24 }}><span>📊</span> Rapports & Statistiques</h1>

      <div className={s.statsGrid}>
        <div className={s.statCard}><span className={s.statIcon}>💰</span><span className={s.statNum}>{(caMois / 1000).toFixed(0)}K</span><span className={s.statLabel}>CA ce mois (FCFA)</span><span className={s.statSub}>Total: {(caTotal / 1000).toFixed(0)}K FCFA</span></div>
        <div className={s.statCard}><span className={s.statIcon}>📉</span><span className={s.statNum} style={{ color: 'var(--red)' }}>{(depMois / 1000).toFixed(0)}K</span><span className={s.statLabel}>Dépenses ce mois</span></div>
        <div className={s.statCard}><span className={s.statIcon}>✨</span><span className={s.statNum} style={{ color: beneficeMois >= 0 ? 'var(--green)' : 'var(--red)' }}>{(beneficeMois / 1000).toFixed(0)}K</span><span className={s.statLabel}>Bénéfice net</span></div>
        <div className={s.statCard}><span className={s.statIcon}>🛒</span><span className={s.statNum}>{nbVentesMois}</span><span className={s.statLabel}>Ventes ce mois</span></div>
        <div className={s.statCard}><span className={s.statIcon}>🧾</span><span className={s.statNum}>{(panierMoyen / 1000).toFixed(0)}K</span><span className={s.statLabel}>Panier moyen</span></div>
        <div className={s.statCard}><span className={s.statIcon}>👥</span><span className={s.statNum}>{clients.length}</span><span className={s.statLabel}>Clients total</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Bar chart */}
        <div className={s.card}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>📈 Ventes — 7 derniers jours</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {ventesByDay.map(v => (
              <div key={v.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 600 }}>{v.total > 0 ? (v.total / 1000).toFixed(0) + 'K' : ''}</div>
                <div style={{ width: '100%', background: v.total > 0 ? 'var(--primary)' : 'var(--border)', borderRadius: '4px 4px 0 0', height: `${Math.max(4, (v.total / maxVente) * 90)}px`, transition: 'height 0.5s' }} />
                <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textAlign: 'center' }}>{v.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top produits */}
        <div className={s.card}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>🏆 Top 5 produits vendus</div>
          {topProduits.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>Aucune vente enregistrée</div>
          ) : topProduits.map(([name, count], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < topProduits.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: ['#FFD700', '#C0C0C0', '#CD7F32', 'var(--text3)', 'var(--text3)'][i], minWidth: 20 }}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text)', fontWeight: 500 }}>{name}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>{count} vente{count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dernières ventes */}
      <div className={s.tableWrap}>
        <div style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>🕐 Dernières ventes</div>
        <table className={s.table}>
          <thead><tr><th>N°</th><th>Client</th><th>Articles</th><th>Paiement</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>
            {ventes.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucune vente enregistrée</td></tr>
            ) : ventes.slice(0, 10).map(v => (
              <tr key={v.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.numero}</td>
                <td>{v.clientNom}</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{v.articles?.length} article{v.articles?.length > 1 ? 's' : ''}</td>
                <td><span className={`${s.badge} ${s.badgeBlue}`}>{v.paiement}</span></td>
                <td style={{ fontWeight: 700 }}>{v.total.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(v.date).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
