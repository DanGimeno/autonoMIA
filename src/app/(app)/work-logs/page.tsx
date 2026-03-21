'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WorkLog, WorkLogWithProject, Project } from '@/types'
import WorkLogModal from '@/components/WorkLogModal'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function WorkLogsPage() {
  const supabase = createClient()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [logs, setLogs] = useState<WorkLogWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null)

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

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
  }, [currentYear, currentMonth, supabase])

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'active')
      setProjects(data || [])
    }
    fetchProjects()
  }, [supabase])

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
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de horas</h1>
          <p className="text-gray-500 mt-1">Registra tu trabajo diario</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">←</button>
          <span className="font-medium text-gray-900 min-w-36 text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">→</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</div>
          <div className="text-sm text-gray-500">Total horas este mes</div>
        </div>
        {Object.values(hoursPerProject).map(({ name, hours }) => (
          <div key={name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{hours.toFixed(1)}h</div>
            <div className="text-sm text-gray-500 truncate">{name}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {dayNames.map(d => (
            <div key={d} className="py-3 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-20 border-b border-r border-gray-50 bg-gray-50/50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayLogs = logsByDate[dateStr] || []
            const dayHours = dayLogs.reduce((sum, l) => sum + l.hours, 0)
            const isToday = dateStr === today.toISOString().split('T')[0]
            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateStr)}
                className={`min-h-20 border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-blue-50/50 transition-colors ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</div>
                {dayLogs.map(log => (
                  <div
                    key={log.id}
                    onClick={(e) => handleLogClick(log, e)}
                    className="text-xs bg-blue-100 text-blue-700 rounded px-1 py-0.5 mb-0.5 truncate hover:bg-blue-200"
                  >
                    {log.hours}h {log.projects?.name || ''}
                  </div>
                ))}
                {dayHours > 0 && dayLogs.length > 1 && (
                  <div className="text-xs text-gray-400 mt-0.5">{dayHours}h total</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {modalOpen && (
        <WorkLogModal
          date={selectedDate!}
          log={selectedLog}
          projects={projects}
          onClose={() => setModalOpen(false)}
          onSave={fetchLogs}
        />
      )}
    </div>
  )
}
