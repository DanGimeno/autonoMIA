# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Sin publicar]

### Añadido
- Scaffold completo del MVP generado por GitHub Copilot (PR #1)
  - Autenticación email/password con Supabase
  - Dashboard con resumen de actividad
  - CRUD de proyectos (nombre, cliente, estado, tarifa/hora)
  - Registro de horas con vista de calendario mensual
  - CRUD de facturas con cálculo de IVA/IRPF
  - CRUD de tareas fiscales (IVA, IRPF, cuota autónomo)
  - Configuración de perfil (NIF, dirección, IVA/IRPF por defecto)
  - Signup desactivable con `NEXT_PUBLIC_SIGNUP_ENABLED`
  - Schema SQL con Row Level Security (RLS)
  - Middleware de autenticación para protección de rutas
- `CLAUDE.md` con directivas del proyecto y guía de accesibilidad WCAG 2.2 AA+
- Skills de Claude Code: `supabase-migration`, `new-feature`, `accessibility-audit`, `deploy-check`
- Página de documentación (`/docs`) con guidelines de desarrollo y accesibilidad
- `CHANGELOG.md`
- Migración UI completa a **shadcn/ui v4** + **Lucide React** (sustituye emojis y HTML crudo)
- **Modo oscuro** con `next-themes` (claro/oscuro/sistema) con toggle en sidebar
- **Paleta de colores** personalizada basada en Coolors: Dusk Blue, Cool Sky, Icy Blue, Blue Slate, Steel Blue
- **Sistema i18n** ligero con soporte para castellano (es) y catalán (ca)
- **Sistema de notificaciones** con campana en sidebar, dropdown de notificaciones, y polling
- **Panel de administración** (`/admin`) para tareas programadas
  - Campo `is_admin` en profiles para control de acceso
  - Tabla `scheduled_tasks` para tareas automáticas con expresiones cron
  - Tabla `task_executions` para historial de ejecuciones
  - Tabla `notifications` con RLS por usuario
- Loading skeletons (`loading.tsx`) en todas las rutas principales
- Error boundary (`error.tsx`) compartido para la app

- **Servidor MCP** (`src/mcp/`) con transporte stdio para conectar asistentes IA (Claude Desktop, etc.)
  - 8 tools read-only: get_profile, list_clients, list_projects, list_invoices, list_work_logs, list_expenses, get_tax_summary, list_tax_tasks
  - 2 resources: profile://current, projects://active
  - Autenticación por token personal con SHA-256
- **Sistema de tokens de API** en página de Configuración
  - Tabla `api_tokens` con RLS y hash SHA-256
  - Server actions para crear/revocar tokens
  - Componente `ApiTokensSection` con generación, copia y revocación
- Build independiente para MCP: `npm run build:mcp` (`tsconfig.mcp.json`)

### Corregido

- `DEFAULT auth.uid()` en todas las columnas `user_id` — los inserts del cliente ya no necesitan enviar `user_id`
- Null checks para `user` en todas las páginas server (redirect a `/login`)
- Re-renders infinitos: `createClient()` de Supabase movido fuera de los componentes
- Calendario empieza en **lunes** (estándar español)
- Constraint `UNIQUE(user_id, invoice_number)` en facturas
- Columna `updated_at` con trigger automático en todas las tablas

## [0.1.0] — 2026-03-21

### Añadido
- Commit inicial del repositorio
- Plan inicial del proyecto
