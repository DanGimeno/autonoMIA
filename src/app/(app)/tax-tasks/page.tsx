import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { TaxTaskStatus, TaxCategory } from '@/types'

async function toggleStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentStatus = formData.get('status') as TaxTaskStatus
  const supabase = await createClient()
  await supabase.from('tax_tasks').update({
    status: currentStatus === 'pending' ? 'done' : 'pending',
  }).eq('id', id)
  revalidatePath('/tax-tasks')
}

async function deleteTask(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('tax_tasks').delete().eq('id', id)
  revalidatePath('/tax-tasks')
}

const categoryColors: Record<TaxCategory, string> = {
  IVA: 'bg-purple-100 text-purple-700',
  IRPF: 'bg-orange-100 text-orange-700',
  'cuota autónomo': 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700',
}

export default async function TaxTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  const { data: tasks } = await supabase
    .from('tax_tasks')
    .select('*')
    .eq('user_id', user!.id)
    .order('due_date', { ascending: true })

  const pending = (tasks || []).filter(t => t.status === 'pending')
  const done = (tasks || []).filter(t => t.status === 'done')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas fiscales</h1>
          <p className="text-gray-500 mt-1">Gestiona tus obligaciones fiscales</p>
        </div>
        <Link
          href="/tax-tasks/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nueva tarea
        </Link>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas fiscales</h3>
          <p className="text-gray-500 mb-4">Añade tus obligaciones fiscales periódicas</p>
          <Link href="/tax-tasks/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Crear tarea
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Pendientes ({pending.length})</h2>
              <div className="space-y-2">
                {pending.map(task => {
                  const isOverdue = task.due_date < today
                  return (
                    <div key={task.id} className={`bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4 ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                      <form action={toggleStatus}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value={task.status} />
                        <button type="submit" className="w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors flex-shrink-0" />
                      </form>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{task.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[task.category as TaxCategory]}`}>
                            {task.category}
                          </span>
                          {isOverdue && <span className="text-xs text-red-600 font-medium">¡Vencida!</span>}
                        </div>
                        {task.notes && <p className="text-sm text-gray-500 mt-0.5">{task.notes}</p>}
                      </div>
                      <div className={`text-sm font-medium flex-shrink-0 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        {task.due_date}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/tax-tasks/${task.id}/edit`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Editar
                        </Link>
                        <form action={deleteTask}>
                          <input type="hidden" name="id" value={task.id} />
                          <button type="submit" className="text-xs text-red-500 hover:text-red-600 font-medium"
                            onClick={e => { if (!confirm('¿Eliminar esta tarea?')) e.preventDefault() }}>
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Completadas ({done.length})</h2>
              <div className="space-y-2">
                {done.map(task => (
                  <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 opacity-60">
                    <form action={toggleStatus}>
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value={task.status} />
                      <button type="submit" className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                        ✓
                      </button>
                    </form>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-700 line-through">{task.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[task.category as TaxCategory]}`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 flex-shrink-0">{task.due_date}</div>
                    <div className="flex gap-2">
                      <Link href={`/tax-tasks/${task.id}/edit`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Editar
                      </Link>
                      <form action={deleteTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <button type="submit" className="text-xs text-red-500 hover:text-red-600 font-medium"
                          onClick={e => { if (!confirm('¿Eliminar esta tarea?')) e.preventDefault() }}>
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
