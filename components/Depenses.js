import { useState } from 'react';
import s from '../styles/shared.module.css';

const CAT_DEPENSES = ['Achat stock', 'Loyer', 'Transport', 'Salaires', 'Électricité/Eau', 'Internet/Téléphone', 'Marketing', 'Maintenance', 'Autre'];

export default function Depenses({ depenses, setDepenses }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ description: '', categorie: 'Achat stock', montant: '', date: new Date().toISOString().slice(0, 10) });

  const save = () => {
    if (!form.description.trim() || !form.montant) return;
    setDepenses(prev => [{ id: Date.now(), ...form, montant: parseFloat(form.montant) }, ...prev]);
    setShowForm(false);
    setForm({ description: '', categorie: 'Achat stock', montant: '', date: new Date().toISOString().slice(0, 10) });
  };

  const del = (id) => { if (confirm('Supprimer ?')) setDepenses(prev => prev.filter(d => d.id !== id)); };

  const filtered = depenses.filter(d =>
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.categorie.toLowerCase().includes(search.toLowerCase())
  );

  const totalMois = depenses.filter(d => {
    const m = new Date().getMonth();
    const y = new Date().getFullYear();
    const dd = new Date(d.date);
    return dd.getMonth() === m && dd.getFullYear() === y;
  }).reduce((s, d) => s + d.montant, 0);

  const totalAll = depenses.reduce((s, d) => s + d.montant, 0);

  const byCategorie = CAT_DEPENSES.map(cat => ({
    cat,
    total: depenses.filter(d => d.categorie === cat).reduce((s, d) => s + d.montant, 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}><span>💰</span> Dépenses</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className={s.searchBar}><input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className={s.btnPrimary} onClick={() => setShowForm(true)}>+ Nouvelle dépense</button>
        </div>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}><span className={s.statIcon}>📅</span><span className={s.statNum}>{(totalMois / 1000).toFixed(0)}K</span><span className={s.statLabel}>Ce mois (FCFA)</span></div>
        <div className={s.statCard}><span className={s.statIcon}>📊</span><span className={s.statNum}>{(totalAll / 1000).toFixed(0)}K</span><span className={s.statLabel}>Total (FCFA)</span></div>
        <div className={s.statCard}><span className={s.statIcon}>🧾</span><span className={s.statNum}>{depenses.length}</span><span className={s.statLabel}>Transactions</span></div>
      </div>

      {byCategorie.length > 0 && (
        <div className={s.card} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>📊 Par catégorie</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {byCategorie.map(({ cat, total }) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text2)' }}>{cat}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 3, width: `${Math.min(100, (total / totalAll) * 100)}%`, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Montant</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucune dépense enregistrée</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                <td style={{ fontWeight: 500 }}>{d.description}</td>
                <td><span className={`${s.badge} ${s.badgeBlue}`}>{d.categorie}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--red)' }}>-{d.montant.toLocaleString('fr-FR')} FCFA</td>
                <td><button className={s.btnDanger} onClick={() => del(d.id)}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={s.overlay} onClick={() => setShowForm(false)}>
          <div className={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>💰 Nouvelle dépense</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup} style={{ gridColumn: '1/-1' }}>
                <label className={s.formLabel}>Description *</label>
                <input className={s.formInput} placeholder="Ex: Achat 5 ordinateurs HP" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Catégorie</label>
                <select className={s.formInput} value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
                  {CAT_DEPENSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Montant (FCFA) *</label>
                <input className={s.formInput} type="number" placeholder="0" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Date</label>
                <input className={s.formInput} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnOutline} onClick={() => setShowForm(false)}>Annuler</button>
              <button className={s.btnPrimary} onClick={save}>💾 Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
