import React, { useState, useEffect } from 'react';
import { getCollaborators, createCollaborator, updateCollaborator, deleteCollaborator, getMachines, getShifts, deleteMachine } from '../../services/api';
import bgImg from '../../assets/ram-bg.png';
import ramLogo from '../../assets/RAM.jpg';
import oneworldLogo from '../../assets/oneworld.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaInfoCircle } from 'react-icons/fa';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'collaborators', label: 'Collaborateurs' },
  { key: 'machines', label: 'Machines' },
  { key: 'shifts', label: 'Shifts' },
];

const AdminDashboard = ({ email, onLogout }) => {
  const [tab, setTab] = useState('dashboard');
  const [collaborators, setCollaborators] = useState([]);
  const [machines, setMachines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loadingCollab, setLoadingCollab] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [editCollab, setEditCollab] = useState(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', phone: '' });
  const [dashboardStats, setDashboardStats] = useState({ collab: 0, machines: 0, shifts: 0 });
  const [shiftSort, setShiftSort] = useState({ key: null, asc: true });

  // Chargement des données selon l'onglet
  useEffect(() => {
    if (tab === 'collaborators') {
      setLoadingCollab(true);
      getCollaborators().then(res => {
        setCollaborators(res.data);
        setLoadingCollab(false);
      });
    } else if (tab === 'machines') {
      setLoadingMachines(true);
      getMachines().then(res => {
        setMachines(res.data);
        setLoadingMachines(false);
      });
    } else if (tab === 'shifts') {
      setLoadingShifts(true);
      getShifts().then(res => {
        setShifts(res.data);
        setLoadingShifts(false);
      });
    } else if (tab === 'dashboard') {
      Promise.all([
        getCollaborators(),
        getMachines(),
        getShifts()
      ]).then(([c, m, s]) => {
        setDashboardStats({
          collab: c.data.length,
          machines: m.data.length,
          shifts: s.data.length
        });
      });
    }
  }, [tab]);

  // Gestion formulaire collaborateur
  const openAddCollab = () => {
    setEditCollab(null);
    setForm({ firstname: '', lastname: '', email: '', phone: '' });
    setShowCollabModal(true);
  };
  const openEditCollab = (collab) => {
    setEditCollab(collab);
    setForm({
      firstname: collab.firstname || '',
      lastname: collab.lastname || '',
      email: collab.email || '',
      phone: collab.phone || ''
    });
    setShowCollabModal(true);
  };
  const closeCollabModal = () => {
    setShowCollabModal(false);
    setEditCollab(null);
    setForm({ firstname: '', lastname: '', email: '', phone: '' });
  };
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleCollabSubmit = async (e) => {
    e.preventDefault();
    if (editCollab) {
      await updateCollaborator(editCollab.id, form);
    } else {
      await createCollaborator(form);
    }
    closeCollabModal();
    setLoadingCollab(true);
    getCollaborators().then(res => {
      setCollaborators(res.data);
      setLoadingCollab(false);
    });
  };
  const handleDeleteCollab = async (id) => {
    if (window.confirm('Supprimer ce collaborateur ?')) {
      await deleteCollaborator(id);
      setLoadingCollab(true);
      getCollaborators().then(res => {
        setCollaborators(res.data);
        setLoadingCollab(false);
      });
    }
  };

  // Suppression machine
  const handleDeleteMachine = async (id) => {
    if (window.confirm('Supprimer cette machine ?')) {
      await deleteMachine(id);
      setLoadingMachines(true);
      getMachines().then(res => {
        setMachines(res.data);
        setLoadingMachines(false);
      });
    }
  };

  // Fonction de tri des shifts
  const sortedShifts = React.useMemo(() => {
    if (!shiftSort.key) return shifts;
    const sorted = [...shifts].sort((a, b) => {
      let va, vb;
      switch (shiftSort.key) {
        case 'duree':
          va = a.duree || 0;
          vb = b.duree || 0;
          break;
        case 'ordName':
          va = a.machine?.ordName || '';
          vb = b.machine?.ordName || '';
          break;
        case 'macAddress':
          va = a.machine?.macAddress || '';
          vb = b.machine?.macAddress || '';
          break;
        case 'email':
          va = a.collaborator?.email || '';
          vb = b.collaborator?.email || '';
          break;
        default:
          va = '';
          vb = '';
      }
      if (va < vb) return shiftSort.asc ? -1 : 1;
      if (va > vb) return shiftSort.asc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [shifts, shiftSort]);

  // Calcul des totaux par email pour les shifts
  const totalDureeByEmail = React.useMemo(() => {
    const map = {};
    shifts.forEach(s => {
      const email = s.collaborator?.email || '';
      if (!map[email]) map[email] = 0;
      map[email] += s.duree || 0;
    });
    return map;
  }, [shifts]);

  const handleShiftSort = (key) => {
    setShiftSort(s => ({ key, asc: s.key === key ? !s.asc : true }));
  };

  // Export Excel collaborateurs
  const handleExportCollaborators = () => {
    const data = collaborators.map(c => ({
      ID: c.id,
      Prénom: c.firstname,
      Nom: c.lastname,
      Email: c.email,
      Téléphone: c.phone
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Collaborateurs');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'collaborateurs.xlsx');
  };

  // Export Excel shifts (filtrage possible)
  const [shiftExportEmail, setShiftExportEmail] = useState('ALL');
  const handleExportShifts = () => {
    let filtered = shifts;
    if (shiftExportEmail !== 'ALL') {
      filtered = shifts.filter(s => s.collaborator && s.collaborator.email === shiftExportEmail);
    }
    const data = filtered.map(s => ({
      Prénom: s.collaborator ? s.collaborator.firstname : '',
      Nom: s.collaborator ? s.collaborator.lastname : '',
      Ordinateur: s.machine ? s.machine.ordName : '',
      'MAC Address': s.machine ? s.machine.macAddress : '',
      'Date entrée': s.dateEntree,
      'Date sortie': s.dateSortie,
      Durée: s.duree
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shifts');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'shifts.xlsx');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      {/* Background image floue */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: `url(${bgImg}) center/cover no-repeat`,
        filter: 'blur(6px) brightness(0.7)',
        zIndex: 0,
      }} />
      {/* Overlay pour lisibilité */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(255,255,255,0.25)',
        zIndex: 1,
      }} />
      <div style={{ maxWidth: 1100, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, border: '2px solid #a60d1a', position: 'relative', textAlign: 'center', zIndex: 2 }}>
        {/* RAM et OneWorld (images) en haut à gauche, plus grand */}
        <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 10, display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={ramLogo} alt="RAM" style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }} />
          <img src={oneworldLogo} alt="OneWorld" style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <h1 style={{ color: '#a60d1a', fontWeight: 700, marginBottom: 18 }}>Espace Administrateur</h1>
        <div style={{ color: '#222', fontSize: 18, marginBottom: 24 }}>
          Bienvenue, <b>{email}</b>
        </div>
        <button onClick={onLogout} style={{ background: '#a60d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', position: 'absolute', right: 32, top: 32 }}>Se déconnecter</button>
        {/* Onglets */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '32px 0' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ background: tab === t.key ? '#a60d1a' : '#eee', color: tab === t.key ? '#fff' : '#a60d1a', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}>{t.label}</button>
          ))}
        </div>
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 40 }}>
            <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 32, minWidth: 180 }}>
              <div style={{ color: '#a60d1a', fontSize: 32, fontWeight: 700 }}>{dashboardStats.collab}</div>
              <div style={{ color: '#222', fontSize: 18 }}>Collaborateurs</div>
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 32, minWidth: 180 }}>
              <div style={{ color: '#bfa046', fontSize: 32, fontWeight: 700 }}>{dashboardStats.machines}</div>
              <div style={{ color: '#222', fontSize: 18 }}>Machines</div>
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 32, minWidth: 180 }}>
              <div style={{ color: '#222', fontSize: 32, fontWeight: 700 }}>{dashboardStats.shifts}</div>
              <div style={{ color: '#222', fontSize: 18 }}>Shifts</div>
            </div>
          </div>
        )}
        {/* Collaborateurs */}
        {tab === 'collaborators' && (
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <h2 style={{ color: '#a60d1a', fontWeight: 600, marginBottom: 18, display: 'inline-block' }}>Collaborateurs</h2>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
              <button onClick={handleExportCollaborators} style={{ background: '#bfa046', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', verticalAlign: 'middle' }}>Télécharger</button>
              <button onClick={openAddCollab} style={{ background: '#bfa046', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', verticalAlign: 'middle' }}>+ Ajouter un collaborateur</button>
            </div>
            {loadingCollab ? <div>Chargement...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>ID</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Prénom</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Nom</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Email</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Téléphone</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collaborators.map(c => (
                    <tr key={c.id}>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{c.id}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{c.firstname}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{c.lastname}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{c.email}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{c.phone}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>
                        <button onClick={() => openEditCollab(c)} style={{ marginRight: 8, background: '#bfa046', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Éditer</button>
                        <button onClick={() => handleDeleteCollab(c.id)} style={{ background: '#a60d1a', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Modal ajout/édition */}
            {showCollabModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <form onSubmit={handleCollabSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 340, boxShadow: '0 2px 12px #0002', position: 'relative' }}>
                  <h3 style={{ color: '#a60d1a', marginBottom: 18 }}>{editCollab ? 'Éditer' : 'Ajouter'} un collaborateur</h3>
                  <input name="firstname" value={form.firstname} onChange={handleFormChange} placeholder="Prénom" style={{ width: '100%', padding: 10, marginBottom: 10, border: '1.5px solid #bfa046', borderRadius: 6, fontSize: 15 }} required />
                  <input name="lastname" value={form.lastname} onChange={handleFormChange} placeholder="Nom" style={{ width: '100%', padding: 10, marginBottom: 10, border: '1.5px solid #bfa046', borderRadius: 6, fontSize: 15 }} required />
                  <input name="email" value={form.email} onChange={handleFormChange} placeholder="Email" type="email" style={{ width: '100%', padding: 10, marginBottom: 10, border: '1.5px solid #bfa046', borderRadius: 6, fontSize: 15 }} required />
                  <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Téléphone" style={{ width: '100%', padding: 10, marginBottom: 18, border: '1.5px solid #bfa046', borderRadius: 6, fontSize: 15 }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" onClick={closeCollabModal} style={{ background: '#eee', color: '#a60d1a', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Annuler</button>
                    <button type="submit" style={{ background: '#a60d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{editCollab ? 'Enregistrer' : 'Ajouter'}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        {/* Machines */}
        {tab === 'machines' && (
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <h2 style={{ color: '#bfa046', fontWeight: 600, marginBottom: 18 }}>Machines</h2>
            {loadingMachines ? <div>Chargement...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>ID</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Nom d'ordinateur</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Adresse MAC</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map(m => (
                    <tr key={m.id}>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{m.id}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{m.ordName}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{m.macAddress}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>
                        <button onClick={() => handleDeleteMachine(m.id)} style={{ background: '#a60d1a', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* Shifts */}
        {tab === 'shifts' && (
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <h2 style={{ color: '#222', fontWeight: 600, marginBottom: 0 }}>Shifts</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, marginBottom: 10 }}>
              <select value={shiftExportEmail} onChange={e => setShiftExportEmail(e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, border: '1.5px solid #bfa046', fontSize: 15 }}>
                <option value="ALL">Tous les collaborateurs</option>
                {Array.from(new Set(shifts.map(s => s.collaborator?.email).filter(Boolean))).map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
              <button onClick={handleExportShifts} style={{ background: '#bfa046', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Télécharger</button>
              <span title="Le fichier téléchargé contient les colonnes : Prénom, Nom, Ordinateur, MAC Address, Date entrée, Date sortie, Durée" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f5f5f5', color: '#bfa046', fontSize: 20, cursor: 'pointer', border: '1.5px solid #bfa046' }}>
                <FaInfoCircle />
              </span>
            </div>
            {/* Résumé total des durées par email */}
            {Object.keys(totalDureeByEmail).length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ color: '#a60d1a', marginBottom: 6 }}>Total des durées par email :</h4>
                <table style={{ width: 320, margin: '0 auto', borderCollapse: 'collapse', background: '#f9f9f9' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #eee', padding: 6 }}>Email</th>
                      <th style={{ border: '1px solid #eee', padding: 6 }}>Total durée (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(totalDureeByEmail).map(([email, total]) => (
                      <tr key={email}>
                        <td style={{ border: '1px solid #eee', padding: 6 }}>{email}</td>
                        <td style={{ border: '1px solid #eee', padding: 6 }}>{total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {loadingShifts ? <div>Chargement...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, border: '1px solid #eee', cursor: 'pointer' }}>
                      Prénom
                    </th>
                    <th style={{ padding: 8, border: '1px solid #eee', cursor: 'pointer' }}>
                      Nom
                    </th>
                    <th style={{ padding: 8, border: '1px solid #eee', cursor: 'pointer' }} onClick={() => handleShiftSort('ordName')}>
                      Ordinateur {shiftSort.key === 'ordName' ? (shiftSort.asc ? '▲' : '▼') : ''}
                    </th>
                    <th style={{ padding: 8, border: '1px solid #eee', cursor: 'pointer' }} onClick={() => handleShiftSort('macAddress')}>
                      MAC Address (bluetooth) {shiftSort.key === 'macAddress' ? (shiftSort.asc ? '▲' : '▼') : ''}
                    </th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Date entrée</th>
                    <th style={{ padding: 8, border: '1px solid #eee' }}>Date sortie</th>
                    <th style={{ padding: 8, border: '1px solid #eee', cursor: 'pointer' }} onClick={() => handleShiftSort('duree')}>
                      Durée (min) {shiftSort.key === 'duree' ? (shiftSort.asc ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedShifts.map(s => (
                    <tr key={s.id}>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.collaborator ? s.collaborator.firstname : ''}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.collaborator ? s.collaborator.lastname : ''}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.machine ? s.machine.ordName : ''}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.machine ? s.machine.macAddress : ''}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.dateEntree}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.dateSortie || '-'}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{s.duree || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      {/* Footer copyright */}
      <div style={{ position: 'fixed', bottom: 12, left: 0, width: '100vw', textAlign: 'center', color: '#888', fontSize: 15, zIndex: 20, letterSpacing: 1 }}>
        © Ayoub Mourfik et Soufiane Qerqach
      </div>
    </div>
  );
};

export default AdminDashboard; 