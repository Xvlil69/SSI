import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import s from '../styles/shared.module.css';

export default function Rapports() {
  const [ventes, setVentes] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const load = async () => {
    const [{ data: v }, { data: d }, { data: c }, { data: f }] = await Promise.all([
      supabase.from('ventes').select('*').order('created_at', { ascending: false }),
      supabase.from('depenses').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('factures').select('*').order('created_at', { ascending: false }),
    ]);
    setVentes(v || []);
    setDepenses(d || []);
    setClients(c || []);
    setFactures(f || []);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Realtime subscriptions
    const channel = supabase.channel('rapports-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ventes' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'depenses' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'factures' }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const now = new Date();
  const thisMonth = (d) => {
    const dd = new Date(d);
    return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
  };

  const caTotal = ventes.reduce((s, v) => s + (v.total || 0), 0);
  const caMois = ventes.filter(v => thisMonth(v.created_at)).reduce((s, v) => s + (v.total || 0), 0);
  const depTotal = depenses.reduce((s, d) => s + (d.montant || 0), 0);
  const depMois = depenses.filter(d => thisMonth(d.created_at || d.date)).reduce((s, d) => s + (d.montant || 0), 0);
  const beneficeMois = caMois - depMois;
  const nbVentesMois = ventes.filter(v => thisMonth(v.created_at)).length;
  const panierMoyen = nbVentesMois > 0 ? caMois / nbVentesMois : 0;

  // Top produits
  const prodCount = {};
  ventes.forEach(v => {
    try {
      const articles = typeof v.articles === 'string' ? JSON.parse(v.articles) : v.articles;
      if (Array.isArray(articles)) {
        articles.forEach(a => {
          prodCount[a.name] = (prodCount[a.name] || 0) + (a.qty || 1);
        });
      }
    } catch {}
  });
  const topProduits = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Ventes 7 derniers jours
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const ventesByDay = last7.map(day => ({
    day,
    label: new Date(day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    total: ventes.filter(v => (v.created_at || '').slice(0, 10) === day).reduce((s, v) => s + (v.total || 0), 0),
  }));

  const maxVente = Math.max(...ventesByDay.map(v => v.total), 1);

  if (loading) return (
    <div className={s.page}>
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
        <p>Chargement des rapports...</p>
      </div>
    </div>
  );

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}><span>📊</span> Rapports & Statistiques</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Temps réel · Màj {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button onClick={load} style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <span className={s.statIcon}>💰</span>
          <span className={s.statNum}>{(caMois / 1000).toFixed(0)}K</span>
          <span className={s.statLabel}>CA ce mois (FCFA)</span>
          <span className={s.statSub}>Total: {(caTotal / 1000).toFixed(0)}K FCFA</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>📉</span>
          <span className={s.statNum} style={{ color: 'var(--red)' }}>{(depMois / 1000).toFixed(0)}K</span>
          <span className={s.statLabel}>Dépenses ce mois</span>
          <span className={s.statSub}>Total: {(depTotal / 1000).toFixed(0)}K FCFA</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>✨</span>
          <span className={s.statNum} style={{ color: beneficeMois >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {beneficeMois >= 0 ? '+' : ''}{(beneficeMois / 1000).toFixed(0)}K
          </span>
          <span className={s.statLabel}>Bénéfice net</span>
          <span className={s.statSub} style={{ color: beneficeMois >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {beneficeMois >= 0 ? '▲ Positif' : '▼ Négatif'}
          </span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>🛒</span>
          <span className={s.statNum}>{nbVentesMois}</span>
          <span className={s.statLabel}>Ventes ce mois</span>
          <span className={s.statSub}>Total: {ventes.length} ventes</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>🧾</span>
          <span className={s.statNum}>{(panierMoyen / 1000).toFixed(0)}K</span>
          <span className={s.statLabel}>Panier moyen</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>👥</span>
          <span className={s.statNum}>{clients.length}</span>
          <span className={s.statLabel}>Total clients</span>
          <span className={s.statSub}>
            {clients.filter(c => thisMonth(c.created_at)).length} ce mois
          </span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>📄</span>
          <span className={s.statNum}>{factures.filter(f => f.statut === 'en_attente').length}</span>
          <span className={s.statLabel}>Factures en attente</span>
          <span className={s.statSub}>{factures.filter(f => f.statut === 'payee').length} payées</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statIcon}>💳</span>
          <span className={s.statNum}>
            {(factures.filter(f => f.statut === 'payee').reduce((s, f) => s + (f.total || 0), 0) / 1000).toFixed(0)}K
          </span>
          <span className={s.statLabel}>CA factures (FCFA)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Bar chart */}
        <div className={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>📈 Ventes — 7 derniers jours</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>FCFA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {ventesByDay.map(v => (
              <div key={v.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.58rem', color: 'var(--text3)', fontWeight: 600, textAlign: 'center' }}>
                  {v.total > 0 ? (v.total / 1000).toFixed(0) + 'K' : ''}
                </div>
                <div style={{ width: '100%', background: v.total > 0 ? 'var(--primary)' : 'var(--border)', borderRadius: '4px 4px 0 0', height: `${Math.max(4, (v.total / maxVente) * 90)}px`, transition: 'height 0.5s ease' }} />
                <div style={{ fontSize: '0.58rem', color: 'var(--text3)', textAlign: 'center' }}>{v.label}</div>
              </div>
            ))}
          </div>
          {ventesByDay.every(v => v.total === 0) && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.8rem', marginTop: 12 }}>Aucune vente cette semaine</div>
          )}
        </div>

        {/* Top produits */}
        <div className={s.card}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>🏆 Top 5 produits vendus</div>
          {topProduits.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              Aucune vente enregistrée
            </div>
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
        <div style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🕐 Dernières ventes</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 400 }}>{ventes.length} au total</span>
        </div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Articles</th>
              <th>Paiement</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ventes.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucune vente enregistrée</td></tr>
            ) : ventes.slice(0, 15).map(v => {
              const articles = typeof v.articles === 'string' ? JSON.parse(v.articles || '[]') : (v.articles || []);
              return (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.numero || '—'}</td>
                  <td>{v.client_nom || v.clientNom || '—'}</td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{Array.isArray(articles) ? articles.length : '—'} article{Array.isArray(articles) && articles.length > 1 ? 's' : ''}</td>
                  <td><span className={`${s.badge} ${s.badgeBlue}`}>{v.paiement || '—'}</span></td>
                  <td style={{ fontWeight: 700 }}>{(v.total || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(v.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}