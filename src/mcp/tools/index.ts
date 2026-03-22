import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { registerProfileTool } from './profile.js'
import { registerClientsTool } from './clients.js'
import { registerProjectsTool } from './projects.js'
import { registerInvoicesTool } from './invoices.js'
import { registerWorkLogsTool } from './work-logs.js'
import { registerExpensesTool } from './expenses.js'
import { registerTaxSummaryTool } from './tax-summary.js'
import { registerTaxTasksTool } from './tax-tasks.js'

export function registerTools(server: McpServer, supabase: SupabaseClient, userId: string) {
  registerProfileTool(server, supabase, userId)
  registerClientsTool(server, supabase, userId)
  registerProjectsTool(server, supabase, userId)
  registerInvoicesTool(server, supabase, userId)
  registerWorkLogsTool(server, supabase, userId)
  registerExpensesTool(server, supabase, userId)
  registerTaxSummaryTool(server, supabase, userId)
  registerTaxTasksTool(server, supabase, userId)
}
