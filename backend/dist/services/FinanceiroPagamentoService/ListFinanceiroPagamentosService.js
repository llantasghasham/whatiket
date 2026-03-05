"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const FinanceiroPagamento_1 = __importDefault(require("../../models/FinanceiroPagamento"));
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const ListFinanceiroPagamentosService = async ({ companyId, faturaId, metodoPagamento, searchParam = "", pageNumber = "1" }) => {
    const where = { companyId };
    if (faturaId) {
        where.faturaId = faturaId;
    }
    if (metodoPagamento) {
        where.metodoPagamento = metodoPagamento;
    }
    if (searchParam) {
        const term = `%${searchParam.trim().toLowerCase()}%`;
        where[sequelize_1.Op.or] = [
            { metodoPagamento: { [sequelize_1.Op.iLike]: term } },
            { observacoes: { [sequelize_1.Op.iLike]: term } }
        ];
    }
    const limit = 20;
    const offset = limit * (Number(pageNumber) - 1);
    const { rows, count } = await FinanceiroPagamento_1.default.findAndCountAll({
        where,
        include: [
            {
                model: FinanceiroFatura_1.default,
                as: "fatura",
                attributes: ["id", "descricao", "valor", "status", "clientId"]
            }
        ],
        limit,
        offset,
        order: [
            ["dataPagamento", "DESC"],
            ["id", "DESC"]
        ]
    });
    return {
        pagamentos: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListFinanceiroPagamentosService;
