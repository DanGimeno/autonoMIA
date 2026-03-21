import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'autonoMIA - Autenticación',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main lang="es">
      {children}
    </main>
  )
}
