'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WorkLog, WorkLogWithProject, Project } from '@/types'
import WorkLogModal from '@/components/WorkLogModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

// Monday = 0, Sunday = 6 (Spanish week)
function getFirstDayOfMonthMondayBased(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const supabase = createClient()

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function WorkLogsPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [logs, setLogs] = useState<WorkLogWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null)

  const fetchLogs = useCallback(async () => {
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${getDaysInMonth(currentYear, currentMonth)}`
    const { data } = await supabase
      .from('work_logs')
      .select('*, projects(name)')
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date')
    setLogs((data as WorkLogWithProject[]) || [])
  }, [currentYear, currentMonth])

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'active')
      setProjects(data || [])
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr)
    setSelectedLog(null)
    setModalOpen(true)
  }

  function handleLogClick(log: WorkLog, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedDate(log.work_date)
    setSelectedLog(log)
    setModalOpen(true)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonthMondayBased(currentYear, currentMonth)

  const totalHours = logs.reduce((sum, l) => sum + l.hours, 0)

  const hoursPerProject: Record<string, { name: string; hours: number }> = {}
  logs.forEach(log => {
    const key = log.project_id || 'none'
    const name = log.projects?.name || 'Sin proyecto'
    if (!hoursPerProject[key]) hoursPerProject[key] = { name, hours: 0 }
    hoursPerProject[key].hours += log.hours
  })

  const logsByDate: Record<string, WorkLogWithProject[]> = {}
  logs.forEach(log => {
    if (!logsByDate[log.work_date]) logsByDate[log.work_date] = []
    logsByDate[log.work_date].push(log)
  })

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registro de horas</h1>
          <p className="text-muted-foreground mt-1">Registra tu trabajo diario</p>
        </div>
        <nav aria-label="Navegación de meses" className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span
            className="font-medium min-w-36 text-center"
            aria-live="polite"
            aria-atomic="true"
          >
            {monthNames[currentMonth]} {currentYear}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Total este mes</span>
            </div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        {Object.values(hoursPerProject).map(({ name, hours }) => (
          <Card key={name}>
            <CardContent className="pt-4 pb-4">
              <div className="text-sm text-muted-foreground mb-1 truncate">{name}</div>
              <div className="text-2xl font-bold">{hours.toFixed(1)}h</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div
            className="grid grid-cols-7 border-b"
            role="row"
            aria-label="Días de la semana"
          >
            {dayNames.map(d => (
              <div
                key={d}
                className="py-3 text-center text-xs font-medium text-muted-foreground"
                role="columnheader"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7" role="grid" aria-label={`Calendario ${monthNames[currentMonth]} ${currentYear}`}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-20 border-b border-r border-border bg-muted/30"
                role="gridcell"
                aria-hidden="true"
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayLogs = logsByDate[dateStr] || []
              const dayHours = dayLogs.reduce((sum, l) => sum + l.hours, 0)
              const isToday = dateStr === todayStr
              return (
                <div
                  key={day}
                  role="gridcell"
                  tabIndex={0}
                  onClick={() => handleDayClick(dateStr)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleDayClick(dateStr)
                    }
                  }}
                  aria-label={`${day} de ${monthNames[currentMonth]}, ${dayHours > 0 ? `${dayHours} horas registradas` : 'sin registros'}`}
                  className={`min-h-20 border-b border-r border-border p-2 cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                    isToday ? 'bg-accent' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 flex items-center gap-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day}
                    {dayLogs.length === 0 && (
                      <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" aria-hidden="true" />
                    )}
                  </div>
                  {dayLogs.map(log => (
                    <button
                      key={log.id}
                      type="button"
                      onClick={(e) => handleLogClick(log, e)}
                      className="w-full text-left text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 mb-0.5 truncate hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label={`${log.hours}h ${log.projects?.name || 'sin proyecto'} — clic para editar`}
                    >
                      {log.hours}h {log.projects?.name || ''}
                    </button>
                  ))}
                  {dayHours > 0 && dayLogs.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-0.5">{dayHours}h total</div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <WorkLogModal
        date={selectedDate || todayStr}
        log={selectedLog}
        projects={projects}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={fetchLogs}
      />
    </div>
  )
}
