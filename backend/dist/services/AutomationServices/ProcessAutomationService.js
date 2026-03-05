"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutomationsByTrigger = exports.processAutomationForContact = exports.executeAction = exports.getNextDispatchDate = exports.isWithinDispatchHours = exports.getCampaignSettings = void 0;
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const AutomationExecution_1 = __importDefault(require("../../models/AutomationExecution"));
const AutomationLog_1 = __importDefault(require("../../models/AutomationLog"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const CampaignSetting_1 = __importDefault(require("../../models/CampaignSetting"));
const SendWhatsAppMessage_1 = __importDefault(require("../WbotServices/SendWhatsAppMessage"));
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const logger_1 = __importDefault(require("../../utils/logger"));
const moment_1 = __importDefault(require("moment"));
const AUTOMATION_WINDOW_REGEX = /^automation_(.+)_(startHour|endHour|sabado|domingo)$/;
const INSTANT_ACTIONS = new Set([
    "add_tag",
    "remove_tag",
    "move_kanban",
    "transfer_queue",
    "transfer_user",
    "close_ticket"
]);
// Buscar configurações de disparo da empresa
const getCampaignSettings = async (companyId) => {
    const settings = await CampaignSetting_1.default.findAll({
        where: { companyId },
        attributes: ["key", "value"]
    });
    let config = {
        messageInterval: 20,
        longerIntervalAfter: 20,
        greaterInterval: 60,
        sabado: false,
        domingo: false,
        startHour: "08:00",
        endHour: "18:00",
        automationWindows: {}
    };
    settings.forEach(setting => {
        try {
            const automationMatch = setting.key.match(AUTOMATION_WINDOW_REGEX);
            if (automationMatch) {
                const [, triggerType, field] = automationMatch;
                const windowConfig = config.automationWindows[triggerType] ||
                    (config.automationWindows[triggerType] = {});
                if (field === "startHour" || field === "endHour") {
                    windowConfig[field] = setting.value;
                }
                else {
                    windowConfig[field] = JSON.parse(setting.value);
                }
                return;
            }
            if (setting.key === "messageInterval")
                config.messageInterval = JSON.parse(setting.value);
            if (setting.key === "longerIntervalAfter")
                config.longerIntervalAfter = JSON.parse(setting.value);
            if (setting.key === "greaterInterval")
                config.greaterInterval = JSON.parse(setting.value);
            if (setting.key === "sabado")
                config.sabado = JSON.parse(setting.value);
            if (setting.key === "domingo")
                config.domingo = JSON.parse(setting.value);
            if (setting.key === "startHour")
                config.startHour = setting.value;
            if (setting.key === "endHour")
                config.endHour = setting.value;
        }
        catch (e) { }
    });
    return config;
};
exports.getCampaignSettings = getCampaignSettings;
const resolveWindow = (settings, triggerType) => {
    const windowConfig = (triggerType && settings.automationWindows[triggerType]) || {};
    return {
        startHour: windowConfig.startHour ?? settings.startHour,
        endHour: windowConfig.endHour ?? settings.endHour,
        sabado: windowConfig.sabado ?? settings.sabado,
        domingo: windowConfig.domingo ?? settings.domingo
    };
};
// Verificar se está dentro do horário de disparo
const isWithinDispatchHours = (settings, triggerType) => {
    const windowConfig = resolveWindow(settings, triggerType);
    const now = (0, moment_1.default)();
    const dayOfWeek = now.day();
    // Verificar sábado e domingo
    if (dayOfWeek === 6 && !windowConfig.sabado)
        return false;
    if (dayOfWeek === 0 && !windowConfig.domingo)
        return false;
    // Verificar horário
    const currentTime = now.format("HH:mm");
    return currentTime >= windowConfig.startHour && currentTime <= windowConfig.endHour;
};
exports.isWithinDispatchHours = isWithinDispatchHours;
const getNextDispatchDate = (settings, triggerType) => {
    const windowConfig = resolveWindow(settings, triggerType);
    const next = (0, moment_1.default)();
    const [startHour, startMinute] = windowConfig.startHour.split(":").map(Number);
    const [endHour, endMinute] = windowConfig.endHour.split(":").map(Number);
    while (true) {
        const day = next.day();
        if ((day === 6 && !windowConfig.sabado) || (day === 0 && !windowConfig.domingo)) {
            next.add(1, "day").startOf("day");
            continue;
        }
        const startOfWindow = next.clone().startOf("day").add(startHour, "hours").add(startMinute, "minutes");
        const endOfWindow = next.clone().startOf("day").add(endHour, "hours").add(endMinute, "minutes");
        if (next.isBefore(startOfWindow)) {
            return startOfWindow.toDate();
        }
        if (next.isBefore(endOfWindow)) {
            return next.toDate();
        }
        next.add(1, "day").startOf("day");
    }
};
exports.getNextDispatchDate = getNextDispatchDate;
// Calcular delay baseado nas configurações
const calculateDelay = (settings, messageCount) => {
    if (messageCount >= settings.longerIntervalAfter) {
        return settings.greaterInterval;
    }
    return settings.messageInterval;
};
// Executar ação de enviar mensagem
const executeActionSendMessage = async (action, contact, ticket, companyId) => {
    try {
        const { message, mediaUrl } = action.actionConfig;
        if (!ticket) {
            return { success: false, message: "Ticket não encontrado" };
        }
        // Substituir variáveis na mensagem
        let finalMessage = message || "";
        finalMessage = finalMessage.replace(/\{\{nome\}\}/gi, contact.name || "");
        finalMessage = finalMessage.replace(/\{\{numero\}\}/gi, contact.number || "");
        finalMessage = finalMessage.replace(/\{\{email\}\}/gi, contact.email || "");
        await (0, SendWhatsAppMessage_1.default)({ body: finalMessage, ticket });
        return { success: true, message: "Mensagem enviada com sucesso" };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao enviar mensagem: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar ação de adicionar tag
const executeActionAddTag = async (action, contact, ticket, companyId) => {
    try {
        const { tagId } = action.actionConfig;
        if (!tagId) {
            return { success: false, message: "Tag não especificada" };
        }
        const tag = await Tag_1.default.findOne({ where: { id: tagId, companyId } });
        if (!tag) {
            return { success: false, message: "Tag não encontrada" };
        }
        // Adicionar tag ao contato
        await ContactTag_1.default.findOrCreate({
            where: { contactId: contact.id, tagId: tag.id },
            defaults: { contactId: contact.id, tagId: tag.id }
        });
        // Adicionar tag ao ticket se existir
        if (ticket) {
            await TicketTag_1.default.findOrCreate({
                where: { ticketId: ticket.id, tagId: tag.id },
                defaults: { ticketId: ticket.id, tagId: tag.id }
            });
        }
        return { success: true, message: `Tag "${tag.name}" adicionada` };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao adicionar tag: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar ação de remover tag
const executeActionRemoveTag = async (action, contact, ticket, companyId) => {
    try {
        const { tagId } = action.actionConfig;
        if (!tagId) {
            return { success: false, message: "Tag não especificada" };
        }
        await ContactTag_1.default.destroy({
            where: { contactId: contact.id, tagId }
        });
        if (ticket) {
            await TicketTag_1.default.destroy({
                where: { ticketId: ticket.id, tagId }
            });
        }
        return { success: true, message: "Tag removida" };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao remover tag: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar ação de mover no Kanban
const executeActionMoveKanban = async (action, contact, ticket, companyId) => {
    try {
        const { tagId } = action.actionConfig; // tagId representa a lane do kanban
        if (!ticket) {
            return { success: false, message: "Ticket não encontrado" };
        }
        const tag = await Tag_1.default.findOne({ where: { id: tagId, companyId } });
        if (!tag) {
            return { success: false, message: "Lane do Kanban não encontrada" };
        }
        // Remover tags kanban anteriores
        await TicketTag_1.default.destroy({
            where: { ticketId: ticket.id }
        });
        // Adicionar nova tag kanban
        await TicketTag_1.default.create({
            ticketId: ticket.id,
            tagId: tag.id
        });
        return { success: true, message: `Movido para "${tag.name}"` };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao mover no Kanban: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar ação de transferir para fila
const executeActionTransferQueue = async (action, contact, ticket, companyId) => {
    try {
        const { queueId } = action.actionConfig;
        if (!ticket) {
            return { success: false, message: "Ticket não encontrado" };
        }
        await (0, UpdateTicketService_1.default)({
            ticketData: { queueId },
            ticketId: ticket.id,
            companyId
        });
        return { success: true, message: "Transferido para fila" };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao transferir para fila: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar ação de transferir para usuário
const executeActionTransferUser = async (action, contact, ticket, companyId) => {
    try {
        const { userId } = action.actionConfig;
        if (!ticket) {
            return { success: false, message: "Ticket não encontrado" };
        }
        await (0, UpdateTicketService_1.default)({
            ticketData: { userId, status: "open" },
            ticketId: ticket.id,
            companyId
        });
        return { success: true, message: "Transferido para atendente" };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao transferir para usuário: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar ação de fechar ticket
const executeActionCloseTicket = async (action, contact, ticket, companyId) => {
    try {
        if (!ticket) {
            return { success: false, message: "Ticket não encontrado" };
        }
        await (0, UpdateTicketService_1.default)({
            ticketData: { status: "closed" },
            ticketId: ticket.id,
            companyId
        });
        return { success: true, message: "Ticket fechado" };
    }
    catch (error) {
        logger_1.default.error(`[Automation] Erro ao fechar ticket: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Executar uma ação específica
const executeAction = async (action, contact, ticket, companyId) => {
    switch (action.actionType) {
        case "send_message":
            return executeActionSendMessage(action, contact, ticket, companyId);
        case "add_tag":
            return executeActionAddTag(action, contact, ticket, companyId);
        case "remove_tag":
            return executeActionRemoveTag(action, contact, ticket, companyId);
        case "move_kanban":
            return executeActionMoveKanban(action, contact, ticket, companyId);
        case "transfer_queue":
            return executeActionTransferQueue(action, contact, ticket, companyId);
        case "transfer_user":
            return executeActionTransferUser(action, contact, ticket, companyId);
        case "close_ticket":
            return executeActionCloseTicket(action, contact, ticket, companyId);
        case "wait":
            return { success: true, message: "Aguardando..." };
        default:
            return { success: false, message: `Ação desconhecida: ${action.actionType}` };
    }
};
exports.executeAction = executeAction;
// Processar automação completa para um contato
const processAutomationForContact = async (automation, contact, ticket) => {
    const companyId = automation.companyId;
    const settings = await (0, exports.getCampaignSettings)(companyId);
    const actions = await AutomationAction_1.default.findAll({
        where: { automationId: automation.id },
        order: [["order", "ASC"]]
    });
    let messageCount = 0;
    for (const action of actions) {
        const isInstantAction = INSTANT_ACTIONS.has(action.actionType);
        if (isInstantAction) {
            const result = await (0, exports.executeAction)(action, contact, ticket, companyId);
            await AutomationLog_1.default.create({
                automationId: automation.id,
                contactId: contact.id,
                ticketId: ticket?.id,
                status: result.success ? "completed" : "failed",
                executedAt: new Date(),
                result,
                error: result.success ? null : result.message
            });
            if (!result.success) {
                logger_1.default.warn(`[Automation] Ação instantânea ${action.actionType} falhou: ${result.message}`);
            }
            continue;
        }
        const anchorMoment = (0, exports.isWithinDispatchHours)(settings, automation.triggerType)
            ? (0, moment_1.default)()
            : (0, moment_1.default)((0, exports.getNextDispatchDate)(settings, automation.triggerType));
        const delaySeconds = action.delayMinutes > 0
            ? action.delayMinutes * 60
            : calculateDelay(settings, messageCount);
        const scheduledAt = anchorMoment.clone().add(delaySeconds, "seconds").toDate();
        const execution = await AutomationExecution_1.default.create({
            automationId: automation.id,
            automationActionId: action.id,
            contactId: contact.id,
            ticketId: ticket?.id,
            scheduledAt,
            status: "scheduled",
            metadata: { actionType: action.actionType }
        });
        await AutomationLog_1.default.create({
            automationId: automation.id,
            contactId: contact.id,
            ticketId: ticket?.id,
            status: "pending",
            result: { executionId: execution.id, actionType: action.actionType }
        });
        if (action.actionType === "send_message") {
            messageCount++;
        }
    }
    logger_1.default.info(`[Automation] ${actions.length} ações agendadas para automação ${automation.id}, contato ${contact.id}`);
};
exports.processAutomationForContact = processAutomationForContact;
// Buscar automações por gatilho
const getAutomationsByTrigger = async (companyId, triggerType) => {
    return Automation_1.default.findAll({
        where: {
            companyId,
            triggerType,
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
};
exports.getAutomationsByTrigger = getAutomationsByTrigger;
