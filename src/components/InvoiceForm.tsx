'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Invoice, InvoiceStatus } from '@/types'

interface InvoiceFormProps {
  invoice?: Invoice
  projects: { id: string; name: string }[]
  defaultVat?: number | null
  defaultIrpf?: number | null
}

export default function InvoiceForm({ invoice, projects, defaultVat, defaultIrpf }: InvoiceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    invoice_number: invoice?.invoice_number || '',
    concept: invoice?.concept || '',
    project_id: invoice?.project_id || '',
    issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || '',
    amount: invoice?.amount?.toString() || '',
    vat_percent: invoice?.vat_percent?.toString() || (defaultVat?.toString() ?? '21'),
    irpf_percent: invoice?.irpf_percent?.toString() || (defaultIrpf?.toString() ?? '15'),
    status: invoice?.status || 'draft' as InvoiceStatus,
    submitted_to_client: invoice?.submitted_to_client || false,
    notes: invoice?.notes || '',
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
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
      concept: form.concept,
      project_id: form.project_id || null,
      issue_date: form.issue_date,
      due_date: form.due_date || null,
      amount: parseFloat(form.amount),
      vat_percent: parseFloat(form.vat_percent),
      irpf_percent: parseFloat(form.irpf_percent),
      status: form.status,
      submitted_to_client: form.submitted_to_client,
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
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nº Factura *</label>
            <input type="text" required value={form.invoice_number} onChange={e => update('invoice_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
            <select value={form.project_id} onChange={e => update('project_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin proyecto</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
          <input type="text" required value={form.concept} onChange={e => update('concept', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha emisión *</label>
            <input type="date" required value={form.issue_date} onChange={e => update('issue_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha vencimiento</label>
            <input type="date" value={form.due_date} onChange={e => update('due_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base imponible (€) *</label>
            <input type="number" required min="0" step="0.01" value={form.amount} onChange={e => update('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
            <input type="number" min="0" max="100" step="0.01" value={form.vat_percent} onChange={e => update('vat_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IRPF (%)</label>
            <input type="number" min="0" max="100" step="0.01" value={form.irpf_percent} onChange={e => update('irpf_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        {amount > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
            <div className="flex justify-between"><span>Base imponible:</span><span>€{amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA ({vat}%):</span><span>+€{vatAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IRPF ({irpf}%):</span><span>-€{irpfAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total a cobrar:</span><span>€{total.toFixed(2)}</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="draft">Borrador</option>
              <option value="issued">Emitida</option>
              <option value="collected">Cobrada</option>
              <option value="overdue">Vencida</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.submitted_to_client} onChange={e => update('submitted_to_client', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Enviada al cliente</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors">
          {loading ? 'Guardando...' : invoice ? 'Actualizar' : 'Crear factura'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
