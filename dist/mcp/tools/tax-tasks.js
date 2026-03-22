"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaxTasksTool = registerTaxTasksTool;
const zod_1 = require("zod");
function registerTaxTasksTool(server, supabase, userId) {
    server.tool('list_tax_tasks', 'Lista las tareas fiscales del usuario (modelos, cuotas, etc.) con filtros por estado y categoría', {
        status: zod_1.z.enum(['pending', 'done']).optional().describe('Filtrar por estado'),
        category: zod_1.z.enum(['IVA', 'IRPF', 'cuota autónomo', 'other']).optional().describe('Filtrar por categoría fiscal'),
        limit: zod_1.z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    }, async ({ status, category, limit }) => {
        let query = supabase
            .from('tax_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .limit(limit);
        if (status)
            query = query.eq('status', status);
        if (category)
            query = query.eq('category', category);
        const { data, error } = await query;
        if (error)
            return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });
}
//# sourceMappingURL=tax-tasks.js.map