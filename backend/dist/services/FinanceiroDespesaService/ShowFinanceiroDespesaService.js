"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroDespesa_1 = __importDefault(require("../../models/FinanceiroDespesa"));
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowFinanceiroDespesaService = async (id, companyId) => {
    try {
        const record = await FinanceiroDespesa_1.default.findOne({
            where: {
                id: Number(id),
                companyId
            },
            include: [
                {
                    model: FinanceiroFornecedor_1.default,
                    as: "fornecedor",
                    attributes: ["id", "nome", "documento", "email", "telefone"]
                },
                {
                    model: FinanceiroCategoria_1.default,
                    as: "categoria",
                    attributes: ["id", "nome", "cor"]
                }
            ]
        });
        if (!record) {
            throw new AppError_1.default("Despesa não encontrada", 404);
        }
        return record;
    }
    catch (err) {
        console.error("Erro ao buscar despesa:", err);
        throw new AppError_1.default("Erro ao buscar despesa", 500);
    }
};
exports.default = ShowFinanceiroDespesaService;
