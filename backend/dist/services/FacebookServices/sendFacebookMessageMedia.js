"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFacebookMessageFileExternal = exports.sendFacebookMessageMediaExternal = exports.sendFacebookMessageMedia = exports.typeAttachment = void 0;
const fs_1 = __importDefault(require("fs"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Message_1 = __importDefault(require("../../models/Message"));
const graphAPI_1 = require("./graphAPI");
const UrlService_1 = require("../SettingService/UrlService");
/** Obtiene PSID desde mensajes entrantes (misma lógica que sendFacebookMessage) */
const getPsidFromMessages = async (ticketId) => {
    const messages = await Message_1.default.findAll({
        where: { ticketId, fromMe: false },
        order: [["id", "DESC"]],
        attributes: ["dataJson"],
        limit: 10
    });
    for (const msg of messages) {
        if (!msg?.dataJson)
            continue;
        try {
            const data = typeof msg.dataJson === "string" ? JSON.parse(msg.dataJson) : msg.dataJson;
            const psid = data?.sender?.id ?? data?.senderId ?? data?.sender_id;
            if (psid && /^\d+$/.test(String(psid)))
                return String(psid);
        }
        catch {
            continue;
        }
    }
    return null;
};
const resolveRecipientId = async (ticket) => {
    let recipientId = ticket.contact?.number ? String(ticket.contact.number).trim() : "";
    const isValidPsid = recipientId && recipientId !== "undefined" && recipientId !== "null" && /^\d+$/.test(recipientId);
    if (!isValidPsid) {
        const psidFromMsg = await getPsidFromMessages(ticket.id);
        if (psidFromMsg) {
            recipientId = psidFromMsg;
            if (ticket.contact?.id) {
                const Contact = (await Promise.resolve().then(() => __importStar(require("../../models/Contact")))).default;
                await Contact.update({ number: psidFromMsg }, { where: { id: ticket.contact.id } });
            }
        }
    }
    if (!recipientId || !/^\d+$/.test(recipientId)) {
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG: El contacto no tiene PSID válido. Pida al usuario que envíe un nuevo mensaje por Facebook/Instagram.");
    }
    return recipientId;
};
const typeAttachment = (media) => {
    if (media.mimetype.includes("image")) {
        return "image";
    }
    if (media.mimetype.includes("video")) {
        return "video";
    }
    if (media.mimetype.includes("audio")) {
        return "audio";
    }
    return "file";
};
exports.typeAttachment = typeAttachment;
const sendFacebookMessageMedia = async ({ media, ticket, body }) => {
    try {
        const recipientId = await resolveRecipientId(ticket);
        const type = (0, exports.typeAttachment)(media);
        const backendUrl = await (0, UrlService_1.getBackendUrl)(ticket.companyId);
        const domain = `${backendUrl}/public/company${ticket.companyId}/${media.filename}`;
        const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(recipientId, domain, type, ticket.whatsapp.facebookUserToken);
        await ticket.update({ lastMessage: media.filename });
        fs_1.default.unlinkSync(media.path);
        return sendMessage;
    }
    catch (err) {
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
};
exports.sendFacebookMessageMedia = sendFacebookMessageMedia;
const sendFacebookMessageMediaExternal = async ({ url, ticket, body }) => {
    try {
        const recipientId = await resolveRecipientId(ticket);
        const type = "image";
        // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`
        const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(recipientId, url, type, ticket.whatsapp.facebookUserToken);
        const randomName = Math.random().toString(36).substring(7);
        await ticket.update({ lastMessage: body || `${randomName}.jpg}` });
        // fs.unlinkSync(media.path);
        return sendMessage;
    }
    catch (err) {
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
};
exports.sendFacebookMessageMediaExternal = sendFacebookMessageMediaExternal;
const sendFacebookMessageFileExternal = async ({ url, ticket, body }) => {
    try {
        const recipientId = await resolveRecipientId(ticket);
        const type = "file";
        // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`
        const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(recipientId, url, type, ticket.whatsapp.facebookUserToken);
        const randomName = Math.random().toString(36).substring(7);
        await ticket.update({ lastMessage: body || `${randomName}.pdf}` });
        // fs.unlinkSync(media.path);
        return sendMessage;
    }
    catch (err) {
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
};
exports.sendFacebookMessageFileExternal = sendFacebookMessageFileExternal;
