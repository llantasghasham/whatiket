"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const sequelize_1 = require("sequelize");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Message_1 = __importDefault(require("../../models/Message"));
const TicketTraking_1 = __importDefault(require("../../models/TicketTraking"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const TicketNote_1 = __importDefault(require("../../models/TicketNote"));
const CleanupCompanyTicketsService = async ({ companyId }) => {
    // Apagar mensagens ligadas aos tickets da empresa
    await Message_1.default.destroy({
        where: {
            ticketId: {
                [sequelize_1.Op.in]: Ticket_1.default.sequelize.literal(`(SELECT id FROM Tickets WHERE companyId = ${companyId})`)
            }
        }
    });
    // Apagar rastreamento de tickets
    await TicketTraking_1.default.destroy({
        where: {
            ticketId: {
                [sequelize_1.Op.in]: Ticket_1.default.sequelize.literal(`(SELECT id FROM Tickets WHERE companyId = ${companyId})`)
            },
            companyId
        }
    });
    // Apagar tags de tickets
    await TicketTag_1.default.destroy({
        where: {
            ticketId: {
                [sequelize_1.Op.in]: Ticket_1.default.sequelize.literal(`(SELECT id FROM Tickets WHERE companyId = ${companyId})`)
            }
        }
    });
    // Apagar notas de tickets
    await TicketNote_1.default.destroy({
        where: {
            ticketId: {
                [sequelize_1.Op.in]: Ticket_1.default.sequelize.literal(`(SELECT id FROM Tickets WHERE companyId = ${companyId})`)
            }
        }
    });
    // Finalmente, apagar os tickets da empresa
    await Ticket_1.default.destroy({ where: { companyId } });
};
exports.default = CleanupCompanyTicketsService;
