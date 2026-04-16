import { useState } from 'react';
import s from '../styles/shared.module.css';

export default function Factures({ factures, setFactures, clients, ventes }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ clientNom: '', articles: [{ desc: '', qty: 1, prix: '' }], statut: 'en_attente' });

  const addLine = () => setForm(f => ({ ...f, articles: [...f.articles, { desc: '', qty: 1, prix: '' }] }));
  const updateLine = (i, field, val) => setForm(f => ({ ...f, articles: f.articles.map((a, idx) => idx === i ? { ...a, [field]: val } : a) }));
  const removeLine = (i) => setForm(f => ({ ...f, articles: f.articles.filter((_, idx) => idx !== i) }));

  const totalForm = form.articles.reduce((sum, a) => sum + (parseFloat(a.prix) || 0) * (parseInt(a.qty) || 0), 0);

  const save = () => {
    if (!form.clientNom.trim()) return;
    const facture = {
      id: Date.now(),
      numero: 'FAC-' + Date.now().toString().slice(-6),
      clientNom: form.clientNom,
      articles: form.articles.filter(a => a.desc),
      total: totalForm,
      statut: form.statut,
      date: new Date().toISOString(),
    };
    setFactures(prev => [facture, ...prev]);
    setShowForm(false);
    setForm({ clientNom: '', articles: [{ desc: '', qty: 1, prix: '' }], statut: 'en_attente' });
  };

  const updateStatut = (id, statut) => setFactures(prev => prev.map(f => f.id === id ? { ...f, statut } : f));
  const del = (id) => { if (confirm('Supprimer ?')) setFactures(prev => prev.filter(f => f.id !== id)); };

  const filtered = factures.filter(f =>
    f.clientNom.toLowerCase().includes(search.toLowerCase()) ||
    f.numero.toLowerCase().includes(search.toLowerCase())
  );

  const totalCA = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.total, 0);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}><span>📄</span> Factures</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className={s.searchBar}><input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className={s.btnPrimary} onClick={() => setShowForm(true)}>+ Nouvelle facture</button>
        </div>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}><span className={s.statIcon}>📄</span><span className={s.statNum}>{factures.length}</span><span className={s.statLabel}>Total factures</span></div>
        <div className={s.statCard}><span className={s.statIcon}>✅</span><span className={s.statNum}>{factures.filter(f=>f.statut==='payee').length}</span><span className={s.statLabel}>Payées</span></div>
        <div className={s.statCard}><span className={s.statIcon}>⏳</span><span className={s.statNum}>{factures.filter(f=>f.statut==='en_attente').length}</span><span className={s.statLabel}>En attente</span></div>
        <div className={s.statCard}><span className={s.statIcon}>💰</span><span className={s.statNum}>{(totalCA/1000).toFixed(0)}K</span><span className={s.statLabel}>CA encaissé (FCFA)</span></div>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucune facture</td></tr>
            ) : filtered.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{f.numero}</td>
                <td>{f.clientNom}</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(f.date).toLocaleDateString('fr-FR')}</td>
                <td style={{ fontWeight: 700 }}>{f.total.toLocaleString('fr-FR')} FCFA</td>
                <td>
                  <select value={f.statut} onChange={e => updateStatut(f.id, e.target.value)}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: '0.78rem', color: f.statut === 'payee' ? 'var(--green)' : f.statut === 'annulee' ? 'var(--red)' : 'var(--orange)', cursor: 'pointer' }}>
                    <option value="en_attente">⏳ En attente</option>
                    <option value="payee">✅ Payée</option>
                    <option value="annulee">❌ Annulée</option>
                  </select>
                </td>
                <td><button className={s.btnDanger} onClick={() => del(f.id)}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={s.overlay} onClick={() => setShowForm(false)}>
          <div className={s.modalBox} style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>📄 Nouvelle facture</h3>
            <div className={s.formGroup} style={{ marginBottom: 16 }}>
              <label className={s.formLabel}>Client *</label>
              <input className={s.formInput} placeholder="Nom du client" value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))} list="clients-list" />
              <datalist id="clients-list">{clients.map(c => <option key={c.id} value={c.nom} />)}</datalist>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8, marginBottom: 8 }}>
                <span className={s.formLabel}>Description</span>
                <span className={s.formLabel}>Qté</span>
                <span className={s.formLabel}>Prix unit.</span>
                <span></span>
              </div>
              {form.articles.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8, marginBottom: 6 }}>
                  <input className={s.formInput} placeholder="Article..." value={a.desc} onChange={e => updateLine(i, 'desc', e.target.value)} />
                  <input className={s.formInput} type="number" min="1" value={a.qty} onChange={e => updateLine(i, 'qty', e.target.value)} />
                  <input className={s.formInput} type="number" placeholder="0" value={a.prix} onChange={e => updateLine(i, 'prix', e.target.value)} />
                  <button onClick={() => removeLine(i)} style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                </div>
              ))}
              <button className={s.btnOutline} onClick={addLine} style={{ marginTop: 4, fontSize: '0.8rem', padding: '6px 12px' }}>+ Ajouter une ligne</button>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 16 }}>
              Total: {totalForm.toLocaleString('fr-FR')} FCFA
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnOutline} onClick={() => setShowForm(false)}>Annuler</button>
              <button className={s.btnPrimary} onClick={save}>💾 Créer la facture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
