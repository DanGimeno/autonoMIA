import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { TaxQuarter, TaxFilingStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { HelpDialog } from '@/components/HelpDialog'
import { helpContent } from '@/lib/help/content'

export const metadata: Metadata = {
  title: 'Trimestres fiscales | autonoMIA',
}

const QUARTER_LABELS = [
  { label: 'T1', months: 'Ene-Mar' },
  { label: 'T2', months: 'Abr-Jun' },
  { label: 'T3', months: 'Jul-Sep' },
  { label: 'T4', months: 'Oct-Dic' },
]

function statusLabel(status: TaxFilingStatus): string {
  switch (status) {
    case 'pending': return 'Pendiente'
    case 'filed': return 'Presentado'
    case 'paid': return 'Pagado'
  }
}

function statusVariant(status: TaxFilingStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'filed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  }
}

function nextStatus(current: TaxFilingStatus): TaxFilingStatus {
  switch (current) {
    case 'pending': return 'filed'
    case 'filed': return 'paid'
    case 'paid': return 'pending'
  }
}

function fmt(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function toggleFilingStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const field = formData.get('field') as string
  const currentStatus = formData.get('status') as TaxFilingStatus
  const newStatus = nextStatus(currentStatus)
  const filedAtField = field === 'modelo_303_status' ? 'modelo_303_filed_at' : 'modelo_130_filed_at'

  const supabase = await createClient()
  await supabase.from('tax_quarters').update({
    [field]: newStatus,
    [filedAtField]: newStatus === 'filed' || newStatus === 'paid' ? new Date().toISOString() : null,
  }).eq('id', id)
  revalidatePath('/tax-quarters')
}

async function createQuarter(formData: FormData) {
  'use server'
  const year = parseInt(formData.get('year') as string)
  const quarter = parseInt(formData.get('quarter') as string)

  const supabase = await createClient()
  await supabase.from('tax_quarters').insert({
    year,
    quarter,
    vat_collected: 0,
    vat_deductible: 0,
    vat_balance: 0,
    income: 0,
    deductible_expenses: 0,
    net_income: 0,
    irpf_rate: 20,
    irpf_amount: 0,
    irpf_withheld: 0,
    autonomo_fee: 0,
    modelo_303_status: 'pending',
    modelo_130_status: 'pending',
  })
  revalidatePath('/tax-quarters')
}

export default async function TaxQuartersPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const currentYear = new Date().getFullYear()
  const selectedYear = params.year ? parseInt(params.year) : currentYear

  const { data: quarters } = await supabase
    .from('tax_quarters')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', selectedYear)
    .order('quarter', { ascending: true })

  const quarterMap = new Map<number, TaxQuarter>()
  ;(quarters || []).forEach(q => quarterMap.set(q.quarter, q as TaxQuarter))

  // Annual totals
  const allQuarters = Array.from(quarterMap.values())
  const totals = {
    vat_collected: allQuarters.reduce((s, q) => s + q.vat_collected, 0),
    vat_deductible: allQuarters.reduce((s, q) => s + q.vat_deductible, 0),
    vat_balance: allQuarters.reduce((s, q) => s + q.vat_balance, 0),
    income: allQuarters.reduce((s, q) => s + q.income, 0),
    deductible_expenses: allQuarters.reduce((s, q) => s + q.deductible_expenses, 0),
    net_income: allQuarters.reduce((s, q) => s + q.net_income, 0),
    irpf_amount: allQuarters.reduce((s, q) => s + q.irpf_amount, 0),
    irpf_withheld: allQuarters.reduce((s, q) => s + q.irpf_withheld, 0),
    autonomo_fee: allQuarters.reduce((s, q) => s + q.autonomo_fee, 0),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Trimestres fiscales</h1>
            <HelpDialog content={helpContent.taxQuarters} title="Ayuda — Trimestres fiscales" />
          </div>
          <p className="text-muted-foreground mt-1">Resumen trimestral de IVA, IRPF y cuota de autonomo</p>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant={selectedYear === currentYear - 1 ? 'default' : 'outline'} size="sm" asChild>
          <Link href={`/tax-quarters?year=${currentYear - 1}`}>{currentYear - 1}</Link>
        </Button>
        <Button variant={selectedYear === currentYear ? 'default' : 'outline'} size="sm" asChild>
          <Link href={`/tax-quarters?year=${currentYear}`}>{currentYear}</Link>
        </Button>
      </div>

      {/* Quarter cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {QUARTER_LABELS.map((ql, idx) => {
          const q = quarterMap.get(idx + 1)
          return (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {ql.label} ({ql.months})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!q ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Sin datos</p>
                    <form action={createQuarter}>
                      <input type="hidden" name="year" value={selectedYear} />
                      <input type="hidden" name="quarter" value={idx + 1} />
                      <Button type="submit" variant="outline" size="sm">
                        Crear trimestre
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* IVA */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">IVA (Modelo 303)</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>IVA repercutido</span>
                          <span>{fmt(q.vat_collected)} &euro;</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IVA soportado deducible</span>
                          <span>{fmt(q.vat_deductible)} &euro;</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Balance</span>
                          <span className={cn(
                            q.vat_balance < 0 ? 'text-green-600' : q.vat_balance > 0 ? 'text-red-600' : ''
                          )}>
                            {fmt(q.vat_balance)} &euro;
                            {q.vat_balance < 0 ? ' (a favor)' : q.vat_balance > 0 ? ' (a pagar)' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* IRPF */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">IRPF (Modelo 130)</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Ingresos</span>
                          <span>{fmt(q.income)} &euro;</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gastos deducibles</span>
                          <span>{fmt(q.deductible_expenses)} &euro;</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rendimiento neto</span>
                          <span>{fmt(q.net_income)} &euro;</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cuota ({q.irpf_rate}%)</span>
                          <span>{fmt(q.irpf_amount)} &euro;</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retenciones practicadas</span>
                          <span>{fmt(q.irpf_withheld)} &euro;</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Cuota autonomo */}
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Cuota autonomo (3 meses)</span>
                      <span>{fmt(q.autonomo_fee)} &euro;</span>
                    </div>

                    <Separator />

                    {/* Filing status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={toggleFilingStatus} className="inline-flex items-center gap-2">
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="field" value="modelo_303_status" />
                        <input type="hidden" name="status" value={q.modelo_303_status} />
                        <span className="text-sm">Modelo 303:</span>
                        <button type="submit">
                          <Badge
                            variant="outline"
                            className={cn('cursor-pointer', statusVariant(q.modelo_303_status))}
                          >
                            {statusLabel(q.modelo_303_status)}
                          </Badge>
                        </button>
                      </form>
                      <form action={toggleFilingStatus} className="inline-flex items-center gap-2">
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="field" value="modelo_130_status" />
                        <input type="hidden" name="status" value={q.modelo_130_status} />
                        <span className="text-sm">Modelo 130:</span>
                        <button type="submit">
                          <Badge
                            variant="outline"
                            className={cn('cursor-pointer', statusVariant(q.modelo_130_status))}
                          >
                            {statusLabel(q.modelo_130_status)}
                          </Badge>
                        </button>
                      </form>
                    </div>

                    {q.notes && (
                      <p className="text-sm text-muted-foreground italic">{q.notes}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Annual summary */}
      {allQuarters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen anual {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">IVA</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Repercutido</span>
                    <span>{fmt(totals.vat_collected)} &euro;</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soportado</span>
                    <span>{fmt(totals.vat_deductible)} &euro;</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Balance</span>
                    <span className={cn(
                      totals.vat_balance < 0 ? 'text-green-600' : totals.vat_balance > 0 ? 'text-red-600' : ''
                    )}>
                      {fmt(totals.vat_balance)} &euro;
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">IRPF</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Ingresos</span>
                    <span>{fmt(totals.income)} &euro;</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos</span>
                    <span>{fmt(totals.deductible_expenses)} &euro;</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rendimiento neto</span>
                    <span>{fmt(totals.net_income)} &euro;</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Cuota IRPF</span>
                    <span>{fmt(totals.irpf_amount)} &euro;</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retenciones</span>
                    <span>{fmt(totals.irpf_withheld)} &euro;</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Cuota autonomo</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>Total anual</span>
                    <span>{fmt(totals.autonomo_fee)} &euro;</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
