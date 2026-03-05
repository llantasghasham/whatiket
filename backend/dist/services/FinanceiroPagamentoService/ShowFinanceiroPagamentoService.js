"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FinanceiroPagamento_1 = __importDefault(require("../../models/FinanceiroPagamento"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const ShowFinanceiroPagamentoService = async (id, companyId) => {
    const pagamento = await FinanceiroPagamento_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: FinanceiroFatura_1.default,
                as: "fatura",
                attributes: ["id", "descricao", "valor", "status", "clientId"]
            }
        ]
    });
    if (!pagamento) {
        throw new AppError_1.default("Pagamento não encontrado.", 404);
    }
    return pagamento;
};
exports.default = ShowFinanceiroPagamentoService;
