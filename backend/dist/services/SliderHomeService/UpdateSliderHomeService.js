"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SliderHome_1 = __importDefault(require("../../models/SliderHome"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UpdateSliderHomeService = async ({ id, name, image, companyId }) => {
    if (companyId !== 1) {
        throw new AppError_1.default("Apenas a empresa mestre pode atualizar banners", 403);
    }
    const slider = await SliderHome_1.default.findByPk(id);
    if (!slider) {
        throw new AppError_1.default("Banner não encontrado", 404);
    }
    await slider.update({
        name: name ?? slider.name,
        image: image ?? slider.image
    });
    return slider;
};
exports.default = UpdateSliderHomeService;
