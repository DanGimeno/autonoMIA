'use client'

import { useState, useTransition } from 'react'
import type { ApiToken } from '@/types'
import { createApiToken, revokeApiToken } from '@/app/(app)/settings/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Copy, Check, KeyRound, Trash2 } from 'lucide-react'

interface ApiTokensSectionProps {
  initialTokens: ApiToken[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ApiTokensSection({ initialTokens }: ApiTokensSectionProps) {
  const [tokens, setTokens] = useState<ApiToken[]>(initialTokens)
  const [newTokenName, setNewTokenName] = useState('')
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [tokenToRevoke, setTokenToRevoke] = useState<ApiToken | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleCreate() {
    setError(null)
    const result = await createApiToken(newTokenName)
    if ('error' in result) {
      setError(result.error)
      return
    }

    setCreatedToken(result.token)
    setNewTokenName('')

    // Refrescar lista de tokens
    startTransition(() => {
      // Añadir token a la lista local con los datos que conocemos
      const newToken: ApiToken = {
        id: crypto.randomUUID(), // temporal, se refresca en la próxima carga
        user_id: '',
        name: newTokenName.trim(),
        token_prefix: result.token.slice(0, 8),
        last_used_at: null,
        expires_at: null,
        revoked_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setTokens(prev => [newToken, ...prev])
    })
  }

  async function handleRevoke() {
    if (!tokenToRevoke) return
    setError(null)
    const result = await revokeApiToken(tokenToRevoke.id)
    if ('error' in result) {
      setError(result.error)
      setRevokeDialogOpen(false)
      return
    }

    setTokens(prev =>
      prev.map(t =>
        t.id === tokenToRevoke.id
          ? { ...t, revoked_at: new Date().toISOString() }
          : t
      )
    )
    setRevokeDialogOpen(false)
    setTokenToRevoke(null)
  }

  async function handleCopy() {
    if (!createdToken) return
    await navigator.clipboard.writeText(createdToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCloseCreateDialog() {
    setCreateDialogOpen(false)
    setCreatedToken(null)
    setNewTokenName('')
    setError(null)
    setCopied(false)
  }

  const activeTokens = tokens.filter(t => !t.revoked_at)
  const revokedTokens = tokens.filter(t => t.revoked_at)

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Tokens de API</CardTitle>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseCreateDialog()
            else setCreateDialogOpen(true)
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Generar token
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generar token de API</DialogTitle>
                <DialogDescription>
                  Usa este token para conectar asistentes de IA como Claude Desktop a tus datos de autonoMIA.
                </DialogDescription>
              </DialogHeader>

              {createdToken ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Este token no se mostrara de nuevo. Copialo ahora y guardalo en un lugar seguro.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Input
                      value={createdToken}
                      readOnly
                      className="font-mono text-sm"
                      aria-label="Token generado"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      aria-label={copied ? 'Token copiado' : 'Copiar token'}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCloseCreateDialog}>Cerrar</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-name">Nombre del token</Label>
                    <Input
                      id="token-name"
                      placeholder="Ej: Claude Desktop"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      aria-describedby={error ? 'token-error' : undefined}
                    />
                    {error && (
                      <p id="token-error" className="text-sm text-destructive" role="alert">
                        {error}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      onClick={handleCreate}
                      disabled={isPending || !newTokenName.trim()}
                    >
                      Generar
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Tokens para conectar integraciones externas como servidores MCP.
        </p>
      </CardHeader>

      <CardContent>
        {tokens.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No tienes tokens de API. Genera uno para conectar tu asistente de IA.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Nombre</TableHead>
                <TableHead scope="col">Token</TableHead>
                <TableHead scope="col">Creado</TableHead>
                <TableHead scope="col">Ultimo uso</TableHead>
                <TableHead scope="col">Estado</TableHead>
                <TableHead scope="col">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {token.token_prefix}...
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(token.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(token.last_used_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Activo</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setTokenToRevoke(token)
                        setRevokeDialogOpen(true)
                      }}
                      aria-label={`Revocar token ${token.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {revokedTokens.map((token) => (
                <TableRow key={token.id} className="opacity-50">
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {token.token_prefix}...
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(token.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(token.last_used_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Revocado</Badge>
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Dialog de confirmación para revocar */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revocar token</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres revocar el token &ldquo;{tokenToRevoke?.name}&rdquo;?
              Las integraciones que lo usen dejaran de funcionar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={isPending}>
              Revocar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
