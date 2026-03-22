import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerWorkLogsTool(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.tool(
    'list_work_logs',
    'Lista los registros de horas del usuario con filtros por proyecto y rango de fechas',
    {
      project_id: z.string().uuid().optional().describe('Filtrar por ID de proyecto'),
      date_from: z.string().optional().describe('Fecha inicio (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('Fecha fin (YYYY-MM-DD)'),
      is_billable: z.boolean().optional().describe('Filtrar por facturable/no facturable'),
      limit: z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    },
    async ({ project_id, date_from, date_to, is_billable, limit }) => {
      let query = supabase
        .from('work_logs')
        .select('*, projects(name)')
        .eq('user_id', userId)
        .order('work_date', { ascending: false })
        .limit(limit)

      if (project_id) query = query.eq('project_id', project_id)
      if (date_from) query = query.gte('work_date', date_from)
      if (date_to) query = query.lte('work_date', date_to)
      if (is_billable !== undefined) query = query.eq('is_billable', is_billable)

      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }

      const totalHours = data?.reduce((sum, log) => sum + (log.hours ?? 0), 0) ?? 0

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ total_hours: totalHours, count: data?.length ?? 0, logs: data }, null, 2),
        }],
      }
    }
  )
}
