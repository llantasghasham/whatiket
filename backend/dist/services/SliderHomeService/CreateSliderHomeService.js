"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SliderHome_1 = __importDefault(require("../../models/SliderHome"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateSliderHomeService = async ({ name, image, companyId }) => {
    if (companyId !== 1) {
        throw new AppError_1.default("Apenas a empresa mestre pode criar banners", 403);
    }
    const slider = await SliderHome_1.default.create({ name, image, companyId });
    return slider;
};
exports.default = CreateSliderHomeService;
