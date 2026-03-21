import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import InvoiceForm from '@/components/InvoiceForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar factura | autonoMIA',
}

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', id).single()
  const { data: projects } = await supabase.from('projects').select('id, name').eq('user_id', user.id)

  if (!invoice) notFound()

  return (
    <div>
      <InvoiceForm invoice={invoice} projects={projects || []} />
    </div>
  )
}
