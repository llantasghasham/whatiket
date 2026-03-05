"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactLidStability = exports.DeduplicateContact = exports.MergeContacts = exports.FindDuplicateContact = void 0;
const Contact_1 = __importDefault(require("../../models/Contact"));
const logger_1 = __importDefault(require("../../utils/logger"));
const sequelize_1 = require("sequelize");
const FindDuplicateContact = async ({ number, lid, remoteJid, companyId, excludeId }) => {
    try {
        logger_1.default.info(`Finding duplicate contact - number: ${number}, lid: ${lid}, companyId: ${companyId}`);
        const orConditions = [];
        // Busca por número (com e sem 55)
        if (number) {
            orConditions.push({ number });
            orConditions.push({ number: number.replace(/^55/, "") });
            // Se número tem 55, busca também sem 55
            if (number.startsWith("55")) {
                orConditions.push({ number: number.substring(2) });
            }
        }
        // Busca por LID
        if (lid) {
            orConditions.push({ lid });
        }
        // Busca por remoteJid (se não for @lid)
        if (remoteJid && !remoteJid.includes("@lid")) {
            orConditions.push({ remoteJid });
        }
        if (orConditions.length === 0) {
            logger_1.default.warn("No search criteria provided for duplicate contact search");
            return null;
        }
        const whereClause = {
            companyId,
            [sequelize_1.Op.or]: orConditions
        };
        // Excluir ID específico se fornecido
        if (excludeId) {
            whereClause.id = { [sequelize_1.Op.ne]: excludeId };
        }
        const duplicate = await Contact_1.default.findOne({
            where: whereClause,
            order: [["updatedAt", "DESC"]] // Pega o mais recente
        });
        if (duplicate) {
            logger_1.default.info(`Duplicate contact found: ${duplicate.id} (${duplicate.name})`);
        }
        else {
            logger_1.default.info("No duplicate contact found");
        }
        return duplicate;
    }
    catch (error) {
        logger_1.default.error("Error finding duplicate contact:", error);
        return null;
    }
};
exports.FindDuplicateContact = FindDuplicateContact;
const MergeContacts = async ({ originalContact, duplicateContact, companyId }) => {
    try {
        logger_1.default.info(`Merging contact ${duplicateContact.id} into ${originalContact.id}`);
        // Determinar quais dados são melhores
        const mergedData = {
            companyId
        };
        // Nome: usar o mais significativo
        if (originalContact.name && originalContact.name !== originalContact.number) {
            mergedData.name = originalContact.name;
        }
        else if (duplicateContact.name && duplicateContact.name !== duplicateContact.number) {
            mergedData.name = duplicateContact.name;
        }
        else {
            mergedData.name = originalContact.name || duplicateContact.name;
        }
        // Número: sempre preferir número real sobre @lid
        const originalIsReal = originalContact.number && !originalContact.number.includes("@lid");
        const duplicateIsReal = duplicateContact.number && !duplicateContact.number.includes("@lid");
        if (originalIsReal) {
            mergedData.number = originalContact.number;
        }
        else if (duplicateIsReal) {
            mergedData.number = duplicateContact.number;
        }
        else {
            mergedData.number = originalContact.number || duplicateContact.number;
        }
        // LID: usar o que existir
        mergedData.lid = originalContact.lid || duplicateContact.lid;
        // RemoteJid: usar o mais recente
        mergedData.remoteJid = originalContact.remoteJid || duplicateContact.remoteJid;
        // ProfilePicUrl: usar o que existir
        mergedData.profilePicUrl = originalContact.profilePicUrl || duplicateContact.profilePicUrl;
        // Email: usar o que existir
        mergedData.email = originalContact.email || duplicateContact.email;
        // Campos booleanos: usar valores mais significativos
        mergedData.isLid = originalContact.isLid && duplicateContact.isLid;
        mergedData.savedToPhone = originalContact.savedToPhone || duplicateContact.savedToPhone;
        mergedData.savedToPhoneAt = originalContact.savedToPhoneAt || duplicateContact.savedToPhoneAt;
        mergedData.savedToPhoneReason = originalContact.savedToPhoneReason || duplicateContact.savedToPhoneReason;
        // Score: usar o maior
        mergedData.potentialScore = Math.max(originalContact.potentialScore || 0, duplicateContact.potentialScore || 0);
        mergedData.isPotential = mergedData.potentialScore >= 5;
        // LidStability: usar o mais confiável
        if (originalContact.lidStability === "high" || duplicateContact.lidStability === "high") {
            mergedData.lidStability = "high";
        }
        else if (originalContact.lidStability === "medium" || duplicateContact.lidStability === "medium") {
            mergedData.lidStability = "medium";
        }
        else {
            mergedData.lidStability = originalContact.lidStability || duplicateContact.lidStability;
        }
        // Atualizar contato original com dados mergeados
        await originalContact.update(mergedData);
        logger_1.default.info(`Contact merged successfully - Original: ${originalContact.id}, Duplicate: ${duplicateContact.id}`);
        return originalContact;
    }
    catch (error) {
        logger_1.default.error("Error merging contacts:", error);
        throw error;
    }
};
exports.MergeContacts = MergeContacts;
const DeduplicateContact = async (contactData, companyId) => {
    try {
        const { number, lid, remoteJid, ...otherData } = contactData;
        // Primeiro, buscar duplicados
        const duplicate = await (0, exports.FindDuplicateContact)({
            number,
            lid,
            remoteJid,
            companyId
        });
        if (duplicate) {
            // Se encontrou duplicado, fazer merge
            const mergedContact = await (0, exports.MergeContacts)({
                originalContact: duplicate,
                duplicateContact: contactData,
                companyId
            });
            return mergedContact;
        }
        else {
            // Se não encontrou, criar novo contato
            const newContact = await Contact_1.default.create({
                ...otherData,
                number,
                lid,
                remoteJid,
                companyId,
                potentialScore: 0,
                isPotential: false,
                savedToPhone: false,
                lidStability: "unknown"
            });
            logger_1.default.info(`New contact created: ${newContact.id}`);
            return newContact;
        }
    }
    catch (error) {
        logger_1.default.error("Error in contact deduplication:", error);
        throw error;
    }
};
exports.DeduplicateContact = DeduplicateContact;
const UpdateContactLidStability = async (contactId, companyId) => {
    try {
        const contact = await Contact_1.default.findByPk(contactId);
        if (!contact) {
            logger_1.default.warn(`Contact ${contactId} not found for stability update`);
            return;
        }
        // Verificar histórico de LIDs para determinar estabilidade
        const relatedContacts = await Contact_1.default.findAll({
            where: {
                companyId,
                [sequelize_1.Op.or]: [
                    { number: contact.number },
                    { lid: contact.lid }
                ],
                id: { [sequelize_1.Op.ne]: contactId }
            }
        });
        let stability = "unknown";
        if (relatedContacts.length === 0) {
            stability = "high"; // Sem duplicados = estável
        }
        else if (relatedContacts.length <= 2) {
            stability = "medium"; // Poucos duplicados = médio
        }
        else {
            stability = "low"; // Muitos duplicados = instável
        }
        await contact.update({ lidStability: stability });
        logger_1.default.info(`Contact ${contactId} lid stability updated: ${stability}`);
    }
    catch (error) {
        logger_1.default.error("Error updating contact lid stability:", error);
    }
};
exports.UpdateContactLidStability = UpdateContactLidStability;
