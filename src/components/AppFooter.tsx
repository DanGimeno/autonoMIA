'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AppFooter() {
  return (
    <footer className="border-t border-border px-6 py-3">
      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground md:flex-row md:justify-between">
        <span>autonoMIA — Tu autonomía, tu gestión</span>
        <Link
          href="/guide"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <BookOpen className="size-3" />
          Guía para principiantes
        </Link>
        <Link
          href="/docs"
          className="hover:text-foreground transition-colors"
        >
          Documentación
        </Link>
      </div>
    </footer>
  )
}
