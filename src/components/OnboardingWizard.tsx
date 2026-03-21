'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowRight, ArrowLeft, Check, User, Building2, Briefcase } from 'lucide-react'

interface OnboardingWizardProps {
  userEmail: string
}

const supabase = createClient()

const TOTAL_STEPS = 3

export function OnboardingWizard({ userEmail }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Personal data
  const [fullName, setFullName] = useState('')
  const [nif, setNif] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2: Fiscal data
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [province, setProvince] = useState('')
  const [defaultVat, setDefaultVat] = useState('21')
  const [defaultIrpf, setDefaultIrpf] = useState('15')

  // Step 3: First client (optional)
  const [clientName, setClientName] = useState('')
  const [clientNif, setClientNif] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientType, setClientType] = useState('company')
  const [skipClient, setSkipClient] = useState(false)

  function nextStep() {
    if (step === 1 && !fullName.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setError(null)
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  function prevStep() {
    setError(null)
    setStep(s => Math.max(s - 1, 1))
  }

  async function handleComplete() {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // 1. Save profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          nif: nif.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          postal_code: postalCode.trim() || null,
          province: province.trim() || null,
          default_vat_percent: parseFloat(defaultVat) || 21,
          default_irpf_percent: parseFloat(defaultIrpf) || 15,
          onboarding_completed: true,
        })

      if (profileError) throw profileError

      // 2. Create first client if provided
      if (!skipClient && clientName.trim()) {
        const { error: clientError } = await supabase
          .from('clients')
          .insert({
            name: clientName.trim(),
            nif_cif: clientNif.trim() || null,
            email: clientEmail.trim() || null,
            type: clientType,
          })

        if (clientError) {
          console.error('Error creating client:', clientError)
          // Non-blocking: continue even if client creation fails
        }
      }

      // 3. Create welcome notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          type: 'general',
          title: '¡Bienvenido a autonoMIA!',
          message: 'Tu cuenta está configurada. Puedes completar tu información personal y fiscal en Configuración.',
          link: '/settings',
        })

      if (notifError) {
        console.error('Error creating notification:', notifError)
      }

      // 4. Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos')
      setLoading(false)
    }
  }

  const stepIcons = [User, Building2, Briefcase]
  const stepLabels = ['Datos personales', 'Dirección y fiscalidad', 'Tu primer cliente']

  return (
    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4">
          <h1 className="text-2xl font-bold">autonoMIA</h1>
          <p className="text-muted-foreground text-sm mt-1">Configuración inicial</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-4" role="navigation" aria-label="Pasos del asistente">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const StepIcon = stepIcons[i]
            const isActive = step === i + 1
            const isCompleted = step > i + 1
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`h-px w-8 ${isCompleted ? 'bg-primary' : 'bg-border'}`} aria-hidden="true" />
                )}
                <div
                  className={`flex items-center justify-center rounded-full size-10 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Paso ${i + 1}: ${stepLabels[i]}${isCompleted ? ' (completado)' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : (
                    <StepIcon className="size-5" aria-hidden="true" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <CardTitle className="text-lg mt-4">
          {stepLabels[step - 1]}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paso {step} de {TOTAL_STEPS}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div role="status" aria-live="polite">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Step 1: Personal data */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Empecemos con lo básico. ¿Cómo te llamas?
            </p>
            <div className="space-y-2">
              <Label htmlFor="ob-name">Nombre completo *</Label>
              <Input
                id="ob-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tu nombre y apellidos"
                aria-required="true"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-nif">NIF/NIE</Label>
              <Input
                id="ob-nif"
                value={nif}
                onChange={e => setNif(e.target.value)}
                placeholder="12345678A"
              />
              <p className="text-xs text-muted-foreground">
                Número de identificación fiscal. Lo puedes añadir después.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-phone">Teléfono</Label>
              <Input
                id="ob-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="612 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-email">Email</Label>
              <Input
                id="ob-email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        )}

        {/* Step 2: Address & fiscal */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tu dirección fiscal aparecerá en las facturas. Los porcentajes de IVA e IRPF se usarán como valores por defecto.
            </p>
            <div className="space-y-2">
              <Label htmlFor="ob-address">Dirección</Label>
              <Input
                id="ob-address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Calle, número, piso..."
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ob-city">Ciudad</Label>
                <Input
                  id="ob-city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Barcelona"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-postal">Código postal</Label>
                <Input
                  id="ob-postal"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="08001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-province">Provincia</Label>
              <Input
                id="ob-province"
                value={province}
                onChange={e => setProvince(e.target.value)}
                placeholder="Barcelona"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ob-vat">IVA por defecto (%)</Label>
                <Input
                  id="ob-vat"
                  type="number"
                  min="0"
                  max="100"
                  value={defaultVat}
                  onChange={e => setDefaultVat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-irpf">IRPF por defecto (%)</Label>
                <Input
                  id="ob-irpf"
                  type="number"
                  min="0"
                  max="100"
                  value={defaultIrpf}
                  onChange={e => setDefaultIrpf(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  7% si llevas menos de 2 años como autónomo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: First client (optional) */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si ya tienes un cliente, puedes añadirlo ahora. Si no, puedes saltarte este paso.
            </p>

            {skipClient ? (
              <div className="text-center py-6">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-3" aria-hidden="true" />
                <p className="text-muted-foreground">
                  Sin problema. Podrás añadir clientes desde la sección Clientes.
                </p>
                <Button
                  variant="link"
                  onClick={() => setSkipClient(false)}
                  className="mt-2"
                >
                  En realidad sí quiero añadir uno
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ob-client-name">Nombre del cliente</Label>
                  <Input
                    id="ob-client-name"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Empresa o nombre del cliente"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ob-client-nif">NIF/CIF del cliente</Label>
                    <Input
                      id="ob-client-nif"
                      value={clientNif}
                      onChange={e => setClientNif(e.target.value)}
                      placeholder="B12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label id="ob-client-type-label">Tipo</Label>
                    <Select value={clientType} onValueChange={setClientType}>
                      <SelectTrigger className="w-full" aria-labelledby="ob-client-type-label">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Empresa</SelectItem>
                        <SelectItem value="freelancer">Autónomo</SelectItem>
                        <SelectItem value="individual">Particular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-client-email">Email del cliente</Label>
                  <Input
                    id="ob-client-email"
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <Button
                  variant="link"
                  onClick={() => setSkipClient(true)}
                  className="text-muted-foreground"
                >
                  Saltar este paso
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between sticky bottom-0 bg-card border-t pt-4">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
            <ArrowLeft className="size-4" />
            Anterior
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={nextStep}>
            Siguiente
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleComplete} disabled={loading}>
            {loading ? 'Guardando...' : (
              <>
                Completar
                <Check className="size-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
