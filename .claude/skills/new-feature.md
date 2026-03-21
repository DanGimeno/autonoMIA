---
name: new-feature
description: Scaffold a new CRUD feature following project conventions
user_invocable: true
---

# New Feature Scaffold

Create a new CRUD feature for autonomIA following all project conventions.

## Arguments
- Feature name (e.g., "expenses", "clients")

## Steps

1. **Schema**: Create SQL migration with table, RLS policies, and update `supabase/schema.sql`
2. **Types**: Add TypeScript interfaces to `src/types/index.ts`
3. **Pages**: Create in `src/app/(app)/{feature}/`:
   - `page.tsx` — List view (Server Component with shadcn Table/Card + Badge)
   - `new/page.tsx` — Create form wrapper (Server Component)
   - `[id]/edit/page.tsx` — Edit form wrapper (Server Component)
   - `loading.tsx` — Skeleton loader
   - `error.tsx` — Error boundary
4. **Form component**: Create `src/components/{Feature}Form.tsx` using shadcn components (Input, Label, Select, Button, Card)
5. **Navigation**: Add route to Sidebar with Lucide icon
6. **Dashboard**: Add summary card if relevant

## Conventions to follow
- All UI text in Spanish
- Use Server Components by default, `'use client'` only for interactive forms
- Server Actions for mutations (delete, toggle status)
- shadcn/ui components, Lucide icons (no emojis)
- Null check on `user` in all server pages
- WCAG AA+ accessibility: labels on all inputs, keyboard navigation, focus management, semantic HTML
- `aria-describedby` for form errors
- `aria-live="polite"` for dynamic status changes
