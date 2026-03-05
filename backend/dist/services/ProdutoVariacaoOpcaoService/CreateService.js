"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../models/ProdutoVariacaoOpcao"));
const CreateService = async ({ companyId, grupoId, nome, ordem }) => {
    const grupo = await ProdutoVariacaoGrupo_1.default.findOne({ where: { id: grupoId, companyId } });
    if (!grupo) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_NOT_FOUND", 404);
    }
    const trimmedName = nome?.trim();
    if (!trimmedName) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_OPTION_INVALID_NAME", 400);
    }
    const opcao = await ProdutoVariacaoOpcao_1.default.create({
        grupoId,
        nome: trimmedName,
        ordem: Number.isFinite(ordem) ? Number(ordem) : 0
    });
    return opcao;
};
exports.default = CreateService;
