"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroReceita_1 = __importDefault(require("../../models/FinanceiroReceita"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const DeleteFinanceiroReceitaService = async (id, companyId) => {
    console.log("DEBUG: DeleteReceita - ID:", id, "CompanyID:", companyId);
    const receita = await FinanceiroReceita_1.default.findOne({
        where: {
            id,
            companyId
        }
    });
    console.log("DEBUG: Receita encontrada:", receita ? "SIM" : "NÃO");
    if (!receita) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_RECEITA_FOUND", 404);
    }
    await receita.destroy();
    const io = (0, socket_1.getIO)();
    io.to(`company-${companyId}`).emit("financeiro_receita", {
        action: "delete",
        id
    });
};
exports.default = DeleteFinanceiroReceitaService;
