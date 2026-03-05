"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../models/ProdutoVariacaoOpcao"));
const UpdateService = async ({ companyId, opcaoId, nome, ordem }) => {
    const opcao = await ProdutoVariacaoOpcao_1.default.findByPk(opcaoId, {
        include: [ProdutoVariacaoGrupo_1.default]
    });
    if (!opcao || !opcao.grupo || opcao.grupo.companyId !== companyId) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_OPTION_NOT_FOUND", 404);
    }
    const trimmedName = nome?.trim();
    const payload = {};
    if (trimmedName) {
        payload.nome = trimmedName;
    }
    if (ordem !== undefined) {
        payload.ordem = Number.isFinite(ordem) ? Number(ordem) : 0;
    }
    if (Object.keys(payload).length === 0) {
        return opcao;
    }
    await opcao.update(payload);
    return opcao;
};
exports.default = UpdateService;
