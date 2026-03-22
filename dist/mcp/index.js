#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const auth_js_1 = require("./auth.js");
const index_js_1 = require("./tools/index.js");
const index_js_2 = require("./resources/index.js");
async function main() {
    const token = process.env.AUTONOMIA_API_TOKEN;
    if (!token) {
        console.error('Error: AUTONOMIA_API_TOKEN no configurado');
        process.exit(1);
    }
    const auth = await (0, auth_js_1.authenticateToken)(token);
    if (!auth) {
        console.error('Error: Token invalido o revocado');
        process.exit(1);
    }
    const server = new mcp_js_1.McpServer({
        name: 'autonomia',
        version: '0.1.0',
    });
    (0, index_js_1.registerTools)(server, auth.supabase, auth.userId);
    (0, index_js_2.registerResources)(server, auth.supabase, auth.userId);
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    console.error('Error fatal del servidor MCP:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map