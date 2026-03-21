'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, AlertTriangle } from 'lucide-react'

const supabase = createClient()

const taskTypes = [
  { value: 'check_overdue_invoices', label: 'Revisar facturas vencidas' },
  { value: 'check_upcoming_tax_tasks', label: 'Revisar tareas fiscales próximas' },
  { value: 'generate_quarterly_summary', label: 'Generar resumen trimestral' },
  { value: 'custom', label: 'Personalizada' },
]

export function AdminTaskActions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    cron_expression: '0 9 * * 1',
    task_type: 'check_overdue_invoices',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.from('scheduled_tasks').insert({
      name: form.name,
      description: form.description || null,
      cron_expression: form.cron_expression,
      task_type: form.task_type,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setOpen(false)
      setForm({ name: '', description: '', cron_expression: '0 9 * * 1', task_type: 'check_overdue_invoices' })
      router.refresh()
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
        Nueva tarea
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby="create-task-desc">
          <DialogHeader>
            <DialogTitle>Crear tarea programada</DialogTitle>
            <DialogDescription id="create-task-desc">
              Configura una nueva tarea que se ejecutará automáticamente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div role="status" aria-live="polite">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-name">Nombre *</Label>
              <Input
                id="task-name"
                required
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Ej: Revisar facturas vencidas semanalmente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc">Descripción</Label>
              <Textarea
                id="task-desc"
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-type">Tipo de tarea</Label>
              <Select
                value={form.task_type}
                onValueChange={(value) => value && update('task_type', value)}
              >
                <SelectTrigger id="task-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-cron">Expresión cron *</Label>
              <Input
                id="task-cron"
                required
                value={form.cron_expression}
                onChange={e => update('cron_expression', e.target.value)}
                placeholder="0 9 * * 1"
              />
              <p className="text-xs text-muted-foreground">
                Formato: minuto hora día-mes mes día-semana. Ej: &quot;0 9 * * 1&quot; = cada lunes a las 9:00
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear tarea'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
