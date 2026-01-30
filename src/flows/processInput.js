import { agents } from "../agents/index.js";

export async function processInput(input) {

    // 1️⃣ Se NÃO for imagem → ignora
    // Assumes input structure has 'type'
    if (input.type !== "image") {
        return input;
    }

    // 2️⃣ Se for imagem → chama OCR
    // Using .process() to match the Agent interface
    const ocrResult = await agents.AgentOCRRoK.process(input.file);

    // 3️⃣ Injeta resultado no fluxo
    return {
        ...input,
        ocr: ocrResult
    };
}
