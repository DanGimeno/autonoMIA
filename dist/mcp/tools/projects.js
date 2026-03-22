"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectsTool = registerProjectsTool;
const zod_1 = require("zod");
function registerProjectsTool(server, supabase, userId) {
    server.tool('list_projects', 'Lista los proyectos del usuario con filtros opcionales por estado', {
        status: zod_1.z.enum(['active', 'paused', 'completed']).optional().describe('Filtrar por estado'),
        limit: zod_1.z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    }, async ({ status, limit }) => {
        let query = supabase
            .from('projects')
            .select('*, clients(name, nif_cif)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (status)
            query = query.eq('status', status);
        const { data, error } = await query;
        if (error)
            return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });
}
//# sourceMappingURL=projects.js.map