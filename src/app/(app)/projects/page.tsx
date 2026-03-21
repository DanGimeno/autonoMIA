import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ProjectStatus } from '@/types'

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

const statusColors: Record<ProjectStatus, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-700',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus proyectos de cliente</p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nuevo proyecto
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos todavía</h3>
          <p className="text-gray-500 mb-4">Crea tu primer proyecto para empezar</p>
          <Link href="/projects/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Crear proyecto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.client_name && (
                    <p className="text-sm text-gray-500">{project.client_name}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[project.status as ProjectStatus]}`}>
                  {statusLabels[project.status as ProjectStatus]}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
              )}
              {project.hourly_rate && (
                <p className="text-sm text-gray-500 mb-3">€{project.hourly_rate}/h</p>
              )}
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="flex-1 text-center py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Editar
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={(e) => {
                      if (!confirm('¿Eliminar este proyecto?')) e.preventDefault()
                    }}
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
