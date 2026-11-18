// Traduz erros do Supabase (Auth e Postgres) para mensagens amigáveis.
// Nunca devolve error.message: o texto técnico original não vai para o usuário.
// Retorno: { field: 'email' | 'password' | 'nome' | null, message: string }

const MENSAGEM_PADRAO = 'Não foi possível concluir a operação. Tente novamente.';
const MENSAGEM_LIMITE = 'Muitas tentativas. Aguarde um pouco e tente novamente.';

export function traduzirErroLogin(error) {
  if (error?.code === 'supabase_not_configured') {
    return {
      field: null,
      message: 'A autenticação está indisponível. Verifique a configuração do Supabase.',
    };
  }

  if (error?.code === 'over_request_rate_limit' || error?.status === 429) {
    return { field: null, message: MENSAGEM_LIMITE };
  }

  // Credenciais inválidas e e-mail não confirmado recebem a MESMA mensagem
  // genérica: diferenciar revelaria se o e-mail existe (enumeração de usuários).
  if (
    error?.code === 'invalid_credentials' ||
    error?.code === 'email_not_confirmed' ||
    error?.status === 400
  ) {
    return { field: null, message: 'E-mail ou senha inválidos.' };
  }

  return { field: null, message: MENSAGEM_PADRAO };
}

export function traduzirErroCadastro(error) {
  if (error?.code === 'supabase_not_configured') {
    return {
      field: null,
      message: 'O cadastro está indisponível. Verifique a configuração do Supabase.',
    };
  }

  switch (error?.code) {
    case 'user_already_exists':
    case 'email_exists':
      return { field: 'email', message: 'Este e-mail já está cadastrado.' };
    case 'weak_password':
      return { field: 'password', message: 'Senha fraca. Escolha uma senha mais forte.' };
    case 'validation_failed':
      return { field: 'email', message: 'Informe um e-mail válido.' };
    case 'signup_disabled':
      return { field: null, message: 'O cadastro está temporariamente desativado.' };
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return { field: null, message: MENSAGEM_LIMITE };
    default:
      return { field: null, message: MENSAGEM_PADRAO };
  }
}

export function traduzirErroBanco(error) {
  // 23514 = check_violation (constraint CHECK do tamanho do título)
  if (error?.code === '23514') {
    return { field: 'nome', message: 'O título não atende ao tamanho permitido (3 a 100 caracteres).' };
  }
  // 42501 = insufficient_privilege (política RLS violada)
  if (error?.code === '42501') {
    return { field: null, message: 'Você não tem permissão para realizar esta operação.' };
  }
  return { field: null, message: MENSAGEM_PADRAO };
}
