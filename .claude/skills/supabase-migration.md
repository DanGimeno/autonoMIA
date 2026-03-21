---
name: supabase-migration
description: Create and run a Supabase SQL migration
user_invocable: true
---

# Supabase Migration

Create a new SQL migration file and execute it against the Supabase database.

## Steps

1. Create the migration file in `supabase/migrations/` with timestamp prefix: `YYYYMMDDHHMMSS_description.sql`
2. Write the SQL with:
   - `CREATE TABLE` with RLS enabled
   - `user_id uuid default auth.uid() not null` for user-scoped tables
   - `created_at timestamptz default now()`
   - `updated_at timestamptz default now()`
   - RLS policies for SELECT, INSERT, UPDATE, DELETE scoped to `auth.uid() = user_id`
3. Update `supabase/schema.sql` to keep it in sync as the canonical full schema
4. Execute the migration via Supabase CLI or the Management API:
   ```bash
   npx supabase db push
   ```
   Or if using remote directly, execute SQL via the Supabase dashboard SQL editor.
5. Verify the migration was applied successfully

## Important
- Always enable RLS on new tables
- Always add `user_id` default to `auth.uid()` so client inserts work without sending user_id
- Use `CREATE TABLE IF NOT EXISTS` and `CREATE POLICY IF NOT EXISTS` for idempotency
- Update the TypeScript types in `src/types/index.ts` to match schema changes
