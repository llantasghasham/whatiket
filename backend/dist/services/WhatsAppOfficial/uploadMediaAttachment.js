"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOfficialMedia = exports.officialMediaUpload = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const officialMediaUpload = async (req, res) => {
    const { whatsappId } = req.params;
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    if (!file) {
        throw new AppError_1.default("ERR_OFFICIAL_MEDIA_REQUIRED");
    }
    const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
    if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
        throw new AppError_1.default("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
    }
    try {
        whatsapp.greetingMediaAttachment = file.filename;
        await whatsapp.save();
        return res.status(200).json({ message: "Mídia oficial atualizada" });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
};
exports.officialMediaUpload = officialMediaUpload;
const deleteOfficialMedia = async (req, res) => {
    const { whatsappId } = req.params;
    const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
    if (!whatsapp || whatsapp.channel !== "whatsapp_official") {
        throw new AppError_1.default("ERR_OFFICIAL_CONNECTION_NOT_FOUND", 404);
    }
    const filePath = path_1.default.resolve("public", whatsapp.greetingMediaAttachment || "");
    const fileExists = fs_1.default.existsSync(filePath);
    if (fileExists) {
        fs_1.default.unlinkSync(filePath);
    }
    whatsapp.greetingMediaAttachment = null;
    await whatsapp.save();
    return res.status(200).json({ message: "Arquivo oficial excluído" });
};
exports.deleteOfficialMedia = deleteOfficialMedia;
