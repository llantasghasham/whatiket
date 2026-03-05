"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const socket_1 = require("../../libs/socket");
const DeleteFinanceiroFaturaService = async (id, companyId) => {
    const record = await FinanceiroFatura_1.default.findOne({
        where: { id, companyId }
    });
    if (!record) {
        throw new AppError_1.default("Fatura não encontrada.", 404);
    }
    await record.destroy();
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-financeiro`, {
        action: "fatura:deleted",
        payload: { id: record.id }
    });
};
exports.default = DeleteFinanceiroFaturaService;
