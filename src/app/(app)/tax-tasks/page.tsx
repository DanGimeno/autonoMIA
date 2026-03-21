import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { TaxTaskStatus, TaxCategory } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { TaxTaskActions } from '@/components/TaxTaskActions'

export const metadata: Metadata = {
  title: 'Tareas fiscales | autonoMIA',
}

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

function categoryBadgeVariant(category: TaxCategory) {
  switch (category) {
    case 'IVA':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    case 'IRPF':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'cuota autónomo':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    default:
      return ''
  }
}

function formatDateES(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function TaxTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: tasks } = await supabase
    .from('tax_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true })

  const pending = (tasks || []).filter(t => t.status === 'pending')
  const done = (tasks || []).filter(t => t.status === 'done')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tareas fiscales</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus obligaciones fiscales</p>
        </div>
        <Button asChild>
          <Link href="/tax-tasks/new">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Nueva tarea
          </Link>
        </Button>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium mb-2">No hay tareas fiscales</h3>
            <p className="text-muted-foreground mb-4">Añade tus obligaciones fiscales periódicas</p>
            <Button asChild>
              <Link href="/tax-tasks/new">Crear tarea</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section aria-label="Tareas pendientes">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Pendientes ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map(task => {
                  const isOverdue = task.due_date < today
                  return (
                    <Card
                      key={task.id}
                      className={isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}
                    >
                      <CardContent className="flex items-center gap-4 py-4">
                        <form action={toggleStatus}>
                          <input type="hidden" name="id" value={task.id} />
                          <input type="hidden" name="status" value={task.status} />
                          <button
                            type="submit"
                            className="flex h-5 w-5 items-center justify-center rounded border-2 border-input hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Marcar "${task.title}" como completada`}
                          />
                        </form>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{task.title}</span>
                            <Badge
                              variant={task.category === 'other' ? 'secondary' : 'outline'}
                              className={categoryBadgeVariant(task.category as TaxCategory)}
                            >
                              {task.category === 'other' ? 'Otro' : task.category}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                Vencida
                              </Badge>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground mt-0.5">{task.notes}</p>
                          )}
                        </div>
                        <span className={cn(
                          'text-sm font-medium shrink-0',
                          isOverdue ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {formatDateES(task.due_date)}
                        </span>
                        <TaxTaskActions taskId={task.id} taskTitle={task.title} deleteAction={deleteTask} />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {pending.length > 0 && done.length > 0 && (
            <Separator />
          )}

          {done.length > 0 && (
            <section aria-label="Tareas completadas">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Completadas ({done.length})
              </h2>
              <div className="space-y-2">
                {done.map(task => (
                  <Card key={task.id} className="opacity-60">
                    <CardContent className="flex items-center gap-4 py-4">
                      <form action={toggleStatus}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value={task.status} />
                        <button
                          type="submit"
                          className="flex h-5 w-5 items-center justify-center rounded border-2 border-primary bg-primary text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Marcar "${task.title}" como pendiente`}
                        >
                          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </form>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-muted-foreground line-through">
                            {task.title}
                          </span>
                          <Badge
                            variant={task.category === 'other' ? 'secondary' : 'outline'}
                            className={categoryBadgeVariant(task.category as TaxCategory)}
                          >
                            {task.category === 'other' ? 'Otro' : task.category}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {formatDateES(task.due_date)}
                      </span>
                      <TaxTaskActions taskId={task.id} taskTitle={task.title} deleteAction={deleteTask} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
