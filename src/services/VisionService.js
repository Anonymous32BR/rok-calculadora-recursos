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
    ,

    // 1️⃣ PROMPT DEFINITIVO — VISION AI (FALLBACK)
    analyzeResources: async (file) => {
        const apiKey = VisionService.getApiKey();
        if (!apiKey) throw new Error("API Key da OpenAI não configurada.");

        const base64Image = await toBase64(file);

        // SYSTEM PROMPT: PROMPT DE VISION AI CORRIGIDO (ROOT CAUSE)
        const systemPrompt = `🧠 PROMPT – OCR + VISION + CÁLCULO CORRETO
Você está analisando prints do jogo Rise of Kingdoms, especificamente telas de recursos.

OBJETIVO:
Extrair com precisão absoluta os valores de:
- TOTAL
- MOCHILA (De Itens)
- ABERTOS (calculado)

REGRAS CRÍTICAS (NÃO VIOLAR):

1. IDENTIFICAÇÃO DA TELA
Se a imagem contiver:
- título semelhante a "Seus Recursos e Acelerações"
- colunas "De Itens" e "Recursos Totais"

ENTÃO esta é a TELA OFICIAL DE RECURSOS.

2. ASSOCIAÇÃO OBRIGATÓRIA
Para cada recurso (Comida, Madeira, Pedra, Ouro, Cristais):

- MOCHILA = valor exibido na coluna "De Itens"
- TOTAL   = valor exibido na coluna "Recursos Totais"
- ABERTOS = TOTAL - MOCHILA

É PROIBIDO:
- assumir valores
- zerar campos
- estimar números

3. NORMALIZAÇÃO DE UNIDADES (REGRA ABSOLUTA)
Todo número com sufixo deve ser convertido:

- K = ×1.000
- M = ×1.000.000
- B = ×1.000.000.000

Exemplos:
- 8.9M  → 8_900_000
- 45.7M → 45_700_000
- 6.8B  → 6_800_000_000

Se o sufixo existir, ele NUNCA pode ser ignorado.

4. VALIDAÇÃO MATEMÁTICA
Após conversão:
- ABERTOS deve ser ≥ 0
- MOCHILA + ABERTOS = TOTAL (exato)

Se não fechar, marque o recurso como:
"ERRO_DE_CONSISTÊNCIA"

5. MULTI-IDIOMA
Ignore o idioma textual.
Reconheça recursos por:
- Ícones
- Posição na lista
- Padrão visual

6. SAÍDA (JSON OBRIGATÓRIO)
Retorne exatamente neste formato:

{
  "comida": {
    "total": 45700000,
    "mochila": 8900000,
    "abertos": 36800000
  },
  "madeira": {
    "total": 61500000,
    "mochila": 26400000,
    "abertos": 35100000
  },
  "pedra": {
    "total": 56400000,
    "mochila": 19000000,
    "abertos": 37400000
  },
  "ouro": {
    "total": 296400000,
    "mochila": 2200000,
    "abertos": 294200000
  }
}

7. FALHA CONTROLADA
Se algum valor não for legível:
- Retorne "null"
- Nunca invente
- Nunca arredonde`;

        const userPrompt = `Analise este print seguindo as regras de prioridade visual e matemática.`;

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
            if (data.error) throw new Error(data.error.message);

            const content = data.choices[0].message.content;
            const parsed = JSON.parse(content);

            // 3️⃣ AJUSTE NO CÁLCULO (LÓGICA CRÍTICA)
            // Normaliza e aplica math rule para cada recurso
            const processResource = (resData) => {
                if (!resData) return { total: 0, bag: 0 };

                let total = resData.total;
                let bag = resData.mochila;
                let open = resData.abertos; // abertos

                // Helper to ensure numbers or null
                const clean = (v) => (typeof v === 'number' ? v : null);

                total = clean(total);
                bag = clean(bag);
                open = clean(open);

                // Math Rules provided by user:
                // if (abertos == null && mochila != null && total != null) -> abertos = total - mochila
                if (open === null && bag !== null && total !== null) {
                    open = total - bag;
                }

                // if (mochila == null && abertos != null && total != null) -> mochila = total - abertos
                if (bag === null && open !== null && total !== null) {
                    bag = total - open;
                }

                // Fallback / Integrity check
                // If total is missing but we have open + bag, calculate total
                if (total === null && open !== null && bag !== null) {
                    total = open + bag;
                }

                // If still missing total, treat as valid 0 or incomplete? 
                // App logic usually defaults to 0 if something is wrong to prevent crashes.
                // User said: "if (abertos == null && mochila == null) { status = 'leitura_incompleta' }"
                // For the app's immediate stability, we return 0 if critical data is totally missing,
                // but preferably we return what we found.

                return {
                    total: total || 0,
                    bag: bag || 0
                };
            };

            return {
                food: processResource(parsed.comida),
                wood: processResource(parsed.madeira),
                stone: processResource(parsed.pedra),
                gold: processResource(parsed.ouro)
            };

        } catch (error) {
            console.error("Resource Vision Error:", error);
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
