"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInvoicesTool = registerInvoicesTool;
const zod_1 = require("zod");
function registerInvoicesTool(server, supabase, userId) {
    server.tool('list_invoices', 'Lista las facturas del usuario con filtros opcionales por estado, cliente y rango de fechas', {
        status: zod_1.z.enum(['draft', 'issued', 'collected', 'overdue']).optional().describe('Filtrar por estado'),
        client_id: zod_1.z.string().uuid().optional().describe('Filtrar por ID de cliente'),
        date_from: zod_1.z.string().optional().describe('Fecha inicio (YYYY-MM-DD)'),
        date_to: zod_1.z.string().optional().describe('Fecha fin (YYYY-MM-DD)'),
        limit: zod_1.z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    }, async ({ status, client_id, date_from, date_to, limit }) => {
        let query = supabase
            .from('invoices')
            .select('*, clients(name, nif_cif), projects(name)')
            .eq('user_id', userId)
            .order('issue_date', { ascending: false })
            .limit(limit);
        if (status)
            query = query.eq('status', status);
        if (client_id)
            query = query.eq('client_id', client_id);
        if (date_from)
            query = query.gte('issue_date', date_from);
        if (date_to)
            query = query.lte('issue_date', date_to);
        const { data, error } = await query;
        if (error)
            return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });
}
//# sourceMappingURL=invoices.js.map