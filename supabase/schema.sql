-- SCHEMA SSI Seye Senghor Informatique
-- Copiez-collez ce code dans Supabase SQL Editor

-- Table categories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  icon text default '📦',
  ordre int default 0,
  created_at timestamptz default now()
);

-- Table produits
create table if not exists produits (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  brand text,
  storage text,
  color text,
  price numeric not null default 0,
  description text,
  image_url text,
  status text default 'brouillon' check (status in ('brouillon', 'publie')),
  whatsapp_number text default '221777042635',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table ventes
create table if not exists ventes (
  id uuid default gen_random_uuid() primary key,
  numero text,
  client_nom text,
  articles jsonb,
  total numeric,
  paiement text,
  created_at timestamptz default now()
);

-- Table clients
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  telephone text,
  email text,
  adresse text,
  created_at timestamptz default now()
);

-- Table factures
create table if not exists factures (
  id uuid default gen_random_uuid() primary key,
  numero text,
  client_nom text,
  articles jsonb,
  total numeric,
  statut text default 'en_attente',
  created_at timestamptz default now()
);

-- Table devis
create table if not exists devis (
  id uuid default gen_random_uuid() primary key,
  numero text,
  client_nom text,
  articles jsonb,
  total numeric,
  validite int default 30,
  statut text default 'en_attente',
  created_at timestamptz default now()
);

-- Table depenses
create table if not exists depenses (
  id uuid default gen_random_uuid() primary key,
  description text,
  categorie text,
  montant numeric,
  date date default current_date,
  created_at timestamptz default now()
);

-- Table events
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  titre text not null,
  description text,
  type text default 'autre',
  lieu text,
  date timestamptz,
  statut text default 'planifie',
  created_at timestamptz default now()
);


-- DONNEES DE BASE - Categories initiales

insert into categories (label, icon, ordre) values
  ('Ordinateurs', '💻', 1),
  ('Smartphones', '📱', 2),
  ('Accessoires', '🖱️', 3),
  ('Composants', '🔧', 4),
  ('Imprimantes', '🖨️', 5),
  ('Réseau & WiFi', '📡', 6)
on conflict do nothing;


-- SECURITE - Row Level Security


-- Activer RLS sur toutes les tables
alter table categories enable row level security;
alter table produits enable row level security;
alter table ventes enable row level security;
alter table clients enable row level security;
alter table factures enable row level security;
alter table devis enable row level security;
alter table depenses enable row level security;
alter table events enable row level security;

-- Produits publiés : visibles par tout le monde
create policy "produits_publics" on produits
  for select using (status = 'publie');

-- Catégories : visibles par tout le monde
create policy "categories_publics" on categories
  for select using (true);

-- Admin (utilisateurs connectés) : accès total
create policy "admin_produits_all" on produits
  for all using (auth.role() = 'authenticated');

create policy "admin_categories_all" on categories
  for all using (auth.role() = 'authenticated');

create policy "admin_ventes_all" on ventes
  for all using (auth.role() = 'authenticated');

create policy "admin_clients_all" on clients
  for all using (auth.role() = 'authenticated');

create policy "admin_factures_all" on factures
  for all using (auth.role() = 'authenticated');

create policy "admin_devis_all" on devis
  for all using (auth.role() = 'authenticated');

create policy "admin_depenses_all" on depenses
  for all using (auth.role() = 'authenticated');

create policy "admin_events_all" on events
  for all using (auth.role() = 'authenticated');


-- STORAGE - Bucket pour les images

-- Allez dans Storage > New bucket > "produits-images"
-- Cochez "Public bucket"
