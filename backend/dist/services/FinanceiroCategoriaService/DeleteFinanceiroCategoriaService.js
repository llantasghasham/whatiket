"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const DeleteFinanceiroCategoriaService = async (id, companyId) => {
    console.log("DEBUG: DeleteCategoria - ID:", id, "CompanyID:", companyId);
    const categoria = await FinanceiroCategoria_1.default.findOne({
        where: {
            id,
            companyId
        }
    });
    console.log("DEBUG: Categoria encontrada:", categoria ? "SIM" : "NÃO");
    if (!categoria) {
        throw new AppError_1.default("ERR_NO_FINANCEIRO_CATEGORIA_FOUND", 404);
    }
    // Verificar se existem categorias filhas
    const categoriasFilhas = await FinanceiroCategoria_1.default.findAll({
        where: {
            paiId: categoria.id
        }
    });
    if (categoriasFilhas.length > 0) {
        throw new AppError_1.default("Não é possível excluir categoria que possui categorias filhas.");
    }
    await categoria.destroy();
    const io = (0, socket_1.getIO)();
    io.to(`company-${companyId}`).emit("financeiro_categoria", {
        action: "delete",
        data: { id }
    });
};
exports.default = DeleteFinanceiroCategoriaService;
