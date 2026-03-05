"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroPagamentoDespesa_1 = __importDefault(require("../../models/FinanceiroPagamentoDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UpdateFinanceiroPagamentoDespesaService = async (id, data, companyId) => {
    try {
        const record = await FinanceiroPagamentoDespesa_1.default.findOne({
            where: {
                id,
                companyId
            }
        });
        if (!record) {
            throw new AppError_1.default("Pagamento não encontrado", 404);
        }
        await record.update(data);
        // Emitir evento via socket.io
        const io = require("../../libs/socket.io").getIO();
        io.to(`company-${companyId}-financeiro`).emit("financeiroPagamentoDespesa", {
            action: "update",
            record
        });
        return record.reload();
    }
    catch (err) {
        console.error("Erro ao atualizar pagamento de despesa:", err);
        throw new AppError_1.default("Erro ao atualizar pagamento de despesa", 500);
    }
};
exports.default = UpdateFinanceiroPagamentoDespesaService;
