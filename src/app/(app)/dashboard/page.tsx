import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FolderKanban, FileText, CircleCheck, ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkLogWithProject } from '@/types'
import { HelpDialog } from '@/components/HelpDialog'
import { helpContent } from '@/lib/help/content'

export const metadata: Metadata = { title: 'Dashboard | autonoMIA' }

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [projectsRes, invoicesRes, taxTasksRes, recentLogsRes] = await Promise.all([
    supabase.from('projects').select('id, status').eq('user_id', user.id),
    supabase.from('invoices').select('id, status, amount, due_date').eq('user_id', user.id),
    supabase.from('tax_tasks').select('id, status, due_date, title, category').eq('user_id', user.id).order('due_date', { ascending: true }).limit(5),
    supabase.from('work_logs').select('id, work_date, hours, notes, project_id, projects(name)').eq('user_id', user.id).order('work_date', { ascending: false }).limit(5),
  ])

  const projects = projectsRes.data || []
  const invoices = invoicesRes.data || []
  const taxTasks = taxTasksRes.data || []
  const recentLogs = (recentLogsRes.data || []) as unknown as WorkLogWithProject[]

  const activeProjects = projects.filter(p => p.status === 'active').length
  const pendingInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'draft')
  const pendingInvoicesAmount = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0)
  const collectedInvoices = invoices.filter(i => i.status === 'collected')
  const collectedAmount = collectedInvoices.reduce((sum, i) => sum + (i.amount || 0), 0)
  const upcomingTaxTasks = taxTasks.filter(t => t.status === 'pending').length

  const today = new Date().toISOString().split('T')[0]
  const overdueTasks = taxTasks.filter(t => t.status === 'pending' && t.due_date < today).length

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <HelpDialog content={helpContent.dashboard} title="Ayuda — Dashboard" />
        </div>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad como autónomo</p>
      </div>

      {/* Tarjetas de resumen */}
      <section aria-label="Resumen general">
        <h2 className="sr-only">Indicadores principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/projects?status=active"
            aria-label={`${activeProjects} proyectos activos. Ver proyectos activos`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent>
                <FolderKanban className="size-8 text-blue-600 mb-2" aria-hidden="true" />
                <div className="text-2xl font-bold text-foreground">{activeProjects}</div>
                <div className="text-sm text-muted-foreground">Proyectos activos</div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/invoices?status=issued"
            aria-label={`${pendingInvoicesAmount.toFixed(2)} euros en ${pendingInvoices.length} facturas pendientes. Ver facturas pendientes`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent>
                <FileText className="size-8 text-amber-600 mb-2" aria-hidden="true" />
                <div className="text-2xl font-bold text-foreground">{pendingInvoicesAmount.toFixed(2)}&nbsp;&euro;</div>
                <div className="text-sm text-muted-foreground">Facturas pendientes ({pendingInvoices.length})</div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/invoices?status=collected"
            aria-label={`${collectedAmount.toFixed(2)} euros cobrados en ${collectedInvoices.length} facturas. Ver facturas cobradas`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent>
                <CircleCheck className="size-8 text-green-600 mb-2" aria-hidden="true" />
                <div className="text-2xl font-bold text-foreground">{collectedAmount.toFixed(2)}&nbsp;&euro;</div>
                <div className="text-sm text-muted-foreground">Facturas cobradas ({collectedInvoices.length})</div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/tax-tasks"
            aria-label={`${upcomingTaxTasks} tareas fiscales pendientes${overdueTasks > 0 ? `, ${overdueTasks} vencidas` : ''}. Ver tareas fiscales`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent>
                <ClipboardList className="size-8 text-purple-600 mb-2" aria-hidden="true" />
                <div className="text-2xl font-bold text-foreground">
                  {upcomingTaxTasks}
                  {overdueTasks > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs align-middle">
                      {overdueTasks} vencidas
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Tareas fiscales pendientes</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas tareas fiscales */}
        <section aria-label="Próximas tareas fiscales">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                <h2 className="text-base font-semibold">Próximas tareas fiscales</h2>
              </CardTitle>
              <Link
                href="/tax-tasks"
                className="text-sm text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Ver todas<span className="sr-only"> las tareas fiscales</span>
              </Link>
            </CardHeader>
            <CardContent>
              {taxTasks.filter(t => t.status === 'pending').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay tareas pendientes</p>
              ) : (
                <ul className="space-y-2" role="list">
                  {taxTasks.filter(t => t.status === 'pending').slice(0, 4).map((task) => {
                    const isOverdue = task.due_date < today
                    return (
                      <li
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? 'bg-destructive/5' : 'bg-muted/50'}`}
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">{task.title}</div>
                          <div className="text-xs text-muted-foreground">{task.category}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <Badge variant="destructive">
                              <span className="sr-only">Tarea </span>Vencida
                            </Badge>
                          )}
                          <time
                            dateTime={task.due_date}
                            className={`text-xs font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}
                          >
                            {formatDate(task.due_date)}
                          </time>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Actividad reciente */}
        <section aria-label="Actividad reciente">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                <h2 className="text-base font-semibold">Actividad reciente</h2>
              </CardTitle>
              <Link
                href="/work-logs"
                className="text-sm text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Ver todas<span className="sr-only"> las entradas de trabajo</span>
              </Link>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay registros de trabajo</p>
              ) : (
                <ul className="space-y-2" role="list">
                  {recentLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {log.projects?.name || 'Sin proyecto'}
                        </div>
                        <time dateTime={log.work_date} className="text-xs text-muted-foreground">
                          {formatDate(log.work_date)}
                        </time>
                      </div>
                      <Badge variant="secondary">
                        {log.hours}<span className="sr-only"> horas</span>h
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
