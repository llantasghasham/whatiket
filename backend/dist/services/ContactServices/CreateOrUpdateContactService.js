"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const socket_1 = require("../../libs/socket");
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const logger_1 = __importDefault(require("../../utils/logger"));
const Sentry = __importStar(require("@sentry/node"));
const sequelize_1 = require("sequelize");
const syncContactToLead_1 = __importDefault(require("../CrmLeadService/helpers/syncContactToLead"));
const normalizeContactNumber_1 = require("../../helpers/normalizeContactNumber");
const ContactDeduplicationService_1 = require("./ContactDeduplicationService");
const ContactScoringService_1 = require("./ContactScoringService");
const axios = require('axios');
// Função local para detectar LID (Linked ID) do WhatsApp Business API
// LIDs geralmente começam com 120 e têm 15+ dígitos
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
const TEMP_LID_PREFIX = "lid-";
const TEMP_RANDOM_PREFIX = "temp-";
const extractLidDigits = (jid) => {
    if (!jid || !jid.includes("@lid"))
        return "";
    const [lidValue] = jid.split("@");
    return (lidValue || "").replace(/\D/g, "");
};
const buildTempNumberFromLid = (lidDigits) => `${TEMP_LID_PREFIX}${lidDigits}`;
const isTemporaryNumber = (value) => Boolean(value && (value.startsWith(TEMP_LID_PREFIX) || value.startsWith(TEMP_RANDOM_PREFIX)));
const isRealPhoneNumber = (value) => {
    if (!value || isTemporaryNumber(value))
        return false;
    const digits = value.replace(/\D/g, "");
    if (!digits)
        return false;
    return !isLidNumber(digits);
};
const downloadProfileImage = async ({ profilePicUrl, companyId, contact }) => {
    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
    const folder = path_1.default.resolve(publicFolder, `company${companyId}`, "contacts");
    if (!fs_1.default.existsSync(folder)) {
        fs_1.default.mkdirSync(folder, { recursive: true });
        fs_1.default.chmodSync(folder, 0o777);
    }
    try {
        const response = await axios.get(profilePicUrl, {
            responseType: 'arraybuffer'
        });
        const filename = `${new Date().getTime()}.jpeg`;
        fs_1.default.writeFileSync((0, path_1.join)(folder, filename), response.data);
        return filename;
    }
    catch (error) {
        logger_1.default.error("Error downloading profile image:", error);
        return null;
    }
};
const DEFAULT_FALLBACK_NAME = "Contato sem nome";
const sanitizeName = (value) => (value || "").trim();
const hasMeaningfulName = (value, referenceNumber, referenceLid) => {
    const normalized = sanitizeName(value);
    if (!normalized)
        return false;
    if (referenceNumber && normalized === referenceNumber)
        return false;
    if (referenceLid && normalized === referenceLid)
        return false;
    if (/^lid[-\s]?/i.test(normalized))
        return false;
    return true;
};
const ensureFallbackName = async (contact) => {
    if (!hasMeaningfulName(contact.name, contact.number, contact.lid)) {
        const fallbackName = `${DEFAULT_FALLBACK_NAME} ${contact.id}`;
        if (contact.name !== fallbackName) {
            contact.name = fallbackName;
            await contact.save();
        }
    }
};
const CreateOrUpdateContactService = async ({ name, number: rawNumber, profilePicUrl, isGroup, email = "", channel = "whatsapp", companyId, extraInfo = [], remoteJid = "", remoteJidAlt, whatsappId, wbot, lid, addressingMode, msgBody }) => {
    logger_1.default.info("=== CREATE OR UPDATE CONTACT SERVICE START ===");
    logger_1.default.info("Input data:", { rawNumber, remoteJid, remoteJidAlt, name, lid, addressingMode });
    try {
        let createContact = false;
        const sanitizedIncomingName = sanitizeName(name);
        const incomingNameIsMeaningful = hasMeaningfulName(sanitizedIncomingName, rawNumber, lid);
        // Prioriza remoteJidAlt (número real) sobre remoteJid (pode ser LID)
        let number = (0, normalizeContactNumber_1.resolveContactNumber)({
            rawNumber,
            remoteJid,
            remoteJidAlt
        });
        const remoteLidDigits = extractLidDigits(remoteJid);
        const remoteAltLidDigits = extractLidDigits(remoteJidAlt);
        // Se não conseguiu resolver o número e temos um rawNumber que parece LID,
        // usa o rawNumber temporariamente mas marca como LID
        const rawDigits = rawNumber ? rawNumber.replace(/\D/g, "") : "";
        const isRawLid = isLidNumber(rawDigits);
        const bestLidDigits = remoteLidDigits || remoteAltLidDigits || (isRawLid ? rawDigits : "");
        if (!number && bestLidDigits) {
            logger_1.default.warn(`Contact identified only by LID: ${bestLidDigits}`);
            number = buildTempNumberFromLid(bestLidDigits);
        }
        if (!number) {
            number = `${TEMP_RANDOM_PREFIX}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }
        const io = (0, socket_1.getIO)();
        const jidToSanitize = remoteJidAlt || remoteJid;
        const sanitizedRemoteJid = (0, normalizeContactNumber_1.sanitizeRemoteJid)(jidToSanitize, number, isGroup);
        // Se o remoteJid é um LID (pelo sufixo ou pelo número), verifica se já existe contato com esse LID no banco
        const remoteJidDigits = remoteJid ? remoteJid.replace(/\D/g, "") : "";
        const isLidJid = (remoteJid && remoteJid.includes("@lid")) || isLidNumber(remoteJidDigits);
        let contact = null;
        if (isLidJid) {
            // Primeiro tenta encontrar pelo LID
            contact = await Contact_1.default.findOne({
                where: {
                    companyId,
                    [sequelize_1.Op.or]: [
                        { remoteJid },
                        { lid: remoteJid.split("@")[0] }
                    ]
                }
            });
            if (contact) {
                logger_1.default.info(`Found existing contact by LID: ${contact.id}, updating with real number: ${number}`);
            }
        }
        // Se não encontrou pelo LID, busca por número ou remoteJidAlt
        if (!contact) {
            const orConditions = [];
            // Busca pelo número normalizado
            if (number) {
                orConditions.push({ number });
                orConditions.push({ number: number.replace(/^55/, "") });
            }
            // Busca pelo remoteJidAlt
            if (remoteJidAlt) {
                orConditions.push({ remoteJid: remoteJidAlt });
            }
            // Busca pelo remoteJid se não for LID
            if (remoteJid && !isLidJid) {
                orConditions.push({ remoteJid });
            }
            // Busca por contatos que foram criados com o número LID incorretamente
            if (isRawLid) {
                orConditions.push({ number: rawDigits });
                logger_1.default.info(`Also searching for contact with LID number: ${rawDigits}`);
            }
            if (orConditions.length > 0) {
                contact = await Contact_1.default.findOne({
                    where: {
                        companyId,
                        [sequelize_1.Op.or]: orConditions
                    }
                });
            }
        }
        if (contact && isRealPhoneNumber(number)) {
            const duplicateContact = await Contact_1.default.findOne({
                where: {
                    companyId,
                    number,
                    id: {
                        [sequelize_1.Op.ne]: contact.id
                    }
                }
            });
            if (duplicateContact) {
                logger_1.default.warn(`Merging contact ID ${contact.id} (LID) into existing contact ID ${duplicateContact.id} with number ${number}`);
                if (bestLidDigits && (!duplicateContact.lid || duplicateContact.lid !== bestLidDigits)) {
                    duplicateContact.lid = bestLidDigits;
                }
                if (sanitizedRemoteJid &&
                    !sanitizedRemoteJid.includes("@lid") &&
                    sanitizedRemoteJid !== duplicateContact.remoteJid) {
                    duplicateContact.remoteJid = sanitizedRemoteJid;
                }
                if (profilePicUrl &&
                    profilePicUrl !== "" &&
                    !profilePicUrl.includes("nopicture.png") &&
                    profilePicUrl !== duplicateContact.profilePicUrl) {
                    duplicateContact.profilePicUrl = profilePicUrl;
                }
                if (name && name !== number && name !== duplicateContact.name) {
                    duplicateContact.name = name;
                }
                if (addressingMode && !duplicateContact.addressingMode) {
                    duplicateContact.addressingMode = addressingMode;
                }
                if (!duplicateContact.whatsappId && whatsappId) {
                    duplicateContact.whatsappId = whatsappId;
                }
                duplicateContact.isLid = false;
                await duplicateContact.save();
                contact = duplicateContact;
            }
        }
        if (contact) {
            logger_1.default.info(`Updating existing contact ID: ${contact.id}, current number: ${contact.number}`);
            // Verifica se o número atual do contato é um LID
            const currentNumberIsLid = isLidNumber(contact.number || "");
            const newNumberIsReal = isRealPhoneNumber(number);
            // Atualiza o número se:
            // 1. O número atual é um LID e temos um número real
            // 2. Ou se o número é diferente e não é um LID
            if ((currentNumberIsLid && newNumberIsReal) || (number !== contact.number && !isLidNumber(number))) {
                logger_1.default.info(`Updating contact number from ${contact.number} to ${number}`);
                contact.number = number;
            }
            if (profilePicUrl && profilePicUrl !== "" && !profilePicUrl.includes("nopicture.png")) {
                contact.profilePicUrl = profilePicUrl;
            }
            if (incomingNameIsMeaningful && sanitizedIncomingName !== contact.name) {
                contact.name = sanitizedIncomingName;
            }
            // Prioriza remoteJidAlt (número real) para o remoteJid salvo
            if (sanitizedRemoteJid && sanitizedRemoteJid !== contact.remoteJid && !sanitizedRemoteJid.includes("@lid")) {
                contact.remoteJid = sanitizedRemoteJid;
                logger_1.default.info(`Updated remoteJid to: ${sanitizedRemoteJid}`);
            }
            // Salva o LID original para referência futura
            if (bestLidDigits && contact.lid !== bestLidDigits) {
                contact.lid = bestLidDigits;
            }
            if (lid) {
                contact.lid = lid;
            }
            if (addressingMode) {
                contact.addressingMode = addressingMode;
            }
            await contact.save();
            logger_1.default.info(`Contact ${contact.id} updated`);
        }
        else {
            // Cria novo contato
            const settings = await CompaniesSettings_1.default.findOne({ where: { companyId } });
            const { acceptAudioMessageContact } = settings;
            let profileUrl = profilePicUrl || `${process.env.FRONTEND_URL}/nopicture.png`;
            if (!profileUrl && wbot && ['whatsapp'].includes(channel)) {
                try {
                    profileUrl = await wbot.profilePictureUrl(remoteJid, "image");
                }
                catch (e) {
                    Sentry.captureException(e);
                    profileUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
                }
            }
            // Prioriza remoteJidAlt (número real) para o remoteJid salvo
            const jidToSanitize = remoteJidAlt || remoteJid;
            const newRemoteJid = (0, normalizeContactNumber_1.sanitizeRemoteJid)(jidToSanitize, number, isGroup) || (0, normalizeContactNumber_1.buildRemoteJidFromNumber)(number, isGroup);
            // Salva o LID original para referência futura
            const lidToSave = isLidJid ? remoteJidDigits : lid;
            const initialName = incomingNameIsMeaningful ? sanitizedIncomingName : DEFAULT_FALLBACK_NAME;
            logger_1.default.info("Creating new contact:", { name: initialName, number, newRemoteJid, lid: lidToSave, addressingMode });
            contact = await Contact_1.default.create({
                name: initialName,
                number,
                email,
                isGroup,
                companyId,
                channel,
                acceptAudioMessage: acceptAudioMessageContact === 'enabled',
                remoteJid: newRemoteJid,
                profilePicUrl: profileUrl,
                urlPicture: "",
                whatsappId,
                lid: lidToSave,
                addressingMode,
                // Campos novos para deduplicação e scoring
                potentialScore: 0,
                isPotential: false,
                savedToPhone: false,
                lidStability: "unknown"
            });
            createContact = true;
            logger_1.default.info(`Contact ${contact.id} created`);
        }
        // Download imagem de perfil se necessário
        if (profilePicUrl && profilePicUrl !== "" && !profilePicUrl.includes("nopicture.png")) {
            const filename = await downloadProfileImage({
                profilePicUrl,
                companyId,
                contact
            });
            if (filename) {
                await contact.update({
                    urlPicture: filename,
                    pictureUpdated: true
                });
            }
        }
        // 🔍 Verificar duplicação ANTES de emitir eventos
        if (contact) {
            // Buscar contatos duplicados
            const duplicate = await (0, ContactDeduplicationService_1.FindDuplicateContact)({
                number: contact.number,
                lid: contact.lid,
                remoteJid: contact.remoteJid,
                companyId,
                excludeId: contact.id
            });
            // Se encontrou duplicado, fazer merge
            if (duplicate && duplicate.id !== contact.id) {
                logger_1.default.warn(`Duplicate contact found: ${duplicate.id}, merging...`);
                contact = await (0, ContactDeduplicationService_1.MergeContacts)({
                    originalContact: duplicate,
                    duplicateContact: contact,
                    companyId
                });
            }
            // 📊 Calcular score se tiver mensagem
            if (msgBody && typeof msgBody === 'string') {
                const score = (0, ContactScoringService_1.CalculatePotentialScore)(msgBody);
                await contact.update({
                    potentialScore: score,
                    isPotential: score >= 5
                });
                logger_1.default.info(`Contact ${contact.id} score updated: ${score}`);
            }
        }
        // Emite evento
        io.of(String(companyId)).emit(`company-${companyId}-contact`, {
            action: createContact ? "create" : "update",
            contact
        });
        // Cria lead se necessário
        await (0, syncContactToLead_1.default)({ contact, companyId });
        await ensureFallbackName(contact);
        logger_1.default.info("=== CREATE OR UPDATE CONTACT SERVICE END ===");
        return contact;
    }
    catch (error) {
        logger_1.default.error("CreateOrUpdateContactService error:", error);
        throw error;
    }
};
exports.default = CreateOrUpdateContactService;
