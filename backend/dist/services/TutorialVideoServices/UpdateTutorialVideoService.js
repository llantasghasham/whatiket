"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowTutorialVideoService_1 = __importDefault(require("./ShowTutorialVideoService"));
const UpdateTutorialVideoService = async ({ tutorialVideoData, tutorialVideoId, companyId }) => {
    const tutorialVideo = await (0, ShowTutorialVideoService_1.default)({
        id: tutorialVideoId,
        companyId
    });
    // Validações
    if (tutorialVideoData.title !== undefined) {
        if (!tutorialVideoData.title || tutorialVideoData.title.trim().length === 0) {
            throw new AppError_1.default("Título é obrigatório", 400);
        }
    }
    if (tutorialVideoData.description !== undefined && tutorialVideoData.description) {
        if (tutorialVideoData.description.length > 300) {
            throw new AppError_1.default("Descrição deve ter no máximo 300 caracteres", 400);
        }
    }
    // Preparar dados para atualização
    const updateData = {};
    if (tutorialVideoData.title !== undefined) {
        updateData.title = tutorialVideoData.title.trim();
    }
    if (tutorialVideoData.description !== undefined) {
        updateData.description = tutorialVideoData.description?.trim();
    }
    if (tutorialVideoData.videoUrl !== undefined) {
        updateData.videoUrl = tutorialVideoData.videoUrl?.trim();
    }
    if (tutorialVideoData.thumbnailUrl !== undefined) {
        updateData.thumbnailUrl = tutorialVideoData.thumbnailUrl?.trim();
    }
    if (tutorialVideoData.isActive !== undefined) {
        updateData.isActive = tutorialVideoData.isActive;
    }
    await tutorialVideo.update(updateData);
    await tutorialVideo.reload({
        include: [
            {
                model: require("../../models/User").default,
                as: "user",
                attributes: ["id", "name", "email"]
            },
            {
                model: require("../../models/Company").default,
                as: "company",
                attributes: ["id", "name"]
            }
        ]
    });
    return tutorialVideo;
};
exports.default = UpdateTutorialVideoService;
