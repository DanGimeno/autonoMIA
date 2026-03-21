import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExpenseForm from '@/components/ExpenseForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar gasto | autonoMIA',
}

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!expense) notFound()

  return (
    <div>
      <ExpenseForm expense={expense} projects={projects || []} />
    </div>
  )
}
