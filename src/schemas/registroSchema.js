import { z } from 'zod';

export const registroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O título deve ter no mínimo 3 caracteres.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  ano: z.coerce
    .number({ invalid_type_error: 'Informe um ano válido.' })
    .int('O ano deve ser um número inteiro.')
    .min(1888, 'O ano deve ser 1888 ou posterior.')
    .max(2100, 'O ano deve ser 2100 ou anterior.'),
  genero: z
    .string()
    .trim()
    .min(1, 'O gênero é obrigatório.')
    .max(50, 'O gênero deve ter no máximo 50 caracteres.'),
});
