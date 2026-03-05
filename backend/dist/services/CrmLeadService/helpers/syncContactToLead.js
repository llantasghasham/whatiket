"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CrmLead_1 = __importDefault(require("../../../models/CrmLead"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const normalizeDocument = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D/g, "");
    return digits.length ? digits : null;
};
const syncContactToLead = async ({ contact, companyId }) => {
    if (contact.isGroup) {
        return;
    }
    let lead = await CrmLead_1.default.findOne({
        where: {
            companyId,
            contactId: contact.id
        }
    });
    if (!lead) {
        // Se não existe Lead, cria um
        const normalizedDocument = normalizeDocument(contact.cpfCnpj);
        const normalizedPhone = contact.number || null;
        const email = contact.email || null;
        const name = contact.name || normalizedPhone || "Lead";
        lead = await CrmLead_1.default.create({
            companyId,
            contactId: contact.id,
            name,
            email,
            phone: normalizedPhone,
            document: normalizedDocument,
            status: "new",
            leadStatus: "novo",
            lastActivityAt: new Date()
        });
        logger_1.default.info(`Created new Lead ${lead.id} for Contact ${contact.id}`);
    }
    else {
        // Se existe, atualiza se necessário
        const updates = {};
        const normalizedDocument = normalizeDocument(contact.cpfCnpj);
        if (contact.number && contact.number !== lead.phone) {
            updates.phone = contact.number;
        }
        if (contact.email && contact.email !== lead.email) {
            updates.email = contact.email;
        }
        if (contact.name && contact.name !== lead.name) {
            updates.name = contact.name;
        }
        if (normalizedDocument && normalizedDocument !== lead.document) {
            updates.document = normalizedDocument;
        }
        if (Object.keys(updates).length > 0) {
            logger_1.default.info(`Syncing Contact ${contact.id} changes to Lead ${lead.id}:`, updates);
            await lead.update(updates);
        }
    }
};
exports.default = syncContactToLead;
