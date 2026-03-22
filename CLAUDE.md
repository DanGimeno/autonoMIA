# autonoMIA — Directivas del Proyecto

## Descripción

autonoMIA es una aplicación web para autónomos españoles. Gestiona proyectos, registro de horas, facturación (con IVA/IRPF) y tareas fiscales. Toda la UI está en español.

## Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Lenguaje**: TypeScript (strict)
- **UI**: shadcn/ui + Tailwind CSS 4 + Lucide React icons
- **Base de datos**: Supabase (PostgreSQL + Auth + RLS)
- **Despliegue**: Vercel

## Estructura del proyecto

```
src/
├── app/
│   ├── (app)/          # Rutas protegidas (requieren auth)
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── work-logs/
│   │   ├── invoices/
│   │   ├── tax-tasks/
│   │   └── settings/
│   └── (auth)/         # Rutas públicas (login, signup)
├── components/         # Componentes reutilizables del proyecto
│   └── ui/             # Componentes shadcn/ui (generados)
├── lib/
│   └── supabase/       # Helpers de Supabase (client.ts, server.ts)
└── types/              # Tipos TypeScript
supabase/
└── schema.sql          # Schema SQL con RLS policies
```

## Convenciones de código

### General
- Todo el texto visible al usuario debe estar en **español**
- Usar Server Components por defecto; `'use client'` solo cuando sea necesario
- Usar Server Actions para mutaciones de datos
- No usar `any`; tipado estricto siempre
- No usar emojis como iconos; usar `lucide-react`
- Formatear fechas en español: `21 mar 2026`, no `2026-03-21`

### Componentes UI
- Usar componentes de **shadcn/ui** como base (Card, Button, Input, Label, Select, Dialog, Table, Badge, etc.)
- No escribir HTML/CSS crudo para elementos de UI que shadcn ya proporciona
- Mantener consistencia visual usando los tokens de shadcn (bg-card, text-muted-foreground, etc.)

### Base de datos
- Toda tabla con datos de usuario debe tener `user_id uuid default auth.uid() not null`
- Toda tabla debe tener RLS habilitado con policies por `user_id`
- Las columnas `user_id` no se envían desde el cliente; se usan defaults de `auth.uid()`
- Usar `created_at` y `updated_at` en todas las tablas

### Autenticación
- Solo email/password (no OAuth, no proveedores externos)
- Middleware protege rutas en `(app)/`
- Signup desactivable con `NEXT_PUBLIC_SIGNUP_ENABLED=false`

### Supabase
- Servidor: `import { createClient } from '@/lib/supabase/server'` (async)
- Cliente: `import { createClient } from '@/lib/supabase/client'`
- En componentes client, crear el cliente de Supabase **fuera del componente** o con `useMemo` para evitar re-renders
- Siempre verificar `user` con null check antes de usar `user.id` en páginas server

## Accesibilidad — WCAG 2.2 Nivel AA+

### Principio: Accesibilidad excelente no es opcional

Toda feature, componente y página debe cumplir WCAG 2.2 nivel AA como mínimo. Aspiramos a AAA donde sea viable. La accesibilidad se implementa desde el inicio, no como corrección posterior.

### Perceptible (WCAG 1.x)

- **Contraste de color**: Ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande (>=18px bold o >=24px). Verificar con herramientas como el contrast checker de WebAIM
- **No depender solo del color** para transmitir información. Usar también iconos, texto, o patrones (ej: badge de "Vencida" no solo rojo, también icono + texto)
- **Texto alternativo**: Todo `<img>` debe tener `alt` descriptivo. Iconos decorativos usan `aria-hidden="true"`. Iconos informativos usan `aria-label`
- **Texto redimensionable**: La UI debe funcionar con zoom al 200% sin pérdida de contenido ni funcionalidad
- **Sin contenido que parpadee** más de 3 veces por segundo
- **Modo oscuro/claro**: Respetar `prefers-color-scheme` del sistema; ambos modos deben cumplir contrastes

### Operable (WCAG 2.x)

- **Navegación por teclado completa**: Todos los elementos interactivos deben ser accesibles con Tab, Shift+Tab, Enter, Escape, flechas
- **Focus visible**: Siempre mostrar un indicador de foco claro y visible (usar `focus-visible:ring-2 focus-visible:ring-ring` de shadcn). Nunca `outline: none` sin alternativa
- **Orden de tabulación lógico**: El orden de `tabIndex` debe seguir el flujo visual y lógico del contenido
- **Sin trampas de teclado**: Los modales/diálogos deben permitir cerrar con Escape y devolver el foco al elemento que los abrió
- **Skip links**: Incluir enlace "Saltar al contenido principal" como primer elemento focusable
- **Tiempo suficiente**: No usar timeouts para acciones críticas sin opción de extender. Los toasts informativos deben durar mínimo 5 segundos
- **Títulos de página descriptivos**: Cada ruta debe tener un `<title>` que describa la página (ej: "Facturas | autonoMIA")

### Comprensible (WCAG 3.x)

- **Idioma**: `<html lang="es">` en el layout raíz
- **Etiquetas de formulario**: Todo `<input>`, `<select>`, `<textarea>` debe tener un `<label>` asociado (shadcn Label). Nunca placeholders como sustituto de labels
- **Mensajes de error claros**: Los errores de validación deben ser específicos, visibles y asociados al campo (usar `aria-describedby` o `aria-errormessage`)
- **Feedback de estado**: Las acciones (guardar, borrar, etc.) deben comunicar su resultado. Usar `aria-live="polite"` para notificaciones dinámicas
- **Consistencia**: Misma acción = mismo patrón en toda la app. Botones de acción primaria siempre a la izquierda, cancelar a la derecha (o viceversa, pero consistente)
- **Prevención de errores**: Acciones destructivas (borrar proyecto, factura) requieren confirmación con diálogo, no solo `window.confirm()`

### Robusto (WCAG 4.x)

- **HTML semántico**: Usar `<main>`, `<nav>`, `<header>`, `<section>`, `<aside>`, `<footer>` apropiadamente. No `<div>` para todo
- **Roles ARIA solo cuando necesario**: Los componentes de shadcn ya incluyen roles correctos. No duplicar ni inventar roles
- **Landmarks**: La app debe tener landmarks claros: `<nav>` para sidebar, `<main>` para contenido, `<header>` si aplica
- **Tablas accesibles**: Las tablas de datos (facturas, proyectos) deben usar `<th scope="col">`, `<caption>`, y `aria-sort` en columnas ordenables
- **Live regions**: Usar `aria-live` para contenido que cambia dinámicamente (contadores, estados, notificaciones)
- **Formularios**: Agrupar campos relacionados con `<fieldset>` + `<legend>` cuando aplique

### Checklist antes de cada PR

- [ ] Navegable 100% con teclado (Tab, Enter, Escape, flechas)
- [ ] Foco visible en todos los elementos interactivos
- [ ] Contraste >= 4.5:1 verificado en todos los textos
- [ ] Labels en todos los campos de formulario
- [ ] Errores asociados a sus campos con `aria-describedby`
- [ ] HTML semántico (no divs genéricos para estructura)
- [ ] Funciona con zoom 200% sin overflow ni contenido cortado
- [ ] `aria-live` en notificaciones y cambios de estado dinámicos
- [ ] Sin `tabIndex` positivos (solo 0 o -1)
- [ ] Diálogos gestionan foco: atrapan foco dentro y lo devuelven al cerrar

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run build:mcp    # Build del servidor MCP
npm run lint         # ESLint
```

### Supabase CLI (requiere Docker Desktop activo)

```bash
npx supabase migration new <nombre>   # Crear nueva migración vacía en supabase/migrations/
npx supabase db push                  # Aplicar migraciones pendientes al Supabase remoto
npx supabase db pull                  # Descargar schema remoto como migración
npx supabase db reset                 # Resetear DB local (ejecuta migraciones + seed)
npx supabase start                    # Arrancar Supabase local (Studio en :54323)
npx supabase stop                     # Parar Supabase local
```

**Flujo para cambios de schema:**

1. Crear migración: `npx supabase migration new <nombre_descriptivo>`
2. Escribir el SQL en el fichero generado en `supabase/migrations/`
3. Mantener `supabase/schema.sql` actualizado como referencia completa
4. Aplicar a remoto: `npx supabase db push`

## Changelog

Todo cambio debe documentarse en `CHANGELOG.md` siguiendo el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/). Categorías: Added, Changed, Fixed, Removed. Cada entrada incluye la fecha y una descripción breve del cambio. No omitir este paso al finalizar una tarea.

## Variables de entorno

Ver `.env.example` para las variables requeridas. Nunca commitear `.env.local`.
