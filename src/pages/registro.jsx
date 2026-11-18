import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastroSchema } from '../schemas/authSchema';
import { useAuth } from '../contexts/AuthContext';
import { traduzirErroCadastro } from '../utils/supabaseErrors';

export default function Registro() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  // Estado da tela de sucesso (não controla nenhum campo do formulário).
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cadastroSchema),
    mode: 'onTouched',
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit({ fullName, email, password }) {
    const { data, error } = await signUp(email, password, fullName);

    if (error) {
      const { field, message } = traduzirErroCadastro(error);
      if (field) setError(field, { type: 'server', message });
      else setError('root.server', { type: 'server', message });
      return;
    }

    // Com confirmação de e-mail ligada, o Supabase não devolve erro para um
    // e-mail já cadastrado (para não revelar quem tem conta): devolve um usuário
    // com a lista "identities" vazia.
    if (data.user && data.user.identities?.length === 0) {
      setError('email', { type: 'server', message: 'Este e-mail já está cadastrado.' });
      return;
    }

    // Sem confirmação de e-mail já existe sessão: entra direto.
    if (data.session) {
      navigate('/registros', { replace: true });
      return;
    }

    setAguardandoConfirmacao(true);
  }

  if (aguardandoConfirmacao) {
    return (
      <div style={{ maxWidth: 400 }}>
        <h2>Cadastro realizado</h2>
        <p>Enviamos um e-mail de confirmação. Confirme seu e-mail para poder entrar.</p>
        <Link to="/login">Ir para o login</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Cadastro</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="fullName">Nome completo</label>
          <br />
          <input id="fullName" type="text" autoComplete="name" {...register('fullName')} />
          {errors.fullName && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.fullName.message}</p>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">E-mail</label>
          <br />
          <input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Senha</label>
          <br />
          <input id="password" type="password" autoComplete="new-password" {...register('password')} />
          {errors.password && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.password.message}</p>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="confirmPassword">Confirmar senha</label>
          <br />
          <input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root?.server && (
          <p role="alert" style={{ color: 'red' }}>{errors.root.server.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}
