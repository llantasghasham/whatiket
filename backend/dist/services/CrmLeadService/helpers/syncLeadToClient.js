"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const CrmClient_1 = __importDefault(require("../../../models/CrmClient"));
const CrmClientContact_1 = __importDefault(require("../../../models/CrmClientContact"));
const Contact_1 = __importDefault(require("../../../models/Contact"));
const sanitizeDigits = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D/g, "");
    return digits.length ? digits : null;
};
const resolvePhoneCandidates = (phone) => {
    const digits = sanitizeDigits(phone);
    if (!digits)
        return [];
    const variants = [digits];
    if (digits.startsWith("55") && digits.length > 2) {
        variants.push(digits.slice(2));
    }
    return [...new Set(variants)];
};
const syncLeadToClient = async (lead) => {
    if (!lead)
        return null;
    let contact = null;
    if (lead.contactId) {
        contact = await Contact_1.default.findOne({
            where: { id: lead.contactId, companyId: lead.companyId }
        });
    }
    const normalizedDocument = sanitizeDigits(lead.document) || sanitizeDigits(contact?.cpfCnpj);
    const normalizedPhone = sanitizeDigits(lead.phone) || sanitizeDigits(contact?.number);
    const phoneCandidates = resolvePhoneCandidates(normalizedPhone || undefined);
    const email = lead.email || contact?.email || null;
    const name = lead.name || contact?.name || normalizedPhone || "Cliente";
    const orConditions = [];
    if (lead.contactId) {
        orConditions.push({ contactId: lead.contactId });
    }
    if (normalizedDocument) {
        orConditions.push({ document: normalizedDocument });
    }
    if (email) {
        orConditions.push({ email });
    }
    phoneCandidates.forEach(value => {
        orConditions.push({ phone: value });
    });
    let client = null;
    if (orConditions.length > 0) {
        client = await CrmClient_1.default.findOne({
            where: {
                companyId: lead.companyId,
                [sequelize_1.Op.or]: orConditions
            }
        });
    }
    if (!client) {
        client = await CrmClient_1.default.create({
            companyId: lead.companyId,
            contactId: contact?.id || lead.contactId || null,
            type: "pf",
            name,
            companyName: lead.companyName,
            document: normalizedDocument || null,
            birthDate: lead.birthDate || contact?.birthday || null,
            email,
            phone: normalizedPhone || null,
            status: "active",
            clientSince: new Date(),
            ownerUserId: lead.ownerUserId,
            notes: lead.notes
        });
    }
    else {
        const updates = {};
        if (contact?.id && client.contactId !== contact.id) {
            updates.contactId = contact.id;
        }
        else if (!client.contactId && lead.contactId) {
            updates.contactId = lead.contactId;
        }
        if (normalizedDocument && normalizedDocument !== client.document) {
            updates.document = normalizedDocument;
        }
        if (email && email !== client.email) {
            updates.email = email;
        }
        if (normalizedPhone && normalizedPhone !== client.phone) {
            updates.phone = normalizedPhone;
        }
        if (!client.name && name) {
            updates.name = name;
        }
        if (lead.companyName && lead.companyName !== client.companyName) {
            updates.companyName = lead.companyName;
        }
        if (lead.birthDate && lead.birthDate !== client.birthDate) {
            updates.birthDate = lead.birthDate;
        }
        if (contact?.birthday &&
            !lead.birthDate &&
            contact.birthday !== client.birthDate) {
            updates.birthDate = contact.birthday;
        }
        if (lead.ownerUserId && lead.ownerUserId !== client.ownerUserId) {
            updates.ownerUserId = lead.ownerUserId;
        }
        if (Object.keys(updates).length) {
            await client.update(updates);
        }
    }
    const effectiveContactId = contact?.id || lead.contactId || client.contactId || null;
    if (effectiveContactId) {
        await CrmClientContact_1.default.findOrCreate({
            where: {
                clientId: client.id,
                contactId: effectiveContactId
            },
            defaults: {
                clientId: client.id,
                contactId: effectiveContactId
            }
        });
    }
    await lead.update({
        contactId: effectiveContactId || lead.contactId || null,
        convertedClientId: client.id,
        convertedAt: new Date(),
        leadStatus: "convertido",
        document: normalizedDocument || lead.document || null,
        email,
        phone: normalizedPhone || lead.phone || null
    });
    return client;
};
exports.default = syncLeadToClient;
