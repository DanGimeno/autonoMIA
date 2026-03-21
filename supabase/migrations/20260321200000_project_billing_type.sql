-- Add billing type to projects: hourly or flat_rate (monthly)
alter table projects add column if not exists billing_type text default 'hourly' check (billing_type in ('hourly', 'flat_rate'));
alter table projects add column if not exists monthly_rate numeric(10,2);
