"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroReceita_1 = __importDefault(require("../../models/FinanceiroReceita"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const UpdateFinanceiroReceitaService = async (id, data, companyId) => {
    try {
        const record = await FinanceiroReceita_1.default.findOne({
            where: {
                id,
                companyId
            }
        });
        if (!record) {
            throw new AppError_1.default("Receita não encontrada", 404);
        }
        await record.update(data);
        // Emitir evento via socket.io
        const io = (0, socket_1.getIO)();
        io.to(`company-${companyId}`).emit("financeiro_receita", {
            action: "update",
            record
        });
        return record.reload();
    }
    catch (err) {
        console.error("Erro ao atualizar receita:", err);
        throw new AppError_1.default("Erro ao atualizar receita", 500);
    }
};
exports.default = UpdateFinanceiroReceitaService;
