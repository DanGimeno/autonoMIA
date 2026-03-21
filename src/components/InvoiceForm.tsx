'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Invoice, InvoiceStatus } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface InvoiceFormProps {
  invoice?: Invoice
  projects: { id: string; name: string }[]
  defaultVat?: number | null
  defaultIrpf?: number | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

const supabase = createClient()

export default function InvoiceForm({ invoice, projects, defaultVat, defaultIrpf }: InvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<{ id: string; name: string; nif_cif: string | null; default_payment_days: number; default_vat_percent: number; default_irpf_percent: number }[]>([])

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name, nif_cif, default_payment_days, default_vat_percent, default_irpf_percent')
        .eq('is_active', true)
        .order('name')
      setClients(data || [])
    }
    fetchClients()
  }, [])

  const [form, setForm] = useState({
    invoice_number: invoice?.invoice_number || '',
    series: invoice?.series || 'F',
    concept: invoice?.concept || '',
    client_id: invoice?.client_id || '',
    project_id: invoice?.project_id || '',
    issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || '',
    amount: invoice?.amount?.toString() || '',
    vat_percent: invoice?.vat_percent?.toString() || (defaultVat?.toString() ?? '21'),
    irpf_percent: invoice?.irpf_percent?.toString() || (defaultIrpf?.toString() ?? '15'),
    status: invoice?.status || 'draft' as InvoiceStatus,
    submitted_to_client: invoice?.submitted_to_client || false,
    payment_method: invoice?.payment_method || '',
    notes: invoice?.notes || '',
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // When client changes, auto-fill VAT/IRPF and due date from client defaults
  function handleClientChange(clientId: string) {
    update('client_id', clientId === '_none' ? '' : clientId)
    if (clientId && clientId !== '_none') {
      const client = clients.find(c => c.id === clientId)
      if (client) {
        update('vat_percent', client.default_vat_percent.toString())
        update('irpf_percent', client.default_irpf_percent.toString())
        // Auto-calculate due date from issue date + payment days
        if (form.issue_date && client.default_payment_days) {
          const issueDate = new Date(form.issue_date + 'T00:00:00')
          issueDate.setDate(issueDate.getDate() + client.default_payment_days)
          update('due_date', issueDate.toISOString().split('T')[0])
        }
      }
    }
  }

  const amount = parseFloat(form.amount) || 0
  const vat = parseFloat(form.vat_percent) || 0
  const irpf = parseFloat(form.irpf_percent) || 0
  const vatAmount = amount * vat / 100
  const irpfAmount = amount * irpf / 100
  const total = amount + vatAmount - irpfAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      invoice_number: form.invoice_number,
      series: form.series,
      concept: form.concept,
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      issue_date: form.issue_date,
      due_date: form.due_date || null,
      amount: parseFloat(form.amount),
      vat_percent: parseFloat(form.vat_percent),
      irpf_percent: parseFloat(form.irpf_percent),
      status: form.status,
      submitted_to_client: form.submitted_to_client,
      payment_method: form.payment_method || null,
      notes: form.notes || null,
    }

    let result
    if (invoice) {
      result = await supabase.from('invoices').update(payload).eq('id', invoice.id)
    } else {
      result = await supabase.from('invoices').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.push('/invoices')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{invoice ? 'Editar factura' : 'Nueva factura'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" aria-live="polite" role="alert">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Row 1: Invoice number + Series + Client */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Nº Factura *</Label>
              <Input
                id="invoice_number"
                type="text"
                required
                value={form.invoice_number}
                onChange={e => update('invoice_number', e.target.value)}
                aria-required="true"
                placeholder="2026-F001"
              />
            </div>
            <div className="space-y-2">
              <Label id="series-label">Serie</Label>
              <Select value={form.series} onValueChange={(val) => { if (val) update('series', val) }}>
                <SelectTrigger className="w-full" aria-labelledby="series-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">F - Factura</SelectItem>
                  <SelectItem value="R">R - Rectificativa</SelectItem>
                  <SelectItem value="P">P - Proforma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label id="client-label">Cliente</Label>
              <Select
                value={form.client_id || '_none'}
                onValueChange={handleClientChange}
              >
                <SelectTrigger className="w-full" aria-labelledby="client-label">
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

          {/* Row 2: Project + Concept */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label id="project-label">Proyecto</Label>
              <Select
                value={form.project_id || '_none'}
                onValueChange={(val) => update('project_id', val === '_none' ? '' : val)}
              >
                <SelectTrigger className="w-full" aria-labelledby="project-label">
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
              <Label htmlFor="concept">Concepto *</Label>
              <Input
                id="concept"
                type="text"
                required
                value={form.concept}
                onChange={e => update('concept', e.target.value)}
                aria-required="true"
              />
            </div>
          </div>

          {/* Row 3: Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Fecha de emisión *</Label>
              <Input
                id="issue_date"
                type="date"
                required
                value={form.issue_date}
                onChange={e => update('issue_date', e.target.value)}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha de vencimiento</Label>
              <Input
                id="due_date"
                type="date"
                value={form.due_date}
                onChange={e => update('due_date', e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Amounts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Base imponible (&euro;) *</Label>
              <Input
                id="amount"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_percent">IVA (%)</Label>
              <Input
                id="vat_percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.vat_percent}
                onChange={e => update('vat_percent', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="irpf_percent">IRPF (%)</Label>
              <Input
                id="irpf_percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.irpf_percent}
                onChange={e => update('irpf_percent', e.target.value)}
              />
            </div>
          </div>

          {/* Calculation summary */}
          {amount > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="py-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Base imponible:</span><span>{formatCurrency(amount)}</span></div>
                <div className="flex justify-between"><span>IVA ({vat}%):</span><span>+{formatCurrency(vatAmount)}</span></div>
                <div className="flex justify-between"><span>IRPF ({irpf}%):</span><span>-{formatCurrency(irpfAmount)}</span></div>
                <div className="flex justify-between font-semibold pt-1 border-t border-border">
                  <span>Total a cobrar:</span><span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status + Payment method + Submitted */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label id="status-label">Estado</Label>
              <Select value={form.status} onValueChange={(val) => { if (val) update('status', val) }}>
                <SelectTrigger className="w-full" aria-labelledby="status-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="issued">Emitida</SelectItem>
                  <SelectItem value="collected">Cobrada</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label id="payment-label">Método de pago</Label>
              <Select
                value={form.payment_method || '_none'}
                onValueChange={(val) => update('payment_method', val === '_none' ? '' : val)}
              >
                <SelectTrigger className="w-full" aria-labelledby="payment-label">
                  <SelectValue placeholder="Sin especificar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sin especificar</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:mt-8">
              <Checkbox
                id="submitted_to_client"
                checked={form.submitted_to_client}
                onCheckedChange={(checked) => update('submitted_to_client', checked === true)}
              />
              <Label htmlFor="submitted_to_client" className="cursor-pointer">
                Enviada al cliente
              </Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : invoice ? 'Actualizar' : 'Crear factura'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
