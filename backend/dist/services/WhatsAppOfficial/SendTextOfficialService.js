"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTextOfficialService = void 0;
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const graphApiHelper_1 = require("../WhatsappCoexistence/graphApiHelper");
const SendTextOfficialService = async ({ body, ticketId, contact, connection }) => {
    if (!connection.coexistencePhoneNumberId || !connection.coexistencePermanentToken) {
        throw new Error("ERR_OFFICIAL_MISSING_CREDENTIALS");
    }
    console.log("[WhatsAppOfficial][SendTextOfficial] connection", {
        whatsappId: connection.id,
        phoneNumberId: connection.coexistencePhoneNumberId,
        wabaId: connection.coexistenceWabaId,
        companyId: connection.companyId
    });
    const payload = {
        messaging_product: "whatsapp",
        to: contact.number,
        text: { body }
    };
    try {
        const response = await (0, graphApiHelper_1.graphRequest)(connection.coexistencePermanentToken, "post", `${connection.coexistencePhoneNumberId}/messages`, payload);
        console.log("[WhatsAppOfficial][SendTextOfficial] graphResponse", {
            status: "success",
            messageId: response?.messages?.[0]?.id,
            raw: response
        });
        const messageId = response?.messages?.[0]?.id;
        if (!messageId) {
            throw new Error("ERR_OFFICIAL_NO_MESSAGE_ID");
        }
        const newMessage = await (0, CreateMessageService_1.default)({
            messageData: {
                wid: messageId,
                ticketId,
                body,
                fromMe: true,
                read: true,
                ack: 2
            },
            companyId: connection.companyId
        });
        return newMessage;
    }
    catch (error) {
        const graphError = (0, graphApiHelper_1.extractGraphError)(error);
        console.error("[WhatsAppOfficial][SendTextOfficial] graphError", {
            status: "error",
            message: graphError,
            payload
        });
        throw new Error(`ERR_OFFICIAL_SEND_TEXT: ${graphError}`);
    }
};
exports.SendTextOfficialService = SendTextOfficialService;
