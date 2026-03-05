"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const CreateService = async ({ companyId, nome }) => {
    const trimmedName = nome?.trim();
    if (!trimmedName) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_INVALID_NAME", 400);
    }
    const duplicated = await ProdutoVariacaoGrupo_1.default.findOne({
        where: { companyId, nome: trimmedName }
    });
    if (duplicated) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_DUPLICATED", 400);
    }
    const grupo = await ProdutoVariacaoGrupo_1.default.create({ companyId, nome: trimmedName });
    return grupo;
};
exports.default = CreateService;
