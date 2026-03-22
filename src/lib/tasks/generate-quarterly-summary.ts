import { SupabaseClient } from '@supabase/supabase-js'

interface TaskResult {
  quarters_updated: number
  users_processed: number
  details: Array<{ user_id: string; quarter: number; year: number }>
}

/**
 * Calculate and upsert quarterly tax summaries for all users.
 * Aggregates invoice income, expense deductions, IVA and IRPF.
 */
export async function generateQuarterlySummary(
  supabase: SupabaseClient
): Promise<TaskResult> {
  const now = new Date()
  const year = now.getFullYear()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)

  // Get the date range for this quarter
  const quarterStart = new Date(year, (quarter - 1) * 3, 1)
  const quarterEnd = new Date(year, quarter * 3, 0) // last day of quarter
  const startStr = quarterStart.toISOString().split('T')[0]
  const endStr = quarterEnd.toISOString().split('T')[0]

  // Get all users with profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, default_irpf_percent, autonomo_fee')

  if (profilesError) throw new Error(`Error fetching profiles: ${profilesError.message}`)
  if (!profiles || profiles.length === 0) {
    return { quarters_updated: 0, users_processed: 0, details: [] }
  }

  const result: TaskResult = { quarters_updated: 0, users_processed: 0, details: [] }

  for (const profile of profiles) {
    // Fetch invoices for this quarter (collected or issued)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, vat_percent, irpf_percent')
      .eq('user_id', profile.id)
      .in('status', ['issued', 'collected', 'overdue'])
      .gte('issue_date', startStr)
      .lte('issue_date', endStr)

    // Fetch expenses for this quarter
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, vat_percent, vat_deductible_percent, irpf_percent')
      .eq('user_id', profile.id)
      .gte('expense_date', startStr)
      .lte('expense_date', endStr)

    // Calculate IVA repercutido (from invoices)
    const vatCollected = (invoices || []).reduce(
      (sum, inv) => sum + (inv.amount * (inv.vat_percent || 0)) / 100,
      0
    )

    // Calculate IVA soportado deducible (from expenses)
    const vatDeductible = (expenses || []).reduce(
      (sum, exp) => sum + (exp.amount * (exp.vat_percent || 0) * (exp.vat_deductible_percent || 100)) / 10000,
      0
    )

    // Income and expenses
    const income = (invoices || []).reduce((sum, inv) => sum + inv.amount, 0)
    const deductibleExpenses = (expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
    const netIncome = income - deductibleExpenses

    // IRPF withheld by clients (from invoices)
    const irpfWithheld = (invoices || []).reduce(
      (sum, inv) => sum + (inv.amount * (inv.irpf_percent || 0)) / 100,
      0
    )

    // IRPF rate (default 20% for estimación directa simplificada)
    const irpfRate = profile.default_irpf_percent || 20
    const irpfAmount = (netIncome * irpfRate) / 100

    // Autonomo fee (monthly, 3 months per quarter)
    const autonomoFee = (profile.autonomo_fee || 0) * 3

    // Upsert the quarter
    const { error: upsertError } = await supabase
      .from('tax_quarters')
      .upsert(
        {
          user_id: profile.id,
          year,
          quarter,
          vat_collected: Math.round(vatCollected * 100) / 100,
          vat_deductible: Math.round(vatDeductible * 100) / 100,
          vat_balance: Math.round((vatCollected - vatDeductible) * 100) / 100,
          income: Math.round(income * 100) / 100,
          deductible_expenses: Math.round(deductibleExpenses * 100) / 100,
          net_income: Math.round(netIncome * 100) / 100,
          irpf_rate: irpfRate,
          irpf_amount: Math.round(irpfAmount * 100) / 100,
          irpf_withheld: Math.round(irpfWithheld * 100) / 100,
          autonomo_fee: autonomoFee,
        },
        { onConflict: 'user_id,year,quarter' }
      )

    if (upsertError) {
      console.error(`Error upserting quarter for user ${profile.id}:`, upsertError.message)
      continue
    }

    result.quarters_updated++
    result.details.push({ user_id: profile.id, quarter, year })

    // Create notification
    await supabase.from('notifications').insert({
      user_id: profile.id,
      type: 'general',
      title: `Resumen T${quarter} ${year} actualizado`,
      message: `Ingresos: ${income.toFixed(2)}€ | Gastos: ${deductibleExpenses.toFixed(2)}€ | IVA a pagar: ${(vatCollected - vatDeductible).toFixed(2)}€`,
      link: '/tax-quarters',
    })
  }

  result.users_processed = profiles.length
  return result
}
