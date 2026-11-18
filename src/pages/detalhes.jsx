import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Detalhes() {
  const { id } = useParams();
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchRegistro() {
      setLoading(true);
      const { data, error } = await supabase
        .from('filme')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) setErro('Não foi possível carregar o registro.');
      else if (!data) setErro('Registro não encontrado.');
      else setRegistro(data);
      setLoading(false);
    }

    fetchRegistro();
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p role="alert" style={{ color: 'red' }}>{erro}</p>;

  return (
    <div>
      <h2>{registro.nome}</h2>
      <p>Ano: {registro.ano}</p>
      <p>Gênero: {registro.genero}</p>
      <Link to="/registros">Voltar</Link>
    </div>
  );
}
