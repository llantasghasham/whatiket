"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TutorialVideo_1 = __importDefault(require("../../models/TutorialVideo"));
const User_1 = __importDefault(require("../../models/User"));
const Company_1 = __importDefault(require("../../models/Company"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowTutorialVideoService = async ({ id, companyId, incrementView = false }) => {
    const tutorialVideo = await TutorialVideo_1.default.findOne({
        where: {
            id,
            companyId
        },
        include: [
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name", "email"]
            },
            {
                model: Company_1.default,
                as: "company",
                attributes: ["id", "name"]
            }
        ]
    });
    if (!tutorialVideo) {
        throw new AppError_1.default("Vídeo tutorial não encontrado", 404);
    }
    // Incrementar contador de visualizações se solicitado
    if (incrementView) {
        await tutorialVideo.update({
            viewsCount: tutorialVideo.viewsCount + 1
        });
        // Recarregar para obter o valor atualizado
        await tutorialVideo.reload();
    }
    return tutorialVideo;
};
exports.default = ShowTutorialVideoService;
