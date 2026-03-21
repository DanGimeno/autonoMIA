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
- Página de documentación con guidelines de desarrollo y accesibilidad
- `CHANGELOG.md`

### Por corregir (identificado en revisión)
- Formularios no incluyen `user_id` en inserts (falta `DEFAULT auth.uid()` en schema)
- `user!.id` sin null check en páginas server
- Re-renders infinitos potenciales en componentes client (Supabase client como dependencia de hooks)
- Calendario empieza en domingo (debería ser lunes para España)
- Fechas sin formatear en español
- Sin `loading.tsx` ni `error.tsx`
- Emojis como iconos (pendiente migración a shadcn + Lucide)

## [0.1.0] — 2026-03-21

### Añadido
- Commit inicial del repositorio
- Plan inicial del proyecto
