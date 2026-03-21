'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, ProjectStatus, BillingType, Client } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ProjectFormProps {
  project?: Project
}

const supabase = createClient()

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  const [form, setForm] = useState({
    name: project?.name || '',
    client_id: project?.client_id || '',
    description: project?.description || '',
    status: project?.status || ('active' as ProjectStatus),
    billing_type: project?.billing_type || ('hourly' as BillingType),
    hourly_rate: project?.hourly_rate?.toString() || '',
    monthly_rate: project?.monthly_rate?.toString() || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    budget: project?.budget?.toString() || '',
    color: project?.color || '#63ADF2',
  })

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name, nif_cif')
        .eq('is_active', true)
        .order('name')
      setClients((data as Client[]) || [])
    }
    fetchClients()
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name,
      client_id: form.client_id || null,
      description: form.description || null,
      status: form.status,
      billing_type: form.billing_type,
      hourly_rate: form.billing_type === 'hourly' && form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      monthly_rate: form.billing_type === 'flat_rate' && form.monthly_rate ? parseFloat(form.monthly_rate) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      color: form.color,
    }

    let result
    if (project) {
      result = await supabase.from('projects').update(payload).eq('id', project.id)
    } else {
      result = await supabase.from('projects').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.push('/projects')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{project ? 'Editar proyecto' : 'Nuevo proyecto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert variant="destructive" className="mb-6" aria-live="polite">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nombre del proyecto *</Label>
                <Input
                  id="project-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  aria-required="true"
                  placeholder="Ej: Rediseño web"
                />
              </div>

              <div className="space-y-2">
                <Label id="project-client-label">Cliente</Label>
                <Select
                  value={form.client_id}
                  onValueChange={(val) => update('client_id', val === '_none' ? '' : val)}
                >
                  <SelectTrigger className="w-full" aria-labelledby="project-client-label">
                    <SelectValue placeholder="Sin cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin cliente</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.nif_cif ? ` (${c.nif_cif})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Descripción</Label>
              <Textarea
                id="project-description"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                placeholder="Breve descripción del proyecto"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label id="project-status-label">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => { if (val) update('status', val) }}
                >
                  <SelectTrigger className="w-full" aria-labelledby="project-status-label">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label id="project-billing-label">Tipo de facturación</Label>
                <Select
                  value={form.billing_type}
                  onValueChange={(val) => { if (val) update('billing_type', val) }}
                >
                  <SelectTrigger className="w-full" aria-labelledby="project-billing-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Por horas</SelectItem>
                    <SelectItem value="flat_rate">Tarifa plana mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.billing_type === 'hourly' ? (
              <div className="space-y-2">
                <Label htmlFor="project-hourly-rate">Tarifa por hora (&euro;/h)</Label>
                <Input
                  id="project-hourly-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourly_rate}
                  onChange={(e) => update('hourly_rate', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="project-monthly-rate">Tarifa mensual (&euro;/mes)</Label>
                <Input
                  id="project-monthly-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthly_rate}
                  onChange={(e) => update('monthly_rate', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Importe fijo mensual independiente de las horas trabajadas
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="project-start">Fecha inicio</Label>
                <Input
                  id="project-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => update('start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-end">Fecha fin</Label>
                <Input
                  id="project-end"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => update('end_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-budget">Presupuesto (&euro;)</Label>
                <Input
                  id="project-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => update('budget', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-color">Color (calendario)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="project-color"
                  type="color"
                  value={form.color}
                  onChange={(e) => update('color', e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-md border border-input"
                />
                <span className="text-sm text-muted-foreground">{form.color}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : project ? 'Actualizar' : 'Crear proyecto'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
