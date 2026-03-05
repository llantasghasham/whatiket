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
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const syncLeadToClient_1 = __importDefault(require("./helpers/syncLeadToClient"));
const normalizeNumber = (phone) => {
    if (!phone)
        return null;
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) {
        return digits.startsWith("55") ? digits : `55${digits}`;
    }
    return digits || null;
};
const resolveContactId = async (companyId, providedContactId, phone) => {
    if (providedContactId) {
        const contact = await Contact_1.default.findOne({
            where: { id: providedContactId, companyId }
        });
        if (!contact) {
            throw new AppError_1.default("Contato informado não encontrado para esta empresa.");
        }
        return contact.id;
    }
    const normalizedPhone = normalizeNumber(phone);
    if (!normalizedPhone) {
        return undefined;
    }
    const contact = (await Contact_1.default.findOne({
        where: {
            companyId,
            number: normalizedPhone
        }
    })) ||
        (await Contact_1.default.findOne({
            where: {
                companyId,
                number: normalizedPhone.replace(/^55/, "")
            }
        }));
    return contact?.id;
};
const resolvePrimaryTicketId = async (companyId, primaryTicketId) => {
    if (!primaryTicketId)
        return undefined;
    const ticket = await Ticket_1.default.findOne({
        where: { id: primaryTicketId, companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("Ticket informado não encontrado para esta empresa.");
    }
    return ticket.id;
};
const CreateCrmLeadService = async (data) => {
    const schema = Yup.object().shape({
        companyId: Yup.number().required(),
        name: Yup.string().required().min(2),
        email: Yup.string().email().nullable(),
        phone: Yup.string().nullable(),
        status: Yup.string()
            .oneOf(["new", "contacted", "qualified", "unqualified", "converted", "lost"])
            .default("new"),
        leadStatus: Yup.string().default("novo").nullable(),
        score: Yup.number().min(0).default(0),
        temperature: Yup.string().oneOf([null, "frio", "morno", "quente"]).nullable(),
        contactId: Yup.number().nullable(),
        primaryTicketId: Yup.number().nullable()
    });
    await schema.validate(data);
    if (data.email) {
        const existingLead = await CrmLead_1.default.findOne({
            where: {
                companyId: data.companyId,
                email: data.email
            }
        });
        if (existingLead) {
            throw new AppError_1.default("Lead já cadastrado com esse e-mail para esta empresa.");
        }
    }
    const contactId = await resolveContactId(data.companyId, data.contactId, data.phone);
    const primaryTicketId = await resolvePrimaryTicketId(data.companyId, data.primaryTicketId);
    // **ENRIQUECIMENTO: Usa campos existentes com metadados de anúncios**
    let enrichedData = { ...data };
    let score = data.score || 0;
    let notes = data.notes || "";
    // **GARANTE CAMPOS SOURCE/CAMPAIGN/MEDIUM SEJAM PREENCHIDOS**
    if (!enrichedData.source || enrichedData.source === '') {
        enrichedData.source = data.adMetadata?.platform || 'Facebook/Instagram Ads';
    }
    if (!enrichedData.campaign || enrichedData.campaign === '') {
        enrichedData.campaign = data.adMetadata?.adTitle || 'Anúncio Patrocinado';
    }
    if (!enrichedData.medium || enrichedData.medium === '') {
        enrichedData.medium = 'paid_social';
    }
    if (data.adMetadata) {
        // Aumenta score baseado na qualidade do anúncio
        if (data.adMetadata.adTitle && data.adMetadata.adDescription) {
            score = Math.min(score + 20, 100);
        }
        // Força sobreescrever com dados do anúncio se existirem
        if (data.adMetadata.platform) {
            enrichedData.source = data.adMetadata.platform;
        }
        if (data.adMetadata.adTitle) {
            enrichedData.campaign = data.adMetadata.adTitle;
        }
        // Adiciona insights aos notes (campo existente)
        const insights = `\n\n📊 Insights do Anúncio:\n` +
            `• Plataforma: ${data.adMetadata.platform}\n` +
            `• Título: ${data.adMetadata.adTitle}\n` +
            `• Descrição: ${data.adMetadata.adDescription}\n` +
            `• Tracking: ${data.adMetadata.trackingUrl}\n` +
            `• Tracking ID: ${data.adMetadata.trackingId}`;
        notes = notes + insights;
    }
    const lead = await CrmLead_1.default.create({
        ...enrichedData,
        contactId,
        primaryTicketId,
        leadStatus: data.leadStatus || "novo",
        score,
        notes,
        lastActivityAt: data.lastActivityAt || new Date()
    });
    if (lead.status === "converted" || lead.leadStatus === "convertido") {
        await (0, syncLeadToClient_1.default)(lead);
    }
    return lead;
};
exports.default = CreateCrmLeadService;
