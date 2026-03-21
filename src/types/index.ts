export type ProjectStatus = 'active' | 'paused' | 'completed'
export type InvoiceStatus = 'draft' | 'issued' | 'collected' | 'overdue'
export type TaxTaskStatus = 'pending' | 'done'
export type TaxCategory = 'IVA' | 'IRPF' | 'cuota autónomo' | 'other'

export interface Profile {
  id: string
  full_name: string | null
  nif: string | null
  address: string | null
  default_vat_percent: number | null
  default_irpf_percent: number | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  client_name: string | null
  description: string | null
  status: ProjectStatus
  hourly_rate: number | null
  created_at: string
}

export interface WorkLog {
  id: string
  user_id: string
  project_id: string | null
  work_date: string
  hours: number
  notes: string | null
  created_at: string
  project?: Project
}

export interface Invoice {
  id: string
  user_id: string
  project_id: string | null
  invoice_number: string
  concept: string
  issue_date: string
  due_date: string | null
  amount: number
  vat_percent: number
  irpf_percent: number
  status: InvoiceStatus
  paid_at: string | null
  submitted_to_client: boolean
  notes: string | null
  created_at: string
  project?: Project
}

export interface TaxTask {
  id: string
  user_id: string
  title: string
  due_date: string
  category: TaxCategory
  status: TaxTaskStatus
  notes: string | null
  created_at: string
}
