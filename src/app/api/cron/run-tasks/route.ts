import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTaskHandler } from '@/lib/tasks'
import { getNextRunDate } from '@/lib/cron'
import { ScheduledTask } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/run-tasks
 * Called by Vercel Cron or manually by admin.
 * Executes all enabled scheduled tasks whose next_run_at <= now.
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  // Accept both Bearer token and Vercel's cron secret header
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    request.headers.get('x-vercel-cron-secret') === cronSecret

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const results: Array<{ task: string; status: string; result?: unknown; error?: string }> = []

  // Fetch enabled tasks that are due to run
  const { data: tasks, error: fetchError } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .eq('enabled', true)
    .or(`next_run_at.is.null,next_run_at.lte.${now}`)

  if (fetchError) {
    return NextResponse.json({ error: `Failed to fetch tasks: ${fetchError.message}` }, { status: 500 })
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ message: 'No tasks to run', results: [] })
  }

  for (const task of tasks as ScheduledTask[]) {
    const handler = getTaskHandler(task.task_type)

    if (!handler) {
      results.push({ task: task.name, status: 'skipped', error: `No handler for type: ${task.task_type}` })
      continue
    }

    // Create execution record
    const { data: execution } = await supabase
      .from('task_executions')
      .insert({
        task_id: task.id,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    try {
      const taskResult = await handler(supabase)

      // Mark execution as success
      if (execution) {
        await supabase
          .from('task_executions')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            result: taskResult,
          })
          .eq('id', execution.id)
      }

      // Update task's last_run_at and next_run_at
      const nextRun = getNextRunDate(task.cron_expression)
      await supabase
        .from('scheduled_tasks')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: nextRun.toISOString(),
        })
        .eq('id', task.id)

      results.push({ task: task.name, status: 'success', result: taskResult })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      // Mark execution as failure
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

      // Still update next_run_at so it doesn't get stuck
      const nextRun = getNextRunDate(task.cron_expression)
      await supabase
        .from('scheduled_tasks')
        .update({ next_run_at: nextRun.toISOString() })
        .eq('id', task.id)

      results.push({ task: task.name, status: 'failure', error: errorMessage })
    }
  }

  return NextResponse.json({
    message: `Processed ${results.length} tasks`,
    results,
  })
}
