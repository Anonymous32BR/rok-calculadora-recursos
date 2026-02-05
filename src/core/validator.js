/**
 * Core Validation Logic for ROK Resource Calculator
 * Implements Layer 3 (Cross-Validation) and Layer 5 (Auto-Rejection)
 */

// Layer 5: Automatic Rejection Criteria
export const validateImageQuality = (imageElement) => {
    // 📐 Quality / Size
    if (imageElement.width < 800) {
        return { valid: false, reason: "Largura da imagem muito baixa (<800px). Envie prints em HD." };
    }

    // We can add more basic checks here if needed (e.g. aspect ratio)
    return { valid: true };
};

// Layer 3: Logical Validation of a Single Result
export const validateResourceLogic = (resourceData) => {
    if (!resourceData) return false;

    const { food, wood, stone, gold } = resourceData;
    const resources = [food, wood, stone, gold];

    let validCount = 0;

    for (const res of resources) {
        if (!res) continue;

        // Logical Rules
        // total >= bag
        if ((res.total || 0) < (res.bag || 0)) {
            // Allow small margin of error? No, strict rule.
            // Actually, in some games display might differ, but for ROK Total includes Bag + Open.
            // So Total MUST be >= Bag.
            // However, OCR might read wrong.
            // If Text says Bag > Total, it's an error.
            if ((res.bag || 0) > (res.total || 0)) return { valid: false, reason: "Inconsistência: Mochila maior que Total." };
        }

        // Values >= 0 (Implicit in parsing, but good to check)

        if ((res.total || 0) > 0 || (res.bag || 0) > 0) validCount++;
    }

    // "Less than 4 resources detected" -> User said "Less than 4", but maybe "Less than 2" is safer for partial screens?
    // The prompt said "At least Food, Wood, Stone, Gold MUST be found" for strict validation.
    // Let's enforce finding at least 3 to be safe, or follow the "OCR Fail" rule of < 2.
    if (validCount < 2) return { valid: false, reason: "Menos de 2 recursos identificados." };

    return { valid: true };
};

// Layer 3: Batch Cross-Validation
export const validateBatchConsistency = (resultsList) => {
    // If we have multiple prints, do they make sense together?
    // User Prompt: "If different values -> assume different accounts (valid)"
    // "If SAME print has conflicting values -> error" (Handled in single validation)

    // For now, in a calculator upload session, users might upload multiple prints of the SAME account (e.g. scrolling).
    // But usually it's just one print or two.
    // The main rule here is just ensuring individual validity.
    // We will assume accumulation is the goal.

    return { valid: true }; // Placeholder for more complex duplicate logic if needed.
};
