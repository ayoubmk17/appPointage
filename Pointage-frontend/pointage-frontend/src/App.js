import React, { useState } from 'react';
import Login from './components/Auth/Login';
import Pointage from './components/Pointage/Pointage';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  // Persistance utilisateur avec localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Wrapper pour setUser qui synchronise localStorage
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  if (user.isAdmin) {
    return <AdminDashboard email={user.email} onLogout={handleLogout} />;
  }
  return <Pointage email={user.email} shiftId={user.shiftId} onLogout={handleLogout} />;
}

export default App; 