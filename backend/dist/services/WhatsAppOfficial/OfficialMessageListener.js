"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficialMessageListener = void 0;
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const CreateOrUpdateTicketService_1 = __importDefault(require("../../HubEcosystem/services/CreateOrUpdateTicketService"));
const FindOrCreateContactService_1 = __importDefault(require("../../HubEcosystem/services/FindOrCreateContactService"));
const OfficialMessageListener = async (body) => {
    if (!body.entry || !Array.isArray(body.entry))
        return;
    for (const entryItem of body.entry) {
        const { changes } = entryItem;
        if (!changes || !Array.isArray(changes))
            continue;
        for (const change of changes) {
            if (change.field !== "messages")
                continue;
            const { value } = change;
            if (!value.messages || !Array.isArray(value.messages))
                continue;
            // Find connection by phone number ID
            const connection = await Whatsapp_1.default.findOne({
                where: {
                    coexistencePhoneNumberId: value.metadata.phone_number_id,
                    channel: "whatsapp_official"
                }
            });
            if (!connection) {
                console.warn("Connection not found for phone number ID:", value.metadata.phone_number_id);
                continue;
            }
            for (const message of value.messages) {
                // Ignore outgoing messages
                if (!message.from)
                    continue;
                const from = message.from;
                const messageId = message.id;
                const timestamp = new Date(parseInt(message.timestamp) * 1000);
                // Extract content based on type
                let body = "";
                let mediaUrl = "";
                let mediaType = "";
                let fileName = "";
                switch (message.type) {
                    case "text":
                        body = message.text?.body || "";
                        break;
                    case "image":
                        body = message.image?.caption || "";
                        mediaUrl = message.image?.id || "";
                        mediaType = "image";
                        break;
                    case "video":
                        body = message.video?.caption || "";
                        mediaUrl = message.video?.id || "";
                        mediaType = "video";
                        break;
                    case "audio":
                        mediaUrl = message.audio?.id || "";
                        mediaType = "audio";
                        break;
                    case "document":
                        body = message.document?.caption || "";
                        mediaUrl = message.document?.id || "";
                        mediaType = "document";
                        fileName = message.document?.filename || "";
                        break;
                }
                try {
                    // Find or create contact
                    const contact = await (0, FindOrCreateContactService_1.default)({
                        name: "",
                        firstName: "",
                        lastName: "",
                        picture: "",
                        from,
                        connection
                    });
                    // Create or update ticket
                    const ticket = await (0, CreateOrUpdateTicketService_1.default)({
                        contactId: contact.id,
                        channel: "whatsapp_official",
                        contents: [{ type: message.type, text: body }],
                        connection
                    });
                    // Create message record
                    const messageData = {
                        contactId: contact.id,
                        body: body || `Mídia ${message.type}`,
                        ticketId: ticket.id,
                        fromMe: false,
                        companyId: connection.companyId,
                        messageId,
                        ack: 1,
                        read: false
                    };
                    if (mediaUrl) {
                        messageData.mediaUrl = mediaUrl;
                        messageData.mediaType = mediaType;
                        if (fileName)
                            messageData.fileName = fileName;
                    }
                    await (0, CreateMessageService_1.default)(messageData);
                    console.log("Official message processed:", { from, body, messageId, ticketId: ticket.id });
                }
                catch (error) {
                    console.error("Error processing official message:", error);
                }
            }
        }
    }
};
exports.OfficialMessageListener = OfficialMessageListener;
