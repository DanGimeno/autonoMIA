'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Trash2 } from 'lucide-react'

interface TaxTaskActionsProps {
  taskId: string
  taskTitle: string
  deleteAction: (formData: FormData) => Promise<void>
}

export function TaxTaskActions({ taskId, taskTitle, deleteAction }: TaxTaskActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/tax-tasks/${taskId}/edit`} aria-label={`Editar "${taskTitle}"`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDeleteOpen(true)}
        aria-label={`Eliminar "${taskTitle}"`}
      >
        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
      </Button>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la tarea &quot;{taskTitle}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={taskId} />
              <Button type="submit" variant="destructive" onClick={() => setDeleteOpen(false)}>
                Eliminar
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
