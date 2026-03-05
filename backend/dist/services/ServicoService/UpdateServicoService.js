"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Servico_1 = __importDefault(require("../../models/Servico"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UpdateServicoService = async ({ id, companyId, nome, descricao, valorOriginal, possuiDesconto, valorComDesconto }) => {
    const servico = await Servico_1.default.findOne({ where: { id, companyId } });
    if (!servico) {
        throw new AppError_1.default("Serviço não encontrado", 404);
    }
    const descontoAtivo = possuiDesconto ?? servico.possuiDesconto;
    let descontoValor = valorComDesconto ?? servico.valorComDesconto;
    if (descontoAtivo && (descontoValor === null || descontoValor === undefined)) {
        throw new AppError_1.default("Informe o valor com desconto");
    }
    if (!descontoAtivo) {
        descontoValor = null;
    }
    await servico.update({
        nome: nome ?? servico.nome,
        descricao: descricao ?? servico.descricao,
        valorOriginal: valorOriginal ?? servico.valorOriginal,
        possuiDesconto: descontoAtivo,
        valorComDesconto: descontoValor
    });
    return servico;
};
exports.default = UpdateServicoService;
