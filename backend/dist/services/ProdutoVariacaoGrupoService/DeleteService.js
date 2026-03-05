"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../models/ProdutoVariacaoOpcao"));
const ProdutoVariacaoItem_1 = __importDefault(require("../../models/ProdutoVariacaoItem"));
const DeleteService = async ({ companyId, grupoId }) => {
    const grupo = await ProdutoVariacaoGrupo_1.default.findOne({
        where: { id: grupoId, companyId },
        include: [{ model: ProdutoVariacaoOpcao_1.default }]
    });
    if (!grupo) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_NOT_FOUND", 404);
    }
    const opcaoIds = grupo.opcoes?.map((opcao) => opcao.id) || [];
    if (opcaoIds.length) {
        await ProdutoVariacaoItem_1.default.destroy({ where: { opcaoId: opcaoIds } });
        await ProdutoVariacaoOpcao_1.default.destroy({ where: { id: opcaoIds } });
    }
    await grupo.destroy();
};
exports.default = DeleteService;
