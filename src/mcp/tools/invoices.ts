import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerInvoicesTool(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.tool(
    'list_invoices',
    'Lista las facturas del usuario con filtros opcionales por estado, cliente y rango de fechas',
    {
      status: z.enum(['draft', 'issued', 'collected', 'overdue']).optional().describe('Filtrar por estado'),
      client_id: z.string().uuid().optional().describe('Filtrar por ID de cliente'),
      date_from: z.string().optional().describe('Fecha inicio (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('Fecha fin (YYYY-MM-DD)'),
      limit: z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    },
    async ({ status, client_id, date_from, date_to, limit }) => {
      let query = supabase
        .from('invoices')
        .select('*, clients(name, nif_cif), projects(name)')
        .eq('user_id', userId)
        .order('issue_date', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)
      if (client_id) query = query.eq('client_id', client_id)
      if (date_from) query = query.gte('issue_date', date_from)
      if (date_to) query = query.lte('issue_date', date_to)

      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }

      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
    }
  )
}
