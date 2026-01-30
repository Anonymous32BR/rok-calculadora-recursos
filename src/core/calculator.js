import { WAREHOUSE_LEVELS, TRADING_POST_TAX } from './constants';

export const calculateTransferable = (
    amount,
    resourceType,
    warehouseLevel,
    tradingPostLevel
) => {
    const protection = WAREHOUSE_LEVELS[warehouseLevel]?.[resourceType] || 0;
    const taxRate = TRADING_POST_TAX[tradingPostLevel] || 0;

    const afterprotection = Math.max(0, amount - protection);
    const taxAmount = Math.floor(afterprotection * taxRate);
    const netAmount = Math.max(0, afterprotection - taxAmount);

    return {
        gross: amount,
        protected: protection,
        taxable: afterprotection,
        tax: taxAmount,
        net: netAmount,
    };
};

export const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(Math.floor(num));
};

export const formatCompact = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
};

export const parseOCRNumber = (text) => {
    if (!text) return 0;

    // Normalize: Uppercase, remove spaces, usually ROK uses dots for thousands or decimals?
    // In Portuguese/Brazil: 1.000.000 (milhão) and 1,5 (decimal). 
    // ROK English: 1.5M. 
    // ROK PT-BR Print shows: "45.7M", "239.8M", "5.950" (for crystals, no suffix).
    // "317.5M". 
    // So dot is DECIMAL separator for M/B/K prefixes in the screenshots.

    let clean = text.toString().toUpperCase().trim().replace(/\s/g, '');

    // Identify suffix
    let multiplier = 1;
    if (clean.includes('B')) {
        multiplier = 1000000000;
        clean = clean.replace('B', '');
    } else if (clean.includes('M')) {
        multiplier = 1000000;
        clean = clean.replace('M', '');
    } else if (clean.includes('K')) {
        multiplier = 1000;
        clean = clean.replace('K', '');
    }

    // Determine decimal handling
    // If we have a multiplier, we usually have a decimal dot (e.g. 45.7)
    // But OCR might read comma "45,7". 
    // Or "1.200" without suffix might be 1200.

    if (multiplier > 1) {
        // Replace comma with dot to ensure float parsing works
        clean = clean.replace(',', '.');
        // Remove any other non-numeric/non-dot chars
        clean = clean.replace(/[^0-9.]/g, '');

        const numberPart = parseFloat(clean);
        if (isNaN(numberPart)) return 0;
        return Math.floor(numberPart * multiplier);
    } else {
        // No suffix. Usually raw number like "5.950". 
        // In PT-BR "5.950" is 5950. 
        // But Tesseract might read "5,950".
        // We should just remove ALL non-digits.
        clean = clean.replace(/[^0-9]/g, '');
        return parseInt(clean, 10) || 0;
    }
};
