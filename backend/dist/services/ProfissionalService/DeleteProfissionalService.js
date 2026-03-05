"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Profissional_1 = __importDefault(require("../../models/Profissional"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const DeleteProfissionalService = async ({ id, companyId }) => {
    const profissional = await Profissional_1.default.findOne({ where: { id, companyId } });
    if (!profissional) {
        throw new AppError_1.default("Profissional não encontrado", 404);
    }
    await profissional.destroy();
};
exports.default = DeleteProfissionalService;
