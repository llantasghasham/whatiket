"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const ListSliderHomeService_1 = __importDefault(require("../services/SliderHomeService/ListSliderHomeService"));
const CreateSliderHomeService_1 = __importDefault(require("../services/SliderHomeService/CreateSliderHomeService"));
const ShowSliderHomeService_1 = __importDefault(require("../services/SliderHomeService/ShowSliderHomeService"));
const UpdateSliderHomeService_1 = __importDefault(require("../services/SliderHomeService/UpdateSliderHomeService"));
const DeleteSliderHomeService_1 = __importDefault(require("../services/SliderHomeService/DeleteSliderHomeService"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const sliderUpload_1 = require("../config/sliderUpload");
const MASTER_COMPANY_ID = 1;
const index = async (_req, res) => {
    const sliders = await (0, ListSliderHomeService_1.default)({ companyId: MASTER_COMPANY_ID });
    return res.json(sliders);
};
exports.index = index;
const show = async (req, res) => {
    const { sliderId } = req.params;
    const slider = await (0, ShowSliderHomeService_1.default)(sliderId);
    return res.json(slider);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { name } = req.body;
    const file = req.file;
    if (companyId !== MASTER_COMPANY_ID) {
        throw new AppError_1.default("Apenas a empresa mestre pode criar banners", 403);
    }
    if (!file) {
        throw new AppError_1.default("Imagem do banner é obrigatória", 400);
    }
    const relativePath = (0, sliderUpload_1.getSliderRelativePath)(file.filename);
    console.log("[SliderHome][CREATE]", {
        name,
        originalName: file.originalname,
        storedFile: file.filename,
        diskPath: file.path,
        relativePath
    });
    const slider = await (0, CreateSliderHomeService_1.default)({
        name,
        image: relativePath,
        companyId
    });
    return res.status(201).json(slider);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { sliderId } = req.params;
    const { name } = req.body;
    const file = req.file;
    let imagePath;
    if (file) {
        imagePath = (0, sliderUpload_1.getSliderRelativePath)(file.filename);
        console.log("[SliderHome][UPDATE]", {
            sliderId,
            name,
            originalName: file.originalname,
            storedFile: file.filename,
            diskPath: file.path,
            relativePath: imagePath
        });
    }
    else {
        console.log("[SliderHome][UPDATE]", { sliderId, name, message: "No new image uploaded" });
    }
    const slider = await (0, UpdateSliderHomeService_1.default)({
        id: sliderId,
        name,
        image: imagePath,
        companyId
    });
    return res.json(slider);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { sliderId } = req.params;
    await (0, DeleteSliderHomeService_1.default)({ id: sliderId, companyId });
    return res.json({ message: "Banner removido com sucesso" });
};
exports.remove = remove;
