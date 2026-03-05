"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.index = exports.store = void 0;
const CreateTutorialVideoService_1 = __importDefault(require("../services/TutorialVideoServices/CreateTutorialVideoService"));
const ListTutorialVideosService_1 = __importDefault(require("../services/TutorialVideoServices/ListTutorialVideosService"));
const ShowTutorialVideoService_1 = __importDefault(require("../services/TutorialVideoServices/ShowTutorialVideoService"));
const UpdateTutorialVideoService_1 = __importDefault(require("../services/TutorialVideoServices/UpdateTutorialVideoService"));
const DeleteTutorialVideoService_1 = __importDefault(require("../services/TutorialVideoServices/DeleteTutorialVideoService"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const MASTER_TUTORIAL_COMPANY_ID = Number(process.env.MASTER_TUTORIAL_COMPANY_ID || 1);
const ensureMasterCompanyAdmin = (companyId, profile) => {
    if (companyId !== MASTER_TUTORIAL_COMPANY_ID || profile !== "admin") {
        throw new AppError_1.default("Apenas administradores da empresa mestre podem alterar tutoriais", 403);
    }
};
const store = async (req, res) => {
    const { companyId, id: userId, profile } = req.user;
    ensureMasterCompanyAdmin(companyId, profile);
    try {
        const tutorialVideo = await (0, CreateTutorialVideoService_1.default)({
            title: req.body.title,
            description: req.body.description,
            videoUrl: req.body.videoUrl,
            thumbnailUrl: req.body.thumbnailUrl,
            companyId: MASTER_TUTORIAL_COMPANY_ID,
            userId: Number(userId)
        });
        return res.status(201).json(tutorialVideo);
    }
    catch (error) {
        console.error("Erro ao criar vídeo tutorial:", error);
        return res.status(400).json({ error: error.message });
    }
};
exports.store = store;
const index = async (req, res) => {
    const { searchParam, pageNumber, isActive } = req.query;
    try {
        const { tutorialVideos, count, hasMore } = await (0, ListTutorialVideosService_1.default)({
            companyId: MASTER_TUTORIAL_COMPANY_ID,
            searchParam: searchParam,
            pageNumber: pageNumber,
            isActive: isActive === "false" ? false : true
        });
        return res.json({ tutorialVideos, count, hasMore });
    }
    catch (error) {
        console.error("Erro ao listar vídeos tutoriais:", error);
        return res.status(400).json({ error: error.message });
    }
};
exports.index = index;
const show = async (req, res) => {
    const { tutorialVideoId } = req.params;
    const { incrementView } = req.query;
    try {
        const tutorialVideo = await (0, ShowTutorialVideoService_1.default)({
            id: tutorialVideoId,
            companyId: MASTER_TUTORIAL_COMPANY_ID,
            incrementView: incrementView === "true"
        });
        return res.json(tutorialVideo);
    }
    catch (error) {
        console.error("Erro ao buscar vídeo tutorial:", error);
        return res.status(404).json({ error: error.message });
    }
};
exports.show = show;
const update = async (req, res) => {
    const { companyId, profile } = req.user;
    const { tutorialVideoId } = req.params;
    const tutorialVideoData = req.body;
    ensureMasterCompanyAdmin(companyId, profile);
    try {
        const tutorialVideo = await (0, UpdateTutorialVideoService_1.default)({
            tutorialVideoData,
            tutorialVideoId,
            companyId: MASTER_TUTORIAL_COMPANY_ID
        });
        return res.json(tutorialVideo);
    }
    catch (error) {
        console.error("Erro ao atualizar vídeo tutorial:", error);
        return res.status(400).json({ error: error.message });
    }
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId, profile } = req.user;
    const { tutorialVideoId } = req.params;
    const { hardDelete } = req.query;
    ensureMasterCompanyAdmin(companyId, profile);
    try {
        await (0, DeleteTutorialVideoService_1.default)({
            id: tutorialVideoId,
            companyId: MASTER_TUTORIAL_COMPANY_ID,
            hardDelete: hardDelete === "true"
        });
        return res.json({ message: "Vídeo tutorial removido com sucesso" });
    }
    catch (error) {
        console.error("Erro ao remover vídeo tutorial:", error);
        return res.status(400).json({ error: error.message });
    }
};
exports.remove = remove;
