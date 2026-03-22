"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaxSummaryTool = registerTaxSummaryTool;
const zod_1 = require("zod");
function getCurrentQuarter() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        quarter: Math.ceil((now.getMonth() + 1) / 3),
    };
}
function registerTaxSummaryTool(server, supabase, userId) {
    server.tool('get_tax_summary', 'Obtiene el resumen fiscal trimestral: IVA (Modelo 303), IRPF (Modelo 130), cuota de autónomo. Por defecto el trimestre actual.', {
        year: zod_1.z.number().optional().describe('Año (por defecto el actual)'),
        quarter: zod_1.z.number().min(1).max(4).optional().describe('Trimestre 1-4 (por defecto el actual)'),
    }, async ({ year, quarter }) => {
        const current = getCurrentQuarter();
        const targetYear = year ?? current.year;
        const targetQuarter = quarter ?? current.quarter;
        const { data, error } = await supabase
            .from('tax_quarters')
            .select('*')
            .eq('user_id', userId)
            .eq('year', targetYear)
            .eq('quarter', targetQuarter)
            .single();
        if (error) {
            return {
                content: [{
                        type: 'text',
                        text: `No hay datos fiscales para Q${targetQuarter} ${targetYear}. ${error.message}`,
                    }],
            };
        }
        const summary = {
            periodo: `Q${data.quarter} ${data.year}`,
            modelo_303_iva: {
                iva_repercutido: data.vat_collected,
                iva_soportado_deducible: data.vat_deductible,
                resultado: data.vat_balance,
                estado: data.modelo_303_status,
                presentado: data.modelo_303_filed_at,
            },
            modelo_130_irpf: {
                ingresos: data.income,
                gastos_deducibles: data.deductible_expenses,
                rendimiento_neto: data.net_income,
                tipo_irpf: `${data.irpf_rate}%`,
                cuota: data.irpf_amount,
                retenciones_soportadas: data.irpf_withheld,
                estado: data.modelo_130_status,
                presentado: data.modelo_130_filed_at,
            },
            cuota_autonomo: data.autonomo_fee,
            notas: data.notes,
        };
        return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    });
}
//# sourceMappingURL=tax-summary.js.map