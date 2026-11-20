-- =========================================================================
-- JuliFor3D - Esquema completo para Supabase (Tablas, Storage y RLS)
-- =========================================================================
-- Instrucciones:
-- 1. Abre el SQL Editor en tu proyecto de Supabase.
-- 2. Pega y ejecuta este script completo.
-- 3. Para acceder a admin.html, crea tu usuario administrador en:
--    Authentication > Users > Add user (con correo y contraseña).
-- 4. Copia tu Project URL y anon public key en `config.js`.
-- =========================================================================

-- Extensión para UUID (normalmente habilitada por defecto en Supabase)
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. TABLAS
-- -------------------------------------------------------------------------

-- Categorías del catálogo
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Productos del catálogo
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_cop integer not null check (price_cop >= 0),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ideas / solicitudes personalizadas de clientes
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  contact text not null,
  description text not null,
  approx_size text not null default '',
  colors text not null default '',
  is_multicolor boolean not null default false,
  file_url text,
  file_path text,
  file_name text,
  status text not null default 'nueva'
    check (status in ('nueva', 'cotizada', 'en producción', 'entregada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para consultas rápidas
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_ideas_status on public.ideas(status);
create index if not exists idx_ideas_created_at on public.ideas(created_at desc);

-- Función y triggers para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists set_ideas_updated_at on public.ideas;
create trigger set_ideas_updated_at
  before update on public.ideas
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------------------------
-- 2. CATEGORÍAS INICIALES
-- -------------------------------------------------------------------------

insert into public.categories (name, slug)
values
  ('Figuras', 'figuras'),
  ('Decoración', 'decoracion'),
  ('Soportes y hogar', 'soportes-y-hogar'),
  ('Llaveros', 'llaveros')
on conflict (name) do nothing;

-- -------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) EN TABLAS
-- -------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.ideas enable row level security;

-- ---- Políticas para `categories` ----
drop policy if exists "Lectura publica de categorias" on public.categories;
create policy "Lectura publica de categorias"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin gestiona categorias" on public.categories;
create policy "Admin gestiona categorias"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

-- ---- Políticas para `products` ----
drop policy if exists "Lectura publica de productos activos" on public.products;
create policy "Lectura publica de productos activos"
  on public.products
  for select
  to anon
  using (active = true);

drop policy if exists "Admin lee todos los productos" on public.products;
create policy "Admin lee todos los productos"
  on public.products
  for select
  to authenticated
  using (true);

drop policy if exists "Admin inserta productos" on public.products;
create policy "Admin inserta productos"
  on public.products
  for insert
  to authenticated
  with check (true);

drop policy if exists "Admin actualiza productos" on public.products;
create policy "Admin actualiza productos"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin elimina productos" on public.products;
create policy "Admin elimina productos"
  on public.products
  for delete
  to authenticated
  using (true);

-- ---- Políticas para `ideas` ----
-- Cualquier visitante puede enviar una nueva idea desde el formulario público
drop policy if exists "Envio publico de ideas" on public.ideas;
create policy "Envio publico de ideas"
  on public.ideas
  for insert
  to anon, authenticated
  with check (status = 'nueva');

-- Solo el administrador autenticado puede ver, editar estado o eliminar ideas
drop policy if exists "Admin lee ideas" on public.ideas;
create policy "Admin lee ideas"
  on public.ideas
  for select
  to authenticated
  using (true);

drop policy if exists "Admin actualiza ideas" on public.ideas;
create policy "Admin actualiza ideas"
  on public.ideas
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin elimina ideas" on public.ideas;
create policy "Admin elimina ideas"
  on public.ideas
  for delete
  to authenticated
  using (true);

-- -------------------------------------------------------------------------
-- 4. BUCKETS DE STORAGE Y POLÍTICAS
-- -------------------------------------------------------------------------

-- Bucket público para fotos de productos del catálogo
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Bucket privado para archivos de referencia enviados por clientes (imágenes, PDF, STL)
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'ideas-clientes',
  'ideas-clientes',
  false,
  26214400 -- 25 MB
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

-- ---- Políticas de Storage para `productos` ----
drop policy if exists "Ver imagenes de productos publicamente" on storage.objects;
create policy "Ver imagenes de productos publicamente"
  on storage.objects
  for select
  to public
  using (bucket_id = 'productos');

drop policy if exists "Admin sube imagenes de productos" on storage.objects;
create policy "Admin sube imagenes de productos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'productos');

drop policy if exists "Admin actualiza imagenes de productos" on storage.objects;
create policy "Admin actualiza imagenes de productos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'productos')
  with check (bucket_id = 'productos');

drop policy if exists "Admin elimina imagenes de productos" on storage.objects;
create policy "Admin elimina imagenes de productos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'productos');

-- ---- Políticas de Storage para `ideas-clientes` ----
-- Visitantes pueden subir su archivo de referencia al enviar el formulario
drop policy if exists "Visitantes suben archivos de ideas" on storage.objects;
create policy "Visitantes suben archivos de ideas"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'ideas-clientes');

-- Solo el administrador autenticado puede ver, descargar o eliminar archivos de clientes
drop policy if exists "Admin accede a archivos de ideas" on storage.objects;
create policy "Admin accede a archivos de ideas"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'ideas-clientes');

drop policy if exists "Admin elimina archivos de ideas" on storage.objects;
create policy "Admin elimina archivos de ideas"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'ideas-clientes');
