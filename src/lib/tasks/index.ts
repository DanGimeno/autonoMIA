import { SupabaseClient } from '@supabase/supabase-js'
import { ScheduledTaskType } from '@/types'
import { checkOverdueInvoices } from './check-overdue-invoices'
import { checkUpcomingTaxTasks } from './check-upcoming-tax-tasks'
import { generateQuarterlySummary } from './generate-quarterly-summary'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskHandler = (supabase: SupabaseClient) => Promise<any>

const taskHandlers: Record<string, TaskHandler> = {
  check_overdue_invoices: checkOverdueInvoices,
  check_upcoming_tax_tasks: checkUpcomingTaxTasks,
  generate_quarterly_summary: generateQuarterlySummary,
}

export function getTaskHandler(taskType: ScheduledTaskType): TaskHandler | null {
  return taskHandlers[taskType] || null
}
