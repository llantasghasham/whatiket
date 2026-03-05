"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoTranslate = exports.importTranslations = exports.exportTranslations = exports.saveTranslations = exports.getTranslationsByLanguage = exports.listAllTranslations = exports.deleteLanguage = exports.updateLanguage = exports.createLanguage = exports.listLanguages = void 0;
const Language_1 = __importDefault(require("../models/Language"));
const Translation_1 = __importDefault(require("../models/Translation"));
const AppError_1 = __importDefault(require("../errors/AppError"));
// ==================== LANGUAGES ====================
const listLanguages = async (req, res) => {
    const languages = await Language_1.default.findAll({
        order: [["name", "ASC"]]
    });
    return res.status(200).json(languages);
};
exports.listLanguages = listLanguages;
const createLanguage = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { code, name } = req.body;
    if (!code || !name) {
        throw new AppError_1.default("ERR_MISSING_PARAMS", 400);
    }
    const existing = await Language_1.default.findOne({ where: { code } });
    if (existing) {
        throw new AppError_1.default("ERR_LANGUAGE_ALREADY_EXISTS", 400);
    }
    const language = await Language_1.default.create({ code, name, active: true });
    return res.status(201).json(language);
};
exports.createLanguage = createLanguage;
const updateLanguage = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { id } = req.params;
    const { name, active } = req.body;
    const language = await Language_1.default.findByPk(id);
    if (!language) {
        throw new AppError_1.default("ERR_LANGUAGE_NOT_FOUND", 404);
    }
    if (name !== undefined)
        language.name = name;
    if (active !== undefined)
        language.active = active;
    await language.save();
    return res.status(200).json(language);
};
exports.updateLanguage = updateLanguage;
const deleteLanguage = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { id } = req.params;
    const language = await Language_1.default.findByPk(id);
    if (!language) {
        throw new AppError_1.default("ERR_LANGUAGE_NOT_FOUND", 404);
    }
    // Delete all translations for this language
    await Translation_1.default.destroy({ where: { languageCode: language.code } });
    await language.destroy();
    return res.status(200).json({ message: "Language deleted" });
};
exports.deleteLanguage = deleteLanguage;
// ==================== TRANSLATIONS ====================
const listAllTranslations = async (req, res) => {
    const translations = await Translation_1.default.findAll();
    const languages = await Language_1.default.findAll({ where: { active: true } });
    // Group translations by language code
    const grouped = {};
    for (const t of translations) {
        if (!grouped[t.languageCode]) {
            grouped[t.languageCode] = {};
        }
        grouped[t.languageCode][t.key] = t.value;
    }
    return res.status(200).json({ translations: grouped, languages });
};
exports.listAllTranslations = listAllTranslations;
const getTranslationsByLanguage = async (req, res) => {
    const { language } = req.params;
    const translations = await Translation_1.default.findAll({
        where: { languageCode: language }
    });
    const result = {};
    for (const t of translations) {
        result[t.key] = t.value;
    }
    return res.status(200).json(result);
};
exports.getTranslationsByLanguage = getTranslationsByLanguage;
const saveTranslations = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { language } = req.params;
    const { translations } = req.body; // { key: value, key: value, ... }
    if (!translations || typeof translations !== "object") {
        throw new AppError_1.default("ERR_INVALID_DATA", 400);
    }
    const keys = Object.keys(translations);
    for (const key of keys) {
        const value = translations[key];
        if (value === null || value === undefined || value === "") {
            // Delete translation if empty
            await Translation_1.default.destroy({
                where: { languageCode: language, key }
            });
        }
        else {
            const existing = await Translation_1.default.findOne({
                where: { languageCode: language, key }
            });
            if (existing) {
                existing.value = value;
                await existing.save();
            }
            else {
                await Translation_1.default.create({
                    languageCode: language,
                    key,
                    value
                });
            }
        }
    }
    return res.status(200).json({ message: "Translations saved" });
};
exports.saveTranslations = saveTranslations;
const exportTranslations = async (req, res) => {
    const { language } = req.params;
    const translations = await Translation_1.default.findAll({
        where: { languageCode: language }
    });
    const result = {};
    for (const t of translations) {
        result[t.key] = t.value;
    }
    const lang = await Language_1.default.findOne({ where: { code: language } });
    return res.status(200).json({
        language: language,
        name: lang?.name || language,
        translations: result
    });
};
exports.exportTranslations = exportTranslations;
const importTranslations = async (req, res) => {
    const { companyId } = req.user;
    if (companyId !== 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { language } = req.params;
    const { translations } = req.body; // { key: value, ... }
    if (!translations || typeof translations !== "object") {
        throw new AppError_1.default("ERR_INVALID_DATA", 400);
    }
    const keys = Object.keys(translations);
    let imported = 0;
    for (const key of keys) {
        const value = translations[key];
        if (!value)
            continue;
        const existing = await Translation_1.default.findOne({
            where: { languageCode: language, key }
        });
        if (existing) {
            existing.value = value;
            await existing.save();
        }
        else {
            await Translation_1.default.create({
                languageCode: language,
                key,
                value
            });
        }
        imported++;
    }
    return res.status(200).json({ message: `${imported} translations imported` });
};
exports.importTranslations = importTranslations;
// ==================== AUTO TRANSLATE (MyMemory API - Free) ====================
const mapLanguageCode = (code) => {
    const map = {
        "pt-BR": "pt",
        "pt": "pt",
        "en": "en",
        "es": "es",
        "fr": "fr",
        "de": "de",
        "it": "it",
        "ja": "ja",
        "ko": "ko",
        "zh": "zh",
        "ru": "ru",
        "ar": "ar",
        "hi": "hi",
        "nl": "nl",
        "tr": "tr",
        "pl": "pl",
    };
    return map[code] || code;
};
const translateText = async (text, sourceLang, targetLang) => {
    try {
        const langPair = `${sourceLang}|${targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
        const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error(`MyMemory error: ${response.status}`);
        }
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }
        return text;
    }
    catch (err) {
        console.error("[AutoTranslate] Error translating:", err);
        return text;
    }
};
const autoTranslate = async (req, res) => {
    try {
        const { companyId } = req.user;
        if (companyId !== 1) {
            throw new AppError_1.default("ERR_NO_PERMISSION", 403);
        }
        const { language } = req.params;
        const { keys, sourceLanguage = "pt-BR", overwrite = false } = req.body;
        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            throw new AppError_1.default("ERR_INVALID_DATA", 400);
        }
        const sourceLang = mapLanguageCode(sourceLanguage);
        const targetLang = mapLanguageCode(language);
        if (sourceLang === targetLang) {
            throw new AppError_1.default("ERR_SAME_LANGUAGE", 400);
        }
        let translated = 0;
        let skipped = 0;
        const results = {};
        for (const item of keys) {
            const { key, sourceText } = item;
            if (!key || !sourceText)
                continue;
            // Se não for sobrescrever, pula chaves que já têm tradução
            if (!overwrite) {
                const existing = await Translation_1.default.findOne({
                    where: { languageCode: language, key }
                });
                if (existing && existing.value) {
                    skipped++;
                    results[key] = existing.value;
                    continue;
                }
            }
            const translatedText = await translateText(sourceText, sourceLang, targetLang);
            const existing = await Translation_1.default.findOne({
                where: { languageCode: language, key }
            });
            if (existing) {
                existing.value = translatedText;
                await existing.save();
            }
            else {
                await Translation_1.default.create({
                    languageCode: language,
                    key,
                    value: translatedText
                });
            }
            results[key] = translatedText;
            translated++;
            // Delay para evitar rate limiting (MyMemory: ~10 req/s free)
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        return res.status(200).json({
            message: `${translated} traduzidas, ${skipped} ignoradas`,
            translated,
            skipped,
            results
        });
    }
    catch (err) {
        console.error("[AutoTranslate] Unhandled error:", err);
        if (err instanceof AppError_1.default) {
            throw err;
        }
        return res.status(500).json({ error: "Erro na tradução automática" });
    }
};
exports.autoTranslate = autoTranslate;
