import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ScheduledTask, TaskExecution } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table'
import { Shield, CheckCircle2, XCircle, Play } from 'lucide-react'
import { AdminTaskActions } from '@/components/AdminTaskActions'

export const metadata: Metadata = {
  title: 'Administración | autonoMIA',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is admin
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
          <p className="text-muted-foreground mt-1">Gestión de tareas programadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Tareas configuradas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{tasks.filter(t => t.enabled).length}</div>
            <div className="text-sm text-muted-foreground">Tareas activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{executions.filter(e => e.status === 'failure').length}</div>
            <div className="text-sm text-muted-foreground">Errores recientes</div>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="tasks-heading" className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle id="tasks-heading">Tareas programadas</CardTitle>
                <CardDescription>Configura y gestiona las tareas automáticas del sistema</CardDescription>
              </div>
              <AdminTaskActions />
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay tareas programadas. Crea una para automatizar procesos.
              </p>
            ) : (
              <Table>
                <TableCaption>Lista de tareas programadas del sistema</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Nombre</TableHead>
                    <TableHead scope="col">Tipo</TableHead>
                    <TableHead scope="col">Cron</TableHead>
                    <TableHead scope="col">Estado</TableHead>
                    <TableHead scope="col">Última ejecución</TableHead>
                    <TableHead scope="col">Próxima ejecución</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.name}</div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground">{task.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{task.task_type.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{task.cron_expression}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={task.enabled ? 'default' : 'secondary'}>
                          {task.enabled ? 'Activa' : 'Pausada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(task.last_run_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(task.next_run_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <Separator className="my-6" />

      <section aria-labelledby="executions-heading">
        <Card>
          <CardHeader>
            <CardTitle id="executions-heading">Historial de ejecuciones</CardTitle>
            <CardDescription>Últimas 20 ejecuciones de tareas</CardDescription>
          </CardHeader>
          <CardContent>
            {executions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay ejecuciones registradas.
              </p>
            ) : (
              <Table>
                <TableCaption>Historial de ejecuciones de tareas programadas</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Estado</TableHead>
                    <TableHead scope="col">Tarea</TableHead>
                    <TableHead scope="col">Inicio</TableHead>
                    <TableHead scope="col">Fin</TableHead>
                    <TableHead scope="col">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map(exec => {
                    const task = tasks.find(t => t.id === exec.task_id)
                    return (
                      <TableRow key={exec.id}>
                        <TableCell>
                          {exec.status === 'success' && (
                            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                              <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                              OK
                            </Badge>
                          )}
                          {exec.status === 'failure' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                              Error
                            </Badge>
                          )}
                          {exec.status === 'running' && (
                            <Badge variant="secondary">
                              <Play className="h-3 w-3 mr-1" aria-hidden="true" />
                              En curso
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {task?.name || exec.task_id}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(exec.started_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(exec.completed_at)}
                        </TableCell>
                        <TableCell>
                          {exec.error ? (
                            <span className="text-xs text-destructive">{exec.error}</span>
                          ) : exec.result ? (
                            <span className="text-xs text-muted-foreground">
                              {JSON.stringify(exec.result).slice(0, 100)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
