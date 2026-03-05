"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const syncLeadToClient_1 = __importDefault(require("./helpers/syncLeadToClient"));
const resolveLeadRelations_1 = require("./helpers/resolveLeadRelations");
const UpdateCrmLeadService = async ({ id, companyId, ...data }) => {
    const lead = await CrmLead_1.default.findOne({
        where: { id, companyId }
    });
    if (!lead) {
        throw new AppError_1.default("Lead não encontrado.", 404);
    }
    const schema = Yup.object().shape({
        name: Yup.string().min(2),
        email: Yup.string().email().nullable(),
        phone: Yup.string().nullable(),
        status: Yup.string()
            .oneOf(["new", "contacted", "qualified", "unqualified", "converted", "lost"])
            .nullable(),
        leadStatus: Yup.string().nullable(),
        score: Yup.number().min(0).nullable(),
        temperature: Yup.string().oneOf([null, "frio", "morno", "quente"]).nullable(),
        contactId: Yup.number().nullable(),
        primaryTicketId: Yup.number().nullable()
    });
    await schema.validate(data);
    if (data.email) {
        const existingLead = await CrmLead_1.default.findOne({
            where: {
                companyId,
                email: data.email,
                id: { [sequelize_1.Op.ne]: id }
            }
        });
        if (existingLead) {
            throw new AppError_1.default("Outro lead já usa esse e-mail nesta empresa.");
        }
    }
    const previousStatus = lead.status;
    const previousLeadStatus = lead.leadStatus;
    const contactId = await (0, resolveLeadRelations_1.resolveLeadContactId)({
        companyId,
        providedContactId: data.contactId,
        phone: data.phone,
        currentContactId: lead.contactId
    });
    const primaryTicketId = await (0, resolveLeadRelations_1.resolveLeadPrimaryTicketId)({
        companyId,
        providedPrimaryTicketId: data.primaryTicketId,
        currentPrimaryTicketId: lead.primaryTicketId
    });
    await lead.update({
        ...data,
        contactId,
        primaryTicketId,
        leadStatus: data.leadStatus ?? lead.leadStatus,
        lastActivityAt: data.lastActivityAt || lead.lastActivityAt
    });
    const shouldSyncByStatus = data.status === "converted" && previousStatus !== "converted";
    const shouldSyncByLeadStatus = (data.leadStatus === "convertido" && previousLeadStatus !== "convertido") ||
        (lead.leadStatus === "convertido" && previousLeadStatus !== "convertido");
    if (shouldSyncByStatus || shouldSyncByLeadStatus) {
        await (0, syncLeadToClient_1.default)(lead);
    }
    return lead;
};
exports.default = UpdateCrmLeadService;
