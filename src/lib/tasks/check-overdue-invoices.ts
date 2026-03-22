import { SupabaseClient } from '@supabase/supabase-js'

interface TaskResult {
  updated: number
  notifications: number
  invoices: string[]
}

/**
 * Find invoices with status 'issued' and due_date < today,
 * update their status to 'overdue', and create notifications.
 */
export async function checkOverdueInvoices(
  supabase: SupabaseClient
): Promise<TaskResult> {
  const today = new Date().toISOString().split('T')[0]

  // Find overdue invoices (issued + past due date)
  const { data: overdueInvoices, error: fetchError } = await supabase
    .from('invoices')
    .select('id, user_id, invoice_number, amount, due_date')
    .eq('status', 'issued')
    .lt('due_date', today)

  if (fetchError) throw new Error(`Error fetching invoices: ${fetchError.message}`)
  if (!overdueInvoices || overdueInvoices.length === 0) {
    return { updated: 0, notifications: 0, invoices: [] }
  }

  const result: TaskResult = { updated: 0, notifications: 0, invoices: [] }

  for (const invoice of overdueInvoices) {
    // Update status to overdue
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('id', invoice.id)

    if (updateError) {
      console.error(`Error updating invoice ${invoice.invoice_number}:`, updateError.message)
      continue
    }

    result.updated++
    result.invoices.push(invoice.invoice_number)

    // Format due date in Spanish
    const dueDate = new Date(invoice.due_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Format amount
    const amount = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(invoice.amount)

    // Create notification for the user
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: invoice.user_id,
        type: 'overdue_invoice',
        title: `Factura vencida: ${invoice.invoice_number}`,
        message: `La factura ${invoice.invoice_number} por ${amount} venció el ${dueDate}`,
        link: '/invoices',
      })

    if (!notifError) result.notifications++
  }

  return result
}
