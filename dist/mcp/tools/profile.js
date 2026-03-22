"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProfileTool = registerProfileTool;
function registerProfileTool(server, supabase, userId) {
    server.tool('get_profile', 'Obtiene el perfil fiscal del usuario: nombre, NIF, dirección, tipos de IVA/IRPF por defecto, cuota de autónomo', {}, async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error)
            return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });
}
//# sourceMappingURL=profile.js.map