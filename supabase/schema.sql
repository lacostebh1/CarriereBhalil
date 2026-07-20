-- ============================================================
-- SOCIETE H.H ISTITMAR — Schéma Supabase
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Salariés
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  "matricule" text not null default '',
  "nom" text not null,
  "cin" text default '',
  "cnss" text default '',
  "poste" text default '',
  "contrat" text default 'CDI',
  "dateEmbauche" date,
  "finContrat" date,
  "salaire" numeric not null default 0,
  "statut" text not null default 'actif',
  created_at timestamptz default now()
);

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  "nom" text not null,
  "ice" text default '',
  "contact" text default '',
  "tel" text default '',
  "email" text default '',
  "adresse" text default '',
  created_at timestamptz default now()
);

-- Fournisseurs
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  "nom" text not null,
  "ice" text default '',
  "categorie" text default '',
  "contact" text default '',
  "tel" text default '',
  "email" text default '',
  created_at timestamptz default now()
);

-- Factures
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  "num" text not null,
  "clientId" uuid references clients(id) on delete restrict,
  "date" date not null,
  "produit" text not null,
  "quantite" numeric not null default 0,
  "pu" numeric not null default 0,
  "statut" text not null default 'impayee',
  "montantRegle" numeric not null default 0,
  created_at timestamptz default now()
);

-- Dépenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  "date" date not null,
  "categorie" text not null,
  "description" text default '',
  "supplierId" uuid references suppliers(id) on delete set null,
  "montant" numeric not null default 0,
  "statut" text not null default 'a_payer',
  created_at timestamptz default now()
);

-- Congés
create table if not exists leaves (
  id uuid primary key default gen_random_uuid(),
  "empId" uuid references employees(id) on delete cascade,
  "type" text not null,
  "du" date not null,
  "au" date not null,
  "statut" text not null default 'attente',
  created_at timestamptz default now()
);

-- Contrats (clients / fournisseurs)
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  "type" text not null default 'Client',
  "partie" text not null,
  "objet" text not null,
  "debut" date,
  "fin" date,
  "montant" numeric not null default 0,
  "statut" text not null default 'actif',
  created_at timestamptz default now()
);

-- Paie : statut par mois et par salarié
create table if not exists payroll (
  "month" text not null,
  "empId" uuid not null references employees(id) on delete cascade,
  "statut" text not null default 'attente',
  primary key ("month", "empId")
);

-- Déclarations : suivi mensuel CNSS / IR / TVA
create table if not exists declarations (
  "month" text not null,
  "kind" text not null,
  "done" boolean not null default false,
  primary key ("month", "kind")
);

-- ============================================================
-- Sécurité : accès réservé aux utilisateurs authentifiés
-- (application mono-entreprise : tout utilisateur connecté
--  est un membre autorisé de la société)
-- ============================================================

alter table employees enable row level security;
alter table clients enable row level security;
alter table suppliers enable row level security;
alter table invoices enable row level security;
alter table expenses enable row level security;
alter table leaves enable row level security;
alter table contracts enable row level security;
alter table payroll enable row level security;
alter table declarations enable row level security;

do $$
declare t text;
begin
  foreach t in array array['employees','clients','suppliers','invoices','expenses','leaves','contracts','payroll','declarations']
  loop
    execute format('drop policy if exists "authenticated_all" on %I', t);
    execute format(
      'create policy "authenticated_all" on %I for all to authenticated using (true) with check (true)', t
    );
  end loop;
end $$;
