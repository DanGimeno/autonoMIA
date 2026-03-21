import { createClient } from '@/lib/supabase/server'
import InvoiceForm from '@/components/InvoiceForm'

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase.from('projects').select('id, name').eq('user_id', user!.id)
  const { data: profile } = await supabase.from('profiles').select('default_vat_percent, default_irpf_percent').eq('id', user!.id).single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva factura</h1>
      <InvoiceForm projects={projects || []} defaultVat={profile?.default_vat_percent} defaultIrpf={profile?.default_irpf_percent} />
    </div>
  )
}
