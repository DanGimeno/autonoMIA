import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProjectForm from '@/components/ProjectForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar proyecto | autonoMIA',
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Editar proyecto</h1>
      <ProjectForm project={project} />
    </section>
  )
}
