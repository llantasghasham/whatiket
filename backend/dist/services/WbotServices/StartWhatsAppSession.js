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
exports.StartWhatsAppSession = void 0;
const wbot_1 = require("../../libs/wbot");
const wbotMessageListener_1 = require("./wbotMessageListener");
const socket_1 = require("../../libs/socket");
const wbotMonitor_1 = __importDefault(require("./wbotMonitor"));
const logger_1 = __importDefault(require("../../utils/logger"));
const Sentry = __importStar(require("@sentry/node"));
let useVoiceCallsBaileys = null;
try {
    useVoiceCallsBaileys = require("voice-calls-baileys").default || require("voice-calls-baileys").useVoiceCallsBaileys;
}
catch (e) {
    logger_1.default.warn("[WAVoIP] voice-calls-baileys não encontrado, chamadas de voz desabilitadas");
}
const StartWhatsAppSession = async (whatsapp, companyId) => {
    await whatsapp.update({ status: "OPENING" });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-whatsappSession`, {
        action: "update",
        session: whatsapp
    });
    try {
        const wbot = await (0, wbot_1.initWASocket)(whatsapp);
        if (wbot.id) {
            (0, wbotMessageListener_1.wbotMessageListener)(wbot, companyId);
            (0, wbotMonitor_1.default)(wbot, whatsapp, companyId);
            // Integrar WAVoIP Voice Calls se token configurado
            if (useVoiceCallsBaileys && whatsapp.wavoip) {
                try {
                    await useVoiceCallsBaileys(whatsapp.wavoip, wbot, "atendzappy", "open", true);
                    logger_1.default.info(`[WAVoIP] Voice calls ativado para WhatsApp ${whatsapp.name} (company ${companyId})`);
                }
                catch (voipErr) {
                    logger_1.default.error(`[WAVoIP] Erro ao iniciar voice calls: ${voipErr.message}`);
                }
            }
        }
    }
    catch (err) {
        Sentry.captureException(err);
        logger_1.default.error(err);
    }
};
exports.StartWhatsAppSession = StartWhatsAppSession;
