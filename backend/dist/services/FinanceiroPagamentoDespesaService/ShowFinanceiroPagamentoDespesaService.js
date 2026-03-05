"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroPagamentoDespesa_1 = __importDefault(require("../../models/FinanceiroPagamentoDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowFinanceiroPagamentoDespesaService = async (id, companyId) => {
    try {
        const record = await FinanceiroPagamentoDespesa_1.default.findOne({
            where: {
                id: Number(id),
                companyId
            },
            include: [
                {
                    association: "despesa",
                    attributes: ["id", "descricao", "status"]
                }
            ]
        });
        if (!record) {
            throw new AppError_1.default("Pagamento não encontrado", 404);
        }
        return record;
    }
    catch (err) {
        console.error("Erro ao buscar pagamento de despesa:", err);
        throw new AppError_1.default("Erro ao buscar pagamento de despesa", 500);
    }
};
exports.default = ShowFinanceiroPagamentoDespesaService;
