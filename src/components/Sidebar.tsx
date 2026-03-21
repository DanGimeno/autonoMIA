'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  BookOpen,
  Shield,
  Users,
  Receipt,
  Calendar,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationsBell } from '@/components/NotificationsBell'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Proyectos', icon: FolderKanban },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/work-logs', label: 'Registro de horas', icon: Clock },
  { href: '/invoices', label: 'Facturas', icon: FileText },
  { href: '/expenses', label: 'Gastos', icon: Receipt },
  { href: '/tax-tasks', label: 'Tareas fiscales', icon: ClipboardList },
  { href: '/tax-quarters', label: 'Trimestres', icon: Calendar },
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/settings', label: 'Configuración', icon: Settings },
  { href: '/admin', label: 'Administración', icon: Shield, adminOnly: true },
]

const supabase = createClient()

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setIsAdmin(data?.is_admin ?? false)
    }
    checkAdmin()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">autonoMIA</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Gestión para autónomos
        </p>
      </div>

      <Separator />

      <nav aria-label="Navegación principal" className="flex-1 p-4">
        <ul role="list" className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    'w-full justify-start gap-3 px-3 py-2',
                    isActive &&
                      'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-sm text-muted-foreground">Tema</span>
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <ThemeToggle />
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
