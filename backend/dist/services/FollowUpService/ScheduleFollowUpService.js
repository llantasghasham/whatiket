"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FollowUp_1 = __importDefault(require("../../models/FollowUp"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ShowTicketService_1 = __importDefault(require("../TicketServices/ShowTicketService"));
const SendWhatsAppMessage_1 = __importDefault(require("../WbotServices/SendWhatsAppMessage"));
class ScheduleFollowUpService {
    constructor() {
    }
    async scheduleFollowUp(data) {
        const { delayMinutes, action, ticketId, companyId, flowNodeId } = data;
        const scheduledAt = (0, moment_1.default)().add(delayMinutes, 'minutes').toDate();
        const followUp = await FollowUp_1.default.create({
            ticketId,
            companyId,
            flowNodeId,
            actionType: action.type,
            actionPayload: action.payload,
            scheduledAt,
            status: 'pending'
        });
        logger_1.default.info(`Follow-up scheduled: ${followUp.id} for ticket ${ticketId} at ${scheduledAt}`);
        return followUp;
    }
    async processPendingFollowUps() {
        try {
            const now = (0, moment_1.default)().toDate();
            const pendingFollowUps = await FollowUp_1.default.findAll({
                where: {
                    status: 'pending',
                    scheduledAt: {
                        [sequelize_1.Op.lte]: now
                    }
                },
                include: [
                    {
                        model: Ticket_1.default,
                        as: 'ticket',
                        include: [
                            {
                                model: Contact_1.default,
                                as: 'contact'
                            },
                            {
                                model: Whatsapp_1.default,
                                as: 'whatsapp'
                            },
                            {
                                model: Queue_1.default,
                                as: 'queue'
                            }
                        ]
                    }
                ]
            });
            logger_1.default.info(`Processing ${pendingFollowUps.length} pending follow-ups`);
            for (const followUp of pendingFollowUps) {
                try {
                    await this.executeFollowUp(followUp);
                    await followUp.update({ status: 'completed', executedAt: new Date() });
                    logger_1.default.info(`Follow-up ${followUp.id} executed successfully`);
                }
                catch (error) {
                    await followUp.update({
                        status: 'failed',
                        executedAt: new Date(),
                        error: error.message
                    });
                    logger_1.default.error(`Failed to execute follow-up ${followUp.id}: ${error.message}`);
                }
            }
        }
        catch (error) {
            logger_1.default.error(`Error processing pending follow-ups: ${error.message}`);
        }
    }
    async executeFollowUp(followUp) {
        const { ticket, actionType, actionPayload } = followUp;
        if (!ticket) {
            throw new Error('Ticket not found for follow-up');
        }
        const actionData = {
            ticket,
            contact: ticket.contact,
            whatsapp: ticket.whatsapp,
            queue: ticket.queue,
            companyId: ticket.companyId,
            ...actionPayload
        };
        switch (actionType) {
            case 'sendMessageFlow':
            case 'sendMessageFlowWithMenu': {
                const messageText = (actionPayload?.text || actionPayload?.body || "").toString().trim();
                if (!messageText) {
                    logger_1.default.warn(`Follow-up ${followUp.id} sem texto para enviar.`);
                    break;
                }
                try {
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, ticket.companyId);
                    await (0, SendWhatsAppMessage_1.default)({
                        body: messageText,
                        ticket: ticketDetails,
                        quotedMsg: null
                    });
                    await ticketDetails.update({ lastMessage: messageText });
                    logger_1.default.info(`Follow-up ${followUp.id} enviou mensagem para ticket ${ticket.id}`);
                }
                catch (error) {
                    logger_1.default.error(`Erro ao enviar mensagem do follow-up ${followUp.id}: ${error.message}`);
                    throw error;
                }
                break;
            }
            case 'addTag':
                // Implement addTag logic - Adicionar tags normais
                if (actionPayload.tags && Array.isArray(actionPayload.tags)) {
                    const Tag = require("../../models/Tag").default;
                    const TicketTag = require("../../models/TicketTag").default;
                    const ContactTag = require("../../models/ContactTag").default;
                    for (const tagId of actionPayload.tags) {
                        try {
                            const tag = await Tag.findByPk(tagId);
                            if (tag && tag.kanban === 0) { // Apenas tags normais
                                // Adicionar tag ao ticket
                                await TicketTag.findOrCreate({
                                    where: { ticketId: ticket.id, tagId },
                                    defaults: { ticketId: ticket.id, tagId }
                                });
                                // Adicionar tag ao contato
                                await ContactTag.findOrCreate({
                                    where: { contactId: ticket.contactId, tagId },
                                    defaults: { contactId: ticket.contactId, tagId }
                                });
                                logger_1.default.info(`Tag ${tag.name} added to ticket ${ticket.id}`);
                            }
                        }
                        catch (error) {
                            logger_1.default.error(`Error adding tag ${tagId} to ticket ${ticket.id}:`, error);
                        }
                    }
                }
                break;
            case 'addTagKanban':
                // Implement addTagKanban logic - Adicionar tag kanban (substitui todas)
                if (actionPayload.kanbanTagId) {
                    const Tag = require("../../models/Tag").default;
                    const TicketTag = require("../../models/TicketTag").default;
                    const ContactTag = require("../../models/ContactTag").default;
                    try {
                        const kanbanTag = await Tag.findByPk(actionPayload.kanbanTagId);
                        if (kanbanTag && kanbanTag.kanban === 1) { // Apenas tags kanban
                            // Remover todas as tags kanban existentes do ticket
                            const existingKanbanTags = await Tag.findAll({
                                where: { kanban: 1 },
                                include: [{
                                        model: TicketTag,
                                        where: { ticketId: ticket.id },
                                        required: true
                                    }]
                            });
                            for (const existingTag of existingKanbanTags) {
                                await TicketTag.destroy({
                                    where: { ticketId: ticket.id, tagId: existingTag.id }
                                });
                                await ContactTag.destroy({
                                    where: { contactId: ticket.contactId, tagId: existingTag.id }
                                });
                            }
                            // Adicionar nova tag kanban
                            await TicketTag.findOrCreate({
                                where: { ticketId: ticket.id, tagId: kanbanTag.id },
                                defaults: { ticketId: ticket.id, tagId: kanbanTag.id }
                            });
                            await ContactTag.findOrCreate({
                                where: { contactId: ticket.contactId, tagId: kanbanTag.id },
                                defaults: { contactId: ticket.contactId, tagId: kanbanTag.id }
                            });
                            logger_1.default.info(`Kanban tag ${kanbanTag.name} set for ticket ${ticket.id}`);
                        }
                    }
                    catch (error) {
                        logger_1.default.error(`Error setting kanban tag for ticket ${ticket.id}:`, error);
                    }
                }
                break;
            case 'transferQueue':
                // Implement transferQueue logic - Transferir para fila
                if (actionPayload.queueId) {
                    const Queue = require("../../models/Queue").default;
                    try {
                        const queue = await Queue.findByPk(actionPayload.queueId);
                        if (queue) {
                            await ticket.update({
                                queueId: queue.id,
                                userId: null // Limpa usuário ao transferir para fila
                            });
                            logger_1.default.info(`Ticket ${ticket.id} transferred to queue ${queue.name}`);
                        }
                    }
                    catch (error) {
                        logger_1.default.error(`Error transferring ticket ${ticket.id} to queue ${actionPayload.queueId}:`, error);
                    }
                }
                break;
            case 'closeTicket':
                // Implement closeTicket logic - Fechar ticket
                try {
                    await ticket.update({
                        status: 'closed',
                        closedAt: new Date()
                    });
                    logger_1.default.info(`Ticket ${ticket.id} closed`);
                }
                catch (error) {
                    logger_1.default.error(`Error closing ticket ${ticket.id}:`, error);
                }
                break;
            case 'transferFlow':
                // Implement transferFlow logic - Transferir para outro fluxo
                if (actionPayload.flowId) {
                    // TODO: Implementar transferência de fluxo
                    // Isso pode precisar de integração com o Flow Builder
                    logger_1.default.info(`Transfer flow action for ticket ${ticket.id} to flow ${actionPayload.flowId}`);
                }
                break;
            default:
                throw new Error(`Unsupported action type: ${actionType}`);
        }
    }
    async cancelFollowUp(followUpId, companyId) {
        const followUp = await FollowUp_1.default.findOne({
            where: {
                id: followUpId,
                companyId,
                status: 'pending'
            }
        });
        if (!followUp) {
            throw new Error('Pending follow-up not found');
        }
        await followUp.update({ status: 'cancelled' });
        logger_1.default.info(`Follow-up ${followUpId} cancelled`);
    }
    async getFollowUpsByTicket(ticketId, companyId) {
        return await FollowUp_1.default.findAll({
            where: {
                ticketId,
                companyId
            },
            order: [['createdAt', 'DESC']]
        });
    }
    async resetFollowUpVariables(ticketId, companyId) {
        const followUps = await FollowUp_1.default.findAll({
            where: {
                ticketId,
                companyId,
                status: ['pending', 'failed']
            }
        });
        for (const followUp of followUps) {
            await followUp.update({ status: 'cancelled' });
        }
        logger_1.default.info(`Reset ${followUps.length} follow-ups for ticket ${ticketId}`);
    }
}
exports.default = ScheduleFollowUpService;
