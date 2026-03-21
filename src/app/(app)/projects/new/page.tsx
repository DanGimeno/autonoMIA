import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProjectForm from '@/components/ProjectForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuevo proyecto | autonoMIA',
}

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Nuevo proyecto</h1>
      <ProjectForm />
    </section>
  )
}
