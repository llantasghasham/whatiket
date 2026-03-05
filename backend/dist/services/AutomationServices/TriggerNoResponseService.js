"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNoResponseAutomations = void 0;
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Message_1 = __importDefault(require("../../models/Message"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ProcessAutomationService_1 = require("./ProcessAutomationService");
// Processar automações de "sem resposta" (lead não respondeu há X horas)
const processNoResponseAutomations = async (companyId) => {
    try {
        // Buscar automações de no_response ativas
        const automations = await Automation_1.default.findAll({
            where: {
                companyId,
                triggerType: "no_response",
                isActive: true
            },
            include: [
                {
                    model: AutomationAction_1.default,
                    as: "actions",
                    separate: true,
                    order: [["order", "ASC"]]
                }
            ]
        });
        if (automations.length === 0) {
            return;
        }
        for (const automation of automations) {
            const { hoursWithoutResponse, onlyOpenTickets } = automation.triggerConfig || {};
            if (!hoursWithoutResponse) {
                continue;
            }
            // Calcular data limite
            const limitDate = (0, moment_1.default)().subtract(hoursWithoutResponse, "hours").toDate();
            // Condição de status do ticket
            const statusCondition = onlyOpenTickets
                ? { status: "open" }
                : { status: { [sequelize_1.Op.notIn]: ["closed", "lgpd", "nps"] } };
            // Buscar tickets que não receberam resposta do cliente
            const tickets = await Ticket_1.default.findAll({
                where: {
                    companyId,
                    ...statusCondition,
                    updatedAt: { [sequelize_1.Op.lte]: limitDate }
                },
                include: [
                    { model: Contact_1.default, as: "contact" }
                ]
            });
            for (const ticket of tickets) {
                // Verificar se a última mensagem foi enviada pela empresa (fromMe = true)
                const lastMessage = await Message_1.default.findOne({
                    where: { ticketId: ticket.id },
                    order: [["createdAt", "DESC"]]
                });
                // Se a última mensagem foi do cliente, não disparar
                if (lastMessage && !lastMessage.fromMe) {
                    continue;
                }
                // Se a última mensagem foi da empresa e o cliente não respondeu
                if (lastMessage && lastMessage.fromMe) {
                    const messageDate = (0, moment_1.default)(lastMessage.createdAt);
                    const hoursSinceMessage = (0, moment_1.default)().diff(messageDate, "hours");
                    if (hoursSinceMessage >= hoursWithoutResponse) {
                        try {
                            await (0, ProcessAutomationService_1.processAutomationForContact)(automation, ticket.contact, ticket);
                            logger_1.default.info(`[Automation NoResponse] Automação ${automation.id} processada para ticket ${ticket.id}`);
                        }
                        catch (error) {
                            logger_1.default.error(`[Automation NoResponse] Erro: ${error.message}`);
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        logger_1.default.error(`[Automation NoResponse] Erro geral: ${error.message}`);
    }
};
exports.processNoResponseAutomations = processNoResponseAutomations;
exports.default = exports.processNoResponseAutomations;
