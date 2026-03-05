"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLeadPrimaryTicketId = exports.resolveLeadContactId = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const Contact_1 = __importDefault(require("../../../models/Contact"));
const Ticket_1 = __importDefault(require("../../../models/Ticket"));
const normalizeNumber = (phone) => {
    if (!phone)
        return null;
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) {
        return digits.startsWith("55") ? digits : `55${digits}`;
    }
    return digits || null;
};
const resolveLeadContactId = async ({ companyId, providedContactId, phone, currentContactId }) => {
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
        return currentContactId;
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
    return contact?.id || currentContactId;
};
exports.resolveLeadContactId = resolveLeadContactId;
const resolveLeadPrimaryTicketId = async ({ companyId, providedPrimaryTicketId, currentPrimaryTicketId }) => {
    if (!providedPrimaryTicketId) {
        return currentPrimaryTicketId;
    }
    const ticket = await Ticket_1.default.findOne({
        where: { id: providedPrimaryTicketId, companyId }
    });
    if (!ticket) {
        throw new AppError_1.default("Ticket informado não encontrado para esta empresa.");
    }
    return ticket.id;
};
exports.resolveLeadPrimaryTicketId = resolveLeadPrimaryTicketId;
