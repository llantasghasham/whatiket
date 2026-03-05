"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWhitelabelSettingByKey = exports.getWhitelabelConfig = void 0;
const Setting_1 = __importDefault(require("../../models/Setting"));
const getWhitelabelSetting = async (companyId, key) => {
    try {
        const setting = await Setting_1.default.findOne({
            where: { companyId, key }
        });
        return setting?.value || null;
    }
    catch (error) {
        console.error(`Error fetching whitelabel setting ${key} for company ${companyId}:`, error);
        return null;
    }
};
const getWhitelabelConfig = async (companyId) => {
    const [verifyToken, facebookAppId, facebookAppSecret, backendUrl, frontendUrl, googleClientId, googleClientSecret, googleRedirectUri, openaiApiKey, geminiApiKey] = await Promise.all([
        getWhitelabelSetting(companyId, "verifyToken"),
        getWhitelabelSetting(companyId, "facebookAppId"),
        getWhitelabelSetting(companyId, "facebookAppSecret"),
        getWhitelabelSetting(companyId, "backendUrl"),
        getWhitelabelSetting(companyId, "frontendUrl"),
        getWhitelabelSetting(companyId, "googleClientId"),
        getWhitelabelSetting(companyId, "googleClientSecret"),
        getWhitelabelSetting(companyId, "googleRedirectUri"),
        getWhitelabelSetting(companyId, "openaiApiKey"),
        getWhitelabelSetting(companyId, "geminiApiKey")
    ]);
    return {
        verifyToken: verifyToken || process.env.VERIFY_TOKEN,
        facebookAppId: facebookAppId || process.env.FACEBOOK_APP_ID,
        facebookAppSecret: facebookAppSecret || process.env.FACEBOOK_APP_SECRET,
        backendUrl: backendUrl || process.env.BACKEND_URL,
        frontendUrl: frontendUrl || process.env.FRONTEND_URL,
        googleClientId: googleClientId || process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: googleClientSecret || process.env.GOOGLE_CLIENT_SECRET,
        googleRedirectUri: googleRedirectUri || process.env.GOOGLE_REDIRECT_URI,
        openaiApiKey: openaiApiKey || process.env.OPENAI_API_KEY,
        geminiApiKey: geminiApiKey || process.env.GEMINI_API_KEY
    };
};
exports.getWhitelabelConfig = getWhitelabelConfig;
const getWhitelabelSettingByKey = async (companyId, key) => {
    const config = await (0, exports.getWhitelabelConfig)(companyId);
    return config[key] || process.env[key.toUpperCase()] || "";
};
exports.getWhitelabelSettingByKey = getWhitelabelSettingByKey;
