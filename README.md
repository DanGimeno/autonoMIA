# autonoMIA

A web app for Spanish freelancers (autónomos) to organize projects, daily work logs, invoices, and tax-related tasks.

## Features

- **Authentication** — Email/password login with Supabase. Configurable public signup
- **Dashboard** — Overview of active projects, pending invoices, and upcoming tax tasks
- **Projects** — Full CRUD for client projects with status and hourly rate tracking
- **Work Logs** — Monthly calendar view to log daily work hours per project
- **Invoices** — Full invoice management with IVA/IRPF calculations, status tracking, and overdue highlighting
- **Tax Tasks** — Track recurring fiscal obligations: IVA, IRPF, cuota autónomo
- **Settings** — Profile management with default VAT/IRPF percentages

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase for auth and database
- Deployable on Vercel

## Setup

1. Clone and install dependencies:

   npm install

2. Create a Supabase project and run the schema:

   Run the contents of supabase/schema.sql in your Supabase SQL editor.

3. Configure environment variables:

   cp .env.example .env.local

   Fill in your Supabase project URL and anon key.

4. Run the development server:

   npm run dev

5. Deploy to Vercel by connecting your repository and adding the environment variables.

## Disabling Public Signup

To prevent new users from registering, set the following environment variable:

   NEXT_PUBLIC_SIGNUP_ENABLED=false

When set to false, the signup page redirects to login and the signup link is hidden.

## Database Schema

The full database schema is in `supabase/schema.sql`. It includes:

- `profiles` — User profile data (name, NIF, address, default tax percentages)
- `projects` — Client projects with status and hourly rate
- `work_logs` — Daily work hour entries linked to projects
- `invoices` — Invoices with IVA/IRPF calculations and payment tracking
- `tax_tasks` — Fiscal obligation tasks with due dates and categories

All tables have Row Level Security (RLS) enabled so users can only access their own data.

## TODO

Future features planned:

- AI-powered quarterly tax summary and export
- Invoice PDF generation
- Recurring tax task reminders / notifications
- Work log export to CSV/Excel
- Invoice templates
- Multi-currency support
- Mobile app (React Native)
