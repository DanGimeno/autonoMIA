"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTools = registerTools;
const profile_js_1 = require("./profile.js");
const clients_js_1 = require("./clients.js");
const projects_js_1 = require("./projects.js");
const invoices_js_1 = require("./invoices.js");
const work_logs_js_1 = require("./work-logs.js");
const expenses_js_1 = require("./expenses.js");
const tax_summary_js_1 = require("./tax-summary.js");
const tax_tasks_js_1 = require("./tax-tasks.js");
function registerTools(server, supabase, userId) {
    (0, profile_js_1.registerProfileTool)(server, supabase, userId);
    (0, clients_js_1.registerClientsTool)(server, supabase, userId);
    (0, projects_js_1.registerProjectsTool)(server, supabase, userId);
    (0, invoices_js_1.registerInvoicesTool)(server, supabase, userId);
    (0, work_logs_js_1.registerWorkLogsTool)(server, supabase, userId);
    (0, expenses_js_1.registerExpensesTool)(server, supabase, userId);
    (0, tax_summary_js_1.registerTaxSummaryTool)(server, supabase, userId);
    (0, tax_tasks_js_1.registerTaxTasksTool)(server, supabase, userId);
}
//# sourceMappingURL=index.js.map