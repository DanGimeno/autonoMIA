'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ExpenseFormProps {
  expense?: Expense
  projects: { id: string; name: string }[]
  defaultVat?: number | null
  defaultIrpf?: number | null
}

const categoryLabels: Record<ExpenseCategory, string> = {
  material: 'Material',
  software: 'Software',
  hardware: 'Hardware',
  travel: 'Viajes',
  meals: 'Comidas',
  office: 'Oficina',
  telecom: 'Telecom',
  professional_services: 'Servicios profesionales',
  training: 'Formacion',
  insurance: 'Seguros',
  vehicle: 'Vehiculo',
  marketing: 'Marketing',
  banking: 'Banca',
  taxes: 'Impuestos',
  other: 'Otro',
}

const statusLabels: Record<ExpenseStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  reimbursed: 'Reembolsado',
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: 'Transferencia',
  card: 'Tarjeta',
  cash: 'Efectivo',
  paypal: 'PayPal',
  other: 'Otro',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export default function ExpenseForm({ expense, projects, defaultVat, defaultIrpf }: ExpenseFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    concept: expense?.concept || '',
    category: expense?.category || 'other' as ExpenseCategory,
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    amount: expense?.amount?.toString() || '',
    vat_percent: expense?.vat_percent?.toString() || (defaultVat?.toString() ?? '21'),
    vat_deductible_percent: expense?.vat_deductible_percent?.toString() || '100',
    irpf_percent: expense?.irpf_percent?.toString() || (defaultIrpf?.toString() ?? '0'),
    supplier_name: expense?.supplier_name || '',
    supplier_nif: expense?.supplier_nif || '',
    receipt_number: expense?.receipt_number || '',
    payment_method: expense?.payment_method || '' as PaymentMethod | '',
    status: expense?.status || 'pending' as ExpenseStatus,
    is_recurring: expense?.is_recurring || false,
    project_id: expense?.project_id || '',
    notes: expense?.notes || '',
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const amount = parseFloat(form.amount) || 0
  const vat = parseFloat(form.vat_percent) || 0
  const irpf = parseFloat(form.irpf_percent) || 0
  const vatDeductiblePct = parseFloat(form.vat_deductible_percent) || 0
  const vatAmount = amount * vat / 100
  const irpfAmount = amount * irpf / 100
  const total = amount + vatAmount - irpfAmount
  const vatDeductible = vatAmount * vatDeductiblePct / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      concept: form.concept,
      category: form.category,
      expense_date: form.expense_date,
      amount: parseFloat(form.amount),
      vat_percent: parseFloat(form.vat_percent),
      vat_deductible_percent: parseFloat(form.vat_deductible_percent),
      irpf_percent: parseFloat(form.irpf_percent),
      supplier_name: form.supplier_name || null,
      supplier_nif: form.supplier_nif || null,
      receipt_number: form.receipt_number || null,
      payment_method: form.payment_method || null,
      status: form.status,
      is_recurring: form.is_recurring,
      project_id: form.project_id || null,
      notes: form.notes || null,
    }

    let result
    if (expense) {
      result = await supabase.from('expenses').update(payload).eq('id', expense.id)
    } else {
      result = await supabase.from('expenses').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.push('/expenses')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{expense ? 'Editar gasto' : 'Nuevo gasto'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" aria-live="polite" role="alert">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Row 1: Concept */}
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

          {/* Row 2: Category + Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={form.category}
                onValueChange={(val: string) => update('category', val)}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(categoryLabels) as [ExpenseCategory, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date">Fecha *</Label>
              <Input
                id="expense_date"
                type="date"
                required
                value={form.expense_date}
                onChange={e => update('expense_date', e.target.value)}
                aria-required="true"
              />
            </div>
          </div>

          {/* Row 3: Amount + VAT + IRPF */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Base imponible (EUR) *</Label>
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

          {/* Row 4: VAT deductible percent */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vat_deductible_percent">IVA deducible (%)</Label>
              <Select
                value={form.vat_deductible_percent}
                onValueChange={(val: string) => update('vat_deductible_percent', val)}
              >
                <SelectTrigger id="vat_deductible_percent" className="w-full">
                  <SelectValue placeholder="Porcentaje deducible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculation summary */}
          {amount > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Base imponible:</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({vat}%):</span>
                  <span>+{formatCurrency(vatAmount)}</span>
                </div>
                {irpf > 0 && (
                  <div className="flex justify-between">
                    <span>IRPF ({irpf}%):</span>
                    <span>-{formatCurrency(irpfAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-border">
                  <span>Total gasto:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA deducible ({vatDeductiblePct}%):</span>
                  <span>{formatCurrency(vatDeductible)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Row 5: Supplier info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Proveedor</Label>
              <Input
                id="supplier_name"
                type="text"
                value={form.supplier_name}
                onChange={e => update('supplier_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_nif">NIF proveedor</Label>
              <Input
                id="supplier_nif"
                type="text"
                value={form.supplier_nif}
                onChange={e => update('supplier_nif', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt_number">N. factura/recibo</Label>
              <Input
                id="receipt_number"
                type="text"
                value={form.receipt_number}
                onChange={e => update('receipt_number', e.target.value)}
              />
            </div>
          </div>

          {/* Row 6: Payment method + Status + Project */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Metodo de pago</Label>
              <Select
                value={form.payment_method || undefined}
                onValueChange={(val: string) => update('payment_method', val || '')}
              >
                <SelectTrigger id="payment_method" className="w-full">
                  <SelectValue placeholder="Sin especificar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin especificar</SelectItem>
                  {(Object.entries(paymentMethodLabels) as [PaymentMethod, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(val: string) => update('status', val || 'pending')}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(statusLabels) as [ExpenseStatus, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_id">Proyecto</Label>
              <Select
                value={form.project_id || undefined}
                onValueChange={(val: string | null) => update('project_id', val || '')}
              >
                <SelectTrigger id="project_id" className="w-full">
                  <SelectValue placeholder="Sin proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin proyecto</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurring checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_recurring"
              checked={form.is_recurring}
              onCheckedChange={(checked: boolean) => update('is_recurring', checked)}
            />
            <Label htmlFor="is_recurring" className="cursor-pointer">
              Gasto recurrente
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : expense ? 'Actualizar' : 'Crear gasto'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
