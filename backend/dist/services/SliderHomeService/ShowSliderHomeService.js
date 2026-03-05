"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SliderHome_1 = __importDefault(require("../../models/SliderHome"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowSliderHomeService = async (id) => {
    const slider = await SliderHome_1.default.findByPk(id);
    if (!slider) {
        throw new AppError_1.default("Banner não encontrado", 404);
    }
    return slider;
};
exports.default = ShowSliderHomeService;
