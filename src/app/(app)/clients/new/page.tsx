import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientForm from '@/components/ClientForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuevo cliente | autonoMIA',
}

export default async function NewClientPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Nuevo cliente</h1>
      <ClientForm />
    </section>
  )
}
