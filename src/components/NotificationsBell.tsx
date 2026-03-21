'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  FileText,
  ClipboardList,
  Info,
  Shield,
  Check,
} from 'lucide-react'

const supabase = createClient()

const typeIcons: Record<string, typeof Bell> = {
  overdue_invoice: FileText,
  upcoming_tax_task: ClipboardList,
  general: Info,
  admin: Shield,
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Ahora'
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`
  if (seconds < 172800) return 'Ayer'
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications((data as Notification[]) || [])
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)

    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                markAllRead()
              }}
              className="text-xs h-auto py-1"
            >
              <Check className="h-3 w-3 mr-1" aria-hidden="true" />
              Marcar como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          notifications.slice(0, 10).map(notification => {
            const Icon = typeIcons[notification.type] || Info
            return (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 py-3 cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                onSelect={() => {
                  markRead(notification.id)
                  if (notification.link) {
                    window.location.href = notification.link
                  }
                }}
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{notification.title}</div>
                  {notification.message && (
                    <div className="text-xs text-muted-foreground truncate">{notification.message}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(notification.created_at)}</div>
                </div>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" aria-label="Sin leer" />
                )}
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
