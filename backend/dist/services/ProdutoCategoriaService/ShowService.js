"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoCategoria_1 = __importDefault(require("../../models/ProdutoCategoria"));
const ShowService = async ({ id, companyId }) => {
    const categoria = await ProdutoCategoria_1.default.findOne({
        where: { id, companyId }
    });
    if (!categoria) {
        throw new AppError_1.default("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
    }
    return categoria;
};
exports.default = ShowService;
