"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Ferramenta_1 = __importDefault(require("../../models/Ferramenta"));
const ShowService = async (id) => {
    const ferramenta = await Ferramenta_1.default.findOne({
        where: { id }
    });
    if (!ferramenta) {
        throw new AppError_1.default("ERR_FERRAMENTA_NOT_FOUND", 404);
    }
    return ferramenta;
};
exports.default = ShowService;
