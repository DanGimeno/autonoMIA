import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ScheduledTask, TaskExecution } from '@/types'
import { Shield } from 'lucide-react'
import { HelpDialog } from '@/components/HelpDialog'
import { helpContent } from '@/lib/help/content'
import { describeCron } from '@/lib/cron'
import { AdminPanel } from '@/components/AdminPanel'

export const metadata: Metadata = {
  title: 'Administración | autonoMIA',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const [tasksRes, executionsRes] = await Promise.all([
    supabase.from('scheduled_tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('task_executions').select('*').order('started_at', { ascending: false }).limit(20),
  ])

  const tasks = (tasksRes.data || []) as ScheduledTask[]
  const executions = (executionsRes.data || []) as TaskExecution[]

  // Pre-compute cron descriptions on server
  const cronDescriptions: Record<string, string> = {}
  for (const task of tasks) {
    cronDescriptions[task.id] = describeCron(task.cron_expression)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
            <HelpDialog content={helpContent.admin} title="Ayuda — Administración" />
          </div>
          <p className="text-muted-foreground mt-1">Gestión de la plataforma</p>
        </div>
      </div>

      <AdminPanel
        tasks={tasks}
        executions={executions}
        cronDescriptions={cronDescriptions}
      />
    </div>
  )
}
