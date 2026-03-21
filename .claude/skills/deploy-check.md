---
name: deploy-check
description: Pre-deployment verification checklist
user_invocable: true
---

# Deploy Check

Run pre-deployment verification before pushing to production.

## Steps

1. **Build check**: Run `npm run build` and verify no errors
2. **Lint check**: Run `npm run lint` and fix any issues
3. **Type check**: Verify no TypeScript errors in build output
4. **Environment vars**: Verify `.env.example` is up to date with all required vars
5. **Schema sync**: Verify `supabase/schema.sql` matches the actual database schema
6. **Security check**:
   - No secrets in code or committed files
   - All tables have RLS enabled
   - No `service_role` key exposed to client
   - `NEXT_PUBLIC_` vars don't contain secrets
7. **Accessibility spot check**:
   - Run through main flows with keyboard only
   - Verify focus indicators are visible
   - Check color contrast on key pages
8. **Responsive check**: Verify main pages work on mobile viewport (375px)

## Output
Report pass/fail for each step with details on any failures.
