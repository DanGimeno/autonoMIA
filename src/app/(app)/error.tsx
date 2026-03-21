'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle>Algo ha salido mal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al dashboard.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-3">
          <Button variant="outline" onClick={reset}>
            Reintentar
          </Button>
          <Button asChild>
            <a href="/dashboard">Ir al dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
