import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/login';
import Registro from './pages/registro';
import Listagem from './pages/listagem';
import NovoRegistro from './pages/novoRegistro';
import Detalhes from './pages/detalhes';
import { supabaseConfigError } from './services/supabaseClient';

export default function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        {supabaseConfigError && (
          <p role="alert" style={{ color: 'red' }}>
            {supabaseConfigError}
          </p>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/registros" element={<Listagem />} />
            <Route path="/registros/novo" element={<NovoRegistro />} />
            <Route path="/registros/:id" element={<Detalhes />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}
