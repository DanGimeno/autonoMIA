import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ProjectStatus } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, FolderOpen } from 'lucide-react'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import type { Metadata } from 'next'
import { HelpDialog } from '@/components/HelpDialog'
import { helpContent } from '@/lib/help/content'

export const metadata: Metadata = {
  title: 'Proyectos | autonoMIA',
}

async function deleteProject(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('projects').delete().eq('id', id)
  revalidatePath('/projects')
}

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Completado',
}

const statusVariants: Record<ProjectStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  paused: 'secondary',
  completed: 'outline',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <section aria-labelledby="projects-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 id="projects-heading" className="text-2xl font-bold tracking-tight">
              Proyectos
            </h1>
            <HelpDialog content={helpContent.projects} title="Ayuda — Proyectos" />
          </div>
          <p className="text-muted-foreground mt-1">
            Gestiona tus proyectos de cliente
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="size-4" />
            Nuevo proyecto
          </Link>
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <FolderOpen className="size-12 text-muted-foreground" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-medium mb-1">No hay proyectos todavia</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer proyecto para empezar
              </p>
            </div>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="size-4" />
                Crear proyecto
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate">{project.name}</CardTitle>
                  {project.client_name && (
                    <CardDescription>{project.client_name}</CardDescription>
                  )}
                </div>
                <Badge variant={statusVariants[project.status as ProjectStatus]}>
                  {statusLabels[project.status as ProjectStatus]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {project.hourly_rate != null && (
                    <span>{project.hourly_rate} &euro;/h</span>
                  )}
                  <span>Creado: {formatDate(project.created_at)}</span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Pencil className="size-4" />
                    Editar
                  </Link>
                </Button>
                <DeleteProjectButton
                  projectName={project.name}
                  deleteAction={deleteProject}
                  projectId={project.id}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
