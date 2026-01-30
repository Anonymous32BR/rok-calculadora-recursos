export const VisionService = {
    // Determine which API Key to use (User provided or Env)
    getApiKey: () => {
        // Priority: LocalStorage > Env
        return localStorage.getItem('rok_openai_key') || import.meta.env.VITE_OPENAI_API_KEY;
    },

    setApiKey: (key) => {
        localStorage.setItem('rok_openai_key', key);
    },

    // Main Process Function
    analyzeImage: async (file) => {
        const apiKey = VisionService.getApiKey();
        if (!apiKey) throw new Error("API Key da OpenAI não configurada.");

        const base64Image = await toBase64(file);

        const systemPrompt = `Você é um agente especialista em análise visual do jogo Rise of Kingdoms.
Sua função é interpretar prints do Hall dos Heróis.
Você DEVE retornar APENAS TEXTO PURO (text/plain).
NÃO use Markdown, blocos de código ou JSON.`;

        const userPrompt = `Você é um sistema de OCR posicional relativo.

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
}`;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey} `
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: userPrompt },
                                { type: "image_url", image_url: { url: base64Image } }
                            ]
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            // Parse the Simple Response
            const content = data.choices[0].message.content;
            const parsed = JSON.parse(content);

            // MAP RAW VALUES TO APP SCHEMA (Deterministic Mapping)
            // Assumes standard grid: Inf T5, Cav T5, Arch T5, Siege T5, Inf T4, ...
            const values = [
                parsed.pos_1, parsed.pos_2, parsed.pos_3, parsed.pos_4,
                parsed.pos_5, parsed.pos_6, parsed.pos_7, parsed.pos_8
            ];

            // Helper to clean number string "1.234.567" -> 1234567
            const cleanNum = (str) => {
                if (!str) return 0;
                return parseInt(str.toString().replace(/\D/g, ''), 10) || 0;
            };

            // Structure expected by the App
            const mappedResult = {
                "_debug_layout": values.map((v, i) => `Slot ${i + 1}: ${v}`),
                "unidades": {
                    "Infantaria T5": cleanNum(values[0]),
                    "Cavalaria T5": cleanNum(values[1]),
                    "Arquearia T5": cleanNum(values[2]),
                    "Cerco T5": cleanNum(values[3]),
                    "Infantaria T4": cleanNum(values[4]),
                    "Cavalaria T4": cleanNum(values[5]),
                    "Arquearia T4": cleanNum(values[6]),
                    "Cerco T4": cleanNum(values[7])
                }
            };

            return JSON.stringify(mappedResult);

        } catch (error) {
            console.error("Vision API Error:", error);
            throw error;
        }
    }
};

const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
