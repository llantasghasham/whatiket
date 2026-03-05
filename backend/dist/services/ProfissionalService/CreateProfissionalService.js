"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Profissional_1 = __importDefault(require("../../models/Profissional"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateProfissionalService = async ({ companyId, nome, servicos = [], agenda = [], ativo = true, comissao = 0, valorEmAberto = 0, valoresRecebidos = 0, valoresAReceber = 0 }) => {
    if (!nome?.trim()) {
        throw new AppError_1.default("Nome do profissional é obrigatório");
    }
    const profissional = await Profissional_1.default.create({
        companyId,
        nome,
        servicos,
        agenda,
        ativo,
        comissao,
        valorEmAberto,
        valoresRecebidos,
        valoresAReceber
    });
    return profissional;
};
exports.default = CreateProfissionalService;
