import { useState } from 'react';
import s from '../styles/shared.module.css';

export default function Devis({ devis, setDevis, setFactures, clients }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ clientNom: '', articles: [{ desc: '', qty: 1, prix: '' }], validite: 30 });

  const addLine = () => setForm(f => ({ ...f, articles: [...f.articles, { desc: '', qty: 1, prix: '' }] }));
  const updateLine = (i, field, val) => setForm(f => ({ ...f, articles: f.articles.map((a, idx) => idx === i ? { ...a, [field]: val } : a) }));
  const removeLine = (i) => setForm(f => ({ ...f, articles: f.articles.filter((_, idx) => idx !== i) }));
  const totalForm = form.articles.reduce((sum, a) => sum + (parseFloat(a.prix) || 0) * (parseInt(a.qty) || 0), 0);

  const save = () => {
    if (!form.clientNom.trim()) return;
    setDevis(prev => [{
      id: Date.now(),
      numero: 'DEV-' + Date.now().toString().slice(-6),
      clientNom: form.clientNom,
      articles: form.articles.filter(a => a.desc),
      total: totalForm,
      validite: form.validite,
      statut: 'en_attente',
      date: new Date().toISOString(),
    }, ...prev]);
    setShowForm(false);
    setForm({ clientNom: '', articles: [{ desc: '', qty: 1, prix: '' }], validite: 30 });
  };

  const convertToFacture = (d) => {
    setFactures(prev => [{
      id: Date.now(),
      numero: 'FAC-' + Date.now().toString().slice(-6),
      clientNom: d.clientNom,
      articles: d.articles,
      total: d.total,
      statut: 'en_attente',
      date: new Date().toISOString(),
    }, ...prev]);
    setDevis(prev => prev.map(x => x.id === d.id ? { ...x, statut: 'converti' } : x));
    alert('✅ Devis converti en facture !');
  };

  const del = (id) => { if (confirm('Supprimer ?')) setDevis(prev => prev.filter(d => d.id !== id)); };
  const filtered = devis.filter(d => d.clientNom.toLowerCase().includes(search.toLowerCase()) || d.numero.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}><span>📋</span> Devis</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className={s.searchBar}><input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className={s.btnPrimary} onClick={() => setShowForm(true)}>+ Nouveau devis</button>
        </div>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}><span className={s.statIcon}>📋</span><span className={s.statNum}>{devis.length}</span><span className={s.statLabel}>Total devis</span></div>
        <div className={s.statCard}><span className={s.statIcon}>✅</span><span className={s.statNum}>{devis.filter(d=>d.statut==='converti').length}</span><span className={s.statLabel}>Convertis</span></div>
        <div className={s.statCard}><span className={s.statIcon}>⏳</span><span className={s.statNum}>{devis.filter(d=>d.statut==='en_attente').length}</span><span className={s.statLabel}>En attente</span></div>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Validité</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucun devis</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{d.numero}</td>
                <td>{d.clientNom}</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{d.validite} jours</td>
                <td style={{ fontWeight: 700 }}>{d.total.toLocaleString('fr-FR')} FCFA</td>
                <td>
                  <span className={`${s.badge} ${d.statut === 'converti' ? s.badgeGreen : d.statut === 'refuse' ? s.badgeRed : s.badgeOrange}`}>
                    {d.statut === 'converti' ? '✅ Converti' : d.statut === 'refuse' ? '❌ Refusé' : '⏳ En attente'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {d.statut === 'en_attente' && (
                    <button className={s.btnGreen} style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => convertToFacture(d)}>→ Facture</button>
                  )}
                  <button className={s.btnDanger} onClick={() => del(d.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={s.overlay} onClick={() => setShowForm(false)}>
          <div className={s.modalBox} style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>📋 Nouveau devis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 16 }}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Client *</label>
                <input className={s.formInput} placeholder="Nom du client" value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))} list="clients-list2" />
                <datalist id="clients-list2">{clients.map(c => <option key={c.id} value={c.nom} />)}</datalist>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Validité (jours)</label>
                <input className={s.formInput} type="number" value={form.validite} onChange={e => setForm(f => ({ ...f, validite: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              {form.articles.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8, marginBottom: 6 }}>
                  <input className={s.formInput} placeholder="Description article..." value={a.desc} onChange={e => updateLine(i, 'desc', e.target.value)} />
                  <input className={s.formInput} type="number" min="1" value={a.qty} onChange={e => updateLine(i, 'qty', e.target.value)} />
                  <input className={s.formInput} type="number" placeholder="Prix" value={a.prix} onChange={e => updateLine(i, 'prix', e.target.value)} />
                  <button onClick={() => removeLine(i)} style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                </div>
              ))}
              <button className={s.btnOutline} onClick={addLine} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>+ Ligne</button>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>Total: {totalForm.toLocaleString('fr-FR')} FCFA</div>
            <div className={s.modalFooter}>
              <button className={s.btnOutline} onClick={() => setShowForm(false)}>Annuler</button>
              <button className={s.btnPrimary} onClick={save}>💾 Créer le devis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
