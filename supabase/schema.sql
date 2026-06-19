-- Cobralia — schema base (Supabase / Postgres)
-- Ejecutar en el SQL Editor de tu proyecto Supabase. Es idempotente.
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

-- Inscripciones (alumno ↔ clase)
create table if not exists public.inscripciones (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  alumno_id   uuid not null references public.alumnos(id) on delete cascade,
  clase_id    uuid not null references public.clases(id) on delete cascade,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (alumno_id, clase_id)
);
create index if not exists inscripciones_studio_idx on public.inscripciones(studio_id);
create index if not exists inscripciones_alumno_idx on public.inscripciones(alumno_id);

-- Cuotas (una por inscripción y período)
create table if not exists public.cuotas (
  id              uuid primary key default gen_random_uuid(),
  studio_id       uuid not null references public.studios(id) on delete cascade,
  inscripcion_id  uuid not null references public.inscripciones(id) on delete cascade,
  periodo         date not null,   -- primer día del mes
  monto           numeric(12, 2) not null,
  vencimiento     date not null,
  estado          text not null default 'PENDIENTE'
                    check (estado in ('PENDIENTE', 'PAGADA', 'VENCIDA', 'PARCIAL')),
  created_at      timestamptz not null default now(),
  unique (inscripcion_id, periodo)
);
create index if not exists cuotas_studio_periodo_idx on public.cuotas(studio_id, periodo);
create index if not exists cuotas_estado_idx on public.cuotas(studio_id, estado);

-- Pagos (una cuota puede recibir varios → pago parcial)
create table if not exists public.pagos (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  cuota_id    uuid not null references public.cuotas(id) on delete cascade,
  monto       numeric(12, 2) not null,
  metodo      text not null default 'EFECTIVO'
                check (metodo in ('EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO')),
  fecha       timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index if not exists pagos_cuota_idx on public.pagos(cuota_id);

-- Recibos (uno por pago, numeración por estudio)
create table if not exists public.recibos (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  pago_id     uuid not null unique references public.pagos(id) on delete cascade,
  numero      integer not null,
  created_at  timestamptz not null default now()
);
create index if not exists recibos_studio_idx on public.recibos(studio_id);

-- Liquidaciones (lo que el profe le debe al estudio: comisión o alquiler)
create table if not exists public.liquidaciones (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  profesor_id uuid not null references public.profesores(id) on delete cascade,
  periodo     date not null,
  concepto    text not null check (concepto in ('COMISION', 'ALQUILER')),
  monto       numeric(12, 2) not null,
  estado      text not null default 'PENDIENTE'
                check (estado in ('PENDIENTE', 'LIQUIDADA')),
  created_at  timestamptz not null default now(),
  unique (profesor_id, periodo, concepto)
);
create index if not exists liquidaciones_studio_periodo_idx
  on public.liquidaciones(studio_id, periodo);

-- Uso de salón por hora (alimenta la liquidación por ALQUILER)
create table if not exists public.uso_salon (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  profesor_id uuid not null references public.profesores(id) on delete cascade,
  salon_id    uuid references public.salones(id) on delete set null,
  fecha       date not null,
  horas       numeric(5, 2) not null,
  created_at  timestamptz not null default now()
);
create index if not exists uso_salon_studio_idx on public.uso_salon(studio_id, fecha);

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
alter table public.inscripciones  enable row level security;
alter table public.cuotas         enable row level security;
alter table public.pagos          enable row level security;
alter table public.recibos        enable row level security;
alter table public.liquidaciones  enable row level security;
alter table public.uso_salon      enable row level security;

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
  foreach t in array array[
    'salones', 'profesores', 'alumnos', 'clases',
    'inscripciones', 'cuotas', 'pagos', 'recibos',
    'liquidaciones', 'uso_salon'
  ] loop
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
-- Onboarding: la app llama a ensure_studio() en el primer ingreso y crea el
-- estudio + OWNER si no existe. A propósito NO usamos un trigger en auth.users
-- (puede fallar o abortar el script según el provider/permisos).
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.ensure_studio()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
begin
  select studio_id into sid
  from public.studio_members
  where user_id = auth.uid()
  limit 1;

  if sid is not null then
    return sid;
  end if;

  insert into public.studios (nombre)
  values (coalesce(
    (select nullif(raw_user_meta_data ->> 'studio_nombre', '')
       from auth.users where id = auth.uid()),
    'Mi estudio'
  ))
  returning id into sid;

  insert into public.studio_members (studio_id, user_id, rol)
  values (sid, auth.uid(), 'OWNER');

  return sid;
end $$;

grant execute on function public.ensure_studio() to authenticated;
