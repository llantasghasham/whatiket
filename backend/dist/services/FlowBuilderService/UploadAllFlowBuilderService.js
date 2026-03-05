"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowAudio_1 = require("../../models/FlowAudio");
const FlowImg_1 = require("../../models/FlowImg");
const UploadAllFlowBuilderService = async ({ userId, medias, companyId }) => {
    try {
        let itemsNewNames = [];
        let itemsUrls = [];
        for (let i = 0; medias.length > i; i++) {
            let nameFile = medias[i].filename;
            itemsNewNames = [...itemsNewNames, nameFile];
            itemsUrls = [...itemsUrls, `uploads/${nameFile}`];
            // Tratamento para imagens
            if (medias[i].mimetype.split("/")[1] === "png" ||
                medias[i].mimetype.split("/")[1] === "jpg" ||
                medias[i].mimetype.split("/")[1] === "jpeg") {
                await FlowImg_1.FlowImgModel.create({
                    userId: userId,
                    companyId: companyId,
                    name: nameFile
                });
            }
            // Tratamento para áudios (CORRIGIDO - removido MP4 daqui)
            else if (medias[i].mimetype === "audio/mp3" ||
                medias[i].mimetype === "audio/mpeg" ||
                medias[i].mimetype === "audio/ogg" ||
                medias[i].mimetype === "audio/mp4" ||
                medias[i].mimetype.split("/")[1] === "mp3" ||
                medias[i].mimetype.split("/")[1] === "ogg" ||
                medias[i].mimetype.split("/")[1] === "mpeg") {
                if (medias[i].mimetype.split("/")[1] === "mpeg") {
                    nameFile = nameFile.split(".")[0] + ".mp3";
                }
                await FlowAudio_1.FlowAudioModel.create({
                    userId: userId,
                    companyId: companyId,
                    name: nameFile
                });
            }
            // NOVO: Tratamento específico para vídeos
            else if (medias[i].mimetype.split("/")[0] === "video" ||
                medias[i].mimetype === "video/mp4" ||
                medias[i].mimetype === "video/webm" ||
                medias[i].mimetype === "video/mov" ||
                medias[i].mimetype === "video/avi" ||
                medias[i].mimetype === "video/quicktime") {
                await FlowImg_1.FlowImgModel.create({
                    userId: userId,
                    companyId: companyId,
                    name: nameFile
                });
            }
            // Tratamento para documentos e outros tipos
            else if (medias[i].mimetype === "application/pdf" ||
                medias[i].mimetype.includes("spreadsheetml") ||
                medias[i].mimetype.includes("wordprocessingml") ||
                medias[i].mimetype.includes("msword") ||
                medias[i].mimetype.includes("ms-excel") ||
                medias[i].mimetype.includes("application/vnd.") ||
                medias[i].mimetype.includes("application/")) {
                await FlowImg_1.FlowImgModel.create({
                    userId: userId,
                    companyId: companyId,
                    name: nameFile
                });
            }
        }
        return itemsUrls;
    }
    catch (error) {
        console.error("Erro ao inserir o arquivo:", error);
        return error;
    }
};
exports.default = UploadAllFlowBuilderService;
