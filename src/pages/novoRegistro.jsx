import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registroSchema } from '../schemas/registroSchema';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { traduzirErroBanco } from '../utils/supabaseErrors';

export default function NovoRegistro() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registroSchema),
    mode: 'onTouched',
    defaultValues: { nome: '', ano: '', genero: '' },
  });

  async function onSubmit(dados) {
    const { error } = await supabase
      .from('filme')
      .insert({ ...dados, user_id: user.id });

    if (error) {
      const { field, message } = traduzirErroBanco(error);
      if (field) setError(field, { type: 'server', message });
      else setError('root.server', { type: 'server', message });
      return;
    }

    reset();
    navigate('/registros', { state: { sucesso: 'Registro salvo com sucesso!' } });
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Novo registro</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="nome">Título</label>
          <br />
          <input id="nome" type="text" {...register('nome')} />
          {errors.nome && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.nome.message}</p>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ano">Ano</label>
          <br />
          <input id="ano" type="number" {...register('ano')} />
          {errors.ano && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.ano.message}</p>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="genero">Gênero</label>
          <br />
          <input id="genero" type="text" {...register('genero')} />
          {errors.genero && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.genero.message}</p>}
        </div>

        {errors.root?.server && (
          <p role="alert" style={{ color: 'red' }}>{errors.root.server.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
