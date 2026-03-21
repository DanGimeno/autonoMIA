import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'autonomIA - Gestión para autónomos',
  description: 'Gestiona tus proyectos, facturas y obligaciones fiscales como autónomo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
