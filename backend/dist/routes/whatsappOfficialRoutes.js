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
const express_1 = __importDefault(require("express"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const multer_1 = __importDefault(require("multer"));
const upload_1 = __importDefault(require("../config/upload"));
const WhatsAppOfficialController = __importStar(require("../controllers/WhatsAppOfficialController"));
const uploadMediaAttachment_1 = require("../services/WhatsAppOfficial/uploadMediaAttachment");
const whatsappOfficialRoutes = express_1.default.Router();
const upload = (0, multer_1.default)(upload_1.default);
// CRUD da conexão oficial
whatsappOfficialRoutes.post("/whatsapp-official", isAuth_1.default, WhatsAppOfficialController.storeOfficial);
whatsappOfficialRoutes.put("/whatsapp-official/:whatsappId", isAuth_1.default, WhatsAppOfficialController.updateOfficial);
whatsappOfficialRoutes.delete("/whatsapp-official/:whatsappId", isAuth_1.default, WhatsAppOfficialController.removeOfficial);
// Envio de mensagens
whatsappOfficialRoutes.post("/whatsapp-official/:ticketId/message", isAuth_1.default, upload.array("medias"), WhatsAppOfficialController.sendMessage);
whatsappOfficialRoutes.post("/whatsapp-official/:whatsappId/media-upload", isAuth_1.default, upload.array("medias"), uploadMediaAttachment_1.officialMediaUpload);
whatsappOfficialRoutes.delete("/whatsapp-official/:whatsappId/media-upload", isAuth_1.default, uploadMediaAttachment_1.deleteOfficialMedia);
// Webhook do Meta (sem isAuth, pois é chamado pelo Facebook)
whatsappOfficialRoutes.get("/webhook/whatsapp-official", WhatsAppOfficialController.webhookOfficial);
whatsappOfficialRoutes.post("/webhook/whatsapp-official", WhatsAppOfficialController.webhookOfficial);
exports.default = whatsappOfficialRoutes;
