"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = hashToken;
exports.authenticateToken = authenticateToken;
const supabase_js_1 = require("@supabase/supabase-js");
const node_crypto_1 = require("node:crypto");
function hashToken(token) {
    return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
}
async function authenticateToken(token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
        throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    }
    const supabase = (0, supabase_js_1.createClient)(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    const hash = hashToken(token);
    const { data, error } = await supabase
        .from('api_tokens')
        .select('id, user_id, expires_at')
        .eq('token_hash', hash)
        .is('revoked_at', null)
        .single();
    if (error || !data)
        return null;
    // Comprobar expiración
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
    }
    // Actualizar último uso
    await supabase
        .from('api_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);
    return { supabase, userId: data.user_id };
}
//# sourceMappingURL=auth.js.map