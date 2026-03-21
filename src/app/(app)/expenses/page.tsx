import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ExpenseWithRelations } from '@/types'
import ExpenseListClient from '@/components/ExpenseListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gastos | autonoMIA',
}

async function deleteExpense(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('expenses').delete().eq('id', id)
  revalidatePath('/expenses')
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: expensesData } = await supabase
    .from('expenses')
    .select('*, projects(name)')
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false })

  const expenses = (expensesData || []) as ExpenseWithRelations[]

  return (
    <ExpenseListClient
      expenses={expenses}
      deleteExpenseAction={deleteExpense}
    />
  )
}
