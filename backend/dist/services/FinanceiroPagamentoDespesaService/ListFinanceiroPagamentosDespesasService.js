"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const FinanceiroPagamentoDespesa_1 = __importDefault(require("../../models/FinanceiroPagamentoDespesa"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListFinanceiroPagamentosDespesasService = async (params) => {
    try {
        const whereConditions = {
            companyId: params.companyId
        };
        if (params.searchParam) {
            whereConditions[sequelize_1.Op.or] = [
                { observacoes: { [sequelize_1.Op.like]: `%${params.searchParam}%` } },
                { metodoPagamento: { [sequelize_1.Op.like]: `%${params.searchParam}%` } }
            ];
        }
        if (params.despesaId) {
            whereConditions.despesaId = params.despesaId;
        }
        if (params.metodoPagamento) {
            whereConditions.metodoPagamento = params.metodoPagamento;
        }
        if (params.dataPagamentoInicio || params.dataPagamentoFim) {
            whereConditions.dataPagamento = {};
            if (params.dataPagamentoInicio) {
                whereConditions.dataPagamento[sequelize_1.Op.gte] = new Date(params.dataPagamentoInicio);
            }
            if (params.dataPagamentoFim) {
                whereConditions.dataPagamento[sequelize_1.Op.lte] = new Date(params.dataPagamentoFim);
            }
        }
        const limit = 20;
        const offset = params.pageNumber ? (params.pageNumber - 1) * limit : 0;
        const { count, rows: pagamentos } = await FinanceiroPagamentoDespesa_1.default.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    association: "despesa",
                    attributes: ["id", "descricao", "status"]
                }
            ],
            limit,
            offset,
            order: [["dataPagamento", "DESC"]]
        });
        const hasMore = count > offset + pagamentos.length;
        return {
            pagamentos,
            count,
            hasMore
        };
    }
    catch (err) {
        console.error("Erro ao listar pagamentos de despesas:", err);
        throw new AppError_1.default("Erro ao listar pagamentos de despesas", 500);
    }
};
exports.default = ListFinanceiroPagamentosDespesasService;
