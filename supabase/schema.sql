-- Cobralia — schema base (Supabase / Postgres)
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
--
-- Multi-tenant: cada fila de dominio cuelga de un studio.
-- RLS (Row Level Security) restringe el acceso a los estudios del usuario logueado.

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────
-- Tablas
-- ──────────────────────────────────────────────────────────────────────────

-- Estudios (el "tenant")
create table if not exists public.studios (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  created_at  timestamptz not null default now()
);

-- Membresía usuario(auth) ↔ estudio
create table if not exists public.studio_members (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rol         text not null default 'OWNER' check (rol in ('OWNER', 'ADMIN')),
  created_at  timestamptz not null default now(),
  unique (user_id, studio_id)
);
create index if not exists studio_members_user_idx on public.studio_members(user_id);

-- Salones (cualquier espacio físico)
create table if not exists public.salones (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  nombre      text not null,
  created_at  timestamptz not null default now()
);
create index if not exists salones_studio_idx on public.salones(studio_id);

-- Profesores
create table if not exists public.profesores (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references public.studios(id) on delete cascade,
  nombre        text not null,
  tipo          text not null default 'TITULAR'
                  check (tipo in ('TITULAR', 'PORCENTAJE', 'ALQUILER')),
  comision_pct  numeric(5, 2),   -- solo PORCENTAJE
  tarifa_hora   numeric(12, 2),  -- solo ALQUILER
  created_at    timestamptz not null default now()
);
create index if not exists profesores_studio_idx on public.profesores(studio_id);

-- Alumnos
create table if not exists public.alumnos (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  nombre      text not null,
  telefono    text,
  email       text,
  created_at  timestamptz not null default now()
);
create index if not exists alumnos_studio_idx on public.alumnos(studio_id);

-- Clases
create table if not exists public.clases (
  id              uuid primary key default gen_random_uuid(),
  studio_id       uuid not null references public.studios(id) on delete cascade,
  nombre          text not null,
  dia_horario     text,
  arancel_mensual numeric(12, 2) not null default 0,
  profesor_id     uuid references public.profesores(id) on delete set null,
  salon_id        uuid references public.salones(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists clases_studio_idx on public.clases(studio_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Helper: estudios del usuario actual (para las policies)
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.current_studio_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select studio_id from public.studio_members where user_id = auth.uid()
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────────────────

alter table public.studios        enable row level security;
alter table public.studio_members enable row level security;
alter table public.salones        enable row level security;
alter table public.profesores     enable row level security;
alter table public.alumnos        enable row level security;
alter table public.clases         enable row level security;

drop policy if exists studios_select on public.studios;
create policy studios_select on public.studios
  for select using (id in (select public.current_studio_ids()));

drop policy if exists members_select on public.studio_members;
create policy members_select on public.studio_members
  for select using (user_id = auth.uid());

-- Tablas de dominio: todo restringido al estudio del usuario.
do $$
declare
  t text;
begin
  foreach t in array array['salones', 'profesores', 'alumnos', 'clases'] loop
    execute format('drop policy if exists %1$s_all on public.%1$s;', t);
    execute format(
      'create policy %1$s_all on public.%1$s for all '
      'using (studio_id in (select public.current_studio_ids())) '
      'with check (studio_id in (select public.current_studio_ids()));',
      t
    );
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────────
-- Onboarding automático: al registrarse un usuario, crear su estudio + OWNER
-- El nombre del estudio viene del metadata del signup (studio_nombre).
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_studio uuid;
begin
  insert into public.studios (nombre)
  values (coalesce(nullif(new.raw_user_meta_data ->> 'studio_nombre', ''), 'Mi estudio'))
  returning id into new_studio;

  insert into public.studio_members (studio_id, user_id, rol)
  values (new_studio, new.id, 'OWNER');

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
