'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

interface DeleteExpenseButtonProps {
  expenseConcept: string
  deleteAction: (formData: FormData) => Promise<void>
  expenseId: string
}

export default function DeleteExpenseButton({
  expenseConcept,
  deleteAction,
  expenseId,
}: DeleteExpenseButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          aria-label={`Eliminar gasto ${expenseConcept}`}
        >
          <Trash2 className="size-4" />
          <span className="sr-only sm:not-sr-only">Eliminar</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar gasto</DialogTitle>
          <DialogDescription>
            Esta accion eliminara el gasto &laquo;{expenseConcept}&raquo; de
            forma permanente. Esta accion no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <form
            action={async (formData) => {
              await deleteAction(formData)
              setOpen(false)
            }}
          >
            <input type="hidden" name="id" value={expenseId} />
            <Button type="submit" variant="destructive">
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
