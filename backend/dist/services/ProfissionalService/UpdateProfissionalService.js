"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Profissional_1 = __importDefault(require("../../models/Profissional"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UpdateProfissionalService = async ({ id, companyId, nome, servicos, agenda, ativo, comissao, valorEmAberto, valoresRecebidos, valoresAReceber }) => {
    const profissional = await Profissional_1.default.findOne({ where: { id, companyId } });
    if (!profissional) {
        throw new AppError_1.default("Profissional não encontrado", 404);
    }
    await profissional.update({
        nome: nome ?? profissional.nome,
        servicos: servicos ?? profissional.servicos,
        agenda: agenda ?? profissional.agenda,
        ativo: ativo ?? profissional.ativo,
        comissao: comissao ?? profissional.comissao,
        valorEmAberto: valorEmAberto ?? profissional.valorEmAberto,
        valoresRecebidos: valoresRecebidos ?? profissional.valoresRecebidos,
        valoresAReceber: valoresAReceber ?? profissional.valoresAReceber
    });
    return profissional;
};
exports.default = UpdateProfissionalService;
