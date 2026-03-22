-- Seed default scheduled tasks (idempotent: only inserts if not exists)

INSERT INTO scheduled_tasks (name, description, cron_expression, task_type, enabled, next_run_at)
SELECT 'Revisar facturas vencidas',
       'Detecta facturas emitidas con fecha de vencimiento pasada, las marca como vencidas y notifica al usuario',
       '0 8 * * *',
       'check_overdue_invoices',
       true,
       NOW() + INTERVAL '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM scheduled_tasks WHERE task_type = 'check_overdue_invoices'
);

INSERT INTO scheduled_tasks (name, description, cron_expression, task_type, enabled, next_run_at)
SELECT 'Alertar tareas fiscales próximas',
       'Busca tareas fiscales pendientes que venzan en los próximos 7 días y envía recordatorios',
       '0 9 * * 1',
       'check_upcoming_tax_tasks',
       true,
       NOW() + INTERVAL '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM scheduled_tasks WHERE task_type = 'check_upcoming_tax_tasks'
);

INSERT INTO scheduled_tasks (name, description, cron_expression, task_type, enabled, next_run_at)
SELECT 'Actualizar resumen trimestral',
       'Calcula IVA, IRPF, ingresos y gastos del trimestre actual y actualiza el resumen',
       '0 6 1 1,4,7,10 *',
       'generate_quarterly_summary',
       true,
       NOW() + INTERVAL '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM scheduled_tasks WHERE task_type = 'generate_quarterly_summary'
);
