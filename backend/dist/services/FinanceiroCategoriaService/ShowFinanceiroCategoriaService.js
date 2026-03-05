"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowFinanceiroCategoriaService = async (id, companyId) => {
    const categoria = await FinanceiroCategoria_1.default.findByPk(id, {
        include: [
            {
                model: FinanceiroCategoria_1.default,
                as: "filhos",
                required: false
            },
            {
                model: FinanceiroCategoria_1.default,
                as: "pai",
                required: false
            }
        ]
    });
    if (!categoria) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_CATEGORIA_FOUND", 404);
    }
    return categoria;
};
exports.default = ShowFinanceiroCategoriaService;
