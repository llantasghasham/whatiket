"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRemoteJid = exports.buildRemoteJidFromNumber = exports.resolveContactNumber = exports.normalizePhoneNumber = exports.isLidNumber = void 0;
const DIGIT_REGEX = /\D/g;
// Código de país por defecto para números locales (sin código de país).
// Ejemplos: 55 = Brasil, 506 = Costa Rica, 52 = México, 57 = Colombia.
// Se configura con variable de entorno DEFAULT_COUNTRY_CODE (ej. DEFAULT_COUNTRY_CODE=506).
const getDefaultCountryCode = () => {
    const code = process.env.DEFAULT_COUNTRY_CODE;
    if (code && /^\d{1,3}$/.test(code))
        return code;
    return "55"; // fallback Brasil para no romper instalaciones existentes
};
const stripDigits = (value) => {
    if (!value)
        return "";
    return value.replace(DIGIT_REGEX, "");
};
// Detecta si es un LID (Linked ID) del WhatsApp Business API
// LIDs suelen comenzar con 120 y tener 15+ dígitos
const isLidNumber = (digits) => {
    if (!digits)
        return false;
    if (digits.startsWith("120") && digits.length >= 15) {
        return true;
    }
    if (digits.length > 15) {
        return true;
    }
    return false;
};
exports.isLidNumber = isLidNumber;
// Longitud mínima y máxima para número internacional E.164 (con código de país)
const MIN_INTERNATIONAL_LENGTH = 10;
const MAX_INTERNATIONAL_LENGTH = 15;
/**
 * Normaliza un número de teléfono para WhatsApp (formato internacional, solo dígitos).
 * Soporta cualquier país: usa DEFAULT_COUNTRY_CODE para números locales.
 * - Si el número ya tiene 10-15 dígitos y no es LID → se acepta tal cual.
 * - Si es número local (8-11 dígitos sin código) → se agrega DEFAULT_COUNTRY_CODE.
 */
const normalizePhoneNumber = (value) => {
    let digits = stripDigits(value);
    if (!digits) {
        return "";
    }
    if ((0, exports.isLidNumber)(digits)) {
        console.log(`[normalizePhoneNumber] Detected LID/WAID, ignoring: ${digits}`);
        return "";
    }
    // Ya es número internacional (longitud típica 10-15 dígitos)
    if (digits.length >= MIN_INTERNATIONAL_LENGTH && digits.length <= MAX_INTERNATIONAL_LENGTH) {
        return digits;
    }
    // Número local: agregar código de país por defecto (ej. 506 Costa Rica, 55 Brasil)
    const countryCode = getDefaultCountryCode();
    if (digits.length >= 8 && digits.length <= 11 && !digits.startsWith(countryCode)) {
        digits = `${countryCode}${digits}`;
    }
    if (digits.length >= MIN_INTERNATIONAL_LENGTH && digits.length <= MAX_INTERNATIONAL_LENGTH) {
        return digits;
    }
    console.log(`[normalizePhoneNumber] Invalid number (length/format): ${digits}`);
    return "";
};
exports.normalizePhoneNumber = normalizePhoneNumber;
const extractDigitsFromJid = (jid) => {
    if (!jid)
        return "";
    return stripDigits(jid);
};
const getCandidateNumbers = (candidates) => candidates
    .map(extractDigitsFromJid)
    .filter(digits => !!digits);
const resolveContactNumber = ({ rawNumber, remoteJid, remoteJidAlt }) => {
    const rawCandidates = getCandidateNumbers([remoteJidAlt, remoteJid, rawNumber]);
    for (const digits of rawCandidates) {
        const normalized = (0, exports.normalizePhoneNumber)(digits);
        if (normalized) {
            return normalized;
        }
    }
    return "";
};
exports.resolveContactNumber = resolveContactNumber;
const buildRemoteJidFromNumber = (number, isGroup = false) => {
    if (!number) {
        return "";
    }
    return isGroup ? `${number}@g.us` : `${number}@s.whatsapp.net`;
};
exports.buildRemoteJidFromNumber = buildRemoteJidFromNumber;
const sanitizeRemoteJid = (remoteJid, number, isGroup = false) => {
    if (number) {
        const normalized = (0, exports.normalizePhoneNumber)(number);
        if (normalized) {
            return (0, exports.buildRemoteJidFromNumber)(normalized, isGroup);
        }
    }
    return "";
};
exports.sanitizeRemoteJid = sanitizeRemoteJid;
