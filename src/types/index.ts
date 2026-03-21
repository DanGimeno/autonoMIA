// ============================================================
// Enums
// ============================================================

export type ProjectStatus = 'active' | 'paused' | 'completed'
export type BillingType = 'hourly' | 'flat_rate'
export type InvoiceStatus = 'draft' | 'issued' | 'collected' | 'overdue'
export type InvoiceSeries = 'F' | 'R' | 'P' // Factura, Rectificativa, Proforma
export type RecurrenceInterval = 'monthly' | 'quarterly' | 'yearly'
export type TaxTaskStatus = 'pending' | 'done'
export type TaxCategory = 'IVA' | 'IRPF' | 'cuota autónomo' | 'other'
export type TaxFilingStatus = 'pending' | 'filed' | 'paid'
export type ClientType = 'company' | 'freelancer' | 'individual'
export type PaymentMethod = 'transfer' | 'card' | 'cash' | 'paypal' | 'other'
export type ExpenseStatus = 'pending' | 'paid' | 'reimbursed'
export type DocumentEntityType = 'invoice' | 'expense' | 'project' | 'client' | 'tax_quarter'

export type ExpenseCategory =
  | 'material'
  | 'software'
  | 'hardware'
  | 'travel'
  | 'meals'
  | 'office'
  | 'telecom'
  | 'professional_services'
  | 'training'
  | 'insurance'
  | 'vehicle'
  | 'marketing'
  | 'banking'
  | 'taxes'
  | 'other'

// ============================================================
// Profile
// ============================================================

export interface Profile {
  id: string
  full_name: string | null
  trade_name: string | null
  nif: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  province: string | null
  phone: string | null
  iban: string | null
  epigraph: string | null
  registration_date: string | null
  autonomo_fee: number | null
  default_vat_percent: number | null
  default_irpf_percent: number | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// Clients
// ============================================================

export interface Client {
  id: string
  user_id: string
  name: string
  trade_name: string | null
  nif_cif: string | null
  type: ClientType
  email: string | null
  phone: string | null
  website: string | null
  contact_person: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  province: string | null
  country: string
  default_payment_days: number
  default_vat_percent: number
  default_irpf_percent: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// Projects
// ============================================================

export interface Project {
  id: string
  user_id: string
  name: string
  client_id: string | null
  client_name: string | null  // legacy, migrar a client_id
  description: string | null
  status: ProjectStatus
  billing_type: BillingType
  hourly_rate: number | null
  monthly_rate: number | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  color: string
  created_at: string
  updated_at: string
  // Joins
  client?: Client
}

export interface ProjectWithClient extends Project {
  clients: { name: string; nif_cif: string | null } | null
}

// ============================================================
// Work Logs
// ============================================================

export interface WorkLog {
  id: string
  user_id: string
  project_id: string | null
  work_date: string
  hours: number
  notes: string | null
  is_billable: boolean
  effective_rate: number | null
  created_at: string
  updated_at: string
  project?: Project
}

export interface WorkLogWithProject extends WorkLog {
  projects: { name: string } | null
}

// ============================================================
// Invoices
// ============================================================

export interface Invoice {
  id: string
  user_id: string
  project_id: string | null
  client_id: string | null
  invoice_number: string
  series: InvoiceSeries
  concept: string
  issue_date: string
  due_date: string | null
  amount: number
  vat_percent: number
  irpf_percent: number
  status: InvoiceStatus
  paid_at: string | null
  submitted_to_client: boolean
  payment_method: PaymentMethod | null
  // Recurrencia
  is_recurring: boolean
  recurrence_interval: RecurrenceInterval | null
  recurrence_day: number | null
  parent_invoice_id: string | null
  // Snapshot datos fiscales (congelados al emitir)
  issuer_name: string | null
  issuer_nif: string | null
  issuer_address: string | null
  client_name_snapshot: string | null
  client_nif_snapshot: string | null
  client_address_snapshot: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joins
  project?: Project
  client?: Client
}

export interface InvoiceWithRelations extends Invoice {
  projects: { name: string } | null
  clients: { name: string; nif_cif: string | null } | null
}

// Legacy compatibility
export type InvoiceWithProject = InvoiceWithRelations

export interface InvoiceItem {
  id: string
  invoice_id: string
  concept: string
  quantity: number
  unit_price: number
  sort_order: number
  created_at: string
}

// ============================================================
// Expenses
// ============================================================

export interface Expense {
  id: string
  user_id: string
  project_id: string | null
  client_id: string | null
  concept: string
  category: ExpenseCategory
  expense_date: string
  amount: number
  vat_percent: number
  vat_deductible_percent: number
  irpf_percent: number
  supplier_name: string | null
  supplier_nif: string | null
  receipt_number: string | null
  payment_method: PaymentMethod | null
  status: ExpenseStatus
  paid_at: string | null
  is_recurring: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Joins
  project?: Project
  client?: Client
}

export interface ExpenseWithRelations extends Expense {
  projects: { name: string } | null
  clients: { name: string } | null
}

// ============================================================
// Tax
// ============================================================

export interface TaxTask {
  id: string
  user_id: string
  title: string
  due_date: string
  category: TaxCategory
  status: TaxTaskStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TaxQuarter {
  id: string
  user_id: string
  year: number
  quarter: number
  // IVA (Modelo 303)
  vat_collected: number
  vat_deductible: number
  vat_balance: number
  // IRPF (Modelo 130)
  income: number
  deductible_expenses: number
  net_income: number
  irpf_rate: number
  irpf_amount: number
  irpf_withheld: number
  // Cuota
  autonomo_fee: number
  // Estado
  modelo_303_status: TaxFilingStatus
  modelo_303_filed_at: string | null
  modelo_130_status: TaxFilingStatus
  modelo_130_filed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Documents
// ============================================================

export interface Document {
  id: string
  user_id: string
  entity_type: DocumentEntityType
  entity_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  created_at: string
}

// ============================================================
// Invoice Sequences
// ============================================================

export interface InvoiceSequence {
  id: string
  user_id: string
  year: number
  series: string
  prefix: string | null
  last_number: number
  format: string
  created_at: string
  updated_at: string
}

// ============================================================
// Notifications
// ============================================================

export type NotificationType = 'overdue_invoice' | 'upcoming_tax_task' | 'general' | 'admin'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  read: boolean
  link: string | null
  created_at: string
}

// ============================================================
// Admin: Scheduled Tasks
// ============================================================

export type ScheduledTaskType = 'check_overdue_invoices' | 'check_upcoming_tax_tasks' | 'generate_quarterly_summary' | 'custom'
export type TaskExecutionStatus = 'success' | 'failure' | 'running'

export interface ScheduledTask {
  id: string
  name: string
  description: string | null
  cron_expression: string
  task_type: ScheduledTaskType
  enabled: boolean
  last_run_at: string | null
  next_run_at: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface TaskExecution {
  id: string
  task_id: string
  status: TaskExecutionStatus
  started_at: string
  completed_at: string | null
  result: Record<string, unknown> | null
  error: string | null
}
