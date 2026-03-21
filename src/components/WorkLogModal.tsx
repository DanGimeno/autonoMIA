'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WorkLog, Project } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface WorkLogModalProps {
  date: string
  log: WorkLog | null
  projects: Project[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const supabase = createClient()

export default function WorkLogModal({ date, log, projects, open, onOpenChange, onSave }: WorkLogModalProps) {
  const [form, setForm] = useState({
    project_id: '',
    hours: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm({
        project_id: log?.project_id || '',
        hours: log?.hours?.toString() || '',
        notes: log?.notes || '',
      })
      setError(null)
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }, [open, log])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.hours || parseFloat(form.hours) <= 0) {
      setError('Las horas deben ser mayores que 0')
      setLoading(false)
      return
    }

    const payload = {
      work_date: date,
      project_id: form.project_id || null,
      hours: parseFloat(form.hours),
      notes: form.notes || null,
    }

    let result
    if (log) {
      result = await supabase.from('work_logs').update(payload).eq('id', log.id)
    } else {
      result = await supabase.from('work_logs').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      setLoading(false)
      onSave()
      onOpenChange(false)
    }
  }

  async function handleDelete() {
    if (!log) return
    setLoading(true)
    await supabase.from('work_logs').delete().eq('id', log.id)
    setLoading(false)
    onSave()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="worklog-dialog-desc">
        <DialogHeader>
          <DialogTitle>
            {log ? 'Editar registro' : 'Añadir horas'}
          </DialogTitle>
          <DialogDescription id="worklog-dialog-desc">
            {formatDateSpanish(date)}
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                ¿Seguro que quieres eliminar este registro de {log?.hours}h?
              </AlertDescription>
            </Alert>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div role="status" aria-live="polite">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wl-project">Proyecto</Label>
              <Select
                value={form.project_id}
                onValueChange={(value) => update('project_id', value === '_none' || value === null ? '' : value)}
              >
                <SelectTrigger id="wl-project">
                  <SelectValue placeholder="Sin proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sin proyecto</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wl-hours">Horas *</Label>
              <Input
                ref={firstInputRef}
                id="wl-hours"
                type="number"
                required
                min="0.5"
                max="24"
                step="0.5"
                value={form.hours}
                onChange={(e) => update('hours', e.target.value)}
                aria-describedby={error ? 'wl-error' : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wl-notes">Notas</Label>
              <Textarea
                id="wl-notes"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {log && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive hover:text-destructive"
                  aria-label="Eliminar registro"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
