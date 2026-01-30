/**
 * Calculates KVK Statistics based on OCR input and Configuration
 * @param {Object} input - Input object containing ocr.unidades
 * @param {Object} config - Point configuration (usually from localStorage)
 * @returns {Object} - Calculated stats (totalPoints, details)
 */
export function calculateStats(input, config) {
    // Safety check
    if (!input || !input.ocr || !input.ocr.unidades) {
        throw new Error("Input inválido para cálculo: 'unidades' não encontrado.");
    }

    const unidades = input.ocr.unidades;
    let totalPoints = 0;
    const details = [];

    // User's snippet logic implementation
    unidades.forEach(u => {
        // u structure: { quantity, tier, unitType, ... }

        // Skip unknown/invalid
        if (u.unitType === 'unknown' || u.tier === 'unknown') {
            return;
        }

        const pointsPerUnit = config[u.unitType][u.tier] || 0;
        const kp = u.quantity * pointsPerUnit;

        totalPoints += kp;

        // Add to details
        details.push({
            ...u,
            points: kp
        });

        // Future: Add deaths/healing logic here if available in OCR data
    });

    return {
        totalPoints,
        details,
        unitCount: unidades.length
    };
}
