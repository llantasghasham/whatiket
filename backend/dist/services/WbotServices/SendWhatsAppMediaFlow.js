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
exports.typeSimulation = void 0;
const Sentry = __importStar(require("@sentry/node"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetTicketWbot_1 = __importDefault(require("../../helpers/GetTicketWbot"));
const mime_types_1 = __importDefault(require("mime-types"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const processAudio = async (audio) => {
    const outputAudio = `${publicFolder}/${new Date().getTime()}.ogg`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i "${audio}" -c:a libopus -b:a 32k -ar 48000 -ac 1 "${outputAudio}" -y`, (error, _stdout, _stderr) => {
            if (error) {
                console.error("Erro no processamento de áudio PTT:", error);
                reject(error);
            }
            else {
                console.log("Áudio PTT processado com sucesso:", outputAudio);
                resolve(outputAudio);
            }
        });
    });
};
const processAudioFile = async (audio) => {
    const outputAudio = `${publicFolder}/${new Date().getTime()}.m4a`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i "${audio}" -c:a aac -b:a 128k -ar 44100 -ac 2 -f mp4 "${outputAudio}" -y`, (error, _stdout, _stderr) => {
            if (error) {
                console.error("Erro no processamento de arquivo de áudio:", error);
                reject(error);
            }
            else {
                console.log("Arquivo de áudio processado com sucesso:", outputAudio);
                resolve(outputAudio);
            }
        });
    });
};
const nameFileDiscovery = (pathMedia) => path_1.default.basename(pathMedia);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const typeSimulation = async (ticket, presence) => {
    const wbot = await (0, GetTicketWbot_1.default)(ticket);
    let contact = await Contact_1.default.findOne({
        where: {
            id: ticket.contactId,
        }
    });
    await wbot.sendPresenceUpdate(presence, `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
    await delay(5000);
    await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
};
exports.typeSimulation = typeSimulation;
// Função para detectar se é vídeo baseado na extensão
const isVideoFile = (filePath) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    const ext = path_1.default.extname(filePath).toLowerCase();
    return videoExtensions.includes(ext);
};
const SendWhatsAppMediaFlow = async ({ media, ticket, body, isFlow = false, isRecord = false }) => {
    try {
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const mimetype = String(mime_types_1.default.lookup(media));
        const pathMedia = media;
        let typeMessage = mimetype.split("/")[0];
        const mediaName = nameFileDiscovery(media);
        // CORREÇÃO: Se o mime-types detectou como 'application' mas o arquivo é vídeo, corrigir
        if (typeMessage === "application" && isVideoFile(media)) {
            typeMessage = "video";
            console.log("CORREÇÃO APLICADA: Arquivo detectado como vídeo baseado na extensão");
        }
        console.log("=== DEBUG FLOWBUILDER VIDEO ===");
        console.log("Media path:", media);
        console.log("MIME type original:", mimetype);
        console.log("Type message corrigido:", typeMessage);
        console.log("Media name:", mediaName);
        console.log("É arquivo de vídeo:", isVideoFile(media));
        console.log("================================");
        let options;
        if (typeMessage === "video") {
            console.log("DETECTOU COMO VIDEO - OK!");
            options = {
                video: { url: pathMedia },
                caption: body,
                fileName: mediaName
                // gifPlayback: true
            };
        }
        else if (typeMessage === "audio") {
            console.log("DETECTOU COMO AUDIO");
            console.log('record', isRecord);
            if (isRecord) {
                const convert = await processAudio(pathMedia);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true
                };
                // Limpar arquivo temporário após uso
                fs_1.default.unlinkSync(convert);
            }
            else {
                const convert = await processAudioFile(pathMedia);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: "audio/mp4",
                    ptt: false
                };
                // Limpar arquivo temporário após uso
                fs_1.default.unlinkSync(convert);
            }
        }
        else if (typeMessage === "document" || typeMessage === "text") {
            console.log("DETECTOU COMO DOCUMENT/TEXT");
            options = {
                document: { url: pathMedia },
                caption: body,
                fileName: mediaName,
                mimetype: mimetype
            };
        }
        else if (typeMessage === "application") {
            console.log("DETECTOU COMO APPLICATION");
            options = {
                document: { url: pathMedia },
                caption: body,
                fileName: mediaName,
                mimetype: mimetype
            };
        }
        else {
            console.log("DETECTOU COMO IMAGEM");
            options = {
                image: { url: pathMedia },
                caption: body
            };
        }
        let contact = await Contact_1.default.findOne({
            where: {
                id: ticket.contactId,
            }
        });
        console.log("Enviando com opções:", Object.keys(options));
        const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            ...options
        });
        await ticket.update({ lastMessage: mediaName });
        return sentMessage;
    }
    catch (err) {
        Sentry.captureException(err);
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMediaFlow;
