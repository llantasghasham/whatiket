"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sequelize_1 = require("sequelize");
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
const GetDefaultWhatsAppByUser_1 = __importDefault(require("../../helpers/GetDefaultWhatsAppByUser"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ShowContactService_1 = __importDefault(require("../ContactServices/ShowContactService"));
const socket_1 = require("../../libs/socket");
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const CheckContactOpenTickets_1 = __importDefault(require("../../helpers/CheckContactOpenTickets"));
const resolveLeadClientForContact_1 = __importDefault(require("./helpers/resolveLeadClientForContact"));
const CreateLogTicketService_1 = __importDefault(require("./CreateLogTicketService"));
const ShowTicketService_1 = __importDefault(require("./ShowTicketService"));
const CreateTicketService = async ({ contactId, lid, status, userId, queueId, companyId, whatsappId = "", reuseOpenTicket = true }) => {
    const io = (0, socket_1.getIO)();
    const { leadId, clientId } = await (0, resolveLeadClientForContact_1.default)(contactId, companyId);
    const contact = await (0, ShowContactService_1.default)(contactId, companyId);
    let whatsapp;
    let defaultWhatsapp;
    if (whatsappId !== "undefined" && whatsappId !== null && whatsappId !== "") {
        // console.log("GETTING WHATSAPP CREATE TICKETSERVICE", whatsappId)
        whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    }
    defaultWhatsapp = await (0, GetDefaultWhatsAppByUser_1.default)(userId);
    if (whatsapp) {
        defaultWhatsapp = whatsapp;
    }
    if (!defaultWhatsapp)
        defaultWhatsapp = await (0, GetDefaultWhatsApp_1.default)(whatsapp.id, companyId);
    // Solo validar ticket abierto si no se permite reutilizar (mensaje rápido)
    if (!reuseOpenTicket) {
        await (0, CheckContactOpenTickets_1.default)(contactId, defaultWhatsapp.id, companyId);
    }
    const { isGroup } = contact;
    // Sempre que possível, reutiliza o último ticket do contato
    let ticket = await Ticket_1.default.findOne({
        where: {
            contactId,
            companyId,
            whatsappId: defaultWhatsapp.id
        },
        order: [["updatedAt", "DESC"]]
    });
    // Se reuseOpenTicket e não achou por whatsappId, busca qualquer ticket aberto do contato
    if (!ticket && reuseOpenTicket) {
        ticket = await Ticket_1.default.findOne({
            where: {
                contactId,
                companyId,
                status: { [sequelize_1.Op.or]: ["open", "pending", "group"] }
            },
            order: [["updatedAt", "DESC"]]
        });
        if (ticket) {
            await ticket.update({
                userId,
                queueId: queueId ?? ticket.queueId,
                status: isGroup ? "group" : ticket.status
            });
        }
    }
    if (ticket && ["closed", "nps", "lgpd"].includes(ticket.status)) {
        await ticket.update({
            whatsappId: defaultWhatsapp.id,
            channel: defaultWhatsapp.channel,
            isGroup,
            userId,
            queueId,
            status: isGroup ? "group" : "open",
            isBot: true,
            isActiveDemand: true,
            crmLeadId: leadId ?? ticket.crmLeadId,
            crmClientId: clientId ?? ticket.crmClientId
        });
    }
    else if (ticket && (!ticket.crmLeadId || !ticket.crmClientId)) {
        await ticket.update({
            crmLeadId: leadId ?? ticket.crmLeadId,
            crmClientId: clientId ?? ticket.crmClientId
        });
    }
    if (!ticket) {
        ticket = await Ticket_1.default.create({
            contactId,
            lid: contact?.lid || lid || null,
            companyId,
            whatsappId: defaultWhatsapp.id,
            channel: defaultWhatsapp.channel,
            isGroup,
            userId,
            isBot: true,
            queueId,
            status: isGroup ? "group" : "open",
            isActiveDemand: true,
            crmLeadId: leadId,
            crmClientId: clientId
        });
    }
    // await Ticket.update(
    //   { companyId, queueId, userId, status: isGroup? "group": "open", isBot: true },
    //   { where: { id } }
    // );
    ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
    if (!ticket) {
        throw new AppError_1.default("ERR_CREATING_TICKET");
    }
    const shouldUpdateLid = (contact?.lid && contact?.lid !== ticket.lid) ||
        (lid && lid !== ticket.lid);
    if (shouldUpdateLid) {
        await ticket.update({ lid: contact?.lid || lid || null });
    }
    ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
    if (!ticket) {
        throw new AppError_1.default("ERR_CREATING_TICKET");
    }
    io.of(String(companyId))
        // .to(ticket.status)
        // .to("notification")
        // .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
    });
    await (0, CreateLogTicketService_1.default)({
        userId,
        queueId,
        ticketId: ticket.id,
        type: "create"
    });
    return ticket;
};
exports.default = CreateTicketService;
