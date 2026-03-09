"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const graphAPI_1 = require("./graphAPI");
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const sendFacebookMessage = async ({ body, ticket, quotedMsg }) => {
    const { number } = ticket.contact;
    const conn = ticket.whatsapp;
    const token = conn?.facebookUserToken;
    const connName = conn?.name || "?";
    const connId = conn?.id;
    const pageId = conn?.facebookPageUserId || "?";
    const channel = ticket.channel || conn?.channel || "?";
    // Log obligatorio pre-envío
    const tokenPreview = token
        ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
        : "NULL";
    console.log("[FB_SEND] INICIO | channel:", channel, "| conexion:", connName, "(id:", connId, ")", "| pageId:", pageId, "| recipient:", number, "| token:", tokenPreview);
    if (!token) {
        console.error("[FB_SEND] ABORT - Conexión sin token | conexion:", connName, "| ticketId:", ticket.id);
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
    try {
        const send = await (0, graphAPI_1.sendText)(number, (0, Mustache_1.default)(body, ticket), token);
        await ticket.update({ lastMessage: body });
        console.log("[FB_SEND] OK | conexion:", connName, "| recipient:", number);
        return send;
    }
    catch (err) {
        const metaData = err?.response?.data?.error || {};
        const metaMsg = metaData.message || err?.message;
        const metaCode = metaData.code || err?.response?.status;
        const metaSubcode = metaData.error_subcode;
        console.error("[FB_SEND] FAIL | conexion:", connName, "| recipient:", number, "| code:", metaCode, "| subcode:", metaSubcode, "| Meta:", metaMsg);
        console.error("[FB_SEND] error.response.data:", JSON.stringify(err?.response?.data || {}));
        // Pasar mensaje de Meta al frontend para diagnóstico
        const userMsg = metaMsg || "Error al enviar mensaje a Facebook/Instagram";
        throw new AppError_1.default(`ERR_SENDING_FACEBOOK_MSG: ${userMsg}`);
    }
};
exports.default = sendFacebookMessage;
