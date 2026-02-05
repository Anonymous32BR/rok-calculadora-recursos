import ptBR from "./pt-BR.json";
import enUS from "./en-US.json";

// Language type definition (JSDoc)
/**
 * @typedef {'pt-BR' | 'en-US'} Language
 */

const dictionaries = {
    "pt-BR": ptBR,
    "en-US": enUS,
    // Add legacy mappings if needed for backward compatibility during migration
    "pt": ptBR,
    "en": enUS
};

/**
 * Translate a key path for a given language.
 * @param {Language} lang 
 * @param {string} path - Dot notation path (e.g., "app.title")
 * @returns {string} Translated text or the path if not found.
 */
export function t(lang, path) {
    // Normalize legacy lang codes if necessary
    const normalizedLang = (lang === 'pt' || lang === 'pt-BR') ? 'pt-BR' : 'en-US';

    return path
        .split(".")
        .reduce((obj, key) => obj?.[key], dictionaries[normalizedLang]) ?? path;
}

export const DEFAULT_LANGUAGE = "pt-BR";
