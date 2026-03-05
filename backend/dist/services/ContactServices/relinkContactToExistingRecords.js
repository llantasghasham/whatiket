"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const logger_1 = __importDefault(require("../../utils/logger"));
const sequelize_1 = require("sequelize");
const relinkContactToExistingRecords = async ({ contact, companyId }) => {
    // Se não tem número nem lid, não pode re-linkar
    if (!contact.number && !contact.lid) {
        return;
    }
    // Busca por leads e clientes que possam estar associados a este contato
    // baseado no número ou lid
    const orConditions = [];
    if (contact.number) {
        orConditions.push({ phone: contact.number });
        orConditions.push({ phone: contact.number.replace(/^55/, "") });
    }
    if (contact.lid) {
        orConditions.push({ lid: contact.lid });
    }
    if (orConditions.length === 0) {
        return;
    }
    // Busca leads sem contato associado
    const orphanLeads = await CrmLead_1.default.findAll({
        where: {
            companyId,
            [sequelize_1.Op.or]: orConditions,
            contactId: null
        }
    });
    // Busca clientes sem contato associado
    const orphanClients = await CrmClient_1.default.findAll({
        where: {
            companyId,
            [sequelize_1.Op.or]: orConditions,
            contactId: null
        }
    });
    // Re-linka leads
    for (const lead of orphanLeads) {
        logger_1.default.info(`Relinking Lead ${lead.id} to Contact ${contact.id}`);
        await lead.update({ contactId: contact.id });
    }
    // Re-linka clientes
    for (const client of orphanClients) {
        logger_1.default.info(`Relinking Client ${client.id} to Contact ${contact.id}`);
        await client.update({ contactId: contact.id });
    }
    // Se encontrou algum registro, também marca o contato como não sendo LID
    if (orphanLeads.length > 0 || orphanClients.length > 0) {
        if (contact.isLid) {
            logger_1.default.info(`Marking Contact ${contact.id} as not LID after relinking`);
            await contact.update({ isLid: false });
        }
    }
};
exports.default = relinkContactToExistingRecords;
