import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpenseForm from '@/components/ExpenseForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuevo gasto | autonoMIA',
}

export default async function NewExpensePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_vat_percent, default_irpf_percent')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <ExpenseForm
        projects={projects || []}
        defaultVat={profile?.default_vat_percent}
        defaultIrpf={profile?.default_irpf_percent}
      />
    </div>
  )
}
