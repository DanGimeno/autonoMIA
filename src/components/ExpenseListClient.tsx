'use client'

import Link from 'next/link'
import { ExpenseCategory, ExpenseStatus, ExpenseWithRelations } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil } from 'lucide-react'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'

interface ExpenseListClientProps {
  expenses: ExpenseWithRelations[]
  deleteExpenseAction: (formData: FormData) => Promise<void>
}

const categoryLabels: Record<ExpenseCategory, string> = {
  material: 'Material',
  software: 'Software',
  hardware: 'Hardware',
  travel: 'Viajes',
  meals: 'Comidas',
  office: 'Oficina',
  telecom: 'Telecom',
  professional_services: 'Serv. profesionales',
  training: 'Formacion',
  insurance: 'Seguros',
  vehicle: 'Vehiculo',
  marketing: 'Marketing',
  banking: 'Banca',
  taxes: 'Impuestos',
  other: 'Otro',
}

const categoryColors: Record<ExpenseCategory, string> = {
  material: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  software: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  hardware: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  travel: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  meals: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  office: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  telecom: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  professional_services: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  training: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  insurance: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  vehicle: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  banking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  taxes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  other: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200',
}

const statusLabels: Record<ExpenseStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  reimbursed: 'Reembolsado',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function CategoryBadge({ category }: { category: ExpenseCategory }) {
  return (
    <Badge variant="secondary" className={categoryColors[category]}>
      {categoryLabels[category]}
    </Badge>
  )
}

function StatusBadge({ status }: { status: ExpenseStatus }) {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">{statusLabels.pending}</Badge>
    case 'paid':
      return <Badge variant="default">{statusLabels.paid}</Badge>
    case 'reimbursed':
      return <Badge variant="outline">{statusLabels.reimbursed}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ExpenseListClient({
  expenses,
  deleteExpenseAction,
}: ExpenseListClientProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Current month expenses
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date + 'T00:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalMonthBase = monthExpenses.reduce((sum, e) => {
    const vatAmount = e.amount * (e.vat_percent || 0) / 100
    const irpfAmount = e.amount * (e.irpf_percent || 0) / 100
    return sum + e.amount + vatAmount - irpfAmount
  }, 0)

  const totalMonthVatDeductible = monthExpenses.reduce((sum, e) => {
    const vatAmount = e.amount * (e.vat_percent || 0) / 100
    const deductiblePct = e.vat_deductible_percent || 0
    return sum + vatAmount * deductiblePct / 100
  }, 0)

  // Top categories this month
  const categoryTotals = monthExpenses.reduce<Record<string, number>>((acc, e) => {
    const total = e.amount + e.amount * (e.vat_percent || 0) / 100 - e.amount * (e.irpf_percent || 0) / 100
    acc[e.category] = (acc[e.category] || 0) + total
    return acc
  }, {})

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gastos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus gastos</p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="size-4" />
            Nuevo gasto
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total gastos mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalMonthBase)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              IVA soportado deducible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalMonthVatDeductible)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por categoria (mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {topCategories.map(([cat, total]) => (
                  <li key={cat} className="flex justify-between">
                    <span>{categoryLabels[cat as ExpenseCategory]}</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin gastos este mes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {!expenses || expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-4" aria-hidden="true">&#128176;</p>
            <h3 className="text-lg font-medium mb-2">No hay gastos todavia</h3>
            <p className="text-muted-foreground mb-4">Registra tu primer gasto para empezar</p>
            <Link href="/expenses/new">
              <Button>Crear gasto</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="sr-only">Lista de gastos</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Fecha</TableHead>
                  <TableHead scope="col">Concepto</TableHead>
                  <TableHead scope="col">Categoria</TableHead>
                  <TableHead scope="col">Base</TableHead>
                  <TableHead scope="col">IVA</TableHead>
                  <TableHead scope="col">Total</TableHead>
                  <TableHead scope="col">Estado</TableHead>
                  <TableHead scope="col" className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const vatAmount = expense.amount * (expense.vat_percent || 0) / 100
                  const irpfAmount = expense.amount * (expense.irpf_percent || 0) / 100
                  const total = expense.amount + vatAmount - irpfAmount
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(expense.expense_date)}
                      </TableCell>
                      <TableCell className="max-w-40 truncate font-medium">
                        {expense.concept}
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={expense.category} />
                      </TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{formatCurrency(vatAmount)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(total)}</TableCell>
                      <TableCell>
                        <StatusBadge status={expense.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/expenses/${expense.id}/edit`}
                            aria-label={`Editar gasto ${expense.concept}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Pencil className="size-4" />
                              <span className="sr-only sm:not-sr-only">Editar</span>
                            </Button>
                          </Link>
                          <DeleteExpenseButton
                            expenseConcept={expense.concept}
                            deleteAction={deleteExpenseAction}
                            expenseId={expense.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
