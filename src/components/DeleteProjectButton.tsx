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

interface DeleteProjectButtonProps {
  projectName: string
  deleteAction: (formData: FormData) => Promise<void>
  projectId: string
}

export default function DeleteProjectButton({
  projectName,
  deleteAction,
  projectId,
}: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" aria-label={`Eliminar ${projectName}`}>
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar proyecto</DialogTitle>
          <DialogDescription>
            Esta accion eliminara el proyecto &laquo;{projectName}&raquo; de
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
            <input type="hidden" name="id" value={projectId} />
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
