import { useState } from 'react';
import s from '../styles/shared.module.css';

export default function Clients({ clients, setClients }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', adresse: '' });

  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone.includes(search)
  );

  const save = () => {
    if (!form.nom.trim()) return;
    if (editId) {
      setClients(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setClients(prev => [...prev, { id: Date.now(), ...form, dateAjout: new Date().toISOString() }]);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ nom: '', telephone: '', email: '', adresse: '' });
  };

  const edit = (c) => {
    setForm({ nom: c.nom, telephone: c.telephone, email: c.email, adresse: c.adresse });
    setEditId(c.id);
    setShowForm(true);
  };

  const del = (id) => {
    if (confirm('Supprimer ce client ?')) setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}><span>👥</span> Clients</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className={s.searchBar}>
            <input placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={s.btnPrimary} onClick={() => { setShowForm(true); setEditId(null); setForm({ nom: '', telephone: '', email: '', adresse: '' }); }}>
            + Nouveau client
          </button>
        </div>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}><span className={s.statIcon}>👥</span><span className={s.statNum}>{clients.length}</span><span className={s.statLabel}>Total clients</span></div>
        <div className={s.statCard}><span className={s.statIcon}>📅</span><span className={s.statNum}>{clients.filter(c => new Date(c.dateAjout) > new Date(Date.now() - 30 * 86400000)).length}</span><span className={s.statLabel}>Ce mois</span></div>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Adresse</th>
              <th>Date ajout</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Aucun client trouvé</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td><strong>{c.nom}</strong></td>
                <td>{c.telephone || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>{c.adresse || '—'}</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(c.dateAjout).toLocaleDateString('fr-FR')}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className={s.btnOutline} style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => edit(c)}>✏️ Modifier</button>
                  <button className={s.btnDanger} onClick={() => del(c.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={s.overlay} onClick={() => setShowForm(false)}>
          <div className={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>{editId ? '✏️ Modifier le client' : '➕ Nouveau client'}</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Nom complet *</label>
                <input className={s.formInput} placeholder="Ex: Moussa Diop" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Téléphone</label>
                <input className={s.formInput} placeholder="77 000 00 00" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Email</label>
                <input className={s.formInput} placeholder="email@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Adresse</label>
                <input className={s.formInput} placeholder="Quartier, Ville" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
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
