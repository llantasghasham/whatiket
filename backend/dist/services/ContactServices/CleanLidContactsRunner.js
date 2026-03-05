"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCleanLidContacts = void 0;
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("../../models/Contact"));
const logger_1 = __importDefault(require("../../utils/logger"));
const normalizeContactNumber_1 = require("../../helpers/normalizeContactNumber");
const BATCH_SIZE = 200;
const buildWhereClause = () => ({
    [sequelize_1.Op.or]: [
        { remoteJid: { [sequelize_1.Op.like]: "%@lid%" } },
        { isLid: true },
        { number: { [sequelize_1.Op.like]: "%:%" } },
        { number: { [sequelize_1.Op.like]: "%@%" } },
        { number: { [sequelize_1.Op.like]: "% %%" } }
    ]
});
const sanitizeContact = async (contact) => {
    const normalizedNumber = (0, normalizeContactNumber_1.resolveContactNumber)({
        rawNumber: contact.number,
        remoteJid: contact.remoteJid,
        remoteJidAlt: contact.remoteJid
    }) || contact.number?.replace(/\D/g, "");
    if (!normalizedNumber) {
        logger_1.default.warn(`[cleanLidContacts] Ignorando contato ${contact.id} — não foi possível extrair número válido`, { remoteJid: contact.remoteJid });
        return { updated: false };
    }
    const sanitizedRemoteJid = (0, normalizeContactNumber_1.sanitizeRemoteJid)(contact.remoteJid, normalizedNumber, contact.isGroup) ||
        (0, normalizeContactNumber_1.buildRemoteJidFromNumber)(normalizedNumber, contact.isGroup);
    let hasChanges = false;
    if (contact.number !== normalizedNumber) {
        contact.number = normalizedNumber;
        hasChanges = true;
    }
    if (sanitizedRemoteJid && contact.remoteJid !== sanitizedRemoteJid) {
        contact.remoteJid = sanitizedRemoteJid;
        hasChanges = true;
    }
    if (contact.isLid) {
        contact.isLid = false;
        hasChanges = true;
    }
    if (hasChanges) {
        await contact.save();
    }
    return { updated: hasChanges };
};
const runCleanLidContacts = async () => {
    logger_1.default.info("[cleanLidContacts] Iniciando saneamento de contatos com @lid");
    let offset = 0;
    let updatedCount = 0;
    let processed = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const contacts = await Contact_1.default.findAll({
            where: buildWhereClause(),
            limit: BATCH_SIZE,
            offset,
            order: [["id", "ASC"]]
        });
        if (contacts.length === 0) {
            break;
        }
        for (const contact of contacts) {
            const { updated } = await sanitizeContact(contact);
            if (updated) {
                updatedCount += 1;
            }
        }
        processed += contacts.length;
        offset += BATCH_SIZE;
        logger_1.default.info(`[cleanLidContacts] Processados ${processed} contatos...`);
    }
    logger_1.default.info(`[cleanLidContacts] Finalizado! Contatos analisados: ${processed}. Contatos atualizados: ${updatedCount}.`);
};
exports.runCleanLidContacts = runCleanLidContacts;
