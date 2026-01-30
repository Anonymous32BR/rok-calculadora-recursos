import Tesseract from 'tesseract.js';
import { parseOCRNumber } from './calculator';
import jsQR from 'jsqr';

// Portuguese keywords for ROK resources
const KEYWORDS = {
    food: ['Comida', 'Food', 'Milho'],
    wood: ['Madeira', 'Wood'],
    stone: ['Pedra', 'Stone'],
    gold: ['Ouro', 'Gold'],
};

export const processImages = async (files, onProgress) => {
    let totals = { food: 0, wood: 0, stone: 0, gold: 0 };
    let totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        onProgress && onProgress((i / totalFiles) * 100, `Lendo imagem ${i + 1}/${totalFiles}...`);

        try {
            const { data: { text } } = await Tesseract.recognize(file, 'por', {
                logger: m => {
                    // Detailed progress if needed
                    if (m.status === 'recognizing text') {
                        // scale progress within the file's share
                        // onProgress((i / totalFiles) * 100 + (m.progress * (100/totalFiles)), ...);
                    }
                }
            });

            console.log('OCR Result:', text);
            const extracted = parseROKText(text);

            totals.food += extracted.food;
            totals.wood += extracted.wood;
            totals.stone += extracted.stone;
            totals.gold += extracted.gold;

        } catch (err) {
            console.error('OCR Error on file', file.name, err);
            // Continue to next file even if one fails
        }
    }

    onProgress && onProgress(100, 'Concluído!');
    return totals;
};

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

const parseROKText = (text) => {
    const lines = text.split('\n');
    const values = { food: 0, wood: 0, stone: 0, gold: 0 };

    // Iterate lines to find keywords
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        for (const [resKey, keyWords] of Object.entries(KEYWORDS)) {
            // Check if line contains resource name
            const hasKeyword = keyWords.some(k => line.toLowerCase().includes(k.toLowerCase()));
            if (hasKeyword) {
                // This line SHOULD contain the values.
                // Format is usually: "Comida 8.9M 45.7M"
                // Or sometimes extracting might put them on next line?
                // Let's look for ALL patterns that look like numbers in this line and the next line.

                // Regex to capture numbers with optional K/M/B suffixes
                // Matches: "45.7M", "100K", "5.950", "200"
                const numberPattern = /[0-9]+[.,]?[0-9]*\s*[KMB]?/gi;

                // Helper to find matches in a string
                const extractNumbers = (str) => {
                    const matches = str.match(numberPattern) || [];
                    // Filter out isolated small numbers that might be noise/level indicators?
                    // Actually, keep everything that parseOCRNumber can handle.
                    return matches.map(m => parseOCRNumber(m)).filter(n => n > 0);
                };

                let numbersFound = extractNumbers(line);

                // If no numbers in the same line, try the next line (often OCR splits "Title" \n "Values")
                if (numbersFound.length === 0 && i + 1 < lines.length) {
                    numbersFound = extractNumbers(lines[i + 1]);
                }

                // DECISION LOGIC:
                // We have "De Itens" (Left) and "Recursos Totais" (Right).
                // We WANT "Recursos Totais" (Right).
                // So if we found 2 numbers (e.g. 8900000 and 45700000), pick the LAST one.
                // If we found 1 number... it's risky, but assume it's the Total if it's the only one found? 
                // Or if it's significantly larger?
                // User said "Priorizar o valor MAIS À DIREITA".

                if (numbersFound.length > 0) {
                    // Take the last one found, which corresponds to the right-most column.
                    const correctValue = numbersFound[numbersFound.length - 1];

                    // Add to total (supporting multiple prints means we default +=)
                    values[resKey] += correctValue;

                    // Break inner keyword loop to avoid double matching same line
                    break;
                }
            }
        }
    }

    return values;
};
