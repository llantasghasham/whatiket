"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Servico_1 = __importDefault(require("../../models/Servico"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateServicoService = async ({ companyId, nome, descricao, valorOriginal = 0, possuiDesconto = false, valorComDesconto = null }) => {
    if (!nome?.trim()) {
        throw new AppError_1.default("Nome do serviço é obrigatório");
    }
    if (possuiDesconto && (valorComDesconto === null || valorComDesconto === undefined)) {
        throw new AppError_1.default("Informe o valor com desconto");
    }
    const servico = await Servico_1.default.create({
        companyId,
        nome,
        descricao,
        valorOriginal,
        possuiDesconto,
        valorComDesconto: possuiDesconto ? valorComDesconto : null
    });
    return servico;
};
exports.default = CreateServicoService;
