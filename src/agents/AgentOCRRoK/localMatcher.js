
const TYPE_TEMPLATES = {
    infantry: '/assets/templates/infantry.png',
    cavalry: '/assets/templates/cavalry.png',
    archer: '/assets/templates/archer.png',
    siege: '/assets/templates/siege.png'
};

const TIER_TEMPLATES = {
    T1: '/assets/templates/t1.png',
    T2: '/assets/templates/t2.png',
    T3: '/assets/templates/t3.png',
    T4: '/assets/templates/t4.png',
    T5: '/assets/templates/t5.jpg'
};

const CACHED_TEMPLATES = {
    types: {},
    tiers: {}
};

let templatesLoaded = false;
let debugContainer = null;

export const loadTemplates = async () => {
    if (templatesLoaded) return;
    const typePromises = Object.entries(TYPE_TEMPLATES).map(([type, src]) => loadSingleTemplate(src).then(data => CACHED_TEMPLATES.types[type] = data));
    const tierPromises = Object.entries(TIER_TEMPLATES).map(([tier, src]) => loadSingleTemplate(src).then(data => CACHED_TEMPLATES.tiers[tier] = data));
    await Promise.all([...typePromises, ...tierPromises]);
    templatesLoaded = true;
};

const loadSingleTemplate = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 32, 32);
            resolve(ctx.getImageData(0, 0, 32, 32).data);
        };
        img.onerror = () => resolve(null);
    });
};

const compareImage = (candidateData, templateData) => {
    if (!templateData) return Infinity;
    let diff = 0;
    // Simple pixel difference (RGB)
    for (let i = 0; i < templateData.length; i += 4) {
        // Ignore alpha/transparent pixels in template
        if (templateData[i + 3] < 50) continue;
        diff += Math.abs(candidateData[i] - templateData[i]) +
            Math.abs(candidateData[i + 1] - templateData[i + 1]) +
            Math.abs(candidateData[i + 2] - templateData[i + 2]);
    }
    return diff;
};

// --- DOM DEBUG VISUALIZER ---
const ensureDebugContainer = (sourceImage) => {
    if (!document.getElementById('ocr-debug-container')) {
        debugContainer = document.createElement('div');
        debugContainer.id = 'ocr-debug-container';
        debugContainer.style.position = 'fixed';
        debugContainer.style.top = '10px';
        debugContainer.style.right = '10px';
        debugContainer.style.width = '600px';
        debugContainer.style.maxHeight = '90vh';
        debugContainer.style.border = '5px solid magenta';
        debugContainer.style.zIndex = '100000';
        debugContainer.style.background = 'rgba(0,0,0,0.8)';
        debugContainer.style.overflow = 'auto'; // scroll if needed

        // Add the image as background reference
        const img = document.createElement('img');
        img.src = sourceImage.src; // Assuming sourceImage is {img, src} or we use the src if available. Wait, sourceImage is an Image Object from fileToImage. It has .src
        img.style.width = '100%';
        img.style.display = 'block';
        img.id = 'ocr-debug-bg';
        debugContainer.appendChild(img);

        document.body.appendChild(debugContainer);
        console.log('[OCR-DEBUG] Debug Container Appended to Body');
    }
    return document.getElementById('ocr-debug-bg');
};

const drawDebugBox = (x, y, w, h, color, label) => {
    if (!debugContainer) return;

    const wrapper = document.getElementById('ocr-debug-bg');
    if (!wrapper) return;

    // The image displayed width vs natural width
    const displayedWidth = wrapper.clientWidth;
    const naturalWidth = wrapper.naturalWidth || 1920;
    const scale = displayedWidth / naturalWidth;

    const box = document.createElement('div');
    box.style.position = 'absolute';
    // Position relative to the container. But the container scrolls. 
    // Wait, the box should be INSIDE the container, overlaid on the image.
    // So the container needs position: relative? No, the container is fixed.
    // We should append box to the container, and use top/left relative to the image?
    // Actually simpler: Make a wrapper div inside debugContainer that holds the image and boxes, and set THAT to relative.

    // Let's adjust helper on the fly if needed, but for now assuming direct append to helper
    // If debugContainer has image as first child, appending div will stack below image unless position absolute.
    // But debugContainer is 'fixed'.
    // Let's just overlay using page coordinates relative to the debug container? No, that's hard.

    // FIX:
    // Create 'debug-wrapper' inside 'ocr-debug-container'.
    // 'debug-wrapper' is relative.
    // Image is inside 'debug-wrapper'.
    // Boxes are inside 'debug-wrapper' (absolute).
}

// SIMPLIFIED DEBUG: Just draw on a new canvas overlaid exactly on the image?
// No, the previous canvas approach failed. 
// Let's try: append the box to the container. 
// Container is fixed. 
// We need to match the image scale.
// If the image is 100% width of container (600px).
// Scale = 600 / naturalWidth.
// Left = x * scale. Top = y * scale.
// And position absolute. debugContainer must be relative or fixed? It is fixed. 
// So the children absolute are relative to debugContainer.
// Yes.

const drawDebugBoxSimple = (x, y, w, h, color, label) => {
    const container = document.getElementById('ocr-debug-container');
    if (!container) return;

    const img = document.getElementById('ocr-debug-bg');
    if (!img) return;

    const scale = img.clientWidth / (img.naturalWidth || 1);

    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.left = `${x * scale}px`;
    box.style.top = `${y * scale}px`;
    box.style.width = `${w * scale}px`;
    box.style.height = `${h * scale}px`;
    box.style.border = `2px solid ${color}`;
    box.style.color = color;
    box.style.fontSize = '12px';
    box.style.fontWeight = 'bold';
    box.innerText = label;
    box.style.zIndex = '100001';

    container.appendChild(box);
}

// ---------------------------------------------------------
// SPATIAL LOGIC
// ---------------------------------------------------------

// SPATIAL LOGIC ADJUSTMENTS FOR HALL OF HEROES
export const identifyTroopType = async (sourceImage, textBbox) => {
    if (!templatesLoaded) await loadTemplates();

    ensureDebugContainer(sourceImage);

    const H = textBbox.y1 - textBbox.y0;

    // Type Icon (Sword/Horse/Bow) is immediately LEFT of the Number Text.
    // Distance is small.
    const iconSize = H * 1.2; // slightly larger than text height
    const iconX = textBbox.x0 - (H * 1.6); // slight gap
    const iconY = textBbox.y0 - (H * 0.1);

    const ctx = getCropContext(sourceImage, iconX, iconY, iconSize, iconSize);
    const candidate = ctx.getImageData(0, 0, 32, 32).data;

    drawDebugBoxSimple(iconX, iconY, iconSize, iconSize, 'yellow', 'TYPE');
    drawDebugBoxSimple(textBbox.x0, textBbox.y0, textBbox.x1 - textBbox.x0, H, 'blue', 'TEXT');

    const match = findBestMatch(candidate, CACHED_TEMPLATES.types, 'unknown', `Type(${textBbox.y0})`);
    return match;
};

export const identifyTroopTier = async (sourceImage, textBbox) => {
    if (!templatesLoaded) await loadTemplates();

    const H = textBbox.y1 - textBbox.y0;

    // Tier is on the main Portrait, which is FAR LEFT of the Number Text.
    // Layout: [Portrait] [TypeIcon] [Number]
    // The Tier numeral (V, IV) is usually at the bottom of the Portrait.
    // Distance from Number Text to Portrait Center is roughly 3-4x Height?

    // Let's try to grab the Tier Medallion specifically.
    // It's usually gold/purple shield at bottom of portrait.
    const medalSize = H * 1.4;
    const medalX = textBbox.x0 - (H * 6.0); // Further left than Type Icon
    const medalY = textBbox.y0 + (H * 0.2); // Slightly lower?

    const ctx = getCropContext(sourceImage, medalX, medalY, medalSize, medalSize);
    const candidate = ctx.getImageData(0, 0, 32, 32).data;

    drawDebugBoxSimple(medalX, medalY, medalSize, medalSize, 'cyan', 'TIER');

    const match = findBestMatch(candidate, CACHED_TEMPLATES.tiers, 'T4', `Tier(${textBbox.y0})`);
    return match;
};

const getCropContext = (source, x, y, w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 32, 32);
    ctx.drawImage(source, x, y, w, h, 0, 0, 32, 32);
    return ctx;
};

const findBestMatch = (candidate, templates, fallback, label = '') => {
    let bestMatch = fallback;
    let minDiff = Infinity;

    const scores = [];

    Object.entries(templates).forEach(([key, tmpl]) => {
        const diff = compareImage(candidate, tmpl);
        scores.push({ key, diff });
        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = key;
        }
    });

    console.log(`[OCR-MATCH] ${label} Best: ${bestMatch} (${minDiff})`, scores.sort((a, b) => a.diff - b.diff).slice(0, 3));
    return bestMatch;
};
