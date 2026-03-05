"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processKanbanStageAutomation = exports.processKanbanTimeAutomations = void 0;
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ProcessAutomationService_1 = require("./ProcessAutomationService");
// Processar automações de tempo no Kanban (lead está X horas em uma fase)
const processKanbanTimeAutomations = async (companyId) => {
    try {
        // Buscar automações de tempo no kanban ativas
        const automations = await Automation_1.default.findAll({
            where: {
                companyId,
                triggerType: "kanban_time",
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
            const { tagId, hoursInStage } = automation.triggerConfig || {};
            if (!tagId || !hoursInStage) {
                continue;
            }
            // Calcular data limite (tickets que estão na tag há mais de X horas)
            const limitDate = (0, moment_1.default)().subtract(hoursInStage, "hours").toDate();
            // Buscar tickets que estão na tag há mais tempo que o limite
            const ticketTags = await TicketTag_1.default.findAll({
                where: {
                    tagId,
                    createdAt: { [sequelize_1.Op.lte]: limitDate }
                },
                include: [
                    {
                        model: Ticket_1.default,
                        as: "ticket",
                        where: {
                            companyId,
                            status: { [sequelize_1.Op.notIn]: ["closed", "lgpd", "nps"] }
                        },
                        include: [
                            { model: Contact_1.default, as: "contact" }
                        ]
                    }
                ]
            });
            for (const ticketTag of ticketTags) {
                const ticket = ticketTag.ticket;
                if (!ticket || !ticket.contact)
                    continue;
                try {
                    await (0, ProcessAutomationService_1.processAutomationForContact)(automation, ticket.contact, ticket);
                    logger_1.default.info(`[Automation KanbanTime] Automação ${automation.id} processada para ticket ${ticket.id}`);
                }
                catch (error) {
                    logger_1.default.error(`[Automation KanbanTime] Erro: ${error.message}`);
                }
            }
        }
    }
    catch (error) {
        logger_1.default.error(`[Automation KanbanTime] Erro geral: ${error.message}`);
    }
};
exports.processKanbanTimeAutomations = processKanbanTimeAutomations;
// Processar automações quando lead entra em uma fase do Kanban
const processKanbanStageAutomation = async (ticketId, tagId, companyId) => {
    try {
        // Buscar automações para essa tag/fase
        const automations = await Automation_1.default.findAll({
            where: {
                companyId,
                triggerType: "kanban_stage",
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
        // Filtrar automações que correspondem à tag
        const matchingAutomations = automations.filter(a => {
            const config = a.triggerConfig || {};
            return config.tagId === tagId || config.tagIds?.includes(tagId);
        });
        if (matchingAutomations.length === 0) {
            return;
        }
        // Buscar ticket com contato
        const ticket = await Ticket_1.default.findByPk(ticketId, {
            include: [{ model: Contact_1.default, as: "contact" }]
        });
        if (!ticket || !ticket.contact) {
            return;
        }
        for (const automation of matchingAutomations) {
            try {
                await (0, ProcessAutomationService_1.processAutomationForContact)(automation, ticket.contact, ticket);
                logger_1.default.info(`[Automation KanbanStage] Automação ${automation.id} processada para ticket ${ticketId}`);
            }
            catch (error) {
                logger_1.default.error(`[Automation KanbanStage] Erro: ${error.message}`);
            }
        }
    }
    catch (error) {
        logger_1.default.error(`[Automation KanbanStage] Erro geral: ${error.message}`);
    }
};
exports.processKanbanStageAutomation = processKanbanStageAutomation;
exports.default = {
    processKanbanTimeAutomations: exports.processKanbanTimeAutomations,
    processKanbanStageAutomation: exports.processKanbanStageAutomation
};
