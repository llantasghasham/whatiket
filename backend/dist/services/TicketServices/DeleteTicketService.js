"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Message_1 = __importDefault(require("../../models/Message"));
const TicketTraking_1 = __importDefault(require("../../models/TicketTraking"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const TicketNote_1 = __importDefault(require("../../models/TicketNote"));
const DeleteTicketService = async (id, userId, companyId) => {
    const ticket = await Ticket_1.default.findOne({
        where: { id, companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("ERR_NO_TICKET_FOUND", 404);
    }
    // Apagar mensagens ligadas a este ticket
    await Message_1.default.destroy({
        where: { ticketId: ticket.id, companyId }
    });
    // Apagar rastreamento deste ticket
    await TicketTraking_1.default.destroy({
        where: { ticketId: ticket.id, companyId }
    });
    // Apagar tags deste ticket
    await TicketTag_1.default.destroy({
        where: { ticketId: ticket.id }
    });
    // Apagar notas deste ticket
    await TicketNote_1.default.destroy({
        where: { ticketId: ticket.id }
    });
    // Finalmente, apagar o ticket
    await ticket.destroy();
    return ticket;
};
exports.default = DeleteTicketService;
