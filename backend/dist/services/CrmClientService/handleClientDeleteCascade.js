"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../models/Contact"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const logger_1 = __importDefault(require("../../utils/logger"));
const handleClientDeleteCascade = async ({ client, companyId }) => {
    // Se o cliente tem um contato associado, apaga o contato e o lead
    if (client.contactId) {
        const contact = await Contact_1.default.findOne({
            where: {
                id: client.contactId,
                companyId
            }
        });
        if (contact) {
            // Busca e apaga o lead associado a este contato
            const lead = await CrmLead_1.default.findOne({
                where: {
                    companyId,
                    contactId: contact.id
                }
            });
            if (lead) {
                logger_1.default.info(`Cascade deleting Lead ${lead.id} due to Client ${client.id} deletion`);
                await lead.destroy();
            }
            // Apaga o contato
            logger_1.default.info(`Cascade deleting Contact ${contact.id} due to Client ${client.id} deletion`);
            await contact.destroy();
        }
    }
    // Se não tem contato direto, mas tem leads, apaga apenas os leads
    const leads = await CrmLead_1.default.findAll({
        where: {
            companyId,
            convertedClientId: client.id
        }
    });
    for (const lead of leads) {
        logger_1.default.info(`Cascade deleting Lead ${lead.id} due to Client ${client.id} deletion`);
        await lead.destroy();
    }
};
exports.default = handleClientDeleteCascade;
