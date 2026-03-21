import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Documentación | autonoMIA',
  description: 'Guidelines de desarrollo, accesibilidad WCAG 2.2 y convenciones del proyecto autonoMIA.',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
      <h2 id={`${id}-heading`} className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20">
      <h3 id={`${id}-heading`} className="text-xl font-semibold text-foreground mb-3 mt-6">{title}</h3>
      {children}
    </div>
  )
}

function GuidelineItem({ criterion, level, children }: { criterion: string; level: 'A' | 'AA' | 'AAA'; children: React.ReactNode }) {
  const levelColors = {
    A: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    AA: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    AAA: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }
  return (
    <li className="flex gap-3 items-start py-2">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold shrink-0 mt-0.5 ${levelColors[level]}`}>
        {criterion} ({level})
      </span>
      <span className="text-muted-foreground">{children}</span>
    </li>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-primary text-primary-foreground rounded-lg p-4 text-sm overflow-x-auto my-3" role="img" aria-label="Ejemplo de código">
      <code>{children}</code>
    </pre>
  )
}

export default function DocsPage() {
  const navItems = [
    { id: 'overview', label: 'Visión general' },
    { id: 'stack', label: 'Stack técnico' },
    { id: 'structure', label: 'Estructura del proyecto' },
    { id: 'conventions', label: 'Convenciones de código' },
    { id: 'accessibility', label: 'Accesibilidad WCAG 2.2' },
    { id: 'a11y-perceptible', label: 'Perceptible' },
    { id: 'a11y-operable', label: 'Operable' },
    { id: 'a11y-comprensible', label: 'Comprensible' },
    { id: 'a11y-robusto', label: 'Robusto' },
    { id: 'checklist', label: 'Checklist de PR' },
    { id: 'commands', label: 'Comandos' },
    { id: 'changelog', label: 'Historial de cambios' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-blue-700 focus:font-medium">
        Saltar al contenido principal
      </a>

      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-foreground hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded">
                autonoMIA
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground font-medium">Documentación</span>
            </div>
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-2 py-1"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
          <nav aria-label="Índice de documentación" className="hidden lg:block sticky top-24 self-start">
            <ul className="space-y-1" role="list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-muted hover:text-foreground text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      item.id.startsWith('a11y-') ? 'pl-6' : ''
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <main id="main-content" className="space-y-12" role="main">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-3">Documentación de autonoMIA</h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Guidelines de desarrollo, convenciones del proyecto y directivas de accesibilidad WCAG 2.2 nivel AA+.
              </p>
            </div>

            <Section id="overview" title="Visión general">
              <p className="text-muted-foreground leading-relaxed">
                <strong>autonoMIA</strong> es una aplicación web diseñada para autónomos españoles. Permite gestionar
                proyectos, registrar horas de trabajo diarias, administrar facturación con cálculos de IVA e IRPF, y
                controlar tareas fiscales recurrentes. La aplicación está pensada para uso individual con soporte
                multi-usuario y aislamiento de datos mediante Row Level Security (RLS).
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Proyectos', desc: 'Gestión de clientes y proyectos con estado y tarifa por hora' },
                  { title: 'Horas', desc: 'Calendario mensual para registrar trabajo diario por proyecto' },
                  { title: 'Facturas', desc: 'Facturación con IVA, IRPF, estados y vencimientos' },
                  { title: 'Tareas fiscales', desc: 'Control de obligaciones fiscales: IVA, IRPF, cuota autónomo' },
                  { title: 'Perfil', desc: 'NIF, dirección y porcentajes de IVA/IRPF por defecto' },
                  { title: 'Autenticación', desc: 'Login por email con signup desactivable' },
                ].map((feature) => (
                  <div key={feature.title} className="bg-card rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="stack" title="Stack técnico">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <caption className="sr-only">Tecnologías utilizadas en el proyecto</caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="text-left py-2 pr-4 font-semibold text-foreground">Tecnología</th>
                      <th scope="col" className="text-left py-2 pr-4 font-semibold text-foreground">Versión</th>
                      <th scope="col" className="text-left py-2 font-semibold text-foreground">Uso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ['Next.js', '15', 'Framework con App Router, Server Components, Server Actions'],
                      ['TypeScript', '5', 'Tipado estricto en todo el código'],
                      ['Tailwind CSS', '4', 'Estilos utilitarios'],
                      ['shadcn/ui', 'latest', 'Componentes UI accesibles (basados en Radix)'],
                      ['Lucide React', 'latest', 'Iconografía SVG consistente'],
                      ['Supabase', '2.x', 'Auth, base de datos PostgreSQL, Row Level Security'],
                      ['Vercel', '-', 'Despliegue y hosting'],
                    ].map(([tech, version, usage]) => (
                      <tr key={tech}>
                        <td className="py-2 pr-4 font-medium text-foreground">{tech}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{version}</td>
                        <td className="py-2 text-muted-foreground">{usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="structure" title="Estructura del proyecto">
              <CodeBlock>{`src/
├── app/
│   ├── (app)/          # Rutas protegidas (requieren auth)
│   │   ├── dashboard/  # Panel principal con resumen
│   │   ├── projects/   # CRUD de proyectos
│   │   ├── work-logs/  # Calendario de horas
│   │   ├── invoices/   # Gestión de facturas
│   │   ├── tax-tasks/  # Tareas fiscales
│   │   └── settings/   # Perfil y configuración
│   ├── (auth)/         # Rutas públicas de auth
│   │   ├── login/
│   │   └── signup/
│   └── (public)/       # Rutas públicas
│       └── docs/       # Esta documentación
├── components/
│   └── ui/             # Componentes shadcn/ui (generados)
├── lib/
│   └── supabase/       # Helpers de Supabase
│       ├── client.ts   # Cliente para componentes client
│       └── server.ts   # Cliente para Server Components
└── types/
    └── index.ts        # Interfaces TypeScript`}</CodeBlock>
            </Section>

            <Section id="conventions" title="Convenciones de código">
              <ul className="space-y-3 text-muted-foreground" role="list">
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> Todo texto visible en <strong>español</strong></li>
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> Server Components por defecto; <code className="bg-muted px-1.5 py-0.5 rounded text-sm">&apos;use client&apos;</code> solo para interactividad</li>
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> Server Actions para mutaciones de datos</li>
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> TypeScript estricto — nunca <code className="bg-muted px-1.5 py-0.5 rounded text-sm">any</code></li>
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> Componentes <strong>shadcn/ui</strong> como base para toda la UI</li>
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> Iconos de <strong>Lucide React</strong> — nunca emojis</li>
                <li className="flex gap-2"><span className="text-green-600 font-bold shrink-0" aria-hidden="true">+</span> Fechas formateadas en español: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">21 mar 2026</code></li>
                <li className="flex gap-2"><span className="text-red-600 font-bold shrink-0" aria-hidden="true">-</span> No enviar <code className="bg-muted px-1.5 py-0.5 rounded text-sm">user_id</code> desde el cliente — usar <code className="bg-muted px-1.5 py-0.5 rounded text-sm">DEFAULT auth.uid()</code></li>
                <li className="flex gap-2"><span className="text-red-600 font-bold shrink-0" aria-hidden="true">-</span> No usar <code className="bg-muted px-1.5 py-0.5 rounded text-sm">user!</code> sin null check en Server Components</li>
              </ul>
            </Section>

            <Section id="accessibility" title="Accesibilidad — WCAG 2.2 Nivel AA+">
              <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-blue-900 dark:text-blue-200 font-medium mb-1">Compromiso de accesibilidad</p>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Toda feature, componente y página debe cumplir WCAG 2.2 nivel AA como mínimo.
                  Aspiramos a AAA donde sea viable. La accesibilidad se implementa desde el inicio,
                  no como corrección posterior.
                </p>
              </div>

              <SubSection id="a11y-perceptible" title="1. Perceptible">
                <p className="text-muted-foreground mb-3">El contenido debe ser presentable de formas que el usuario pueda percibir.</p>
                <ul className="space-y-1" role="list">
                  <GuidelineItem criterion="1.4.3" level="AA">
                    <strong>Contraste mínimo</strong>: 4.5:1 para texto normal, 3:1 para texto grande (&ge;18px bold o &ge;24px).
                    Verificar con herramientas como WebAIM Contrast Checker.
                  </GuidelineItem>
                  <GuidelineItem criterion="1.4.1" level="A">
                    <strong>No solo color</strong>: La información no debe transmitirse únicamente mediante color.
                    Usar también iconos, texto o patrones (ej: badge &quot;Vencida&quot; con icono + texto, no solo rojo).
                  </GuidelineItem>
                  <GuidelineItem criterion="1.1.1" level="A">
                    <strong>Texto alternativo</strong>: Todo <code className="bg-muted px-1 rounded text-xs">&lt;img&gt;</code> con <code className="bg-muted px-1 rounded text-xs">alt</code> descriptivo.
                    Iconos decorativos con <code className="bg-muted px-1 rounded text-xs">aria-hidden=&quot;true&quot;</code>.
                  </GuidelineItem>
                  <GuidelineItem criterion="1.4.4" level="AA">
                    <strong>Zoom 200%</strong>: La UI debe funcionar con zoom al 200% sin pérdida de contenido ni scroll horizontal.
                  </GuidelineItem>
                  <GuidelineItem criterion="1.4.11" level="AA">
                    <strong>Contraste no textual</strong>: Bordes de inputs, iconos informativos y componentes gráficos
                    deben tener ratio mínimo 3:1 contra el fondo.
                  </GuidelineItem>
                  <GuidelineItem criterion="1.4.13" level="AA">
                    <strong>Contenido hover/focus</strong>: Los tooltips y contenido que aparece al hover/focus deben ser
                    descartables, hoverable y persistentes.
                  </GuidelineItem>
                </ul>
              </SubSection>

              <SubSection id="a11y-operable" title="2. Operable">
                <p className="text-muted-foreground mb-3">Los componentes de la interfaz deben ser operables por cualquier usuario.</p>
                <ul className="space-y-1" role="list">
                  <GuidelineItem criterion="2.1.1" level="A">
                    <strong>Teclado</strong>: Todos los elementos interactivos accesibles con Tab, Shift+Tab, Enter, Escape, flechas.
                  </GuidelineItem>
                  <GuidelineItem criterion="2.4.7" level="AA">
                    <strong>Foco visible</strong>: Indicador de foco claro en todos los elementos focusables.
                    Usar <code className="bg-muted px-1 rounded text-xs">focus-visible:ring-2</code> de shadcn.
                  </GuidelineItem>
                  <GuidelineItem criterion="2.1.2" level="A">
                    <strong>Sin trampas</strong>: Los modales permiten cerrar con Escape y devuelven el foco al trigger.
                  </GuidelineItem>
                  <GuidelineItem criterion="2.4.1" level="A">
                    <strong>Skip link</strong>: Enlace &quot;Saltar al contenido principal&quot; como primer elemento focusable.
                  </GuidelineItem>
                  <GuidelineItem criterion="2.4.2" level="A">
                    <strong>Títulos de página</strong>: Cada ruta con <code className="bg-muted px-1 rounded text-xs">&lt;title&gt;</code> descriptivo
                    (ej: &quot;Facturas | autonoMIA&quot;).
                  </GuidelineItem>
                  <GuidelineItem criterion="2.4.3" level="A">
                    <strong>Orden de foco</strong>: El orden de tabulación sigue el flujo visual y lógico del contenido.
                  </GuidelineItem>
                  <GuidelineItem criterion="2.2.1" level="A">
                    <strong>Tiempo suficiente</strong>: Toasts informativos mínimo 5 segundos. Sin timeouts en acciones críticas.
                  </GuidelineItem>
                  <GuidelineItem criterion="2.5.8" level="AA">
                    <strong>Tamaño de target</strong>: Elementos interactivos con tamaño mínimo de 24x24px (idealmente 44x44px en mobile).
                  </GuidelineItem>
                </ul>
              </SubSection>

              <SubSection id="a11y-comprensible" title="3. Comprensible">
                <p className="text-muted-foreground mb-3">La información y la operación de la interfaz deben ser comprensibles.</p>
                <ul className="space-y-1" role="list">
                  <GuidelineItem criterion="3.1.1" level="A">
                    <strong>Idioma</strong>: <code className="bg-muted px-1 rounded text-xs">&lt;html lang=&quot;es&quot;&gt;</code> en el layout raíz.
                  </GuidelineItem>
                  <GuidelineItem criterion="3.3.2" level="A">
                    <strong>Labels</strong>: Todo input con <code className="bg-muted px-1 rounded text-xs">&lt;label&gt;</code> asociado.
                    Nunca placeholders como sustituto de labels.
                  </GuidelineItem>
                  <GuidelineItem criterion="3.3.1" level="A">
                    <strong>Errores claros</strong>: Mensajes específicos, visibles y asociados al campo con
                    <code className="bg-muted px-1 rounded text-xs">aria-describedby</code>.
                  </GuidelineItem>
                  <GuidelineItem criterion="3.3.4" level="AA">
                    <strong>Prevención de errores</strong>: Acciones destructivas requieren confirmación con diálogo accesible,
                    no <code className="bg-muted px-1 rounded text-xs">window.confirm()</code>.
                  </GuidelineItem>
                  <GuidelineItem criterion="3.2.6" level="A">
                    <strong>Feedback de estado</strong>: Las acciones comunican su resultado con
                    <code className="bg-muted px-1 rounded text-xs">aria-live=&quot;polite&quot;</code>.
                  </GuidelineItem>
                  <GuidelineItem criterion="3.2.3" level="AA">
                    <strong>Consistencia</strong>: Misma acción = mismo patrón en toda la app.
                  </GuidelineItem>
                </ul>
              </SubSection>

              <SubSection id="a11y-robusto" title="4. Robusto">
                <p className="text-muted-foreground mb-3">El contenido debe ser lo suficientemente robusto para tecnologías asistivas.</p>
                <ul className="space-y-1" role="list">
                  <GuidelineItem criterion="4.1.2" level="A">
                    <strong>HTML semántico</strong>: Usar <code className="bg-muted px-1 rounded text-xs">&lt;main&gt;</code>,{' '}
                    <code className="bg-muted px-1 rounded text-xs">&lt;nav&gt;</code>,{' '}
                    <code className="bg-muted px-1 rounded text-xs">&lt;header&gt;</code>,{' '}
                    <code className="bg-muted px-1 rounded text-xs">&lt;section&gt;</code>. No divs genéricos para estructura.
                  </GuidelineItem>
                  <GuidelineItem criterion="4.1.2" level="A">
                    <strong>Tablas accesibles</strong>: <code className="bg-muted px-1 rounded text-xs">&lt;th scope=&quot;col&quot;&gt;</code>,{' '}
                    <code className="bg-muted px-1 rounded text-xs">&lt;caption&gt;</code> en tablas de datos.
                  </GuidelineItem>
                  <GuidelineItem criterion="4.1.3" level="AA">
                    <strong>Live regions</strong>: <code className="bg-muted px-1 rounded text-xs">aria-live</code> para
                    contenido que cambia dinámicamente.
                  </GuidelineItem>
                  <GuidelineItem criterion="4.1.2" level="A">
                    <strong>Landmarks</strong>: <code className="bg-muted px-1 rounded text-xs">&lt;nav&gt;</code> para sidebar,{' '}
                    <code className="bg-muted px-1 rounded text-xs">&lt;main&gt;</code> para contenido.
                  </GuidelineItem>
                  <GuidelineItem criterion="4.1.2" level="A">
                    <strong>ARIA correcta</strong>: Los componentes shadcn ya incluyen roles correctos. No duplicar ni inventar roles.
                    Solo <code className="bg-muted px-1 rounded text-xs">tabIndex</code> 0 o -1, nunca positivos.
                  </GuidelineItem>
                </ul>
              </SubSection>
            </Section>

            <Section id="checklist" title="Checklist de PR">
              <p className="text-muted-foreground mb-4">Antes de enviar cada Pull Request, verificar:</p>
              <div className="bg-card rounded-lg border border-border divide-y divide-border">
                {[
                  'Navegable 100% con teclado (Tab, Enter, Escape, flechas)',
                  'Foco visible en todos los elementos interactivos',
                  'Contraste >= 4.5:1 verificado en todos los textos',
                  'Labels en todos los campos de formulario',
                  'Errores asociados a sus campos con aria-describedby',
                  'HTML semántico (no divs genéricos para estructura)',
                  'Funciona con zoom 200% sin overflow ni contenido cortado',
                  'aria-live en notificaciones y cambios de estado dinámicos',
                  'Sin tabIndex positivos (solo 0 o -1)',
                  'Diálogos gestionan foco: atrapan foco dentro y lo devuelven al cerrar',
                  'Texto UI en español',
                  'Fechas formateadas en español',
                  'npm run build sin errores',
                  'npm run lint sin warnings',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="w-5 h-5 rounded border-2 border-border shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="commands" title="Comandos">
              <div className="space-y-2">
                {[
                  { cmd: 'npm run dev', desc: 'Servidor de desarrollo en localhost:3000' },
                  { cmd: 'npm run build', desc: 'Build de producción' },
                  { cmd: 'npm run start', desc: 'Servidor de producción' },
                  { cmd: 'npm run lint', desc: 'ESLint' },
                  { cmd: 'npx supabase db push', desc: 'Aplicar migraciones a Supabase' },
                ].map(({ cmd, desc }) => (
                  <div key={cmd} className="flex items-center gap-4 bg-card rounded-lg border border-border px-4 py-3">
                    <code className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-mono">{cmd}</code>
                    <span className="text-sm text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="changelog" title="Historial de cambios">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sin publicar</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Añadido</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside" role="list">
                        <li>Scaffold completo del MVP (autenticación, dashboard, proyectos, horas, facturas, tareas fiscales, configuración)</li>
                        <li>Schema SQL con Row Level Security</li>
                        <li>Middleware de autenticación</li>
                        <li>Documentación con guidelines WCAG 2.2 AA+</li>
                        <li>CLAUDE.md con directivas del proyecto</li>
                        <li>Skills de Claude Code</li>
                        <li>CHANGELOG.md</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-1">Por corregir</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside" role="list">
                        <li>Formularios sin user_id en inserts (falta DEFAULT auth.uid())</li>
                        <li>Null checks en páginas server</li>
                        <li>Re-renders infinitos en componentes client</li>
                        <li>Calendario en domingo (debe ser lunes)</li>
                        <li>Migración a shadcn/ui + Lucide</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">0.1.0 — 2026-03-21</h3>
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Añadido</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside" role="list">
                      <li>Commit inicial del repositorio</li>
                      <li>Plan inicial del proyecto</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            <footer className="border-t border-border pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                autonoMIA — Gestión para autónomos. Código abierto en GitHub.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
