"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const FinanceiroDespesa_1 = __importDefault(require("../../models/FinanceiroDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const DeleteFinanceiroFornecedorService = async (id, companyId) => {
    console.log("DEBUG: DeleteFornecedor - ID:", id, "CompanyID:", companyId);
    const fornecedor = await FinanceiroFornecedor_1.default.findOne({
        where: {
            id,
            companyId
        }
    });
    console.log("DEBUG: Fornecedor encontrado:", fornecedor ? "SIM" : "NÃO");
    if (!fornecedor) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_FORNECEDOR_FOUND", 404);
    }
    // Verificar se existem despesas vinculadas
    const despesasCount = await FinanceiroDespesa_1.default.count({
        where: {
            fornecedorId: fornecedor.id
        }
    });
    if (despesasCount > 0) {
        throw new AppError_1.default("Não é possível excluir fornecedor que possui despesas vinculadas.");
    }
    await fornecedor.destroy();
    const io = (0, socket_1.getIO)();
    io.to(`company-${companyId}`).emit("financeiro_fornecedor", {
        action: "delete",
        data: { id }
    });
};
exports.default = DeleteFinanceiroFornecedorService;
