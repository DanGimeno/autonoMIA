'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ScheduledTask, TaskExecution } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption,
} from '@/components/ui/table'
import {
  BarChart3, Users, Clock, CheckCircle2, XCircle, Play, Search,
  Shield, ShieldCheck, Loader2,
} from 'lucide-react'
import { AdminTaskActions } from '@/components/AdminTaskActions'
import { RunTaskButton } from '@/components/RunTaskButton'

interface AdminUser {
  id: string
  full_name: string | null
  email: string
  email_confirmed: boolean
  is_admin: boolean
  onboarding_completed: boolean
  created_at: string
  last_sign_in: string | null
}

interface AdminPanelProps {
  tasks: ScheduledTask[]
  executions: TaskExecution[]
  cronDescriptions: Record<string, string>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function formatDateTime(dateStr: string | null): string {
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

export function AdminPanel({ tasks, executions, cronDescriptions }: AdminPanelProps) {
  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="stats">
          <BarChart3 className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Estadísticas
        </TabsTrigger>
        <TabsTrigger value="users">
          <Users className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Usuarios
        </TabsTrigger>
        <TabsTrigger value="tasks">
          <Clock className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Tareas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <StatsTab tasks={tasks} executions={executions} />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab />
      </TabsContent>

      <TabsContent value="tasks">
        <TasksTab tasks={tasks} executions={executions} cronDescriptions={cronDescriptions} />
      </TabsContent>
    </Tabs>
  )
}

// ============================================================
// Stats Tab
// ============================================================

function StatsTab({ tasks, executions }: { tasks: ScheduledTask[]; executions: TaskExecution[] }) {
  const recentSuccess = executions.filter(e => e.status === 'success').length
  const recentFailure = executions.filter(e => e.status === 'failure').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold text-green-600">{recentSuccess}</div>
            <div className="text-sm text-muted-foreground">Ejecuciones OK</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-destructive">{recentFailure}</div>
            <div className="text-sm text-muted-foreground">Errores recientes</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas ejecuciones</CardTitle>
          <CardDescription>Historial reciente de tareas programadas</CardDescription>
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
                        <ExecutionStatusBadge status={exec.status} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {task?.name || exec.task_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(exec.started_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(exec.completed_at)}
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
    </div>
  )
}

// ============================================================
// Users Tab
// ============================================================

function UsersTab() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function toggleAdmin(userId: string, currentIsAdmin: boolean) {
    setUpdatingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_admin: !currentIsAdmin }),
      })

      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, is_admin: !currentIsAdmin } : u
        ))
        router.refresh()
      }
    } catch {
      // silent
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      !search ||
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'admin' && u.is_admin) ||
      (filter === 'user' && !u.is_admin)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Buscar usuarios"
          />
        </div>

        <div className="flex gap-1">
          {(['all', 'user', 'admin'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'Todos' : f === 'admin' ? 'Admin' : 'Usuario'}
            </Button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground">
          {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando usuarios...</span>
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de usuarios registrados</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Nombre</TableHead>
                  <TableHead scope="col">Email</TableHead>
                  <TableHead scope="col">Rol</TableHead>
                  <TableHead scope="col">Estado</TableHead>
                  <TableHead scope="col">Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {(u.full_name || u.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{u.full_name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Button
                        variant={u.is_admin ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        disabled={updatingId === u.id}
                        aria-label={`Cambiar rol de ${u.full_name || u.email}`}
                        className="gap-1"
                      >
                        {updatingId === u.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        ) : u.is_admin ? (
                          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <Shield className="h-3 w-3" aria-hidden="true" />
                        )}
                        {u.is_admin ? 'admin' : 'user'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {u.email_confirmed ? (
                        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                          Completado
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pendiente</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Tasks Tab
// ============================================================

function TasksTab({
  tasks,
  executions,
  cronDescriptions,
}: {
  tasks: ScheduledTask[]
  executions: TaskExecution[]
  cronDescriptions: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tareas programadas</CardTitle>
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
                  <TableHead scope="col">Acción</TableHead>
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
                      <div>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{task.cron_expression}</code>
                        <div className="text-xs text-muted-foreground mt-1">
                          {cronDescriptions[task.id] || task.cron_expression}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.enabled ? 'default' : 'secondary'}>
                        {task.enabled ? 'Activa' : 'Pausada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(task.last_run_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(task.next_run_at)}
                    </TableCell>
                    <TableCell>
                      <RunTaskButton taskId={task.id} taskName={task.name} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Historial de ejecuciones</CardTitle>
          <CardDescription>Últimas 20 ejecuciones de tareas</CardDescription>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay ejecuciones registradas.
            </p>
          ) : (
            <Table>
              <TableCaption>Historial de ejecuciones</TableCaption>
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
                        <ExecutionStatusBadge status={exec.status} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {task?.name || exec.task_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(exec.started_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(exec.completed_at)}
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
    </div>
  )
}

// ============================================================
// Shared
// ============================================================

function ExecutionStatusBadge({ status }: { status: string }) {
  if (status === 'success') {
    return (
      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
        OK
      </Badge>
    )
  }
  if (status === 'failure') {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
        Error
      </Badge>
    )
  }
  return (
    <Badge variant="secondary">
      <Play className="h-3 w-3 mr-1" aria-hidden="true" />
      En curso
    </Badge>
  )
}
