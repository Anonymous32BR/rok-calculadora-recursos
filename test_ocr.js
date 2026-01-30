
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const OCR_ROK_PROMPT = `
Você é um sistema de OCR posicional relativo.

Objetivo:
Extrair 8 números grandes visíveis da imagem.

Método:
Considere a imagem dividida em 3 linhas e 3 colunas.

Leia APENAS os números maiores que aparecem:
- Linha superior: esquerda, centro, direita
- Linha do meio: esquerda, centro, direita
- Linha inferior: esquerda, centro

Ignore qualquer outro número pequeno ou irrelevante.

Ordem de leitura OBRIGATÓRIA:
1. topo-esquerda
2. topo-centro
3. topo-direita
4. meio-esquerda
5. meio-centro
6. meio-direita
7. base-esquerda
8. base-centro

Regras:
- Não identificar tipo de tropa
- Não identificar nível
- Não interpretar significado
- Não validar
- Não ordenar
- Apenas ler os números como TEXTO

Retorne EXCLUSIVAMENTE um JSON válido,
sem qualquer texto adicional.

Formato de saída obrigatório:

{
  "pos_1": "155.579.453",
  "pos_2": "197.920.574",
  "pos_3": "102.984.809",
  "pos_4": "1.637.918",
  "pos_5": "129.669.152",
  "pos_6": "119.389.243",
  "pos_7": "65.042.582",
  "pos_8": "22.422.020"
}
`;

const processImage = async (imagePath) => {
    console.log(`Processing: ${imagePath}`);
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    if (!fs.existsSync(imagePath)) {
        console.error(`File not found: ${imagePath}`);
        return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

    const payload = {
        model: "gpt-4o",
        messages: [
            { role: "system", content: OCR_ROK_PROMPT },
            {
                role: "user",
                content: [
                    { type: "text", text: "Extraia os dados desta imagem." },
                    { type: "image_url", image_url: { url: base64Image } }
                ]
            }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`API Error (${response.status}):`, errText);
            return;
        }

        const data = await response.json();

        if (data.error) {
            console.error("API Returned Error:", data.error);
            return;
        }

        console.log(`\n--- RESULTADO PARA ${path.basename(imagePath)} ---`);
        const resultJson = JSON.parse(data.choices[0].message.content);
        console.log(JSON.stringify(resultJson, null, 2));

        const outputFileName = `result_${path.basename(imagePath)}.json`;
        fs.writeFileSync(outputFileName, JSON.stringify(resultJson, null, 2));
        console.log(`Saved output to ${outputFileName}`);
        console.log("--------------------------------------------------\n");

    } catch (e) {
        console.error("Request Failed:", e);
    }
};

// Paths to images (Using the newly uploaded images)
const img1 = "C:/Users/almei/.gemini/antigravity/brain/331e5572-b5bb-4c92-9f0c-b336a8998b6f/uploaded_media_1_1769734117225.png";

(async () => {
    await processImage(img1);
})();
