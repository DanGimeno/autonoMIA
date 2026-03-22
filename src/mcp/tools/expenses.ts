import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerExpensesTool(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.tool(
    'list_expenses',
    'Lista los gastos deducibles del usuario con filtros por categoría, proyecto y rango de fechas',
    {
      category: z.enum([
        'material', 'software', 'hardware', 'travel', 'meals', 'office',
        'telecom', 'professional_services', 'training', 'insurance',
        'vehicle', 'marketing', 'banking', 'taxes', 'other',
      ]).optional().describe('Filtrar por categoría'),
      project_id: z.string().uuid().optional().describe('Filtrar por ID de proyecto'),
      date_from: z.string().optional().describe('Fecha inicio (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('Fecha fin (YYYY-MM-DD)'),
      status: z.enum(['pending', 'paid', 'reimbursed']).optional().describe('Filtrar por estado de pago'),
      limit: z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    },
    async ({ category, project_id, date_from, date_to, status, limit }) => {
      let query = supabase
        .from('expenses')
        .select('*, projects(name), clients(name)')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false })
        .limit(limit)

      if (category) query = query.eq('category', category)
      if (project_id) query = query.eq('project_id', project_id)
      if (date_from) query = query.gte('expense_date', date_from)
      if (date_to) query = query.lte('expense_date', date_to)
      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }

      const totalAmount = data?.reduce((sum, exp) => sum + (exp.amount ?? 0), 0) ?? 0

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ total_amount: totalAmount, count: data?.length ?? 0, expenses: data }, null, 2),
        }],
      }
    }
  )
}
