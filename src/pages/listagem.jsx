import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Listagem() {
  const location = useLocation();
  const sucesso = location.state?.sucesso;

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchRegistros() {
      setLoading(true);
      const { data, error } = await supabase.from('filme').select('*').order('id');

      if (error) {
        // Mensagem amigável: o texto técnico não é exibido ao usuário.
        setErro('Não foi possível carregar os registros. Tente novamente.');
      } else {
        setRegistros(data || []);
      }
      setLoading(false);
    }

    fetchRegistros();
  }, []);

  if (loading) return <p>Carregando registros...</p>;

  return (
    <div>
      <h2>Lista de Filmes</h2>

      {sucesso && <p role="status" style={{ color: 'green' }}>{sucesso}</p>}
      {erro && <p role="alert" style={{ color: 'red' }}>{erro}</p>}

      <p><Link to="/registros/novo">+ Novo registro</Link></p>

      {!erro && registros.length === 0 && <p>Nenhum registro cadastrado.</p>}

      <ul>
        {registros.map((item) => (
          <li key={item.id} style={{ margin: '10px 0' }}>
            <strong>{item.nome}</strong> ({item.ano}) - <em>{item.genero}</em>{' '}
            <Link to={`/registros/${item.id}`}>Ver Detalhes</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
