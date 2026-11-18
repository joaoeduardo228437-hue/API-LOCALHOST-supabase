import { z } from 'zod';

// Schema do cadastro (/registro)
export const cadastroSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'O nome completo é obrigatório.'),
    email: z
      .string()
      .trim()
      .min(1, 'O e-mail é obrigatório.')
      .email('Informe um e-mail válido.'),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    confirmPassword: z
      .string()
      .min(1, 'Confirme a senha.'),
  })
  // Regra que depende de outro campo: fica no objeto e o erro é exibido
  // no campo de confirmação por causa do "path".
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

// Schema do login (/login)
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.'),
});
