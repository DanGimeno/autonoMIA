import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import TaxTaskForm from '@/components/TaxTaskForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar tarea fiscal | autonoMIA',
}

export default async function EditTaxTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: task } = await supabase.from('tax_tasks').select('*').eq('id', id).single()

  if (!task) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar tarea fiscal</h1>
      <TaxTaskForm task={task} />
    </div>
  )
}
