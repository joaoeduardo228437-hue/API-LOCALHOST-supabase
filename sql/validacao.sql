-- Etapa 5 - Validação no banco de dados (execute no SQL Editor do Supabase)

-- 1) Coluna que identifica o dono do registro.
--    O default auth.uid() preenche automaticamente com o usuário logado.
alter table public.filme
  add column if not exists user_id uuid
  references auth.users (id) on delete cascade
  default auth.uid();

-- 2) Constraint CHECK: o título (coluna "nome") deve ter de 3 a 100 caracteres.
--    "not valid" evita falhar por linhas antigas que já violem a regra;
--    ela vale para todos os INSERT/UPDATE novos. Para validar as antigas
--    depois: alter table public.filme validate constraint filme_nome_tamanho;
alter table public.filme
  add constraint filme_nome_tamanho
  check (char_length(nome) between 3 and 100) not valid;

-- 3) Ativar RLS.
alter table public.filme enable row level security;

-- 4) Leitura: qualquer usuário autenticado pode listar.
create policy "filme_select_autenticados"
  on public.filme
  for select
  to authenticated
  using (true);

-- 5) Inserção: somente em nome do próprio usuário.
--    WITH CHECK valida a linha NOVA que está sendo inserida.
create policy "filme_insert_proprio_usuario"
  on public.filme
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- Testes fora do formulário (SQL Editor ou chamada direta à API REST).
-- Registre o resultado no README.
--
-- a) Título curto demais (deve falhar com código 23514):
--    insert into public.filme (nome, ano, genero) values ('ab', 2020, 'Drama');
--
-- b) Inserir em nome de outro usuário (deve falhar com código 42501):
--    insert into public.filme (nome, ano, genero, user_id)
--    values ('Filme valido', 2020, 'Drama', '00000000-0000-0000-0000-000000000000');
--
-- Obs.: o SQL Editor roda como "postgres" e ignora RLS. Para testar a RLS use
-- a API REST com o token de um usuário logado (veja o README).
