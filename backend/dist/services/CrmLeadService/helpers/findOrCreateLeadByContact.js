"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CrmLead_1 = __importDefault(require("../../../models/CrmLead"));
const sequelize_1 = require("sequelize");
const normalizeDocument = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D/g, "");
    return digits.length ? digits : null;
};
const findOrCreateLeadByContact = async ({ contact, companyId }) => {
    if (!contact || contact.isGroup) {
        return null;
    }
    const normalizedDocument = normalizeDocument(contact.cpfCnpj);
    const normalizedPhone = contact.number || null;
    const email = contact.email || null;
    const name = contact.name || normalizedPhone || "Lead";
    // Primeiro, tenta encontrar um lead vinculado a este contactId
    let lead = await CrmLead_1.default.findOne({
        where: {
            companyId,
            contactId: contact.id
        }
    });
    // Se não encontrou por contactId, busca por número de telefone ou lid
    if (!lead && (normalizedPhone || normalizedDocument)) {
        const whereConditions = [];
        if (normalizedPhone) {
            whereConditions.push({ phone: normalizedPhone });
        }
        if (normalizedDocument) {
            whereConditions.push({ lid: normalizedDocument });
        }
        if (whereConditions.length > 0) {
            lead = await CrmLead_1.default.findOne({
                where: {
                    companyId,
                    [sequelize_1.Op.or]: whereConditions
                }
            });
            // Se encontrou um lead existente, vincula ao novo contato
            if (lead && lead.contactId !== contact.id) {
                await lead.update({ contactId: contact.id });
            }
        }
    }
    if (!lead) {
        // Cria um novo lead apenas se não encontrou nenhum existente
        lead = await CrmLead_1.default.create({
            companyId,
            contactId: contact.id,
            name,
            email,
            phone: normalizedPhone,
            lid: normalizedDocument,
            document: normalizedDocument,
            status: "new",
            leadStatus: "novo",
            lastActivityAt: new Date()
        });
    }
    else {
        // Atualiza as informações do lead existente
        const updates = {};
        if (normalizedPhone && normalizedPhone !== lead.phone) {
            updates.phone = normalizedPhone;
        }
        if (email && email !== lead.email) {
            updates.email = email;
        }
        if (contact.name && (!lead.name || lead.name === "Lead")) {
            updates.name = contact.name;
        }
        if (normalizedDocument && normalizedDocument !== lead.document) {
            updates.document = normalizedDocument;
        }
        if (normalizedDocument && normalizedDocument !== lead.lid) {
            updates.lid = normalizedDocument;
        }
        updates.lastActivityAt = new Date();
        if (Object.keys(updates).length) {
            await lead.update(updates);
        }
    }
    return lead;
};
exports.default = findOrCreateLeadByContact;
