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
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Message_1 = __importDefault(require("../../models/Message"));
const graphAPI_1 = require("./graphAPI");
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
/** Obtiene PSID desde mensajes entrantes si contact.number no es válido */
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
const sendFacebookMessage = async ({ body, ticket, quotedMsg }) => {
    const conn = ticket.whatsapp;
    const token = conn?.facebookUserToken;
    const connName = conn?.name || "?";
    const connId = conn?.id;
    const pageId = conn?.facebookPageUserId || "?";
    const channel = ticket.channel || conn?.channel || "?";
    // Para Facebook/Instagram, recipient.id debe ser el PSID (Page-Scoped ID), no teléfono
    let recipientId = ticket.contact?.number;
    if (recipientId != null) {
        recipientId = String(recipientId).trim();
    }
    const isValidPsid = recipientId && recipientId !== "undefined" && recipientId !== "null" && /^\d+$/.test(recipientId);
    // Fallback: si contact.number no es PSID válido, intentar obtenerlo de mensajes entrantes
    if (!isValidPsid) {
        const psidFromMsg = await getPsidFromMessages(ticket.id);
        if (psidFromMsg) {
            recipientId = psidFromMsg;
            console.log("[FB_SEND] Usando PSID desde mensaje entrante | ticketId:", ticket.id, "| psid:", recipientId);
            // Actualizar contacto para futuros envíos
            if (ticket.contact?.id) {
                const Contact = (await Promise.resolve().then(() => __importStar(require("../../models/Contact")))).default;
                await Contact.update({ number: psidFromMsg }, { where: { id: ticket.contact.id } });
            }
        }
    }
    if (!recipientId || recipientId === "undefined" || recipientId === "null") {
        console.error("[FB_SEND] ABORT - recipient[id] inválido | contactId:", ticket.contact?.id, "| number:", ticket.contact?.number);
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG: El contacto no tiene PSID válido. " +
            "Si el ticket fue transferido o el contacto importado, pida al usuario que envíe un nuevo mensaje por Facebook/Instagram para actualizar el ID.");
    }
    if (!/^\d+$/.test(recipientId)) {
        console.error("[FB_SEND] ABORT - recipient no es PSID válido (debe ser numérico) | contact.number:", recipientId);
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG: El contacto tiene número de teléfono en lugar de PSID. Solo se puede responder a contactos que escribieron por Facebook/Instagram.");
    }
    const tokenPreview = token
        ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
        : "NULL";
    console.log("[FB_SEND] INICIO | channel:", channel, "| conexion:", connName, "(id:", connId, ")", "| pageId:", pageId, "| recipient:", recipientId, "| token:", tokenPreview);
    if (!token) {
        console.error("[FB_SEND] ABORT - Conexión sin token | conexion:", connName, "| ticketId:", ticket.id);
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
    try {
        const send = await (0, graphAPI_1.sendText)(recipientId, (0, Mustache_1.default)(body, ticket), token);
        await ticket.update({ lastMessage: body });
        console.log("[FB_SEND] OK | conexion:", connName, "| recipient:", recipientId);
        return send;
    }
    catch (err) {
        const metaData = err?.response?.data?.error || {};
        const metaMsg = metaData.message || err?.message;
        const metaCode = metaData.code || err?.response?.status;
        const metaSubcode = metaData.error_subcode;
        console.error("[FB_SEND] FAIL | conexion:", connName, "| recipient:", recipientId, "| code:", metaCode, "| subcode:", metaSubcode, "| Meta:", metaMsg);
        console.error("[FB_SEND] error.response.data:", JSON.stringify(err?.response?.data || {}));
        // Pasar mensaje de Meta al frontend para diagnóstico
        const userMsg = metaMsg || "Error al enviar mensaje a Facebook/Instagram";
        throw new AppError_1.default(`ERR_SENDING_FACEBOOK_MSG: ${userMsg}`);
    }
};
exports.default = sendFacebookMessage;
