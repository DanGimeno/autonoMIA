import { SupabaseClient } from '@supabase/supabase-js'

interface TaskResult {
  alerted: number
  skipped: number
  tasks: string[]
}

/**
 * Find pending tax tasks with due_date within the next 7 days,
 * and create notifications (avoiding duplicates for the same day).
 */
export async function checkUpcomingTaxTasks(
  supabase: SupabaseClient
): Promise<TaskResult> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const in7Days = new Date(today)
  in7Days.setDate(in7Days.getDate() + 7)
  const in7DaysStr = in7Days.toISOString().split('T')[0]

  // Find pending tax tasks due within 7 days (including overdue)
  const { data: upcomingTasks, error: fetchError } = await supabase
    .from('tax_tasks')
    .select('id, user_id, title, due_date')
    .eq('status', 'pending')
    .lte('due_date', in7DaysStr)

  if (fetchError) throw new Error(`Error fetching tax tasks: ${fetchError.message}`)
  if (!upcomingTasks || upcomingTasks.length === 0) {
    return { alerted: 0, skipped: 0, tasks: [] }
  }

  const result: TaskResult = { alerted: 0, skipped: 0, tasks: [] }

  for (const task of upcomingTasks) {
    // Check for existing notification today to avoid duplicates
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', task.user_id)
      .eq('type', 'upcoming_tax_task')
      .ilike('title', `%${task.title}%`)
      .gte('created_at', `${todayStr}T00:00:00`)
      .limit(1)

    if (existing && existing.length > 0) {
      result.skipped++
      continue
    }

    // Calculate days until due
    const dueDate = new Date(task.due_date)
    const diffMs = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    const dueDateFormatted = dueDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const urgency = diffDays <= 0
      ? 'Vencida'
      : diffDays === 1
        ? 'Vence mañana'
        : `Vence en ${diffDays} días`

    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: task.user_id,
        type: 'upcoming_tax_task',
        title: `Tarea fiscal próxima: ${task.title}`,
        message: `${urgency} (${dueDateFormatted})`,
        link: '/tax-tasks',
      })

    if (!notifError) {
      result.alerted++
      result.tasks.push(task.title)
    }
  }

  return result
}
