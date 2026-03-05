"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SliderHome_1 = __importDefault(require("../../models/SliderHome"));
const ListSliderHomeService = async ({ companyId }) => {
    const sliders = await SliderHome_1.default.findAll({
        where: { companyId },
        order: [["createdAt", "DESC"]]
    });
    return sliders;
};
exports.default = ListSliderHomeService;
