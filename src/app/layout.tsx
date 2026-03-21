import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
