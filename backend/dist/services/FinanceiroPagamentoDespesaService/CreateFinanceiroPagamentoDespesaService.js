"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroPagamentoDespesa_1 = __importDefault(require("../../models/FinanceiroPagamentoDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateFinanceiroPagamentoDespesaService = async (data, companyId) => {
    try {
        // Verificar se a despesa existe e pertence à empresa
        const despesa = await FinanceiroPagamentoDespesa_1.default.findOne({
            where: {
                id: data.despesaId,
                companyId
            }
        });
        if (!despesa) {
            throw new AppError_1.default("Despesa não encontrada", 404);
        }
        const record = await FinanceiroPagamentoDespesa_1.default.create({
            despesaId: data.despesaId,
            valor: data.valor,
            metodoPagamento: data.metodoPagamento,
            dataPagamento: data.dataPagamento,
            observacoes: data.observacoes || null,
            companyId
        });
        // Atualizar status da despesa para paga
        await despesa.update({
            status: "paga",
            dataPagamento: data.dataPagamento,
            metodoPagamentoReal: data.metodoPagamento
        });
        // Emitir evento via socket.io
        const io = require("../../libs/socket.io").getIO();
        io.to(`company-${companyId}-financeiro`).emit("financeiroPagamentoDespesa", {
            action: "create",
            record: record
        });
        return record;
    }
    catch (err) {
        console.error("Erro ao criar pagamento de despesa:", err);
        throw new AppError_1.default("Erro ao criar pagamento de despesa", 500);
    }
};
exports.default = CreateFinanceiroPagamentoDespesaService;
