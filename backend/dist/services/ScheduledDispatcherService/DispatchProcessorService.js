"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = __importDefault(require("mustache"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ScheduledDispatchLog_1 = __importDefault(require("../../models/ScheduledDispatchLog"));
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const Company_1 = __importDefault(require("../../models/Company"));
const FindOrCreateTicketService_1 = __importDefault(require("../TicketServices/FindOrCreateTicketService"));
const SendWhatsAppMessage_1 = __importDefault(require("../WbotServices/SendWhatsAppMessage"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const dispatchQueue_1 = require("../../queues/dispatchQueue");
const logger_1 = __importDefault(require("../../utils/logger"));
const ensureTicket = async (contact, whatsapp, companyId) => {
    return (0, FindOrCreateTicketService_1.default)(contact, whatsapp, 0, companyId, null, null, undefined, undefined, false);
};
const renderMessage = (template, variables, ticket) => {
    const filledTemplate = mustache_1.default.render(template, variables || {});
    return (0, Mustache_1.default)(filledTemplate, ticket);
};
const handleDispatchJob = async (job) => {
    const { logId, dispatcherId, companyId, contactId, whatsappId, template, variables } = job.data;
    const log = await ScheduledDispatchLog_1.default.findByPk(logId);
    if (!log) {
        logger_1.default.warn(`[DispatchQueue] Log ${logId} não encontrado, ignorando job`);
        return;
    }
    try {
        const dispatcher = await ScheduledDispatcher_1.default.findByPk(dispatcherId);
        if (!dispatcher) {
            throw new Error(`Dispatcher ${dispatcherId} não encontrado`);
        }
        const contact = await Contact_1.default.findByPk(contactId, {
            include: [Company_1.default]
        });
        if (!contact) {
            throw new Error(`Contato ${contactId} não encontrado`);
        }
        if (!contact.number) {
            throw new Error(`Contato ${contactId} sem número válido`);
        }
        const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
        if (!whatsapp) {
            throw new Error(`WhatsApp ${whatsappId} não encontrado`);
        }
        const ticket = await ensureTicket(contact, whatsapp, companyId);
        const message = renderMessage(template, variables, ticket);
        if (!message || !message.trim()) {
            throw new Error("Template de mensagem vazio após renderização");
        }
        await (0, SendWhatsAppMessage_1.default)({
            body: message,
            ticket
        });
        await log.update({
            status: "sent",
            ticketId: ticket.id,
            sentAt: new Date(),
            errorMessage: null
        });
    }
    catch (err) {
        const errorMessage = err?.message || JSON.stringify(err);
        await log.update({
            status: "error",
            errorMessage
        });
        logger_1.default.error(`[DispatchQueue] Falha no job ${job.id}: ${errorMessage}`);
        throw err;
    }
};
const startDispatchProcessor = () => {
    (0, dispatchQueue_1.processDispatchQueue)(handleDispatchJob);
    logger_1.default.info("[DispatchQueue] Processor iniciado");
};
exports.default = startDispatchProcessor;
