"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWorkLogsTool = registerWorkLogsTool;
const zod_1 = require("zod");
function registerWorkLogsTool(server, supabase, userId) {
    server.tool('list_work_logs', 'Lista los registros de horas del usuario con filtros por proyecto y rango de fechas', {
        project_id: zod_1.z.string().uuid().optional().describe('Filtrar por ID de proyecto'),
        date_from: zod_1.z.string().optional().describe('Fecha inicio (YYYY-MM-DD)'),
        date_to: zod_1.z.string().optional().describe('Fecha fin (YYYY-MM-DD)'),
        is_billable: zod_1.z.boolean().optional().describe('Filtrar por facturable/no facturable'),
        limit: zod_1.z.number().min(1).max(100).default(50).describe('Máximo de resultados'),
    }, async ({ project_id, date_from, date_to, is_billable, limit }) => {
        let query = supabase
            .from('work_logs')
            .select('*, projects(name)')
            .eq('user_id', userId)
            .order('work_date', { ascending: false })
            .limit(limit);
        if (project_id)
            query = query.eq('project_id', project_id);
        if (date_from)
            query = query.gte('work_date', date_from);
        if (date_to)
            query = query.lte('work_date', date_to);
        if (is_billable !== undefined)
            query = query.eq('is_billable', is_billable);
        const { data, error } = await query;
        if (error)
            return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        const totalHours = data?.reduce((sum, log) => sum + (log.hours ?? 0), 0) ?? 0;
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({ total_hours: totalHours, count: data?.length ?? 0, logs: data }, null, 2),
                }],
        };
    });
}
//# sourceMappingURL=work-logs.js.map