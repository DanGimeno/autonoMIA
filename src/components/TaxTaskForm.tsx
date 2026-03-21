'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TaxTask } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

interface TaxTaskFormProps {
  task?: TaxTask
}

export default function TaxTaskForm({ task }: TaxTaskFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: task?.title || '',
    due_date: task?.due_date || '',
    category: task?.category || 'other',
    status: task?.status || 'pending',
    notes: task?.notes || '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      title: form.title,
      due_date: form.due_date,
      category: form.category,
      status: form.status,
      notes: form.notes || null,
    }

    let result
    if (task) {
      result = await supabase.from('tax_tasks').update(payload).eq('id', task.id)
    } else {
      result = await supabase.from('tax_tasks').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.push('/tax-tasks')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{task ? 'Editar tarea fiscal' : 'Nueva tarea fiscal'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" aria-live="polite">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Ej: Declaracion IVA 1T 2025"
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha limite *</Label>
              <Input
                id="due_date"
                type="date"
                required
                value={form.due_date}
                onChange={e => update('due_date', e.target.value)}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(value) => {
                  if (value) update('category', value as string)
                }}
              >
                <SelectTrigger id="category" className="w-full" aria-label="Categoria de la tarea">
                  <SelectValue placeholder="Selecciona categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IVA">IVA</SelectItem>
                  <SelectItem value="IRPF">IRPF</SelectItem>
                  <SelectItem value="cuota autónomo">Cuota autonomo</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={form.status}
              onValueChange={(value) => {
                if (value) update('status', value as string)
              }}
            >
              <SelectTrigger id="status" className="w-full" aria-label="Estado de la tarea">
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="done">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : task ? 'Actualizar' : 'Crear tarea'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
