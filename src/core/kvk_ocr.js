import Tesseract from 'tesseract.js';

// Pre-process image to highlight text
// STRATEGY: Enforce Black Text on White Background
export const preprocessHallImage = async (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // STRATEGY: CENTER CROP (Focus on Hall of Heroes Modal)
                // Removes game background noise (power, resources, etc)
                // Keep center 70% width, 60% height
                const cropX = img.width * 0.15;
                const cropY = img.height * 0.20;
                const cropW = img.width * 0.70;
                const cropH = img.height * 0.60;

                canvas.width = cropW;
                canvas.height = cropH;

                // Draw only the cropped area
                ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

                // AGGRESSIVE BINARIZATION
                // Goal: Convert beige background to Pure White, Dark text to Pure Black
                // Threshold: 180 (0-255)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Standard luminance formula
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

                    // If it's somewhat dark (Text), force BLACK
                    // If it's light (Background), force WHITE
                    if (gray < 180) {
                        data[i] = 0;
                        data[i + 1] = 0;
                        data[i + 2] = 0;
                    } else {
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 1.0)); // High quality
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const parseHallData = async (imageFile) => {
    try {
        console.log("[OCR] Pre-processing image (Permissive Mode)...");
        const imageData = await preprocessHallImage(imageFile);

        console.log("[OCR] Sending to Tesseract...");
        const result = await Tesseract.recognize(
            imageData,
            'eng', // English has better digit support usually
            {
                // logger: m => console.log(m) 
            }
        );

        console.log("[OCR] Raw Result:", result);

        if (!result || !result.data) {
            throw new Error("Tesseract não retornou dados.");
        }

        const { data } = result;
        const blocks = [];

        // STRATEGY: PERMISSIVE NUMBER SCANNING
        // We look for any "cluster" of characters that looks like a large number.
        // This handles: "155.579.453", "155 579 453", "155.579.453", etc.

        // 1. Clean common typos
        const cleanFullText = data.text
            .replace(/[oO]/g, '0')
            .replace(/[lI]/g, '1');

        // 2. Find "Number Phrases": sequences of digits/dots/commas/spaces at least 6 chars long
        // This avoids picking up small noise like "Level 5" or "10%" unless it's attached to more digits.
        const potentialNumbers = cleanFullText.match(/[\d\.,\s']{6,}/g) || [];

        potentialNumbers.forEach(phrase => {
            // 3. Destructive Cleanup: Remove anything that isn't a digit
            const cleanDigits = phrase.replace(/[^\d]/g, '');

            if (cleanDigits.length > 0) {
                const quantity = parseInt(cleanDigits);

                // 4. Sanity Check: Kill counts are usually high.
                // Let's accept anything > 1000 to be safe (Siege T4 might be low?)
                // Also ignore super long numbers (phone numbers? timestamps? > 15 digits)
                if (!isNaN(quantity) && quantity > 1000 && cleanDigits.length < 15) {
                    blocks.push({
                        quantity,
                        bbox: { x0: 0, y0: blocks.length, x1: 0, y1: 0 }, // Dummy bbox for sorting logic in Agent
                        troop_type: 'unknown',
                        troop_tier: 'unknown',
                        original: phrase // Debug info
                    });
                }
            }
        });

        console.log("[OCR] Permissive Scan found:", blocks.length, "numbers.");
        return blocks;

    } catch (err) {
        console.error("OCR Logic Error:", err);
        alert("Erro Crítico OCR: " + err.message);
        throw err;
    }
};
