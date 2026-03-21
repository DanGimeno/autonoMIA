import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoiceForm from '@/components/InvoiceForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nueva factura | autonoMIA',
}

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase.from('projects').select('id, name').eq('user_id', user.id)
  const { data: profile } = await supabase.from('profiles').select('default_vat_percent, default_irpf_percent').eq('id', user.id).single()

  return (
    <div>
      <InvoiceForm projects={projects || []} defaultVat={profile?.default_vat_percent} defaultIrpf={profile?.default_irpf_percent} />
    </div>
  )
}
