'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WorkLog, Project } from '@/types'

interface WorkLogModalProps {
  date: string
  log: WorkLog | null
  projects: Project[]
  onClose: () => void
  onSave: () => void
}

export default function WorkLogModal({ date, log, projects, onClose, onSave }: WorkLogModalProps) {
  const supabase = createClient()
  const [form, setForm] = useState({
    project_id: log?.project_id || '',
    hours: log?.hours?.toString() || '',
    notes: log?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.hours || parseFloat(form.hours) <= 0) {
      setError('Las horas deben ser mayores que 0')
      setLoading(false)
      return
    }

    const payload = {
      work_date: date,
      project_id: form.project_id || null,
      hours: parseFloat(form.hours),
      notes: form.notes || null,
    }

    let result
    if (log) {
      result = await supabase.from('work_logs').update(payload).eq('id', log.id)
    } else {
      result = await supabase.from('work_logs').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      onSave()
      onClose()
    }
  }

  async function handleDelete() {
    if (!log || !confirm('¿Eliminar este registro?')) return
    await supabase.from('work_logs').delete().eq('id', log.id)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {log ? 'Editar registro' : 'Añadir horas'} — {date}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
            <select
              value={form.project_id}
              onChange={(e) => update('project_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas *</label>
            <input
              type="number"
              required
              min="0.5"
              max="24"
              step="0.5"
              value={form.hours}
              onChange={(e) => update('hours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            {log && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
