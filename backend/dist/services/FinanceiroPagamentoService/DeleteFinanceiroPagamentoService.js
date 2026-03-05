"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FinanceiroPagamento_1 = __importDefault(require("../../models/FinanceiroPagamento"));
const syncFaturaPagamentoStatus_1 = __importDefault(require("./helpers/syncFaturaPagamentoStatus"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const socket_1 = require("../../libs/socket");
const DeleteFinanceiroPagamentoService = async (id, companyId) => {
    const pagamento = await FinanceiroPagamento_1.default.findOne({
        where: { id, companyId }
    });
    if (!pagamento) {
        throw new AppError_1.default("Pagamento não encontrado.", 404);
    }
    await pagamento.destroy();
    await (0, syncFaturaPagamentoStatus_1.default)({
        companyId,
        faturaId: pagamento.faturaId
    });
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: pagamento.faturaId, companyId }
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
        action: "pagamento:deleted",
        payload: {
            pagamentoId: pagamento.id,
            fatura
        }
    });
};
exports.default = DeleteFinanceiroPagamentoService;
