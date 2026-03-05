"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowFinanceiroFornecedorService = async (id, companyId) => {
    const fornecedor = await FinanceiroFornecedor_1.default.findByPk(id);
    if (!fornecedor) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_FORNECEDOR_FOUND", 404);
    }
    return fornecedor;
};
exports.default = ShowFinanceiroFornecedorService;
