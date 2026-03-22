import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerTaxTasksTool(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.tool(
    'list_tax_tasks',
    'Lista las tareas fiscales del usuario (modelos, cuotas, etc.) con filtros por estado y categoría',
    {
      status: z.enum(['pending', 'done']).optional().describe('Filtrar por estado'),
      category: z.enum(['IVA', 'IRPF', 'cuota autónomo', 'other']).optional().describe('Filtrar por categoría fiscal'),
      limit: z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    },
    async ({ status, category, limit }) => {
      let query = supabase
        .from('tax_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })
        .limit(limit)

      if (status) query = query.eq('status', status)
      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }

      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
    }
  )
}
