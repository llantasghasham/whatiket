"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMediaOfficialService = void 0;
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const graphApiHelper_1 = require("../WhatsappCoexistence/graphApiHelper");
const file_type_1 = __importDefault(require("file-type"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const verifyExtensionFile = async (media) => {
    const resultFile = await file_type_1.default.fromFile(media.path);
    const havePoint = media.filename.includes(".");
    const actualExtension = media.filename.split(".").pop();
    const extension = resultFile?.ext || havePoint ? actualExtension : "withoutExtension";
    let newFilename = media.filename;
    if (actualExtension && actualExtension !== extension && havePoint) {
        newFilename = media.filename.replace(actualExtension, extension);
        const newPath = (0, path_1.join)(media.destination, newFilename);
        await (0, promises_1.rename)(media.path, newPath);
    }
    else if (!havePoint) {
        newFilename = `${media.filename}.${extension}`;
        const newPath = (0, path_1.join)(media.destination, newFilename);
        await (0, promises_1.rename)(media.path, newPath);
    }
    media.filename = newFilename;
    media.originalname = newFilename;
};
const SendMediaOfficialService = async ({ media, body, ticketId, contact, connection, passVerification = false }) => {
    if (!passVerification)
        await verifyExtensionFile(media);
    if (!connection.coexistencePhoneNumberId || !connection.coexistencePermanentToken) {
        throw new Error("ERR_OFFICIAL_MISSING_CREDENTIALS");
    }
    console.log("[WhatsAppOfficial][SendMediaOfficial] connection", {
        whatsappId: connection.id,
        phoneNumberId: connection.coexistencePhoneNumberId,
        wabaId: connection.coexistenceWabaId,
        companyId: connection.companyId
    });
    // Upload media to Graph API first
    const uploadPayload = {
        file: media.path,
        type: media.mimetype
    };
    let mediaId;
    try {
        const uploadRes = await (0, graphApiHelper_1.graphRequest)(connection.coexistencePermanentToken, "post", `${connection.coexistencePhoneNumberId}/media`, uploadPayload);
        mediaId = uploadRes.id;
    }
    catch (error) {
        const graphError = (0, graphApiHelper_1.extractGraphError)(error);
        console.error("[WhatsAppOfficial][SendMediaOfficial] graphError", {
            status: "error",
            message: graphError,
            payload: uploadPayload
        });
        throw new Error(`ERR_OFFICIAL_MEDIA_UPLOAD: ${graphError}`);
    }
    // Determine message type based on mime
    const mediaType = media.mimetype.split("/")[0]; // image, video, audio, document
    const messagePayload = {
        messaging_product: "whatsapp",
        to: contact.number,
        [mediaType]: {
            id: mediaId
        }
    };
    if (body) {
        messagePayload.caption = body;
    }
    try {
        const response = await (0, graphApiHelper_1.graphRequest)(connection.coexistencePermanentToken, "post", `${connection.coexistencePhoneNumberId}/messages`, messagePayload);
        console.log("[WhatsAppOfficial][SendMediaOfficial] graphResponse", {
            status: "success",
            mediaType,
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
                mediaType: media.mimetype.split("/")[0],
                mediaUrl: mediaId
            },
            companyId: connection.companyId
        });
        return newMessage;
    }
    catch (error) {
        const graphError = (0, graphApiHelper_1.extractGraphError)(error);
        console.error("[WhatsAppOfficial][SendMediaOfficial] graphError", {
            status: "error",
            message: graphError,
            payload: messagePayload
        });
        throw new Error(`ERR_OFFICIAL_SEND_MEDIA: ${graphError}`);
    }
};
exports.SendMediaOfficialService = SendMediaOfficialService;
