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

interface DeleteClientButtonProps {
  clientName: string
  deleteAction: (formData: FormData) => Promise<void>
  clientId: string
}

export default function DeleteClientButton({
  clientName,
  deleteAction,
  clientId,
}: DeleteClientButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" aria-label={`Eliminar ${clientName}`}>
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar cliente</DialogTitle>
          <DialogDescription>
            Esta accion eliminara el cliente &laquo;{clientName}&raquo; de
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
            <input type="hidden" name="id" value={clientId} />
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
