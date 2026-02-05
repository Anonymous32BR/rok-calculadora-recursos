export const MULTILINGUAL_DICTIONARY = {
    food: ["food", "comida", "nourriture", "alimento", "alimentos", "еда", "食物", "milho", "corn"],
    wood: ["wood", "madeira", "bois", "madera", "holz", "木材", "lumber"],
    stone: ["stone", "pedra", "pierre", "piedra", "stein", "石"],
    gold: ["gold", "ouro", "or", "oro", "gold", "金"],

    open: ["open", "abertos", "ouvert", "abierto", "offen"],
    bag: ["bag", "mochila", "sac", "bolsa", "rucksack", "itens", "items"]
};

// Helper: Normalize text and find key
export const normalizeResourceKey = (text) => {
    if (!text) return null;
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    for (const [key, variants] of Object.entries(MULTILINGUAL_DICTIONARY)) {
        if (variants.some(v => normalized.includes(v))) {
            return key;
        }
    }
    return null;
};
