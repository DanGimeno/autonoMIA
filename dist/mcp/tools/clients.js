"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClientsTool = registerClientsTool;
const zod_1 = require("zod");
function registerClientsTool(server, supabase, userId) {
    server.tool('list_clients', 'Lista los clientes del usuario con filtros opcionales por estado activo y búsqueda por nombre', {
        is_active: zod_1.z.boolean().optional().describe('Filtrar por clientes activos/inactivos'),
        search: zod_1.z.string().optional().describe('Buscar por nombre o nombre comercial'),
        limit: zod_1.z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    }, async ({ is_active, search, limit }) => {
        let query = supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId)
            .order('name')
            .limit(limit);
        if (is_active !== undefined)
            query = query.eq('is_active', is_active);
        if (search)
            query = query.or(`name.ilike.%${search}%,trade_name.ilike.%${search}%`);
        const { data, error } = await query;
        if (error)
            return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });
}
//# sourceMappingURL=clients.js.map