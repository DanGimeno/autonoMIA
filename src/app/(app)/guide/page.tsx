import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  CheckSquare,
  Calendar,
  FileText,
  Lightbulb,
  AlertTriangle,
  GraduationCap,
  LayoutDashboard,
  Users,
  FolderKanban,
  Clock,
  Receipt,
  ClipboardList,
  Settings,
  ListChecks,
  BookMarked,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Guía para principiantes | autonoMIA',
}

const tocItems = [
  { id: 'bienvenido', label: '1. Bienvenido a autonoMIA' },
  { id: 'primeros-pasos', label: '2. Primeros pasos' },
  { id: 'secciones', label: '3. Cómo usar cada sección' },
  { id: 'calendario-fiscal', label: '4. Calendario fiscal' },
  { id: 'checklist-mensual', label: '5. Checklist mensual' },
  { id: 'checklist-trimestral', label: '6. Checklist trimestral' },
  { id: 'consejos', label: '7. Consejos para el autónomo' },
  { id: 'glosario', label: '8. Glosario rápido' },
]

function Checkbox({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-muted-foreground/40 text-muted-foreground">
        &nbsp;
      </span>
      <span>{children}</span>
    </li>
  )
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="size-8 text-primary" />
          <h1 className="text-3xl font-bold">Guía para principiantes</h1>
        </div>
        <p className="text-muted-foreground">
          Todo lo que necesitas saber para gestionar tu actividad como autónomo con autonoMIA.
        </p>
      </div>

      {/* Table of contents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="size-5" />
            Índice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <nav>
            <ol className="space-y-1">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </CardContent>
      </Card>

      <Separator />

      {/* 1. Bienvenido */}
      <section id="bienvenido">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              1. Bienvenido a autonoMIA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>autonoMIA</strong> es tu herramienta de gestión integral para autónomos en España.
              Está diseñada para que puedas llevar el control de tu actividad profesional de forma
              sencilla, sin necesidad de conocimientos avanzados de contabilidad.
            </p>
            <p>
              Con autonoMIA podrás:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestionar tus <strong>clientes</strong> y <strong>proyectos</strong></li>
              <li>Registrar tus <strong>horas de trabajo</strong></li>
              <li>Crear y enviar <strong>facturas</strong> profesionales</li>
              <li>Controlar tus <strong>gastos</strong> deducibles</li>
              <li>Preparar tus <strong>obligaciones fiscales</strong> trimestrales y anuales</li>
              <li>Tener una visión clara de tu negocio desde el <strong>dashboard</strong></li>
            </ul>
            <p className="text-muted-foreground italic">
              No te preocupes si estás empezando, esta guía te acompañará paso a paso.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 2. Primeros pasos */}
      <section id="primeros-pasos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              2. Primeros pasos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Sigue esta lista para configurar tu cuenta y empezar a trabajar con autonoMIA:
            </p>
            <ul className="space-y-3">
              <Checkbox>Completa tu perfil en <strong>Configuración</strong> (nombre, NIF, dirección)</Checkbox>
              <Checkbox>Añade tu primer <strong>cliente</strong></Checkbox>
              <Checkbox>Crea tu primer <strong>proyecto</strong></Checkbox>
              <Checkbox>Registra tus primeras <strong>horas de trabajo</strong></Checkbox>
              <Checkbox>Emite tu primera <strong>factura</strong></Checkbox>
              <Checkbox>Registra tu primer <strong>gasto</strong></Checkbox>
              <Checkbox>Configura tus <strong>tareas fiscales</strong> trimestrales</Checkbox>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 3. Cómo usar cada sección */}
      <section id="secciones">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="size-5 text-primary" />
              3. Cómo usar cada sección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dashboard */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <LayoutDashboard className="size-4" />
                Dashboard
                <Badge variant="outline">Inicio</Badge>
              </h3>
              <p>
                El dashboard te ofrece una visión general de tu actividad: ingresos del mes,
                facturas pendientes, horas trabajadas y próximas obligaciones fiscales.
                Las tarjetas resumen te permiten detectar de un vistazo si hay algo que requiera tu atención.
              </p>
            </div>

            {/* Clientes */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Users className="size-4" />
                Clientes
              </h3>
              <p>
                Registra a todos tus clientes con sus datos fiscales: nombre o razón social, NIF/CIF,
                dirección y datos de contacto. Tener los datos correctos es fundamental para emitir
                facturas válidas. Puedes asociar varios proyectos a cada cliente.
              </p>
            </div>

            {/* Proyectos */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <FolderKanban className="size-4" />
                Proyectos
              </h3>
              <p>
                Cada proyecto se asocia a un cliente y puede tener dos tipos de facturación:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Por horas:</strong> defines una tarifa por hora y facturas según las horas registradas.</li>
                <li><strong>Tarifa plana:</strong> defines un precio fijo para todo el proyecto.</li>
              </ul>
            </div>

            {/* Registro de horas */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Clock className="size-4" />
                Registro de horas
              </h3>
              <p>
                Utiliza el calendario para registrar las horas dedicadas a cada proyecto.
                Puedes seleccionar el día, el proyecto y las horas trabajadas. Esto te permite
                llevar un control preciso de tu tiempo y facilita la facturación por horas.
              </p>
            </div>

            {/* Facturas */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <FileText className="size-4" />
                Facturas
              </h3>
              <p>
                Para crear una factura, selecciona el cliente y el proyecto. Los conceptos clave son:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Base imponible:</strong> el importe antes de impuestos.</li>
                <li><strong>IVA (21%):</strong> el impuesto que repercutes al cliente (se lo cobras y luego ingresas a Hacienda).</li>
                <li><strong>IRPF (15%):</strong> la retención del impuesto sobre la renta que el cliente ingresa por ti (solo aplica en ciertos casos).</li>
                <li><strong>Total:</strong> Base + IVA - IRPF = lo que cobra realmente el cliente.</li>
              </ul>
            </div>

            {/* Gastos */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Receipt className="size-4" />
                Gastos
              </h3>
              <p>
                Registra todos los gastos relacionados con tu actividad profesional. El IVA que pagas
                en tus compras (IVA soportado) se puede deducir del IVA que cobras a tus clientes
                (IVA repercutido). Por eso es importante guardar todos los tickets y facturas de compra.
              </p>
            </div>

            {/* Tareas fiscales */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <ClipboardList className="size-4" />
                Tareas fiscales
              </h3>
              <p>
                El calendario del autónomo te recuerda todas tus obligaciones fiscales:
                declaraciones trimestrales de IVA e IRPF, declaraciones anuales y el pago
                de la cuota de autónomo. Nunca más se te pasará una fecha límite.
              </p>
            </div>

            {/* Trimestres fiscales */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Calendar className="size-4" />
                Trimestres fiscales
              </h3>
              <p>
                Los trimestres fiscales agrupan tus ingresos y gastos por periodos de tres meses
                (T1: enero-marzo, T2: abril-junio, T3: julio-septiembre, T4: octubre-diciembre).
                Esto te ayuda a preparar las declaraciones trimestrales y a tener una visión
                clara de la evolución de tu negocio.
              </p>
            </div>

            {/* Configuración */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Settings className="size-4" />
                Configuración
              </h3>
              <p>
                Desde aquí puedes actualizar tus datos personales, fiscales y de contacto.
                Asegúrate de tener todo completo para que tus facturas salgan correctas.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 4. Calendario fiscal */}
      <section id="calendario-fiscal">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              4. Calendario fiscal del autónomo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Estas son las principales obligaciones fiscales que debes tener en cuenta como autónomo en España:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Periodicidad</th>
                    <th className="text-left py-2 pr-4 font-semibold">Obligación</th>
                    <th className="text-left py-2 font-semibold">Fecha límite</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 pr-4">
                      <Badge variant="secondary">Mensual</Badge>
                    </td>
                    <td className="py-2 pr-4">Cuota de autónomo</td>
                    <td className="py-2">Último día del mes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <Badge>Trimestral</Badge>
                    </td>
                    <td className="py-2 pr-4">Modelo 303 (IVA)</td>
                    <td className="py-2">20 ene / 20 abr / 20 jul / 20 oct</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <Badge>Trimestral</Badge>
                    </td>
                    <td className="py-2 pr-4">Modelo 130 (IRPF)</td>
                    <td className="py-2">20 ene / 20 abr / 20 jul / 20 oct</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <Badge variant="destructive">Anual</Badge>
                    </td>
                    <td className="py-2 pr-4">Modelo 390 (resumen anual IVA)</td>
                    <td className="py-2">30 de enero</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <Badge variant="destructive">Anual</Badge>
                    </td>
                    <td className="py-2 pr-4">Modelo 100 (declaración de la renta)</td>
                    <td className="py-2">Abril - Junio</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 5. Checklist mensual */}
      <section id="checklist-mensual">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              5. Checklist mensual del autónomo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Cada mes, asegúrate de completar estas tareas para mantener tu gestión al día:
            </p>
            <ul className="space-y-3">
              <Checkbox>Registrar todas las horas trabajadas</Checkbox>
              <Checkbox>Emitir facturas pendientes</Checkbox>
              <Checkbox>Registrar todos los gastos (guardar tickets)</Checkbox>
              <Checkbox>Pagar cuota de autónomo</Checkbox>
              <Checkbox>Revisar facturas vencidas</Checkbox>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 6. Checklist trimestral */}
      <section id="checklist-trimestral">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              6. Checklist trimestral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Antes de cada declaración trimestral, repasa esta lista:
            </p>
            <ul className="space-y-3">
              <Checkbox>Revisar IVA repercutido vs IVA soportado</Checkbox>
              <Checkbox>Preparar Modelo 303 (IVA)</Checkbox>
              <Checkbox>Preparar Modelo 130 (IRPF)</Checkbox>
              <Checkbox>Presentar antes del día 20</Checkbox>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 7. Consejos */}
      <section id="consejos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-5 text-primary" />
              7. Consejos para el autónomo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="size-4 text-green-600" />
                Tips prácticos
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Guarda todos los tickets y facturas de compra.</strong> Son necesarios para justificar tus gastos deducibles ante Hacienda.</li>
                <li><strong>Registra tus horas de trabajo cada día.</strong> Es mucho más fácil que intentar recordarlas a final de mes.</li>
                <li><strong>Revisa las facturas vencidas regularmente.</strong> No dejes que se acumulen impagos sin reclamar.</li>
                <li><strong>Separa tu cuenta bancaria personal de la profesional.</strong> Te ahorrará muchos dolores de cabeza a la hora de cuadrar cuentas.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="size-4 text-amber-600" />
                Errores comunes
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Olvidar gastos deducibles:</strong> muchos autónomos no deducen gastos que podrían, como material de oficina, software, formación o parte de los suministros del hogar.</li>
                <li><strong>No hacer facturas correlativas:</strong> la numeración de las facturas debe ser consecutiva y sin saltos. Si emites la factura 001 y luego la 003, Hacienda puede pedirte explicaciones.</li>
                <li><strong>Dejar las declaraciones para el último día:</strong> si hay algún error o falta documentación, no tendrás margen para resolverlo.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 8. Glosario */}
      <section id="glosario">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="size-5 text-primary" />
              8. Glosario rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold">Autónomo</dt>
                <dd className="text-muted-foreground">Trabajador por cuenta propia dado de alta en el Régimen Especial de Trabajadores Autónomos (RETA) de la Seguridad Social.</dd>
              </div>
              <div>
                <dt className="font-semibold">NIF / CIF</dt>
                <dd className="text-muted-foreground">Número de Identificación Fiscal. Para personas físicas suele coincidir con el DNI. El CIF (ahora NIF de persona jurídica) identifica a empresas y sociedades.</dd>
              </div>
              <div>
                <dt className="font-semibold">IVA (Impuesto sobre el Valor Añadido)</dt>
                <dd className="text-muted-foreground">Impuesto indirecto que se aplica al consumo. El tipo general es del 21%. Como autónomo, cobras IVA a tus clientes (repercutido) y pagas IVA en tus compras (soportado). La diferencia es lo que ingresas a Hacienda.</dd>
              </div>
              <div>
                <dt className="font-semibold">IRPF (Impuesto sobre la Renta de las Personas Físicas)</dt>
                <dd className="text-muted-foreground">Impuesto directo sobre tus ingresos. Como autónomo, realizas pagos fraccionados trimestrales (Modelo 130) a cuenta de tu declaración anual.</dd>
              </div>
              <div>
                <dt className="font-semibold">Base imponible</dt>
                <dd className="text-muted-foreground">El importe de una factura antes de aplicar impuestos. Es la cantidad sobre la que se calculan el IVA y el IRPF.</dd>
              </div>
              <div>
                <dt className="font-semibold">Epígrafe IAE</dt>
                <dd className="text-muted-foreground">Código que identifica tu actividad económica en el Impuesto de Actividades Económicas. Se elige al darte de alta como autónomo.</dd>
              </div>
              <div>
                <dt className="font-semibold">Modelo 303</dt>
                <dd className="text-muted-foreground">Declaración trimestral de IVA. Aquí declaras la diferencia entre el IVA que has cobrado (repercutido) y el que has pagado (soportado).</dd>
              </div>
              <div>
                <dt className="font-semibold">Modelo 130</dt>
                <dd className="text-muted-foreground">Declaración trimestral de IRPF. Es un pago fraccionado a cuenta de tu declaración de la renta anual, generalmente el 20% del rendimiento neto.</dd>
              </div>
              <div>
                <dt className="font-semibold">Cuota de autónomo</dt>
                <dd className="text-muted-foreground">La cantidad mensual que pagas a la Seguridad Social por estar dado de alta como trabajador autónomo. Te da derecho a prestaciones como asistencia sanitaria o jubilación.</dd>
              </div>
              <div>
                <dt className="font-semibold">Factura rectificativa</dt>
                <dd className="text-muted-foreground">Factura que se emite para corregir errores en una factura anterior. Sustituye o complementa la factura original.</dd>
              </div>
              <div>
                <dt className="font-semibold">Proforma</dt>
                <dd className="text-muted-foreground">Documento que tiene el formato de una factura pero no tiene valor fiscal. Se usa como presupuesto o para que el cliente conozca el importe antes de la factura definitiva.</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <p className="text-center text-sm text-muted-foreground pb-4">
        ¿Tienes dudas? Consulta la{' '}
        <Link href="/docs" className="text-primary hover:underline">
          documentación técnica
        </Link>{' '}
        o revisa la{' '}
        <Link href="/settings" className="text-primary hover:underline">
          configuración
        </Link>{' '}
        de tu cuenta.
      </p>
    </div>
  )
}
