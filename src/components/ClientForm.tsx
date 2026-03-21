'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Client, ClientType } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ClientFormProps {
  client?: Client
}

export default function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: client?.name || '',
    trade_name: client?.trade_name || '',
    nif_cif: client?.nif_cif || '',
    type: client?.type || ('company' as ClientType),
    email: client?.email || '',
    phone: client?.phone || '',
    website: client?.website || '',
    contact_person: client?.contact_person || '',
    address: client?.address || '',
    city: client?.city || '',
    postal_code: client?.postal_code || '',
    province: client?.province || '',
    country: client?.country || 'España',
    default_payment_days: client?.default_payment_days?.toString() || '30',
    default_vat_percent: client?.default_vat_percent?.toString() || '21',
    default_irpf_percent: client?.default_irpf_percent?.toString() || '0',
    notes: client?.notes || '',
    is_active: client?.is_active ?? true,
  })

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name,
      trade_name: form.trade_name || null,
      nif_cif: form.nif_cif || null,
      type: form.type,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      contact_person: form.contact_person || null,
      address: form.address || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      province: form.province || null,
      country: form.country,
      default_payment_days: parseInt(form.default_payment_days) || 30,
      default_vat_percent: parseFloat(form.default_vat_percent) || 0,
      default_irpf_percent: parseFloat(form.default_irpf_percent) || 0,
      notes: form.notes || null,
      is_active: form.is_active,
    }

    let result
    if (client) {
      result = await supabase.from('clients').update(payload).eq('id', client.id)
    } else {
      result = await supabase.from('clients').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.push('/clients')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{client ? 'Editar cliente' : 'Nuevo cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert variant="destructive" className="mb-6" aria-live="polite">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            {/* Datos de identificacion */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold">Datos de identificacion</legend>

              <div className="space-y-2">
                <Label htmlFor="client-name">Nombre / Razon social *</Label>
                <Input
                  id="client-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  aria-required="true"
                  placeholder="Ej: Acme S.L."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-trade-name">Nombre comercial</Label>
                <Input
                  id="client-trade-name"
                  type="text"
                  value={form.trade_name}
                  onChange={(e) => update('trade_name', e.target.value)}
                  placeholder="Nombre comercial (si difiere)"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-nif-cif">NIF / CIF</Label>
                  <Input
                    id="client-nif-cif"
                    type="text"
                    value={form.nif_cif}
                    onChange={(e) => update('nif_cif', e.target.value)}
                    placeholder="Ej: B12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label id="client-type-label">Tipo de cliente</Label>
                  <Select
                    value={form.type}
                    onValueChange={(val) => { if (val) update('type', val) }}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-labelledby="client-type-label"
                    >
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Empresa</SelectItem>
                      <SelectItem value="freelancer">Autonomo</SelectItem>
                      <SelectItem value="individual">Particular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </fieldset>

            {/* Contacto */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold">Contacto</legend>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-phone">Telefono</Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-website">Sitio web</Label>
                  <Input
                    id="client-website"
                    type="url"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    placeholder="https://ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-contact-person">Persona de contacto</Label>
                  <Input
                    id="client-contact-person"
                    type="text"
                    value={form.contact_person}
                    onChange={(e) => update('contact_person', e.target.value)}
                    placeholder="Nombre del contacto"
                  />
                </div>
              </div>
            </fieldset>

            {/* Direccion fiscal */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold">Direccion fiscal</legend>

              <div className="space-y-2">
                <Label htmlFor="client-address">Direccion</Label>
                <Input
                  id="client-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="Calle, numero, piso..."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="client-city">Ciudad</Label>
                  <Input
                    id="client-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="Ciudad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-postal-code">Codigo postal</Label>
                  <Input
                    id="client-postal-code"
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => update('postal_code', e.target.value)}
                    placeholder="28001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-province">Provincia</Label>
                  <Input
                    id="client-province"
                    type="text"
                    value={form.province}
                    onChange={(e) => update('province', e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-country">Pais</Label>
                <Input
                  id="client-country"
                  type="text"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  placeholder="España"
                />
              </div>
            </fieldset>

            {/* Condiciones por defecto */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold">Condiciones por defecto</legend>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="client-payment-days">Dias de pago</Label>
                  <Input
                    id="client-payment-days"
                    type="number"
                    min="0"
                    step="1"
                    value={form.default_payment_days}
                    onChange={(e) => update('default_payment_days', e.target.value)}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-vat-percent">IVA (%)</Label>
                  <Input
                    id="client-vat-percent"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.default_vat_percent}
                    onChange={(e) => update('default_vat_percent', e.target.value)}
                    placeholder="21"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-irpf-percent">IRPF (%)</Label>
                  <Input
                    id="client-irpf-percent"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.default_irpf_percent}
                    onChange={(e) => update('default_irpf_percent', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </fieldset>

            {/* Notas */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold">Notas</legend>

              <div className="space-y-2">
                <Label htmlFor="client-notes">Notas internas</Label>
                <Textarea
                  id="client-notes"
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Notas internas sobre el cliente..."
                />
              </div>
            </fieldset>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : client
                  ? 'Actualizar'
                  : 'Crear cliente'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
