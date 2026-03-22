import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'
import ApiTokensSection from '@/components/ApiTokensSection'
import { getApiTokens } from './actions'
import type { Metadata } from 'next'
import { HelpDialog } from '@/components/HelpDialog'
import { helpContent } from '@/lib/help/content'

export const metadata: Metadata = {
  title: 'Configuracion | autonoMIA',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, tokens] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getApiTokens(),
  ])

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
          <HelpDialog content={helpContent.settings} title="Ayuda — Configuración" />
        </div>
        <p className="text-muted-foreground mt-1">Gestiona tu perfil y datos fiscales</p>
      </div>
      <SettingsForm profile={profile} userEmail={user.email} />
      <ApiTokensSection initialTokens={tokens} />
    </div>
  )
}
