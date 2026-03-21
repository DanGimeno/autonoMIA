import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { InvoiceStatus, InvoiceWithProject } from '@/types'

async function markCollected(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('invoices').update({
    status: 'collected',
    paid_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/invoices')
}

async function deleteInvoice(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('invoices').delete().eq('id', id)
  revalidatePath('/invoices')
}

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  collected: 'Cobrada',
  overdue: 'Vencida',
}

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  issued: 'bg-blue-100 text-blue-700',
  collected: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('invoices')
    .select('*, projects(name)')
    .eq('user_id', user!.id)
    .order('issue_date', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: invoicesData } = await query
  const invoices = (invoicesData || []) as InvoiceWithProject[]

  const totalPending = invoices
    .filter(i => i.status === 'issued')
    .reduce((sum, i) => sum + i.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus facturas</p>
        </div>
        <Link
          href="/invoices/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nueva factura
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { label: 'Todas', value: '' },
          { label: 'Borrador', value: 'draft' },
          { label: 'Emitidas', value: 'issued' },
          { label: 'Cobradas', value: 'collected' },
          { label: 'Vencidas', value: 'overdue' },
        ].map(tab => (
          <Link
            key={tab.value}
            href={tab.value ? `/invoices?status=${tab.value}` : '/invoices'}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              params.status === tab.value || (!params.status && !tab.value)
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!invoices || invoices.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">🧾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay facturas todavía</h3>
          <p className="text-gray-500 mb-4">Crea tu primera factura para empezar</p>
          <Link href="/invoices/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Crear factura
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nº Factura</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Concepto</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Cliente/Proyecto</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Importe</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((invoice) => {
                const isOverdue = invoice.status === 'issued' && invoice.due_date && invoice.due_date < today
                return (
                  <tr key={invoice.id} className={`hover:bg-gray-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 max-w-40 truncate">{invoice.concept}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{invoice.projects?.name || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{invoice.issue_date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">€{invoice.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : statusColors[invoice.status as InvoiceStatus]}`}>
                        {isOverdue ? 'Vencida' : statusLabels[invoice.status as InvoiceStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/invoices/${invoice.id}/edit`}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Editar
                        </Link>
                        {invoice.status === 'issued' && (
                          <form action={markCollected}>
                            <input type="hidden" name="id" value={invoice.id} />
                            <button type="submit" className="text-xs text-green-600 hover:text-green-700 font-medium">
                              Marcar cobrada
                            </button>
                          </form>
                        )}
                        <form action={deleteInvoice}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                            onClick={(e) => { if (!confirm('¿Eliminar esta factura?')) e.preventDefault() }}
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {totalPending > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 text-right">
              Total pendiente de cobro: <span className="font-semibold text-gray-900">€{totalPending.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
