"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Produto_1 = __importDefault(require("../../models/Produto"));
const ProdutoCategoria_1 = __importDefault(require("../../models/ProdutoCategoria"));
const DeleteService = async ({ id, companyId }) => {
    const categoria = await ProdutoCategoria_1.default.findOne({
        where: { id, companyId }
    });
    if (!categoria) {
        throw new AppError_1.default("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
    }
    const linkedProduct = await Produto_1.default.findOne({
        where: {
            companyId,
            categoriaId: id
        }
    });
    if (linkedProduct) {
        throw new AppError_1.default("ERR_PRODUTO_CATEGORIA_IN_USE", 400);
    }
    await categoria.destroy();
};
exports.default = DeleteService;
