import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ClientType } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Users, Building2 } from 'lucide-react'
import DeleteClientButton from '@/components/DeleteClientButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clientes | autonoMIA',
}

async function deleteClient(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('clients').delete().eq('id', id)
  revalidatePath('/clients')
}

const typeLabels: Record<ClientType, string> = {
  company: 'Empresa',
  freelancer: 'Autonomo',
  individual: 'Particular',
}

const typeVariants: Record<ClientType, 'default' | 'secondary' | 'outline'> = {
  company: 'default',
  freelancer: 'secondary',
  individual: 'outline',
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  return (
    <section aria-labelledby="clients-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 id="clients-heading" className="text-2xl font-bold tracking-tight">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus clientes y sus datos fiscales
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="size-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {!clients || clients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <Users className="size-12 text-muted-foreground" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-medium mb-1">No hay clientes todavia</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer cliente para empezar
              </p>
            </div>
            <Button asChild>
              <Link href="/clients/new">
                <Plus className="size-4" />
                Crear cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate flex items-center gap-2">
                    <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {client.name}
                  </CardTitle>
                  {client.nif_cif && (
                    <CardDescription>{client.nif_cif}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={typeVariants[client.type as ClientType]}>
                    {typeLabels[client.type as ClientType]}
                  </Badge>
                  {!client.is_active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {client.email && (
                  <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                )}
                {client.phone && (
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                )}
                {client.city && (
                  <p className="text-sm text-muted-foreground">{client.city}</p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/clients/${client.id}/edit`}>
                    <Pencil className="size-4" />
                    Editar
                  </Link>
                </Button>
                <DeleteClientButton
                  clientName={client.name}
                  deleteAction={deleteClient}
                  clientId={client.id}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
