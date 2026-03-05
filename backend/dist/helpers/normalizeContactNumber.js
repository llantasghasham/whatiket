"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRemoteJid = exports.buildRemoteJidFromNumber = exports.resolveContactNumber = exports.normalizePhoneNumber = exports.isLidNumber = void 0;
const DIGIT_REGEX = /\D/g;
const stripDigits = (value) => {
    if (!value)
        return "";
    return value.replace(DIGIT_REGEX, "");
};
// Detecta se é um LID (Linked ID) do WhatsApp Business API
// LIDs geralmente começam com 120 e têm 15+ dígitos
const isLidNumber = (digits) => {
    if (!digits)
        return false;
    // LIDs começam com 120 e têm 15 ou mais dígitos
    if (digits.startsWith("120") && digits.length >= 15) {
        return true;
    }
    // Também pode ser um WAID que começa com outros padrões
    // Se tem mais de 15 dígitos e não parece um número de telefone válido
    if (digits.length > 15) {
        return true;
    }
    return false;
};
exports.isLidNumber = isLidNumber;
const normalizePhoneNumber = (value) => {
    let digits = stripDigits(value);
    if (!digits) {
        return "";
    }
    // Se é um LID/WAID, retorna vazio - não é um número de telefone válido
    if ((0, exports.isLidNumber)(digits)) {
        console.log(`[normalizePhoneNumber] Detected LID/WAID, ignoring: ${digits}`);
        return "";
    }
    // Normaliza números nacionais (ex: 11988887777 -> 5511988887777)
    if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
        digits = `55${digits}`;
    }
    // Aceita somente números brasileiros válidos (55 + DDD + número)
    const isBrazilNumber = digits.startsWith("55") && digits.length >= 12 && digits.length <= 13;
    if (!isBrazilNumber) {
        console.log(`[normalizePhoneNumber] Invalid BR number (len/prefix): ${digits}`);
        return "";
    }
    return digits;
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
