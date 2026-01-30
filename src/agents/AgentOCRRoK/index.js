
export const AgentOCRRoK = {
    name: 'AgentOCRRoK',
    description: 'Leitura Inteligente via IA (OpenAI Vision)',

    process: async (imageFile) => {
        console.log(`[AgentOCRRoK] Iniciando Leitura via IA (Vision V16 - Strict JSON): ${imageFile.name}`);

        try {
            // Call Vision Service
            const { VisionService } = await import('../../services/VisionService');
            // Returns JSON String: '{"Infantaria T5": 123, ...}'
            let visionText = await VisionService.analyzeImage(imageFile);
            console.log("[AgentOCRRoK] OpenAI Raw Response:", visionText);

            if (!visionText) {
                throw new Error("Resposta vazia da IA");
            }

            // Cleanup potential markdown wrappers
            let cleanedText = visionText.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '');
            }
            cleanedText = cleanedText.trim();

            let dataMap = {};
            try {
                dataMap = JSON.parse(cleanedText);
            } catch (e) {
                console.error("Failed to parse JSON:", cleanedText);
                throw new Error("Falha ao processar resposta da IA (JSON Inválido)");
            }

            // Map Keys to Standard Types
            // Prompt Keys: "Infantaria T5", "Cavalaria T5", "Arquearia T5", "Cerco T5", etc.

            const mapping = {
                "Infantaria T5": { type: 'infantry', tier: 't5' },
                "Cavalaria T5": { type: 'cavalry', tier: 't5' },
                "Arquearia T5": { type: 'archer', tier: 't5' },
                "Cerco T5": { type: 'siege', tier: 't5' },

                "Infantaria T4": { type: 'infantry', tier: 't4' },
                "Cavalaria T4": { type: 'cavalry', tier: 't4' },
                "Arquearia T4": { type: 'archer', tier: 't4' },
                "Cerco T4": { type: 'siege', tier: 't4' }
            };

            // Reconstruct Sorted Array (Fixed Order 8 Slots)
            const fixedOrder = [
                { type: 'infantry', tier: 't5', key: "Infantaria T5" },
                { type: 'cavalry', tier: 't5', key: "Cavalaria T5" },
                { type: 'archer', tier: 't5', key: "Arquearia T5" },
                { type: 'siege', tier: 't5', key: "Cerco T5" },
                { type: 'infantry', tier: 't4', key: "Infantaria T4" },
                { type: 'cavalry', tier: 't4', key: "Cavalaria T4" },
                { type: 'archer', tier: 't4', key: "Arquearia T4" },
                { type: 'siege', tier: 't4', key: "Cerco T4" }
            ];

            const enrichedBlocks = [];

            fixedOrder.forEach(slot => {
                // Check exact match first
                let val = dataMap[slot.key];

                // If undefined, try safe fallbacks (e.g. user prompt might typo "Arqueiria")
                if (val === undefined) {
                    // Try to find a key that loosely matches
                    const looseKey = Object.keys(dataMap).find(k =>
                        k.toLowerCase().includes(slot.key.split(' ')[0].toLowerCase().slice(0, 4)) && // "Infa", "Cava", "Arqu", "Cerc"
                        k.includes(slot.tier.toUpperCase().replace('T', '')) // "5", "4" or "V", "IV" -> User prompt uses T5/T4
                    );
                    if (looseKey) val = dataMap[looseKey];
                }

                val = val || 0; // Default to 0

                addBlock(enrichedBlocks, slot.type, slot.tier, val);
            });

            console.log("[AgentOCRRoK] JSON Mapping Complete:", enrichedBlocks.length);
            return enrichedBlocks;

        } catch (error) {
            console.error("[AgentOCRRoK] IA Failed:", error);
            throw error;
        }
    }
};

function addBlock(list, type, tier, val) {
    list.push({
        kingdom: null,
        troop_type: type,
        troop_tier: tier,
        specialization: "unknown",
        kills: val,
        confidence: 1.0,
        original_text: "AI_READ_V16_JSON"
    });
}
