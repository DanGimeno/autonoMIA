import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { InvoiceWithProject } from '@/types'
import InvoiceListClient from '@/components/InvoiceListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Facturas | autonoMIA',
}

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

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams

  let query = supabase
    .from('invoices')
    .select('*, projects(name)')
    .eq('user_id', user.id)
    .order('issue_date', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: invoicesData } = await query
  const invoices = (invoicesData || []) as InvoiceWithProject[]

  return (
    <InvoiceListClient
      invoices={invoices}
      currentStatus={params.status || ''}
      markCollectedAction={markCollected}
      deleteInvoiceAction={deleteInvoice}
    />
  )
}
