/**
 * Valida a resposta do Agente de OCR.
 * Garante que a estrutura do JSON esteja correta antes de passar para a aplicação.
 */
export const validateSchema = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error("Formato de resposta inválido: JSON esperado.");
    }

    if (!Array.isArray(data.unidades)) {
        throw new Error("Formato inválido: array 'unidades' não encontrado.");
    }

    data.unidades.forEach((item, index) => {
        // Validar troop_type
        const validTypes = ['infantry', 'cavalry', 'archer', 'siege', 'unknown'];
        if (!item.troop_type || !validTypes.includes(item.troop_type)) {
            console.warn(`Item ${index}: troop_type inválido '${item.troop_type}'. Fallback para unknown.`);
            item.troop_type = 'unknown';
        }

        // Validar troop_tier
        const validTiers = ['T1', 'T2', 'T3', 'T4', 'T5', 'unknown'];
        // Normaliza input caso venha 't5' em vez de 'T5'
        if (item.troop_tier && typeof item.troop_tier === 'string') {
            item.troop_tier = item.troop_tier.toUpperCase();
        }
        if (!item.troop_tier || !validTiers.includes(item.troop_tier)) {
            console.warn(`Item ${index}: troop_tier inválido '${item.troop_tier}'. Fallback para T4.`);
            item.troop_tier = 'T4';
        }

        // Validar kills (antigo quantidade)
        if (typeof item.kills !== 'number') {
            console.warn(`Item ${index}: kills inválido '${item.kills}'. Fallback para 0.`);
            item.kills = 0;
        }

        // Opcionais com default
        if (item.confidence === undefined) item.confidence = 1.0;
        if (item.kingdom === undefined) item.kingdom = null;
    });

    return true;
};
