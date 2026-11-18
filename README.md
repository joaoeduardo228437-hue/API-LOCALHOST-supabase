# Validação de Formulários com React Hook Form, Zod e Supabase

Aplicação React (Vite) com Supabase Auth, Context API, rotas protegidas e formulários validados com React Hook Form + Zod. A validação acontece em camadas: front-end (feedback rápido), Supabase Auth (regras de autenticação) e banco de dados (RLS + constraints).

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha com os dados do seu projeto Supabase (Project Settings > API):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   O `.env` está no `.gitignore` e não deve ser enviado ao repositório.
3. No SQL Editor do Supabase, execute os comandos da seção [Comandos SQL aplicados](#comandos-sql-aplicados) (o mesmo conteúdo está em `sql/validacao.sql`).
4. Inicie o projeto:
   ```bash
   npm run dev
   ```

## Rotas

| Rota | Página | Acesso |
|---|---|---|
| /login | Login | Público |
| /registro | Cadastro | Público |
| /registros | Listagem de registros | Autenticado |
| /registros/novo | Novo registro | Autenticado |
| /registros/:id | Detalhes | Autenticado |

## Estrutura

```
src/
  contexts/AuthContext.jsx        # sessão e funções de auth (Supabase)
  components/ProtectedRoute.jsx   # protege as rotas autenticadas
  schemas/
    authSchema.js                 # cadastroSchema e loginSchema
    registroSchema.js             # schema do novo registro
  services/supabaseClient.js      # cliente do Supabase
  utils/supabaseErrors.js         # tradução dos erros do Supabase
  pages/                          # login, registro, listagem, novoRegistro, detalhes
sql/validacao.sql                 # constraint CHECK e políticas RLS
```

## Regras de validação (Zod)

- **Cadastro:** `fullName` obrigatório, `email` válido, `password` com no mínimo 8 caracteres e `confirmPassword` igual à senha (`.refine()` com o erro exibido no campo de confirmação).
- **Login:** `email` válido e `password` obrigatória.
- **Novo registro:** título (`nome`) com 3 a 100 caracteres, ano inteiro entre 1888 e 2100 e gênero obrigatório (até 50 caracteres).

## Tratamento de erros do Supabase

Todas as mensagens são traduzidas em `src/utils/supabaseErrors.js`. A mensagem técnica original (`error.message`) nunca é exibida.

- **Cadastro:** e-mail já cadastrado aparece no campo de e-mail (`setError`); os demais erros aparecem como erro geral do formulário.
- **Login:** credenciais inválidas sempre exibem "E-mail ou senha inválidos."
- **Novo registro:** violação da constraint (`23514`) aparece no campo do título; violação de RLS (`42501`) aparece como erro geral.

## Comandos SQL aplicados

```sql
-- Coluna que identifica o dono do registro (preenchida com o usuário logado).
alter table public.filme
  add column if not exists user_id uuid
  references auth.users (id) on delete cascade
  default auth.uid();

-- Constraint CHECK: título (coluna "nome") com 3 a 100 caracteres.
-- "not valid" evita falhar por linhas antigas; vale para todo INSERT/UPDATE novo.
alter table public.filme
  add constraint filme_nome_tamanho
  check (char_length(nome) between 3 and 100) not valid;

-- Ativa a RLS.
alter table public.filme enable row level security;

-- Leitura: qualquer usuário autenticado.
create policy "filme_select_autenticados"
  on public.filme
  for select
  to authenticated
  using (true);

-- Inserção: somente em nome do próprio usuário.
create policy "filme_insert_proprio_usuario"
  on public.filme
  for insert
  to authenticated
  with check (auth.uid() = user_id);
```

## Teste da Etapa 5: inserção inválida direto no banco (sem o formulário)

> **Preencha esta seção com o resultado real do seu teste.** Os blocos "Resultado obtido" estão vazios de propósito: os testes precisam ser executados no seu projeto Supabase.

### Teste A: título curto demais (constraint CHECK)

No SQL Editor do Supabase:

```sql
insert into public.filme (nome, ano, genero) values ('ab', 2020, 'Drama');
```

- **Esperado:** erro de violação da constraint `filme_nome_tamanho` (código `23514`).
- **Resultado obtido:** _(cole aqui a mensagem exibida)_

### Teste B: inserir em nome de outro usuário (política RLS)

O SQL Editor roda como `postgres` e ignora a RLS, então este teste deve ser feito pela API REST com o token (`access_token`) de um usuário logado:

```bash
curl -i -X POST "$VITE_SUPABASE_URL/rest/v1/filme" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <access_token_do_usuario>" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Filme valido","ano":2020,"genero":"Drama","user_id":"00000000-0000-0000-0000-000000000000"}'
```

- **Esperado:** HTTP 403 com código `42501` ("new row violates row-level security policy").
- **Resultado obtido:** _(cole aqui a resposta)_

## Perguntas

**1. Qual é a vantagem de utilizar o React Hook Form em relação a controlar cada campo com useState?**
Com `useState`, cada campo precisa de um estado, de um `onChange` e de uma nova renderização do componente a cada tecla digitada, e as validações e mensagens de erro ficam espalhadas pelo JSX. O React Hook Form registra os campos (`register`) sem criar um estado por campo e com poucas re-renderizações. Ele também já entrega os erros (`errors`), o estado de envio (`isSubmitting`), `setError` para erros vindos do servidor e `reset` para limpar o formulário. O resultado é menos código repetido e um formulário mais rápido.

**2. Qual é o papel do Zod e do zodResolver?**
O Zod descreve as regras de validação (tipos, tamanhos, formato e regras entre campos, como a confirmação de senha) em um schema separado do JSX, que pode ser reaproveitado e testado. O `zodResolver` é a ponte entre as duas bibliotecas: ele faz o React Hook Form executar o schema a cada validação e converte os erros do Zod em erros dos campos, exibidos em `errors`.

**3. Por que a validação no front-end não é suficiente para garantir a segurança dos dados?**
Porque o código do front-end roda no navegador do usuário, que pode alterá-lo, desativar a validação ou simplesmente ignorar a interface e chamar a API do Supabase diretamente (com `curl`, por exemplo). A validação do front melhora a experiência, mas quem garante a segurança é o servidor: Supabase Auth, políticas RLS e constraints no banco.

**4. Qual é a diferença entre um erro de validação do formulário e um erro devolvido pelo Supabase?**
O erro de validação do formulário acontece no navegador, antes do envio, e vem do schema Zod (por exemplo, "senha com menos de 8 caracteres"); nenhuma requisição é feita. O erro do Supabase vem do servidor, depois do envio, por regras que o front não conhece ou não controla (e-mail já cadastrado, credenciais inválidas, violação de RLS ou de constraint). Por isso ele precisa ser traduzido para uma mensagem amigável e exibido com `setError`.

**5. Por que o login deve exibir uma mensagem genérica para credenciais inválidas?**
Para não revelar se um e-mail existe no sistema. Se a aplicação dissesse "usuário não encontrado" para um caso e "senha incorreta" para outro, um atacante poderia testar listas de e-mails e descobrir quais têm conta (enumeração de usuários), o que facilita ataques de phishing e de força bruta. Com a mesma mensagem ("E-mail ou senha inválidos.") para qualquer falha, essa informação não vaza.

**6. Qual é a função das constraints e do WITH CHECK do RLS?**
A constraint (como o `CHECK` do tamanho do título) garante a integridade do dado: nenhuma linha que viole a regra entra na tabela, venha de onde vier. O `WITH CHECK` de uma política RLS valida a linha nova ou alterada contra uma condição (aqui, `auth.uid() = user_id`), impedindo que um usuário grave dados em nome de outro. Já o `USING` define quais linhas existentes o usuário pode ver ou alterar; o `WITH CHECK` valida as linhas que estão sendo gravadas.

## Fontes consultadas

> Liste aqui as páginas que você realmente consultou. Sugestões:

- Documentação do React Hook Form: https://react-hook-form.com
- Documentação do Zod: https://zod.dev
- @hookform/resolvers: https://github.com/react-hook-form/resolvers
- Supabase Auth: https://supabase.com/docs/guides/auth
- Row Level Security no Supabase: https://supabase.com/docs/guides/database/postgres/row-level-security
- PostgreSQL, constraints CHECK: https://www.postgresql.org/docs/current/ddl-constraints.html

## Dificuldades encontradas

> Descreva aqui as suas.
