import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function registerProfileTool(server: McpServer, supabase: SupabaseClient, userId: string) {
  server.tool(
    'get_profile',
    'Obtiene el perfil fiscal del usuario: nombre, NIF, dirección, tipos de IVA/IRPF por defecto, cuota de autónomo',
    {},
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }

      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
    }
  )
}
