"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const User_1 = __importDefault(require("../../models/User"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Plan_1 = __importDefault(require("../../models/Plan"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Company_1 = __importDefault(require("../../models/Company"));
const QueueIntegrations_1 = __importDefault(require("../../models/QueueIntegrations"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const ShowUserService_1 = __importDefault(require("../UserServices/ShowUserService"));
const normalizeEnabled = (value) => {
    if (typeof value === "string") {
        const normalized = value.toLowerCase();
        return ["enabled", "enable", "true", "1"].includes(normalized);
    }
    return Boolean(value);
};
const ShowTicketService = async (id, companyId, userId) => {
    // Buscando o ticket com a inclusão do modelo do WhatsApp
    // @ts-ignore
    const ticket = await Ticket_1.default.findOne({
        where: {
            id,
            companyId
        },
        attributes: [
            "id",
            "uuid",
            "queueId",
            "lastFlowId",
            "flowStopped",
            "dataWebhook",
            "flowWebhook",
            "isGroup",
            "channel",
            "status",
            "contactId",
            "useIntegration",
            "lastMessage",
            "updatedAt",
            "unreadMessages",
            "companyId",
            "whatsappId",
            "imported",
            "lgpdAcceptedAt",
            "amountUsedBotQueues",
            "useIntegration",
            "integrationId",
            "userId",
            "amountUsedBotQueuesNPS",
            "lgpdSendMessageAt",
            "isBot",
            "typebotSessionId",
            "typebotStatus",
            "sendInactiveMessage",
            "queueId",
            "fromMe",
            "isOutOfHour",
            "isActiveDemand",
            "typebotSessionTime",
            "crmLeadId",
            "crmClientId",
            "leadValue"
        ],
        include: [
            {
                model: Contact_1.default,
                as: "contact",
                attributes: [
                    "id",
                    "companyId",
                    "name",
                    "number",
                    "email",
                    "profilePicUrl",
                    "acceptAudioMessage",
                    "active",
                    "disableBot",
                    "remoteJid",
                    "urlPicture",
                    "lgpdAcceptedAt",
                    "cpfCnpj",
                    "address",
                    "birthday",
                    "anniversary"
                ],
                include: [
                    "extraInfo",
                    "tags",
                    {
                        association: "wallets",
                        attributes: ["id", "name"]
                    }
                ]
            },
            {
                model: Queue_1.default,
                as: "queue",
                attributes: ["id", "name", "color"],
                include: ["chatbots"]
            },
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name"]
            },
            {
                model: Tag_1.default,
                as: "tags",
                attributes: ["id", "name", "color", "kanban"]
            },
            {
                model: Whatsapp_1.default,
                as: "whatsapp",
                attributes: [
                    "id",
                    "name",
                    "groupAsTicket",
                    "greetingMediaAttachment",
                    "facebookUserToken",
                    "facebookUserId",
                    "facebookPageUserId",
                    "channel",
                    "status",
                    "wavoip"
                ]
            },
            {
                model: Company_1.default,
                as: "company",
                attributes: ["id", "name"],
                include: [
                    {
                        model: Plan_1.default,
                        as: "plan",
                        attributes: ["id", "name", "useKanban"]
                    }
                ]
            },
            {
                model: QueueIntegrations_1.default,
                as: "queueIntegration",
                attributes: ["id", "name"]
            },
            {
                model: TicketTag_1.default,
                as: "ticketTags",
                attributes: ["tagId"]
            },
            {
                model: CrmLead_1.default,
                as: "crmLead",
                attributes: [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "leadStatus",
                    "status",
                    "convertedClientId"
                ]
            },
            {
                model: CrmClient_1.default,
                as: "crmClient",
                attributes: [
                    "id",
                    "name",
                    "document",
                    "email",
                    "phone",
                    "status",
                    "contactId"
                ]
            }
        ]
    });
    // Validando se a consulta é para a empresa certa
    if (ticket?.companyId !== companyId) {
        throw new AppError_1.default("Não é possível consultar registros de outra empresa");
    }
    // Validando se o ticket foi encontrado
    if (!ticket) {
        throw new AppError_1.default("ERR_NO_TICKET_FOUND", 404);
    }
    if (userId) {
        const user = await (0, ShowUserService_1.default)(userId, companyId);
        const hasAllTicketPermission = normalizeEnabled(user.allTicket);
        const hasAllUserChatPermission = normalizeEnabled(user.allUserChat);
        const hasAllQueuesPermission = normalizeEnabled(user.allHistoric);
        const canSeeOtherUsersTickets = hasAllUserChatPermission || hasAllTicketPermission;
        const userQueueIds = (user.queues || []).map(queue => queue.id);
        const belongsToAllowedQueue = ticket.queueId === null
            ? hasAllTicketPermission
            : userQueueIds.includes(ticket.queueId) || hasAllQueuesPermission;
        const isTicketAssignedToAnotherUser = ticket.userId && ticket.userId !== user.id;
        const cannotSeeTicket = (!belongsToAllowedQueue && !canSeeOtherUsersTickets) ||
            (isTicketAssignedToAnotherUser && !canSeeOtherUsersTickets);
        if (cannotSeeTicket) {
            throw new AppError_1.default("ERR_NO_PERMISSION", 403);
        }
    }
    // Exibindo dados do WhatsApp
    if (ticket?.whatsapp) {
        // Acessando o wavoip do WhatsApp associado ao ticket
        console.log("Whatsapp wavoip:", ticket.whatsapp.wavoip);
    }
    else {
        console.log("Whatsapp não encontrado.");
    }
    // Garantir que campos críticos nunca sejam null (compatibilidade com frontend)
    const ticketJSON = ticket.toJSON();
    // Se user for null, criar objeto placeholder
    if (!ticketJSON.user) {
        ticketJSON.user = { id: null, name: "Sem usuário" };
    }
    // Se queue for null, criar objeto placeholder
    if (!ticketJSON.queue) {
        ticketJSON.queue = { id: null, name: "Sem fila", color: "#999", chatbots: [] };
    }
    // Se contact for null, criar objeto placeholder completo
    if (!ticketJSON.contact) {
        ticketJSON.contact = {
            id: null,
            name: "Contato removido",
            number: "",
            email: null,
            profilePicUrl: null,
            acceptAudioMessage: false,
            active: true,
            disableBot: false,
            remoteJid: null,
            urlPicture: null,
            lgpdAcceptedAt: null,
            extraInfo: [],
            tags: [],
            wallets: []
        };
    }
    else {
        // Garantir que arrays dentro de contact existam
        if (!ticketJSON.contact.extraInfo)
            ticketJSON.contact.extraInfo = [];
        if (!ticketJSON.contact.tags)
            ticketJSON.contact.tags = [];
        if (!ticketJSON.contact.wallets)
            ticketJSON.contact.wallets = [];
    }
    // Garantir que tags seja sempre um array e filtrar nulls
    if (!ticketJSON.tags || !Array.isArray(ticketJSON.tags)) {
        ticketJSON.tags = [];
    }
    else {
        // Filtrar tags nulas ou inválidas e garantir que tenham os campos necessários
        ticketJSON.tags = ticketJSON.tags
            .filter((tag) => tag && tag.name)
            .map((tag) => ({
            id: tag.id || null,
            name: tag.name || "Tag sem nome",
            color: tag.color || "#999999"
        }));
    }
    // Garantir que whatsapp não seja null
    if (!ticketJSON.whatsapp) {
        ticketJSON.whatsapp = {
            id: null,
            name: "WhatsApp desconectado",
            groupAsTicket: null,
            greetingMediaAttachment: null,
            facebookUserToken: null,
            facebookUserId: null,
            status: "DISCONNECTED",
            wavoip: null
        };
    }
    // Garantir que company e plan existam
    if (!ticketJSON.company) {
        ticketJSON.company = {
            id: companyId,
            name: "Empresa",
            plan: { id: null, name: "Plano", useKanban: false }
        };
    }
    else if (!ticketJSON.company.plan) {
        ticketJSON.company.plan = { id: null, name: "Plano", useKanban: false };
    }
    // Garantir que queueIntegration exista
    if (!ticketJSON.queueIntegration) {
        ticketJSON.queueIntegration = null;
    }
    // Garantir que ticketTags seja um array
    if (!ticketJSON.ticketTags || !Array.isArray(ticketJSON.ticketTags)) {
        ticketJSON.ticketTags = [];
    }
    // Criar um novo objeto ticket com os dados seguros
    const safeTicket = Object.create(ticket);
    safeTicket.toJSON = function () {
        return ticketJSON;
    };
    return safeTicket;
};
exports.default = ShowTicketService;
