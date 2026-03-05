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
// @ts-nocheck
const baileys_1 = require("@whiskeysockets/baileys");
const Sentry = __importStar(require("@sentry/node"));
const fs_1 = __importDefault(require("fs"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const CallRecord_1 = __importDefault(require("../../models/CallRecord"));
const logger_1 = __importDefault(require("../../utils/logger"));
const CreateOrUpdateBaileysService_1 = __importDefault(require("../BaileysServices/CreateOrUpdateBaileysService"));
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const socket_1 = require("../../libs/socket");
const path_1 = __importDefault(require("path"));
const wbotMessageListener_1 = require("./wbotMessageListener");
const FindOrCreateTicketService_1 = __importDefault(require("../TicketServices/FindOrCreateTicketService"));
let i = 0;
setInterval(() => {
    i = 0;
}, 5000);
const wbotMonitor = async (wbot, whatsapp, companyId) => {
    try {
        // Map para rastrear chamadas em andamento (callId -> startTime)
        const activeCalls = new Map();
        wbot.ws.on("CB:call", async (node) => {
            const content = node.content[0];
            const callId = content?.attrs?.["call-id"];
            const fromJid = node.attrs.from;
            if (!fromJid || fromJid.includes("@call"))
                return;
            await new Promise(r => setTimeout(r, i * 650));
            i++;
            const number = fromJid.split(":")[0].replace(/\D/g, "");
            const io = (0, socket_1.getIO)();
            try {
                // Buscar contato
                const contact = await Contact_1.default.findOne({
                    where: { companyId, number },
                });
                // === OFFER: Chamada recebida (tocando) ===
                if (content.tag === "offer") {
                    const callType = content.attrs?.["call-type"] === "video" ? "video" : "voice";
                    activeCalls.set(callId, new Date());
                    logger_1.default.info(`[CallRecord] Chamada ${callType} recebida de ${number} (callId: ${callId})`);
                    // Criar registro da chamada como "ringing"
                    const callRecord = await CallRecord_1.default.create({
                        callId,
                        type: "incoming",
                        status: "ringing",
                        fromNumber: number,
                        toNumber: whatsapp.number || "",
                        duration: 0,
                        contactId: contact?.id || null,
                        whatsappId: whatsapp.id,
                        companyId,
                        callStartedAt: new Date(),
                    });
                    // Emitir evento socket para atualização em tempo real
                    io.of(String(companyId)).emit(`company-${companyId}-call`, {
                        action: "ringing",
                        callRecord: {
                            ...callRecord.toJSON(),
                            contact: contact ? { id: contact.id, name: contact.name, number: contact.number, profilePicUrl: contact.profilePicUrl } : null,
                        },
                    });
                }
                // === TERMINATE: Chamada encerrada ===
                if (content.tag === "terminate") {
                    const startTime = activeCalls.get(callId);
                    const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0;
                    activeCalls.delete(callId);
                    // Determinar status da chamada
                    const reason = content.attrs?.reason;
                    let callStatus = "missed";
                    if (reason === "busy")
                        callStatus = "busy";
                    else if (reason === "timeout")
                        callStatus = "missed";
                    else if (duration > 3)
                        callStatus = "answered";
                    logger_1.default.info(`[CallRecord] Chamada encerrada de ${number} - status: ${callStatus}, duração: ${duration}s (callId: ${callId})`);
                    // Atualizar ou criar registro da chamada
                    const existingRecord = await CallRecord_1.default.findOne({ where: { callId, companyId } });
                    if (existingRecord) {
                        await existingRecord.update({
                            status: callStatus,
                            duration,
                            callEndedAt: new Date(),
                        });
                    }
                    else {
                        await CallRecord_1.default.create({
                            callId,
                            type: "incoming",
                            status: callStatus,
                            fromNumber: number,
                            toNumber: whatsapp.number || "",
                            duration,
                            contactId: contact?.id || null,
                            whatsappId: whatsapp.id,
                            companyId,
                            callStartedAt: startTime || new Date(),
                            callEndedAt: new Date(),
                        });
                    }
                    // Buscar registro atualizado para emitir
                    const updatedRecord = await CallRecord_1.default.findOne({
                        where: { callId, companyId },
                        include: [{ model: Contact_1.default, as: "contact", attributes: ["id", "name", "number", "profilePicUrl"] }],
                    });
                    io.of(String(companyId)).emit(`company-${companyId}-call`, {
                        action: "ended",
                        callRecord: updatedRecord,
                    });
                    // Manter comportamento existente: enviar mensagem automática
                    const settings = await CompaniesSettings_1.default.findOne({
                        where: { companyId },
                    });
                    if (settings?.acceptCallWhatsapp === "enabled") {
                        const sentMessage = await wbot.sendMessage(fromJid, {
                            text: `\u200e ${settings.AcceptCallWhatsappMessage}`,
                        });
                        if (!contact)
                            return;
                        const ticket = await (0, FindOrCreateTicketService_1.default)(contact, whatsapp, 0, companyId, undefined, undefined, undefined, "whatsapp", false, false, settings);
                        if (!ticket)
                            return;
                        // Vincular ticket ao registro de chamada
                        if (updatedRecord) {
                            await updatedRecord.update({ ticketId: ticket.id });
                        }
                        await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, contact);
                        const date = new Date();
                        const hours = date.getHours();
                        const minutes = date.getMinutes();
                        const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;
                        const messageData = {
                            wid: callId,
                            ticketId: ticket.id,
                            contactId: contact.id,
                            body,
                            fromMe: false,
                            mediaType: "call_log",
                            read: true,
                            quotedMsgId: null,
                            ack: 1,
                        };
                        await ticket.update({ lastMessage: body });
                        return (0, CreateMessageService_1.default)({ messageData, companyId });
                    }
                }
            }
            catch (err) {
                logger_1.default.error(`[CallRecord] Erro ao processar chamada: ${err.message}`);
                Sentry.captureException(err);
            }
        });
        function cleanStringForJSON(str) {
            // Remove caracteres de controle, ", \ e '
            return str.replace(/[\x00-\x1F"\\']/g, "");
        }
        wbot.ev.on("contacts.upsert", async (contacts) => {
            const filteredContacts = [];
            try {
                Promise.all(contacts.map(async (contact) => {
                    if (!(0, baileys_1.isJidBroadcast)(contact.id) &&
                        !(0, baileys_1.isJidStatusBroadcast)(contact.id) &&
                        !!(0, baileys_1.isLidUser)(contact.id)) {
                        const contactArray = {
                            'id': contact.id,
                            'name': contact.name ? cleanStringForJSON(contact.name) : contact.id.split('@')[0].split(':')[0]
                        };
                        filteredContacts.push(contactArray);
                    }
                }));
                const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                if (!fs_1.default.existsSync(path_1.default.join(publicFolder, `company${companyId}`))) {
                    fs_1.default.mkdirSync(path_1.default.join(publicFolder, `company${companyId}`), { recursive: true });
                    fs_1.default.chmodSync(path_1.default.join(publicFolder, `company${companyId}`), 0o777);
                }
                const contatcJson = path_1.default.join(publicFolder, `company${companyId}`, "contactJson.txt");
                if (fs_1.default.existsSync(contatcJson)) {
                    await fs_1.default.unlinkSync(contatcJson);
                }
                await fs_1.default.promises.writeFile(contatcJson, JSON.stringify(filteredContacts, null, 2));
            }
            catch (err) {
                Sentry.captureException(err);
                logger_1.default.error(`Erro contacts.upsert: ${JSON.stringify(err)}`);
            }
            try {
                await (0, CreateOrUpdateBaileysService_1.default)({
                    whatsappId: whatsapp.id,
                    contacts: filteredContacts,
                });
            }
            catch (err) {
                console.log(filteredContacts);
                logger_1.default.error(err);
            }
        });
    }
    catch (err) {
        Sentry.captureException(err);
        logger_1.default.error(err);
    }
};
exports.default = wbotMonitor;
