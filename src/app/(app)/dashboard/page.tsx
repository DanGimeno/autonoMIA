import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [projectsRes, invoicesRes, taxTasksRes, recentLogsRes] = await Promise.all([
    supabase.from('projects').select('id, status').eq('user_id', user!.id),
    supabase.from('invoices').select('id, status, amount, due_date').eq('user_id', user!.id),
    supabase.from('tax_tasks').select('id, status, due_date, title, category').eq('user_id', user!.id).order('due_date', { ascending: true }).limit(5),
    supabase.from('work_logs').select('id, work_date, hours, notes, project_id, projects(name)').eq('user_id', user!.id).order('work_date', { ascending: false }).limit(5),
  ])

  const projects = projectsRes.data || []
  const invoices = invoicesRes.data || []
  const taxTasks = taxTasksRes.data || []
  const recentLogs = recentLogsRes.data || []

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de tu actividad como autónomo</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/projects?status=active" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">📁</div>
          <div className="text-2xl font-bold text-gray-900">{activeProjects}</div>
          <div className="text-sm text-gray-500">Proyectos activos</div>
        </Link>
        <Link href="/invoices?status=issued" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">🧾</div>
          <div className="text-2xl font-bold text-gray-900">€{pendingInvoicesAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Facturas pendientes ({pendingInvoices.length})</div>
        </Link>
        <Link href="/invoices?status=collected" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-900">€{collectedAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Facturas cobradas ({collectedInvoices.length})</div>
        </Link>
        <Link href="/tax-tasks" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-gray-900">
            {upcomingTaxTasks}
            {overdueTasks > 0 && <span className="text-sm text-red-500 ml-1">({overdueTasks} vencidas)</span>}
          </div>
          <div className="text-sm text-gray-500">Tareas fiscales pendientes</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming tax tasks */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Próximas tareas fiscales</h2>
            <Link href="/tax-tasks" className="text-sm text-blue-600 hover:text-blue-700">Ver todas</Link>
          </div>
          {taxTasks.filter(t => t.status === 'pending').length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay tareas pendientes</p>
          ) : (
            <div className="space-y-2">
              {taxTasks.filter(t => t.status === 'pending').slice(0, 4).map((task) => {
                const isOverdue = task.due_date < today
                return (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.category}</div>
                    </div>
                    <div className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                      {task.due_date}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent work logs */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
            <Link href="/work-logs" className="text-sm text-blue-600 hover:text-blue-700">Ver todas</Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay registros de trabajo</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {(log.projects as unknown as { name: string } | null)?.name || 'Sin proyecto'}
                    </div>
                    <div className="text-xs text-gray-500">{log.work_date}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{log.hours}h</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
