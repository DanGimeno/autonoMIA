'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

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
    trade_name: profile?.trade_name || '',
    nif: profile?.nif || '',
    address: profile?.address || '',
    city: profile?.city || '',
    postal_code: profile?.postal_code || '',
    province: profile?.province || '',
    phone: profile?.phone || '',
    iban: profile?.iban || '',
    epigraph: profile?.epigraph || '',
    registration_date: profile?.registration_date || '',
    autonomo_fee: profile?.autonomo_fee?.toString() || '',
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
      trade_name: form.trade_name || null,
      nif: form.nif || null,
      address: form.address || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      province: form.province || null,
      phone: form.phone || null,
      iban: form.iban || null,
      epigraph: form.epigraph || null,
      registration_date: form.registration_date || null,
      autonomo_fee: form.autonomo_fee ? parseFloat(form.autonomo_fee) : null,
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
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Configuracion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" aria-live="polite" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {saved && (
            <Alert aria-live="polite" role="status" className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              <AlertDescription>Cambios guardados correctamente.</AlertDescription>
            </Alert>
          )}

          {/* Cuenta */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userEmail || ''}
              disabled
              aria-readonly="true"
            />
          </div>

          <Separator />

          {/* Datos personales */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Datos personales
            </h2>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="Tu nombre y apellidos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trade_name">Nombre comercial</Label>
              <Input
                id="trade_name"
                type="text"
                value={form.trade_name}
                onChange={e => update('trade_name', e.target.value)}
                placeholder="Nombre comercial o marca"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF/NIE</Label>
              <Input
                id="nif"
                type="text"
                value={form.nif}
                onChange={e => update('nif', e.target.value)}
                placeholder="12345678A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Direccion fiscal</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={e => update('address', e.target.value)}
                rows={2}
                placeholder="Calle, numero..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Codigo postal</Label>
                <Input
                  id="postal_code"
                  type="text"
                  value={form.postal_code}
                  onChange={e => update('postal_code', e.target.value)}
                  placeholder="28001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  type="text"
                  value={form.province}
                  onChange={e => update('province', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          <Separator />

          {/* Configuracion fiscal */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Datos fiscales
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default_vat_percent">IVA por defecto (%)</Label>
                <Input
                  id="default_vat_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.default_vat_percent}
                  onChange={e => update('default_vat_percent', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_irpf_percent">IRPF por defecto (%)</Label>
                <Input
                  id="default_irpf_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.default_irpf_percent}
                  onChange={e => update('default_irpf_percent', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                type="text"
                value={form.iban}
                onChange={e => update('iban', e.target.value)}
                placeholder="ES00 0000 0000 0000 0000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epigraph">Epigrafe IAE</Label>
              <Input
                id="epigraph"
                type="text"
                value={form.epigraph}
                onChange={e => update('epigraph', e.target.value)}
                placeholder="Ej: 831 - Servicios tecnicos"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registration_date">Fecha de alta</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={form.registration_date}
                  onChange={e => update('registration_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autonomo_fee">Cuota de autonomo mensual</Label>
                <Input
                  id="autonomo_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.autonomo_fee}
                  onChange={e => update('autonomo_fee', e.target.value)}
                  placeholder="80.00"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
