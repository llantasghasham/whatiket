"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroFatura_1 = __importDefault(require("../../../models/FinanceiroFatura"));
const FinanceiroPagamento_1 = __importDefault(require("../../../models/FinanceiroPagamento"));
const syncFaturaPagamentoStatus = async ({ companyId, faturaId, transaction }) => {
    const fatura = await FinanceiroFatura_1.default.findOne({
        where: { id: faturaId, companyId },
        transaction
    });
    if (!fatura) {
        return;
    }
    const totalPagoRaw = await FinanceiroPagamento_1.default.sum("valor", {
        where: { companyId, faturaId },
        transaction
    });
    const totalPago = Number(totalPagoRaw || 0);
    const valorFatura = Number(fatura.valor || 0);
    const ultimoPagamento = await FinanceiroPagamento_1.default.findOne({
        where: { companyId, faturaId },
        order: [
            ["dataPagamento", "DESC"],
            ["id", "DESC"]
        ],
        transaction
    });
    let novoStatus = fatura.status;
    let dataPagamento = ultimoPagamento?.dataPagamento || null;
    const isCancelada = fatura.status === "cancelada";
    const isTotalQuitado = valorFatura <= 0 || totalPago >= valorFatura;
    const venceu = !!fatura.dataVencimento &&
        new Date(fatura.dataVencimento).setHours(0, 0, 0, 0) <
            new Date().setHours(0, 0, 0, 0);
    if (!isCancelada) {
        if (isTotalQuitado) {
            novoStatus = "paga";
            if (!dataPagamento) {
                dataPagamento = new Date();
            }
        }
        else if (venceu) {
            novoStatus = "vencida";
            dataPagamento = null;
        }
        else {
            novoStatus = "aberta";
            dataPagamento = null;
        }
    }
    await fatura.update({
        status: novoStatus,
        dataPagamento,
        valorPago: totalPago
    }, { transaction });
};
exports.default = syncFaturaPagamentoStatus;
