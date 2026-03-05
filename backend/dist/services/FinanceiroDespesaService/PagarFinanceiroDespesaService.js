"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroDespesa_1 = __importDefault(require("../../models/FinanceiroDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const PagarFinanceiroDespesaService = async (id, companyId, data) => {
    try {
        const record = await FinanceiroDespesa_1.default.findOne({
            where: {
                id,
                companyId
            }
        });
        if (!record) {
            throw new AppError_1.default("Despesa não encontrada", 404);
        }
        if (record.status === "paga") {
            throw new AppError_1.default("Despesa já está paga", 400);
        }
        await record.update({
            status: "paga",
            dataPagamento: data.dataPagamento,
            metodoPagamentoReal: data.metodoPagamento
        });
        // Emitir evento via socket.io
        const io = require("../../libs/socket.io").getIO();
        io.to(`company-${companyId}-financeiro`).emit("financeiroDespesa", {
            action: "pagar",
            record
        });
        return record.reload();
    }
    catch (err) {
        console.error("Erro ao pagar despesa:", err);
        throw new AppError_1.default("Erro ao pagar despesa", 500);
    }
};
exports.default = PagarFinanceiroDespesaService;
