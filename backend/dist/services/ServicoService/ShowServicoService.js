"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Servico_1 = __importDefault(require("../../models/Servico"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowServicoService = async ({ id, companyId }) => {
    const servico = await Servico_1.default.findOne({ where: { id, companyId } });
    if (!servico) {
        throw new AppError_1.default("Serviço não encontrado", 404);
    }
    return servico;
};
exports.default = ShowServicoService;
