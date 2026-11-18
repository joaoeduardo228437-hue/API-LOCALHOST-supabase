import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/authSchema';
import { useAuth } from '../contexts/AuthContext';
import { traduzirErroLogin } from '../utils/supabaseErrors';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from?.pathname || '/registros';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit({ email, password }) {
    const { error } = await signIn(email, password);

    if (error) {
      const { message } = traduzirErroLogin(error);
      setError('root.server', { type: 'server', message });
      return;
    }

    navigate(destino, { replace: true });
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">E-mail</label>
          <br />
          <input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Senha</label>
          <br />
          <input id="password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <p role="alert" style={{ color: 'red', margin: 0 }}>{errors.password.message}</p>}
        </div>

        {errors.root?.server && (
          <p role="alert" style={{ color: 'red' }}>{errors.root.server.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p>
        Não tem conta? <Link to="/registro">Cadastre-se</Link>
      </p>
    </div>
  );
}
