"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const FinanceiroDespesa_1 = __importDefault(require("../../models/FinanceiroDespesa"));
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListFinanceiroDespesasService = async (params) => {
    try {
        const whereConditions = {
            companyId: params.companyId
        };
        if (params.searchParam) {
            whereConditions[sequelize_1.Op.or] = [
                { descricao: { [sequelize_1.Op.like]: `%${params.searchParam}%` } },
                { observacoes: { [sequelize_1.Op.like]: `%${params.searchParam}%` } }
            ];
        }
        if (params.fornecedorId) {
            whereConditions.fornecedorId = params.fornecedorId;
        }
        if (params.categoriaId) {
            whereConditions.categoriaId = params.categoriaId;
        }
        if (params.status) {
            whereConditions.status = params.status;
        }
        if (params.dataVencimentoInicio || params.dataVencimentoFim) {
            whereConditions.dataVencimento = {};
            if (params.dataVencimentoInicio) {
                whereConditions.dataVencimento[sequelize_1.Op.gte] = new Date(params.dataVencimentoInicio);
            }
            if (params.dataVencimentoFim) {
                whereConditions.dataVencimento[sequelize_1.Op.lte] = new Date(params.dataVencimentoFim);
            }
        }
        const limit = 20;
        const offset = params.pageNumber ? (params.pageNumber - 1) * limit : 0;
        const { count, rows: despesas } = await FinanceiroDespesa_1.default.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: FinanceiroFornecedor_1.default,
                    as: "fornecedor",
                    attributes: ["id", "nome", "documento"]
                },
                {
                    model: FinanceiroCategoria_1.default,
                    as: "categoria",
                    attributes: ["id", "nome", "cor"]
                }
            ],
            limit,
            offset,
            order: [["dataVencimento", "DESC"]]
        });
        const hasMore = count > offset + despesas.length;
        return {
            despesas,
            count,
            hasMore
        };
    }
    catch (err) {
        console.error("Erro ao listar despesas:", err);
        throw new AppError_1.default("Erro ao listar despesas", 500);
    }
};
exports.default = ListFinanceiroDespesasService;
