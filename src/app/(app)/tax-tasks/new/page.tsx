import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TaxTaskForm from '@/components/TaxTaskForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nueva tarea fiscal | autonoMIA',
}

export default async function NewTaxTaskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva tarea fiscal</h1>
      <TaxTaskForm />
    </div>
  )
}
