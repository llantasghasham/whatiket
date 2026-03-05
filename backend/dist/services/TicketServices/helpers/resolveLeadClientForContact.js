"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../../models/Contact"));
const findOrCreateLeadByContact_1 = __importDefault(require("../../CrmLeadService/helpers/findOrCreateLeadByContact"));
const findClientByContact_1 = __importDefault(require("../../CrmClientService/helpers/findClientByContact"));
const resolveLeadClientForContact = async (contactId, companyId) => {
    if (!contactId) {
        return {};
    }
    const contact = await Contact_1.default.findOne({
        where: { id: contactId, companyId }
    });
    if (!contact) {
        return {};
    }
    const lead = await (0, findOrCreateLeadByContact_1.default)({ contact, companyId });
    const client = await (0, findClientByContact_1.default)(contact.id, companyId);
    return {
        leadId: lead?.id,
        clientId: client?.id
    };
};
exports.default = resolveLeadClientForContact;
