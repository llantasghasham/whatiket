"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const syncLeadToClient_1 = __importDefault(require("./helpers/syncLeadToClient"));
const resolveLeadRelations_1 = require("./helpers/resolveLeadRelations");
const ConvertCrmLeadService = async ({ leadId, companyId, contactId, phone, primaryTicketId }) => {
    const lead = await CrmLead_1.default.findOne({
        where: { id: leadId, companyId }
    });
    if (!lead) {
        throw new AppError_1.default("Lead não encontrado.", 404);
    }
    const resolvedContactId = await (0, resolveLeadRelations_1.resolveLeadContactId)({
        companyId,
        providedContactId: contactId,
        phone,
        currentContactId: lead.contactId
    });
    if (!resolvedContactId) {
        throw new AppError_1.default("Para converter um lead é necessário ter um contato vinculado.", 400);
    }
    const resolvedTicketId = await (0, resolveLeadRelations_1.resolveLeadPrimaryTicketId)({
        companyId,
        providedPrimaryTicketId: primaryTicketId,
        currentPrimaryTicketId: lead.primaryTicketId
    });
    await lead.update({
        contactId: resolvedContactId,
        primaryTicketId: resolvedTicketId,
        status: "converted",
        leadStatus: "convertido"
    });
    const client = await (0, syncLeadToClient_1.default)(lead);
    return {
        lead,
        client
    };
};
exports.default = ConvertCrmLeadService;
