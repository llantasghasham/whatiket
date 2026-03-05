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
const syncClientToLead = async ({ client, companyId }) => {
    // Busca todos os leads associados a este cliente
    const leads = await CrmLead_1.default.findAll({
        where: {
            companyId,
            convertedClientId: client.id
        }
    });
    if (leads.length === 0) {
        logger_1.default.warn(`No leads found for Client ${client.id}`);
        return;
    }
    // Para cada lead, verifica se precisa sincronizar
    for (const lead of leads) {
        const updates = {};
        const normalizedDocument = normalizeDocument(client.document);
        if (client.email && client.email !== lead.email) {
            updates.email = client.email;
        }
        if (client.phone && client.phone !== lead.phone) {
            updates.phone = client.phone;
        }
        if (client.name && client.name !== lead.name) {
            updates.name = client.name;
        }
        if (client.companyName && client.companyName !== lead.companyName) {
            updates.companyName = client.companyName;
        }
        if (normalizedDocument && normalizedDocument !== lead.document) {
            updates.document = normalizedDocument;
        }
        // Se há atualizações, aplica ao lead
        if (Object.keys(updates).length > 0) {
            logger_1.default.info(`Syncing Client ${client.id} changes to Lead ${lead.id}:`, updates);
            await lead.update(updates);
        }
    }
};
exports.default = syncClientToLead;
