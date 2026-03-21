-- ============================================================
-- MODELO EXPANDIDO autonoMIA
-- Diseño senior: entidades reales de un autónomo español
-- ============================================================

-- ============================================================
-- 1. CLIENTES
-- Antes: client_name era un texto suelto en projects.
-- Ahora: entidad propia con datos fiscales completos.
-- Un autónomo necesita estos datos para emitir facturas válidas.
-- ============================================================
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),

  -- Identificación
  name text not null,                    -- razón social o nombre completo
  trade_name text,                       -- nombre comercial (puede diferir)
  nif_cif text,                          -- NIF persona física / CIF empresa
  type text default 'company' check (type in ('company', 'freelancer', 'individual')),

  -- Contacto
  email text,
  phone text,
  website text,
  contact_person text,                   -- persona de contacto si es empresa

  -- Dirección fiscal (obligatoria en facturas)
  address text,
  city text,
  postal_code text,
  province text,
  country text default 'España',

  -- Condiciones por defecto para este cliente
  default_payment_days integer default 30,  -- días para vencimiento
  default_vat_percent numeric(5,2) default 21,
  default_irpf_percent numeric(5,2) default 15,

  notes text,
  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger clients_updated_at
  before update on clients
  for each row execute function public.update_updated_at();

alter table clients enable row level security;
create policy "Users can view own clients" on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on clients for delete using (auth.uid() = user_id);

-- ============================================================
-- 2. PROJECTS: vincular a client, añadir fechas y presupuesto
-- ============================================================
alter table projects add column if not exists client_id uuid references clients on delete set null;
alter table projects add column if not exists start_date date;
alter table projects add column if not exists end_date date;
alter table projects add column if not exists budget numeric(12,2);       -- presupuesto total
alter table projects add column if not exists color text default '#63ADF2'; -- color para el calendario

-- ============================================================
-- 3. GASTOS / EXPENSES
-- Crítico para autónomos: IVA soportado deducible,
-- gastos deducibles para IRPF, justificación ante Hacienda.
-- ============================================================
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),

  -- Vinculación opcional
  project_id uuid references projects on delete set null,
  client_id uuid references clients on delete set null,  -- proveedor si es un cliente registrado

  -- Datos del gasto
  concept text not null,
  category text not null check (category in (
    'material',              -- material y suministros
    'software',              -- licencias, SaaS
    'hardware',              -- equipos informáticos
    'travel',                -- viajes y desplazamientos
    'meals',                 -- comidas de trabajo
    'office',                -- alquiler oficina, coworking
    'telecom',               -- teléfono, internet
    'professional_services', -- asesoría, gestoría
    'training',              -- formación
    'insurance',             -- seguros
    'vehicle',               -- gastos de vehículo
    'marketing',             -- publicidad, marketing
    'banking',               -- comisiones bancarias
    'taxes',                 -- impuestos no deducibles
    'other'
  )),
  expense_date date not null,

  -- Importes
  amount numeric(12,2) not null,           -- base imponible
  vat_percent numeric(5,2) default 21,     -- IVA soportado
  vat_deductible_percent numeric(5,2) default 100, -- % del IVA deducible (50% vehículo, 100% normal)
  irpf_percent numeric(5,2) default 0,     -- retención IRPF si aplica

  -- Proveedor (si no está en clients)
  supplier_name text,
  supplier_nif text,

  -- Documento
  receipt_number text,                      -- nº factura del proveedor
  payment_method text check (payment_method in ('transfer', 'card', 'cash', 'paypal', 'other')),

  -- Estado
  status text default 'pending' check (status in ('pending', 'paid', 'reimbursed')),
  paid_at timestamptz,
  is_recurring boolean default false,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger expenses_updated_at
  before update on expenses
  for each row execute function public.update_updated_at();

alter table expenses enable row level security;
create policy "Users can view own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on expenses for delete using (auth.uid() = user_id);

-- ============================================================
-- 4. LÍNEAS DE FACTURA
-- Una factura real tiene múltiples conceptos/líneas.
-- El amount de invoices pasa a ser calculado desde las líneas.
-- ============================================================
create table if not exists invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices on delete cascade not null,
  concept text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null,
  -- amount se calcula: quantity * unit_price
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Las líneas heredan el acceso del invoice (no necesitan user_id propio)
alter table invoice_items enable row level security;
create policy "Users can view own invoice items" on invoice_items for select
  using (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));
create policy "Users can insert own invoice items" on invoice_items for insert
  with check (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));
create policy "Users can update own invoice items" on invoice_items for update
  using (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));
create policy "Users can delete own invoice items" on invoice_items for delete
  using (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));

-- ============================================================
-- 5. INVOICES: vincular a client, soporte recurrencia,
--    datos fiscales del emisor y receptor en la factura
-- ============================================================
alter table invoices add column if not exists client_id uuid references clients on delete set null;

-- Serie de facturación (obligatorio en España: series correlativas)
alter table invoices add column if not exists series text default 'F';  -- F, R (rectificativa), P (proforma)

-- Recurrencia
alter table invoices add column if not exists is_recurring boolean default false;
alter table invoices add column if not exists recurrence_interval text check (recurrence_interval in ('monthly', 'quarterly', 'yearly'));
alter table invoices add column if not exists recurrence_day integer; -- día del mes
alter table invoices add column if not exists parent_invoice_id uuid references invoices on delete set null;

-- Método de pago
alter table invoices add column if not exists payment_method text check (payment_method in ('transfer', 'card', 'cash', 'paypal', 'other'));

-- Datos fiscales snapshot (se guardan en el momento de emisión para que no cambien si el perfil se actualiza)
alter table invoices add column if not exists issuer_name text;
alter table invoices add column if not exists issuer_nif text;
alter table invoices add column if not exists issuer_address text;
alter table invoices add column if not exists client_name_snapshot text;
alter table invoices add column if not exists client_nif_snapshot text;
alter table invoices add column if not exists client_address_snapshot text;

-- ============================================================
-- 6. TRIMESTRES FISCALES
-- El autónomo español declara IVA (modelo 303) e IRPF (modelo 130)
-- trimestralmente. Esta tabla calcula los totales automáticamente.
-- ============================================================
create table if not exists tax_quarters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),

  year integer not null,
  quarter integer not null check (quarter between 1 and 4),

  -- IVA (Modelo 303)
  vat_collected numeric(12,2) default 0,     -- IVA repercutido (de tus facturas)
  vat_deductible numeric(12,2) default 0,    -- IVA soportado deducible (de tus gastos)
  vat_balance numeric(12,2) default 0,       -- a pagar (positivo) o a compensar (negativo)

  -- IRPF (Modelo 130)
  income numeric(12,2) default 0,            -- ingresos del trimestre
  deductible_expenses numeric(12,2) default 0, -- gastos deducibles
  net_income numeric(12,2) default 0,        -- rendimiento neto
  irpf_rate numeric(5,2) default 20,         -- tipo aplicable (20% general)
  irpf_amount numeric(12,2) default 0,       -- cuota a pagar
  irpf_withheld numeric(12,2) default 0,     -- retenciones ya practicadas por clientes

  -- Cuota autónomo
  autonomo_fee numeric(10,2) default 0,      -- cuota mensual × 3

  -- Estado de presentación
  modelo_303_status text default 'pending' check (modelo_303_status in ('pending', 'filed', 'paid')),
  modelo_303_filed_at timestamptz,
  modelo_130_status text default 'pending' check (modelo_130_status in ('pending', 'filed', 'paid')),
  modelo_130_filed_at timestamptz,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint tax_quarters_unique_per_user unique (user_id, year, quarter)
);

create or replace trigger tax_quarters_updated_at
  before update on tax_quarters
  for each row execute function public.update_updated_at();

alter table tax_quarters enable row level security;
create policy "Users can view own tax quarters" on tax_quarters for select using (auth.uid() = user_id);
create policy "Users can insert own tax quarters" on tax_quarters for insert with check (auth.uid() = user_id);
create policy "Users can update own tax quarters" on tax_quarters for update using (auth.uid() = user_id);
create policy "Users can delete own tax quarters" on tax_quarters for delete using (auth.uid() = user_id);

-- ============================================================
-- 7. DOCUMENTOS / ADJUNTOS
-- Facturas recibidas, tickets, contratos...
-- Usa Supabase Storage para los archivos.
-- ============================================================
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),

  -- Vinculación polimórfica
  entity_type text not null check (entity_type in ('invoice', 'expense', 'project', 'client', 'tax_quarter')),
  entity_id uuid not null,

  file_name text not null,
  file_path text not null,              -- path en Supabase Storage
  file_type text,                       -- MIME type
  file_size integer,                    -- bytes

  created_at timestamptz default now()
);

alter table documents enable row level security;
create policy "Users can view own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on documents for delete using (auth.uid() = user_id);

-- ============================================================
-- 8. PROFILES: ampliar datos fiscales del autónomo
-- ============================================================
alter table profiles add column if not exists trade_name text;         -- nombre comercial
alter table profiles add column if not exists city text;
alter table profiles add column if not exists postal_code text;
alter table profiles add column if not exists province text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists iban text;               -- cuenta bancaria para facturas
alter table profiles add column if not exists autonomo_fee numeric(10,2); -- cuota mensual de autónomo
alter table profiles add column if not exists epigraph text;           -- epígrafe IAE
alter table profiles add column if not exists registration_date date;  -- fecha alta autónomos

-- ============================================================
-- 9. SECUENCIAS DE FACTURACIÓN
-- En España las facturas deben ser correlativas por serie y año.
-- ============================================================
create table if not exists invoice_sequences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  year integer not null,
  series text not null default 'F',
  prefix text,                          -- ej: "2026-F" o "F"
  last_number integer default 0,
  format text default '{prefix}{number}', -- template: {prefix}001

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint invoice_sequences_unique unique (user_id, year, series)
);

alter table invoice_sequences enable row level security;
create policy "Users can view own sequences" on invoice_sequences for select using (auth.uid() = user_id);
create policy "Users can insert own sequences" on invoice_sequences for insert with check (auth.uid() = user_id);
create policy "Users can update own sequences" on invoice_sequences for update using (auth.uid() = user_id);

-- ============================================================
-- 10. WORK LOGS: añadir billable flag y tarifa efectiva
-- ============================================================
alter table work_logs add column if not exists is_billable boolean default true;
alter table work_logs add column if not exists effective_rate numeric(10,2); -- tarifa real aplicada (puede diferir del proyecto)
