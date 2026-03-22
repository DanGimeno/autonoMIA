import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getTaskHandler } from '@/lib/tasks'
import { getNextRunDate } from '@/lib/cron'
import { ScheduledTask } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/run-task/[taskId]
 * Execute a specific scheduled task manually.
 * Auth: either CRON_SECRET header OR admin user session.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params

  // Check auth: CRON_SECRET or admin session
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const hasCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!hasCronAuth) {
    // Fall back to checking admin session
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await userSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })
    }
  }

  const supabase = createAdminClient()

  // Fetch the task
  const { data: task, error: fetchError } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (fetchError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const typedTask = task as ScheduledTask
  const handler = getTaskHandler(typedTask.task_type)

  if (!handler) {
    return NextResponse.json({ error: `No handler for type: ${typedTask.task_type}` }, { status: 400 })
  }

  // Create execution record
  const { data: execution } = await supabase
    .from('task_executions')
    .insert({
      task_id: typedTask.id,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  try {
    const result = await handler(supabase)

    if (execution) {
      await supabase
        .from('task_executions')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          result,
        })
        .eq('id', execution.id)
    }

    const nextRun = getNextRunDate(typedTask.cron_expression)
    await supabase
      .from('scheduled_tasks')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun.toISOString(),
      })
      .eq('id', typedTask.id)

    return NextResponse.json({ status: 'success', result })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    if (execution) {
      await supabase
        .from('task_executions')
        .update({
          status: 'failure',
          completed_at: new Date().toISOString(),
          error: errorMessage,
        })
        .eq('id', execution.id)
    }

    return NextResponse.json({ status: 'failure', error: errorMessage }, { status: 500 })
  }
}
