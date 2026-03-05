"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoCategoria_1 = __importDefault(require("../../models/ProdutoCategoria"));
const CreateService = async ({ companyId, nome, slug, descricao }) => {
    const existing = await ProdutoCategoria_1.default.findOne({
        where: {
            companyId,
            nome
        }
    });
    if (existing) {
        throw new AppError_1.default("ERR_PRODUTO_CATEGORIA_DUPLICATED", 400);
    }
    const categoria = await ProdutoCategoria_1.default.create({
        companyId,
        nome,
        slug: slug || null,
        descricao: descricao || null
    });
    return categoria;
};
exports.default = CreateService;
