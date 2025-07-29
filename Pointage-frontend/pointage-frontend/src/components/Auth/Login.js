import React, { useState } from 'react';
import bgImg from '../../assets/ram-bg.png';
import ramLogo from '../../assets/RAM.jpg';
import oneworldLogo from '../../assets/oneworld.png';
import { createShift, getMacAddress, getOrdName } from '../../services/api';

const RAM_RED = '#a60d1a';
const RAM_GOLD = '#bfa046';
const RAM_TEXT = '#222222';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer un email valide.');
      return;
    }
    setError('');
    setLoading(true);
    const isAdmin = email.trim().toLowerCase() === 'admin@ram-admin.com';
    if (isAdmin) {
      if (password !== 'admin1234') {
        setLoading(false);
        setError('Mot de passe administrateur incorrect.');
        return;
      }
      setLoading(false);
      onLogin({ email: email.trim(), isAdmin: true });
      return;
    }
    try {
      // Créer le shift (le backend gère la machine)
      const now = new Date().toISOString();
      const macAddress = (await getMacAddress()).data;
      const ordName = (await getOrdName()).data;
      const shiftRes = await createShift({ dateEntree: now, collaborator: { email: email.trim() }, machine: { macAddress,ordName } });
      const shiftId = shiftRes.data.id;
      setLoading(false);
      onLogin({ email, shiftId });
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
      setError("Erreur lors de la création du pointage. Vérifiez l'email ou réessayez.");
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* RAM et OneWorld (images) en haut à gauche, plus grand */}
      <div style={{ position: 'fixed', top: 24, left: 32, zIndex: 10, display: 'flex', alignItems: 'center', gap: 18 }}>
        <img src={ramLogo} alt="RAM" style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }} />
        <img src={oneworldLogo} alt="OneWorld" style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }} />
      </div>
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
      {/* Formulaire */}
      <div style={{
        maxWidth: 520,
        margin: '80px auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px #0001',
        padding: 32,
        border: `2px solid ${RAM_RED}`,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Header/logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, justifyContent: 'center' }}>
          <div style={{ fontWeight: 'bold', color: RAM_RED, fontSize: 28, letterSpacing: 2, fontFamily: 'serif', marginRight: 12 }}>
            <span style={{ color: RAM_GOLD, fontSize: 22, verticalAlign: 'middle' }}>✈</span> Royal Air Maroc
          </div>
        </div>
        <h2 style={{ color: RAM_RED, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 14, border: `1.5px solid ${RAM_GOLD}`, borderRadius: 6, fontSize: 16, padding: 12, outline: 'none', color: RAM_TEXT, boxSizing: 'border-box' }}
          />
          {/* Champ mot de passe pour l'admin */}
          {email.trim().toLowerCase() === 'admin@ram-admin.com' && (
            <input
              type="password"
              placeholder="Mot de passe administrateur"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 14, border: `1.5px solid ${RAM_GOLD}`, borderRadius: 6, fontSize: 16, padding: 12, outline: 'none', color: RAM_TEXT, boxSizing: 'border-box' }}
          />
          )}
          {error && <div style={{ color: RAM_RED, marginBottom: 10, textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: RAM_RED, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 18, letterSpacing: 1, boxShadow: '0 2px 8px #a60d1a22', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginBottom: 0 }}>
            {loading ? 'Connexion...' : 'Entrer'}
          </button>
        </form>
      </div>
      {/* Footer copyright */}
      <div style={{ position: 'fixed', bottom: 12, left: 0, width: '100vw', textAlign: 'center', color: '#888', fontSize: 15, zIndex: 20, letterSpacing: 1 }}>
        © Ayoub Mourfik et Soufiane Qerqach
      </div>
    </div>
  );
};

export default Login; 