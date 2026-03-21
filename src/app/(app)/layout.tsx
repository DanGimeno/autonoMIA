import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import AppFooter from '@/components/AppFooter'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Detect current path from middleware header
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isOnboardingPage = pathname === '/onboarding'

  // Redirect to onboarding if not completed (skip if already on onboarding page)
  if (!isOnboardingPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarding_completed) {
      redirect('/onboarding')
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Saltar al contenido principal
      </a>
      {!isOnboardingPage && <Sidebar />}
      <main id="main-content" className="flex-1 overflow-auto flex flex-col" tabIndex={-1}>
        <div className={`flex-1 ${isOnboardingPage ? '' : 'p-6'}`}>
          {children}
        </div>
        {!isOnboardingPage && <AppFooter />}
      </main>
    </div>
  )
}
