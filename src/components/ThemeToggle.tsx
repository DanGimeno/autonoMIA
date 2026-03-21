'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'

const PALETTE_KEY = 'autonomia-palette'

interface PaletteOption {
  id: string
  name: string
  colors: string[] // preview colors
}

const palettes: PaletteOption[] = [
  { id: '', name: 'Ocean Blue', colors: ['#63ADF2', '#304D6D', '#A7CCED', '#545E75', '#82A0BC'] },
  { id: 'olive-garden', name: 'Olive Garden', colors: ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25'] },
  { id: 'fiery-ocean', name: 'Fiery Ocean', colors: ['#780000', '#C1121F', '#FDF0D5', '#003049', '#669BBC'] },
  { id: 'summer-breeze', name: 'Summer Breeze', colors: ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'] },
  { id: 'summer-fun', name: 'Summer Fun', colors: ['#8ECAE6', '#219EBC', '#023047', '#FFB703', '#FB8500'] },
  { id: 'cool-waters', name: 'Cool Waters', colors: ['#22577A', '#38A3A5', '#57CC99', '#80ED99', '#C7F9CC'] },
]

type ThemeMode = 'light' | 'dark' | 'system'

const themeModes: { id: ThemeMode; name: string; icon: typeof Sun }[] = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Oscuro', icon: Moon },
  { id: 'system', name: 'Sistema', icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentPalette, setCurrentPalette] = useState('')

  const applyPalette = useCallback((paletteId: string) => {
    document.documentElement.setAttribute('data-palette', paletteId)
    localStorage.setItem(PALETTE_KEY, paletteId)
    setCurrentPalette(paletteId)
  }, [])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(PALETTE_KEY) || ''
    applyPalette(saved)
  }, [applyPalette])

  if (!mounted) return null

  const currentModeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cambiar tema y paleta"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Modo</DropdownMenuLabel>
        {themeModes.map(mode => {
          const Icon = mode.icon
          const isActive = theme === mode.id
          return (
            <DropdownMenuItem
              key={mode.id}
              onSelect={() => setTheme(mode.id)}
              className={isActive ? 'bg-accent' : ''}
            >
              <Icon className="size-4" />
              {mode.name}
              {isActive && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Paleta</DropdownMenuLabel>

        {palettes.map(palette => {
          const isActive = currentPalette === palette.id
          return (
            <DropdownMenuItem
              key={palette.id || 'default'}
              onSelect={() => applyPalette(palette.id)}
              className={`flex items-center gap-3 ${isActive ? 'bg-accent' : ''}`}
            >
              <div className="flex gap-0.5 shrink-0" aria-hidden="true">
                {palette.colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="size-3 rounded-full border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm">{palette.name}</span>
              {isActive && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
