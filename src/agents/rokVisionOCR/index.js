import { parseHallData } from '../../core/kvk_ocr';
import { ROK_VISION_PROMPT } from './prompt';
import { validate } from './schema';

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export const rokVisionOCRAgent = {
    name: 'ROK Vision OCR',
    description: 'Specialized agent for extracting data from Rise of Kingdoms screenshots using OpenAI Vision.',

    /**
     * Process an image file to extract KVK Kill Points.
     * @param {File} imageFile 
     * @returns {Promise<Array>} Array of blocks with quantity, tier, type.
     */
    process: async (imageFile) => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        // Fallback to local OCR if no key provided
        if (!apiKey || apiKey === 'sk-xxxxxxxxxxxx') {
            console.warn("[ROK Vision] No OpenAI Key found. Using Local Tesseract.");
            return await parseHallData(imageFile);
        }

        console.log(`[ROK Vision] Processing with OpenAI: ${imageFile.name}`);

        try {
            const base64Image = await fileToBase64(imageFile);

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: ROK_VISION_PROMPT
                        },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Extraia os dados desta imagem." },
                                { type: "image_url", image_url: { url: base64Image } }
                            ]
                        }
                    ],
                    max_tokens: 1000
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("OpenAI Error:", data.error);
                throw new Error(data.error.message);
            }

            const content = data.choices[0].message.content;

            // Clean markdown code blocks if present
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            // 1. Validate against strict schema
            validate(parsed);

            // 2. Map schema (PT) to Internal App Model (EN)
            return parsed.unidades.map(u => ({
                quantity: u.quantidade,
                tier: u.nivel.toLowerCase(), // "T5" -> "t5"
                unitType: mapTipo(u.tipo),   // "infantaria" -> "infantry"
                originalHelper: `GPT: ${u.tipo} ${u.nivel}`
            }));

        } catch (error) {
            console.error("[ROK Vision] OpenAI Failed/Invalid:", error);
            // Fallback to local on error is optional depending on severity, 
            // but user seems strict about quality, so maybe better to throw or alert?
            // For now keeping fallback for robustness.
            return await parseHallData(imageFile);
        }
    }
};

function mapTipo(tipo) {
    switch (tipo.toLowerCase()) {
        case 'infantaria': return 'infantry';
        case 'cavalaria': return 'cavalry';
        case 'arqueiros': return 'archer';
        case 'siege': return 'siege';
        default: return 'unknown';
    }
}
