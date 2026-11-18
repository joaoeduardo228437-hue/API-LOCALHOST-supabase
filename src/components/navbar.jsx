import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSair() {
    await signOut();
    navigate('/login');
  }

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '15px', background: '#f0f0f0', marginBottom: '20px' }}>
      <Link to="/">Início</Link>
      {user ? (
        <>
          <Link to="/registros">Listagem</Link>
          <Link to="/registros/novo">Novo registro</Link>
          <span style={{ marginLeft: 'auto' }}>{user.email}</span>
          <button onClick={handleSair}>Sair</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/registro">Cadastro</Link>
        </>
      )}
    </nav>
  );
}
