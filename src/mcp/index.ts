#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { authenticateToken } from './auth.js'
import { registerTools } from './tools/index.js'
import { registerResources } from './resources/index.js'

async function main() {
  const token = process.env.AUTONOMIA_API_TOKEN
  if (!token) {
    console.error('Error: AUTONOMIA_API_TOKEN no configurado')
    process.exit(1)
  }

  const auth = await authenticateToken(token)
  if (!auth) {
    console.error('Error: Token invalido o revocado')
    process.exit(1)
  }

  const server = new McpServer({
    name: 'autonomia',
    version: '0.1.0',
  })

  registerTools(server, auth.supabase, auth.userId)
  registerResources(server, auth.supabase, auth.userId)

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('Error fatal del servidor MCP:', err)
  process.exit(1)
})
