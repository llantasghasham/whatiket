"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroReceita_1 = __importDefault(require("../../models/FinanceiroReceita"));
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowFinanceiroReceitaService = async (id, companyId) => {
    const receita = await FinanceiroReceita_1.default.findOne({
        where: {
            id,
            companyId
        },
        include: [
            {
                model: FinanceiroFornecedor_1.default,
                as: "fornecedor",
                required: false
            },
            {
                model: FinanceiroCategoria_1.default,
                as: "categoria",
                required: false
            }
        ]
    });
    if (!receita) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_RECEITA_FOUND", 404);
    }
    return receita;
};
exports.default = ShowFinanceiroReceitaService;
