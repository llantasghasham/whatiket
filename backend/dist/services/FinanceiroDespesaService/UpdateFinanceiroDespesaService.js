"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroDespesa_1 = __importDefault(require("../../models/FinanceiroDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const UpdateFinanceiroDespesaService = async (id, data, companyId) => {
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
        await record.update(data);
        // Emitir evento via socket.io
        const io = (0, socket_1.getIO)();
        io.to(`company-${companyId}`).emit("financeiro_despesa", {
            action: "update",
            record
        });
        return record.reload();
    }
    catch (err) {
        console.error("Erro ao atualizar despesa:", err);
        throw new AppError_1.default("Erro ao atualizar despesa", 500);
    }
};
exports.default = UpdateFinanceiroDespesaService;
