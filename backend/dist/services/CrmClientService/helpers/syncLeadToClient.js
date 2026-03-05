"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CrmClient_1 = __importDefault(require("../../../models/CrmClient"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const normalizeDocument = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D/g, "");
    return digits.length ? digits : null;
};
const syncLeadToClient = async ({ lead, companyId }) => {
    if (!lead.convertedClientId) {
        // Lead não foi convertido para cliente ainda
        return;
    }
    const client = await CrmClient_1.default.findOne({
        where: {
            id: lead.convertedClientId,
            companyId
        }
    });
    if (!client) {
        logger_1.default.warn(`Client ${lead.convertedClientId} not found for Lead ${lead.id}`);
        return;
    }
    const updates = {};
    // Sincroniza campos relevantes do Lead para o Client
    if (lead.email && lead.email !== client.email) {
        updates.email = lead.email;
    }
    if (lead.phone && lead.phone !== client.phone) {
        updates.phone = lead.phone;
    }
    if (lead.name && lead.name !== client.name) {
        updates.name = lead.name;
    }
    if (lead.companyName && lead.companyName !== client.companyName) {
        updates.companyName = lead.companyName;
    }
    const normalizedDocument = normalizeDocument(lead.document);
    if (normalizedDocument && normalizedDocument !== client.document) {
        updates.document = normalizedDocument;
    }
    // Se há atualizações, aplica ao cliente
    if (Object.keys(updates).length > 0) {
        logger_1.default.info(`Syncing Lead ${lead.id} changes to Client ${client.id}:`, updates);
        await client.update(updates);
    }
};
exports.default = syncLeadToClient;
