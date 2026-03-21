'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InvoiceStatus, InvoiceWithProject } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HelpDialog } from '@/components/HelpDialog'
import { helpContent } from '@/lib/help/content'

interface InvoiceListClientProps {
  invoices: InvoiceWithProject[]
  currentStatus: string
  markCollectedAction: (formData: FormData) => Promise<void>
  deleteInvoiceAction: (formData: FormData) => Promise<void>
}

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  collected: 'Cobrada',
  overdue: 'Vencida',
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

function StatusBadge({ status, isOverdue }: { status: InvoiceStatus; isOverdue: boolean }) {
  if (isOverdue) {
    return <Badge variant="destructive">Vencida</Badge>
  }
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">{statusLabels.draft}</Badge>
    case 'issued':
      return <Badge variant="default">{statusLabels.issued}</Badge>
    case 'collected':
      return <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">{statusLabels.collected}</Badge>
    case 'overdue':
      return <Badge variant="destructive">{statusLabels.overdue}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const tabs = [
  { label: 'Todas', value: '' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Emitidas', value: 'issued' },
  { label: 'Cobradas', value: 'collected' },
  { label: 'Vencidas', value: 'overdue' },
]

export default function InvoiceListClient({
  invoices,
  currentStatus,
  markCollectedAction,
  deleteInvoiceAction,
}: InvoiceListClientProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const totalPending = invoices
    .filter(i => i.status === 'issued')
    .reduce((sum, i) => {
      const vatAmount = i.amount * (i.vat_percent || 0) / 100
      const irpfAmount = i.amount * (i.irpf_percent || 0) / 100
      return sum + i.amount + vatAmount - irpfAmount
    }, 0)

  function handleDeleteClick(id: string) {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Facturas</h1>
            <HelpDialog content={helpContent.invoices} title="Ayuda — Facturas" />
          </div>
          <p className="text-muted-foreground mt-1">Gestiona tus facturas</p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="size-4" />
            Nueva factura
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <nav aria-label="Filtrar facturas por estado" className="mb-4">
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
          {tabs.map(tab => (
            <Link
              key={tab.value}
              href={tab.value ? `/invoices?status=${tab.value}` : '/invoices'}
              className={cn(
                'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                (currentStatus === tab.value || (!currentStatus && !tab.value))
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={(currentStatus === tab.value || (!currentStatus && !tab.value)) ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      {!invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-4" aria-hidden="true">&#128466;</p>
            <h3 className="text-lg font-medium mb-2">No hay facturas todavia</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera factura para empezar</p>
            <Link href="/invoices/new">
              <Button>Crear factura</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableCaption className="sr-only">Lista de facturas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">N. Factura</TableHead>
                  <TableHead scope="col">Concepto</TableHead>
                  <TableHead scope="col">Proyecto</TableHead>
                  <TableHead scope="col">Fecha</TableHead>
                  <TableHead scope="col">Importe</TableHead>
                  <TableHead scope="col">Estado</TableHead>
                  <TableHead scope="col" className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const isOverdue = invoice.status === 'issued' && !!invoice.due_date && invoice.due_date < today
                  return (
                    <TableRow
                      key={invoice.id}
                      className={cn(isOverdue && 'bg-destructive/5')}
                    >
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell className="max-w-40 truncate">{invoice.concept}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.projects?.name || '\u2014'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.issue_date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status as InvoiceStatus} isOverdue={isOverdue} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            aria-label={`Editar factura ${invoice.invoice_number}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Pencil className="size-4" />
                              <span className="sr-only sm:not-sr-only">Editar</span>
                            </Button>
                          </Link>
                          {invoice.status === 'issued' && (
                            <form action={markCollectedAction}>
                              <input type="hidden" name="id" value={invoice.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                aria-label={`Marcar como cobrada la factura ${invoice.invoice_number}`}
                              >
                                <CircleCheck className="size-4" />
                                <span className="sr-only sm:not-sr-only">Cobrada</span>
                              </Button>
                            </form>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(invoice.id)}
                            aria-label={`Eliminar factura ${invoice.invoice_number}`}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only sm:not-sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {totalPending > 0 && (
              <div className="px-4 py-3 bg-muted/50 border-t text-sm text-muted-foreground text-right">
                Total pendiente de cobro:{' '}
                <span className="font-semibold text-foreground">{formatCurrency(totalPending)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar factura</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara la factura de forma permanente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <form action={deleteInvoiceAction}>
              <input type="hidden" name="id" value={deleteId || ''} />
              <Button
                type="submit"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Eliminar
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
