"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TutorialVideo_1 = __importDefault(require("../../models/TutorialVideo"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateTutorialVideoService = async ({ title, description, videoUrl, thumbnailUrl, companyId, userId }) => {
    // Validações
    if (!title || title.trim().length === 0) {
        throw new AppError_1.default("Título é obrigatório", 400);
    }
    if (!videoUrl || videoUrl.trim().length === 0) {
        throw new AppError_1.default("URL do vídeo é obrigatória", 400);
    }
    if (description && description.length > 300) {
        throw new AppError_1.default("Descrição deve ter no máximo 300 caracteres", 400);
    }
    const tutorialVideo = await TutorialVideo_1.default.create({
        title: title.trim(),
        description: description?.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl?.trim(),
        companyId,
        userId,
        isActive: true,
        viewsCount: 0
    });
    return tutorialVideo;
};
exports.default = CreateTutorialVideoService;
