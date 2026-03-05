"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../../models/Contact"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const syncLeadToContact = async ({ lead, companyId }) => {
    if (!lead.contactId) {
        logger_1.default.warn(`Lead ${lead.id} has no associated contact`);
        return;
    }
    const contact = await Contact_1.default.findOne({
        where: {
            id: lead.contactId,
            companyId
        }
    });
    if (!contact) {
        logger_1.default.warn(`Contact ${lead.contactId} not found for Lead ${lead.id}`);
        return;
    }
    const updates = {};
    // Sincroniza campos relevantes do Lead para o Contact
    if (lead.email && lead.email !== contact.email) {
        updates.email = lead.email;
    }
    if (lead.phone && lead.phone !== contact.number) {
        updates.number = lead.phone;
    }
    if (lead.name && lead.name !== contact.name) {
        updates.name = lead.name;
    }
    if (lead.document && lead.document !== contact.cpfCnpj) {
        updates.cpfCnpj = lead.document;
    }
    // Se há atualizações, aplica ao contato
    if (Object.keys(updates).length > 0) {
        logger_1.default.info(`Syncing Lead ${lead.id} changes to Contact ${contact.id}:`, updates);
        await contact.update(updates);
    }
};
exports.default = syncLeadToContact;
