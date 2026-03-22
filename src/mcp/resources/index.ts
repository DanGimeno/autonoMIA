import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerResources(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.resource(
    'Perfil actual',
    'profile://current',
    async (uri) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        }],
      }
    }
  )

  server.resource(
    'Proyectos activos',
    'projects://active',
    async (uri) => {
      const { data } = await supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        }],
      }
    }
  )
}
