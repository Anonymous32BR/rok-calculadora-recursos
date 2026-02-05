import Tesseract from 'tesseract.js';
import { parseOCRNumber } from './calculator';
import { VisionService } from '../services/VisionService';
import { validateImageQuality, validateResourceLogic } from './validator';
import jsQR from 'jsqr';

// Portuguese keywords for ROK resources
// Although Vision AI handles languages, we keep this for the Tesseract fallback
const KEYWORDS = {
    food: ['Comida', 'Food', 'Milho'],
    wood: ['Madeira', 'Wood'],
    stone: ['Pedra', 'Stone'],
    gold: ['Ouro', 'Gold'],
};

// --------------------------------------------------------------------------
// HELPER FUNCTIONS (Defined before usage)
// --------------------------------------------------------------------------

const checkImageSize = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

const parseROKText = (text) => {
    const lines = text.split('\n');
    const values = {
        food: { total: 0, bag: 0 },
        wood: { total: 0, bag: 0 },
        stone: { total: 0, bag: 0 },
        gold: { total: 0, bag: 0 }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        for (const [resKey, keyWords] of Object.entries(KEYWORDS)) {
            const hasKeyword = keyWords.some(k => line.toLowerCase().includes(k.toLowerCase()));
            if (hasKeyword) {
                const numberPattern = /[0-9]+[.,]?[0-9]*\s*[KMB]?/gi;
                const extractNumbers = (str) => {
                    const matches = str.match(numberPattern) || [];
                    return matches.map(m => parseOCRNumber(m)).filter(n => n > 0);
                };

                let numbersFound = extractNumbers(line);

                if (numbersFound.length === 0 && i + 1 < lines.length) {
                    numbersFound = extractNumbers(lines[i + 1]);
                }

                let currentTotal = 0;
                let currentBag = 0;

                if (numbersFound.length >= 2) {
                    currentTotal = numbersFound[numbersFound.length - 1];
                    currentBag = numbersFound[numbersFound.length - 2];
                } else if (numbersFound.length === 1) {
                    currentTotal = numbersFound[0];
                    currentBag = 0;
                }

                if (currentTotal > 0 || currentBag > 0) {
                    values[resKey].total += currentTotal;
                    values[resKey].bag += currentBag;
                    break;
                }
            }
        }
    }

    return values;
};

// --------------------------------------------------------------------------
// EXPORTED FUNCTIONS
// --------------------------------------------------------------------------

export const readQRCodeFromImage = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    try {
                        resolve(JSON.parse(code.data));
                    } catch (e) {
                        reject('QR Code inválido ou corrompido.');
                    }
                } else {
                    reject('Nenhum QR Code encontrado na imagem.');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const processImages = async (files, onProgress) => {
    let totals = {
        food: { total: 0, bag: 0 },
        wood: { total: 0, bag: 0 },
        stone: { total: 0, bag: 0 },
        gold: { total: 0, bag: 0 }
    };
    let totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        onProgress && onProgress((i / totalFiles) * 100, `Analisando imagem ${i + 1}/${totalFiles} com Vision AI...`);

        let fileResult = null;
        let visionSuccess = false;

        // 1. VISION AI (PRIMARY STRATEGY)
        try {
            console.log(`[VISION START] ${file.name} - Tentando análise visual...`);
            const visionData = await VisionService.analyzeResources(file);

            // Validate Vision Data
            const logicCheck = validateResourceLogic(visionData);
            if (logicCheck.valid) {
                fileResult = visionData;
                visionSuccess = true;
                console.log(`[VISION SUCCESS] ${file.name} processado com sucesso.`);
            } else {
                console.warn(`[VISION REJECTED] ${file.name} - ${logicCheck.reason}`);
                throw new Error("Vision Validation Failed: " + logicCheck.reason);
            }

        } catch (visionErr) {
            console.warn(`[VISION FAIL] ${file.name} - ${visionErr.message}. Tentando Fallback OCR...`);
            visionSuccess = false;
        }

        // 2. OCR FALLBACK (SECONDARY STRATEGY)
        if (!visionSuccess) {
            onProgress && onProgress((i / totalFiles) * 100, `Vision falhou. Tentando OCR Tesseract em ${i + 1}...`);
            try {
                const { data: { text } } = await Tesseract.recognize(file, 'por', {
                    logger: m => { } // Silent
                });

                const extract = parseROKText(text);
                const logicCheck = validateResourceLogic(extract);

                if (logicCheck.valid) {
                    fileResult = extract;
                    console.log(`[OCR SUB-SUCCESS] ${file.name} salvo pelo OCR (Fallback).`);
                } else {
                    console.warn(`[OCR FAIL] ${file.name} - ${logicCheck.reason}. Imagem descartada.`);
                }
            } catch (ocrErr) {
                console.error(`[OCR CRISIS] ${file.name} - OCR também falhou.`, ocrErr);
            }
        }

        // 3. ACUMULAÇÃO
        if (fileResult) {
            ['food', 'wood', 'stone', 'gold'].forEach(k => {
                if (fileResult[k]) {
                    totals[k].total += (fileResult[k].total || 0);
                    totals[k].bag += (fileResult[k].bag || 0);
                }
            });
        }
    }

    onProgress && onProgress(100, 'Concluído!');
    return totals;
};
