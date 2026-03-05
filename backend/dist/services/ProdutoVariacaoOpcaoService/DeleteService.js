"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const ProdutoVariacaoItem_1 = __importDefault(require("../../models/ProdutoVariacaoItem"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../models/ProdutoVariacaoOpcao"));
const DeleteService = async ({ companyId, opcaoId }) => {
    const opcao = await ProdutoVariacaoOpcao_1.default.findByPk(opcaoId, {
        include: [ProdutoVariacaoGrupo_1.default]
    });
    if (!opcao || !opcao.grupo || opcao.grupo.companyId !== companyId) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_OPTION_NOT_FOUND", 404);
    }
    await ProdutoVariacaoItem_1.default.destroy({ where: { opcaoId } });
    await opcao.destroy();
};
exports.default = DeleteService;
