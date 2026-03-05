"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = __importDefault(require("../../libs/queue"));
const SendWhatsAppMediaFlow_1 = __importDefault(require("../WbotServices/SendWhatsAppMediaFlow"));
const SendMessage_1 = require("../../helpers/SendMessage");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ActionsWebhookService_1 = require("../WebhookService/ActionsWebhookService");
class WaitQuestionService {
    // Agendar envio da pergunta
    static async scheduleQuestionWithFollowUp(data) {
        const delay = data.delayMinutes * 60 * 1000; // Converter para milissegundos
        await queue_1.default.add("WaitQuestion/SendQuestion", {
            ticketId: data.ticketId,
            question: data.question,
            mediaType: data.mediaType,
            mediaUrl: data.mediaUrl,
            mediaName: data.mediaName,
            optionX: data.optionX,
            optionY: data.optionY,
            nodeId: data.nodeId,
            companyId: data.companyId
        }, {
            delay,
            attempts: 3,
            backoff: "exponential",
            removeOnComplete: false
        });
        console.log(`[WaitQuestion] Pergunta agendada para ticket ${data.ticketId} em ${data.delayMinutes} minutos`);
    }
    // Enviar a pergunta (executado pela queue)
    static async sendQuestion(data) {
        try {
            const ticket = await Ticket_1.default.findByPk(data.ticketId);
            if (!ticket) {
                console.error(`[WaitQuestion] Ticket ${data.ticketId} não encontrado`);
                return;
            }
            // Enviar mídia primeiro (se existir)
            if (data.mediaType && data.mediaType !== "none" && data.mediaUrl) {
                try {
                    await (0, SendWhatsAppMediaFlow_1.default)({
                        ticket: ticket,
                        media: data.mediaUrl,
                        body: "",
                        isFlow: true
                    });
                    console.log(`[WaitQuestion] Mídia enviada para ticket ${data.ticketId}`);
                }
                catch (error) {
                    console.error(`[WaitQuestion] Erro ao enviar mídia:`, error);
                }
            }
            // Enviar a pergunta
            if (data.question) {
                await (0, SendMessage_1.SendMessage)(ticket.whatsapp, {
                    number: ticket.contact.number,
                    body: data.question,
                    companyId: data.companyId
                });
                console.log(`[WaitQuestion] Pergunta enviada para ticket ${data.ticketId}`);
            }
            // Atualizar estado do ticket
            await ticket.update({
                waitingQuestion: true,
                questionNodeId: data.nodeId,
                questionOptions: {
                    optionX: data.optionX,
                    optionY: data.optionY
                }
            });
        }
        catch (error) {
            console.error(`[WaitQuestion] Erro ao enviar pergunta:`, error);
        }
    }
    // Agendar timeout
    static async scheduleTimeoutAction(data) {
        const delay = data.timeoutMinutes * 60 * 1000; // Converter para milissegundos
        await queue_1.default.add("WaitQuestion/TimeoutAction", {
            ticketId: data.ticketId,
            nodeId: data.nodeId,
            action: data.action,
            companyId: data.companyId,
            transferQueueId: data.transferQueueId
        }, {
            delay,
            attempts: 3,
            backoff: "exponential",
            removeOnComplete: false
        });
        console.log(`[WaitQuestion] Timeout agendado para ticket ${data.ticketId} em ${data.timeoutMinutes} minutos`);
    }
    // Executar ação de timeout
    static async executeTimeoutAction(data) {
        try {
            const ticket = await Ticket_1.default.findByPk(data.ticketId);
            if (!ticket) {
                console.error(`[WaitQuestion] Ticket ${data.ticketId} não encontrado`);
                return;
            }
            // Verificar se ainda está esperando resposta
            if (!ticket.waitingQuestion || ticket.questionNodeId !== data.nodeId) {
                console.log(`[WaitQuestion] Ticket ${data.ticketId} não está mais aguardando resposta, ignorando timeout`);
                return;
            }
            // Limpar estado de espera
            await ticket.update({
                waitingQuestion: false,
                questionNodeId: null,
                questionOptions: null,
                timeoutEnabled: false,
                timeoutAt: null
            });
            console.log(`[WaitQuestion] Timeout executado para ticket ${data.ticketId}, ação: ${data.action}`);
            // Executar ação baseada no tipo
            switch (data.action) {
                case "close":
                    await ticket.update({
                        status: "closed"
                    });
                    console.log(`[WaitQuestion] Ticket ${data.ticketId} fechado por timeout`);
                    break;
                case "transfer":
                    if (data.transferQueueId) {
                        await ticket.update({
                            queueId: data.transferQueueId,
                            userId: null // Remover atendente atual
                        });
                        console.log(`[WaitQuestion] Ticket ${data.ticketId} transferido para fila ${data.transferQueueId} por timeout`);
                    }
                    break;
                case "continue":
                    // Continuar fluxo pelo handle de timeout (left)
                    await (0, ActionsWebhookService_1.ActionsWebhookService)(ticket.whatsappId, 0, // idFlowDb não necessário para continuar
                    data.companyId, [], // nodes não necessário
                    [], // connects não necessário
                    data.nodeId, // nextStage = nodeId atual para usar conexão left
                    ticket.dataWebhook || {}, {}, "", "", data.ticketId);
                    console.log(`[WaitQuestion] Fluxo continuado pelo handle de timeout para ticket ${data.ticketId}`);
                    break;
                default:
                    console.log(`[WaitQuestion] Ação de timeout desconhecida: ${data.action}`);
            }
        }
        catch (error) {
            console.error(`[WaitQuestion] Erro ao executar timeout:`, error);
        }
    }
    // Normalizar texto para comparação
    static normalizeText(text) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }
    // Verificar se resposta match com trigger
    static checkMatch(response, trigger, matchType) {
        const normalizedResponse = this.normalizeText(response);
        const normalizedTrigger = this.normalizeText(trigger);
        if (matchType === "exact") {
            return normalizedResponse === normalizedTrigger;
        }
        else if (matchType === "contains") {
            return normalizedResponse.includes(normalizedTrigger);
        }
        return false;
    }
    // Processar resposta do usuário
    static async processResponse(ticketId, response) {
        try {
            const ticket = await Ticket_1.default.findByPk(ticketId);
            if (!ticket || !ticket.waitingQuestion) {
                return null;
            }
            const questionOptions = ticket.questionOptions;
            if (!questionOptions || !questionOptions.optionX || !questionOptions.optionY) {
                return null;
            }
            // Salvar nodeId antes de limpar estado (clearWaitingState seta questionNodeId=null)
            const savedNodeId = ticket.questionNodeId;
            // Verificar match com opção X
            if (this.checkMatch(response, questionOptions.optionX.trigger, questionOptions.optionX.matchType)) {
                await this.clearWaitingState(ticket);
                return {
                    option: "x",
                    action: questionOptions.optionX.action,
                    nodeId: savedNodeId
                };
            }
            // Verificar match com opção Y
            if (this.checkMatch(response, questionOptions.optionY.trigger, questionOptions.optionY.matchType)) {
                await this.clearWaitingState(ticket);
                return {
                    option: "y",
                    action: questionOptions.optionY.action,
                    nodeId: savedNodeId
                };
            }
            // Não encontrou match
            return null;
        }
        catch (error) {
            console.error(`[WaitQuestion] Erro ao processar resposta:`, error);
            return null;
        }
    }
    // Limpar estado de espera
    static async clearWaitingState(ticket) {
        await ticket.update({
            waitingQuestion: false,
            questionNodeId: null,
            questionOptions: null,
            timeoutEnabled: false,
            timeoutAt: null
        });
    }
}
exports.default = WaitQuestionService;
