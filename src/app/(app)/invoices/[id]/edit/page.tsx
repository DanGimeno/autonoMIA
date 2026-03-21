import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InvoiceForm from '@/components/InvoiceForm'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', id).single()
  const { data: projects } = await supabase.from('projects').select('id, name').eq('user_id', user!.id)

  if (!invoice) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar factura</h1>
      <InvoiceForm invoice={invoice} projects={projects || []} />
    </div>
  )
}
