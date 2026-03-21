'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface SettingsFormProps {
  profile: Profile | null
  userEmail?: string
}

export default function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    nif: profile?.nif || '',
    address: profile?.address || '',
    default_vat_percent: profile?.default_vat_percent?.toString() || '21',
    default_irpf_percent: profile?.default_irpf_percent?.toString() || '15',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    const { error } = await supabase.from('profiles').upsert({
      full_name: form.full_name || null,
      nif: form.nif || null,
      address: form.address || null,
      default_vat_percent: parseFloat(form.default_vat_percent),
      default_irpf_percent: parseFloat(form.default_irpf_percent),
    })

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          ¡Cambios guardados correctamente!
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Cuenta</h2>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          Email: <span className="font-medium text-gray-900">{userEmail}</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Datos personales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
              placeholder="Tu nombre y apellidos"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF/NIE</label>
            <input type="text" value={form.nif} onChange={e => update('nif', e.target.value)}
              placeholder="12345678A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal</label>
            <textarea value={form.address} onChange={e => update('address', e.target.value)} rows={2}
              placeholder="Calle, número, ciudad..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Valores por defecto en facturas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IVA por defecto (%)</label>
            <input type="number" min="0" max="100" step="0.01" value={form.default_vat_percent}
              onChange={e => update('default_vat_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IRPF por defecto (%)</label>
            <input type="number" min="0" max="100" step="0.01" value={form.default_irpf_percent}
              onChange={e => update('default_irpf_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors">
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
