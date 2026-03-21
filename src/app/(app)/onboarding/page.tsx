import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/OnboardingWizard'

export const metadata: Metadata = {
  title: 'Bienvenido a autonoMIA',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
      <OnboardingWizard userEmail={user.email || ''} />
    </div>
  )
}
