import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ClientForm from '@/components/ClientForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar cliente | autonoMIA',
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Editar cliente</h1>
      <ClientForm client={client} />
    </section>
  )
}
