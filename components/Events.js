import { useState } from 'react';
import s from '../styles/shared.module.css';

export default function Events({ events, setEvents }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', date: '', lieu: '', type: 'vente' });

  const save = () => {
    if (!form.titre.trim()) return;
    setEvents(prev => [{ id: Date.now(), ...form, statut: 'planifie' }, ...prev]);
    setShowForm(false);
    setForm({ titre: '', description: '', date: '', lieu: '', type: 'vente' });
  };

  const toggleStatut = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, statut: e.statut === 'planifie' ? 'termine' : 'planifie' } : e));
  };

  const del = (id) => { if (confirm('Supprimer ?')) setEvents(prev => prev.filter(e => e.id !== id)); };

  const typeLabel = { vente: '🛒 Vente promo', livraison: '🚚 Livraison', maintenance: '🔧 Maintenance', reunion: '👥 Réunion', autre: '📌 Autre' };
  const typeColor = { vente: s.badgeGreen, livraison: s.badgeBlue, maintenance: s.badgeOrange, reunion: s.badgeBlue, autre: s.badgeBlue };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}><span>🛒</span> Évènements</h1>
        <button className={s.btnPrimary} onClick={() => setShowForm(true)}>+ Nouvel évènement</button>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}><span className={s.statIcon}>📅</span><span className={s.statNum}>{events.length}</span><span className={s.statLabel}>Total évènements</span></div>
        <div className={s.statCard}><span className={s.statIcon}>✅</span><span className={s.statNum}>{events.filter(e => e.statut === 'termine').length}</span><span className={s.statLabel}>Terminés</span></div>
        <div className={s.statCard}><span className={s.statIcon}>⏳</span><span className={s.statNum}>{events.filter(e => e.statut === 'planifie').length}</span><span className={s.statLabel}>Planifiés</span></div>
      </div>

      {events.length === 0 ? (
        <div className={s.empty}><span className={s.emptyIcon}>📅</span><p>Aucun évènement planifié</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {events.map(e => (
            <div key={e.id} className={s.card} style={{ opacity: e.statut === 'termine' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span className={`${s.badge} ${typeColor[e.type] || s.badgeBlue}`}>{typeLabel[e.type] || e.type}</span>
                <span className={`${s.badge} ${e.statut === 'termine' ? s.badgeGreen : s.badgeOrange}`}>
                  {e.statut === 'termine' ? '✅ Terminé' : '⏳ Planifié'}
                </span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 6, textDecoration: e.statut === 'termine' ? 'line-through' : 'none' }}>{e.titre}</h3>
              {e.description && <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>{e.description}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                {e.date && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>📅 {new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                {e.lieu && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>📍 {e.lieu}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleStatut(e.id)} className={e.statut === 'termine' ? s.btnOutline : s.btnGreen} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '7px 12px' }}>
                  {e.statut === 'termine' ? '↩ Réouvrir' : '✅ Terminer'}
                </button>
                <button className={s.btnDanger} onClick={() => del(e.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={s.overlay} onClick={() => setShowForm(false)}>
          <div className={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>📅 Nouvel évènement</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup} style={{ gridColumn: '1/-1' }}>
                <label className={s.formLabel}>Titre *</label>
                <input className={s.formInput} placeholder="Ex: Soldes de fin d'année" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Type</label>
                <select className={s.formInput} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="vente">🛒 Vente promo</option>
                  <option value="livraison">🚚 Livraison</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="reunion">👥 Réunion</option>
                  <option value="autre">📌 Autre</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Date</label>
                <input className={s.formInput} type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Lieu</label>
                <input className={s.formInput} placeholder="Ex: Keur Massar" value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} />
              </div>
              <div className={s.formGroup} style={{ gridColumn: '1/-1' }}>
                <label className={s.formLabel}>Description</label>
                <textarea className={s.formInput} rows={3} placeholder="Détails de l'évènement..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnOutline} onClick={() => setShowForm(false)}>Annuler</button>
              <button className={s.btnPrimary} onClick={save}>💾 Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
