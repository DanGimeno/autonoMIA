import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerProjectsTool(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.tool(
    'list_projects',
    'Lista los proyectos del usuario con filtros opcionales por estado',
    {
      status: z.enum(['active', 'paused', 'completed']).optional().describe('Filtrar por estado'),
      limit: z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    },
    async ({ status, limit }) => {
      let query = supabase
        .from('projects')
        .select('*, clients(name, nif_cif)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }

      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
    }
  )
}
