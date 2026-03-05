"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookOfficial = exports.sendMessage = exports.removeOfficial = exports.updateOfficial = exports.storeOfficial = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const CreateWhatsAppService_1 = __importDefault(require("../services/WhatsappService/CreateWhatsAppService"));
const ShowWhatsAppService_1 = __importDefault(require("../services/WhatsappService/ShowWhatsAppService"));
const UpdateWhatsAppService_1 = __importDefault(require("../services/WhatsappService/UpdateWhatsAppService"));
const DeleteWhatsAppService_1 = __importDefault(require("../services/WhatsappService/DeleteWhatsAppService"));
const SendTextOfficialService_1 = require("../services/WhatsAppOfficial/SendTextOfficialService");
const SendMediaOfficialService_1 = require("../services/WhatsAppOfficial/SendMediaOfficialService");
const OfficialMessageListener_1 = require("../services/WhatsAppOfficial/OfficialMessageListener");
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Contact_1 = __importDefault(require("../models/Contact"));
const multer_1 = __importDefault(require("multer"));
const upload_1 = __importDefault(require("../config/upload"));
const graphApiHelper_1 = require("../services/WhatsappCoexistence/graphApiHelper");
const upload = (0, multer_1.default)(upload_1.default);
const validateOfficialCredentials = async ({ phoneNumberId, token }) => {
    if (!phoneNumberId || !token) {
        throw new AppError_1.default("ERR_OFFICIAL_MISSING_CREDENTIALS", 400);
    }
    try {
        await (0, graphApiHelper_1.graphRequest)(token, "get", `${phoneNumberId}?fields=id`);
    }
    catch (error) {
        const graphError = (0, graphApiHelper_1.extractGraphError)(error);
        throw new AppError_1.default(`ERR_OFFICIAL_CREDENTIALS_INVALID: ${graphError}`, 400);
    }
};
const storeOfficial = async (req, res) => {
    const { name, queueIds = [], greetingMessage, complationMessage, outOfHoursMessage, ratingMessage, isDefault = false, allowGroup = false, sendIdQueue, timeSendQueue, timeInactiveMessage, inactiveMessage, maxUseBotQueuesNPS, expiresTicketNPS, whenExpiresTicket, expiresInactiveMessage, groupAsTicket, importOldMessages, importRecentMessages, closedTicketsPostImported, importOldMessagesGroups, timeCreateNewTicket, schedules, promptId, collectiveVacationEnd, collectiveVacationMessage, collectiveVacationStart, queueIdImportMessages, flowIdNotPhrase, flowIdWelcome, coexistencePhoneNumberId, coexistenceWabaId, coexistencePermanentToken, messageRoutingMode = "automatic", routingRules = null } = req.body;
    const { companyId } = req.user;
    await validateOfficialCredentials({
        phoneNumberId: coexistencePhoneNumberId,
        token: coexistencePermanentToken
    });
    const { whatsapp } = await (0, CreateWhatsAppService_1.default)({
        name,
        status: "CONNECTED",
        isDefault,
        greetingMessage,
        complationMessage,
        outOfHoursMessage,
        ratingMessage,
        queueIds,
        companyId,
        channel: "whatsapp_official",
        allowGroup,
        sendIdQueue,
        timeSendQueue,
        timeInactiveMessage,
        inactiveMessage,
        maxUseBotQueuesNPS,
        expiresTicketNPS,
        whenExpiresTicket,
        expiresInactiveMessage,
        groupAsTicket,
        importOldMessages,
        importRecentMessages,
        closedTicketsPostImported,
        importOldMessagesGroups,
        timeCreateNewTicket,
        schedules,
        promptId,
        collectiveVacationEnd,
        collectiveVacationMessage,
        collectiveVacationStart,
        queueIdImportMessages,
        flowIdNotPhrase,
        flowIdWelcome
    });
    // Atualiza campos específicos da API oficial
    await whatsapp.update({
        coexistenceEnabled: true,
        coexistencePhoneNumberId,
        coexistenceWabaId,
        coexistencePermanentToken,
        messageRoutingMode,
        routingRules,
        businessAppConnected: false // Apenas API oficial, sem app
    });
    return res.status(200).json(whatsapp);
};
exports.storeOfficial = storeOfficial;
const updateOfficial = async (req, res) => {
    const { whatsappId } = req.params;
    const whatsappData = req.body;
    const { companyId } = req.user;
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
        throw new AppError_1.default("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
    }
    const { whatsapp: updated } = await (0, UpdateWhatsAppService_1.default)({
        whatsappData,
        whatsappId,
        companyId
    });
    // Atualiza campos específicos se enviados
    const { coexistencePhoneNumberId, coexistenceWabaId, coexistencePermanentToken, messageRoutingMode, routingRules } = req.body;
    if (coexistencePhoneNumberId || coexistenceWabaId || coexistencePermanentToken || messageRoutingMode || routingRules) {
        if (coexistencePhoneNumberId || coexistencePermanentToken) {
            await validateOfficialCredentials({
                phoneNumberId: coexistencePhoneNumberId || whatsapp.coexistencePhoneNumberId,
                token: coexistencePermanentToken || whatsapp.coexistencePermanentToken
            });
        }
        await updated.update({
            ...(coexistencePhoneNumberId && { coexistencePhoneNumberId }),
            ...(coexistenceWabaId && { coexistenceWabaId }),
            ...(coexistencePermanentToken && { coexistencePermanentToken }),
            ...(messageRoutingMode && { messageRoutingMode }),
            ...(routingRules && { routingRules })
        });
    }
    return res.status(200).json(updated);
};
exports.updateOfficial = updateOfficial;
const removeOfficial = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId, profile } = req.user;
    if (profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
        throw new AppError_1.default("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
    }
    await (0, DeleteWhatsAppService_1.default)(whatsappId);
    return res.status(200).json({ message: "WhatsApp Oficial removido" });
};
exports.removeOfficial = removeOfficial;
const sendMessage = async (req, res) => {
    const { body: message } = req.body;
    const { ticketId } = req.params;
    const medias = req.files;
    const { companyId } = req.user;
    const ticket = await Ticket_1.default.findByPk(ticketId, {
        include: [
            { model: Contact_1.default, as: "contact", attributes: ["number"] },
            { model: Whatsapp_1.default, as: "whatsapp", attributes: ["id", "token", "channel", "companyId", "coexistencePhoneNumberId", "coexistencePermanentToken"] }
        ]
    });
    if (!ticket || ticket.whatsapp.channel !== "whatsapp_official") {
        throw new AppError_1.default("ERR_OFFICIAL_TICKET_NOT_FOUND", 404);
    }
    try {
        if (medias && medias.length > 0) {
            await Promise.all(medias.map(async (media) => {
                await (0, SendMediaOfficialService_1.SendMediaOfficialService)({
                    media,
                    body: message,
                    ticketId: ticket.id,
                    contact: ticket.contact,
                    connection: ticket.whatsapp
                });
            }));
        }
        else {
            await (0, SendTextOfficialService_1.SendTextOfficialService)({
                body: message,
                ticketId: ticket.id,
                contact: ticket.contact,
                connection: ticket.whatsapp
            });
        }
        return res.status(200).json({ message: "Mensagem enviada com sucesso" });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ message: error });
    }
};
exports.sendMessage = sendMessage;
const webhookOfficial = async (req, res) => {
    const { "hub.verify-token": verifyToken, "hub.challenge": challenge } = req.query;
    // Webhook verification
    if (verifyToken) {
        const expectedToken = process.env.VERIFY_TOKEN || "meu_token_secreto";
        if (verifyToken !== expectedToken) {
            return res.status(403).send("Invalid verify token");
        }
        return res.status(200).send(challenge);
    }
    // Handle incoming messages
    try {
        await (0, OfficialMessageListener_1.OfficialMessageListener)(req.body);
        return res.status(200).send("EVENT_RECEIVED");
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        return res.status(500).send("ERROR");
    }
};
exports.webhookOfficial = webhookOfficial;
