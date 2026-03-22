'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface RunTaskButtonProps {
  taskId: string
  taskName: string
}

export function RunTaskButton({ taskId, taskName }: RunTaskButtonProps) {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ status: string; error?: string } | null>(null)

  async function handleRun() {
    setRunning(true)
    setResult(null)

    try {
      const res = await fetch(`/api/cron/run-task/${taskId}`, {
        method: 'POST',
      })

      const data = await res.json()
      setResult(data)
      router.refresh()
    } catch {
      setResult({ status: 'failure', error: 'Error de red' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRun}
        disabled={running}
        aria-label={`Ejecutar tarea: ${taskName}`}
      >
        {running ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : (
          <Play className="h-3 w-3" aria-hidden="true" />
        )}
        <span className="ml-1">
          {running ? 'Ejecutando...' : 'Ejecutar'}
        </span>
      </Button>
      {result && (
        <span
          className={`flex items-center gap-1 text-xs ${result.status === 'success' ? 'text-green-600' : 'text-destructive'}`}
          role="status"
        >
          {result.status === 'success' ? (
            <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> OK</>
          ) : (
            <><XCircle className="h-3 w-3" aria-hidden="true" /> {result.error || 'Error'}</>
          )}
        </span>
      )}
    </div>
  )
}
