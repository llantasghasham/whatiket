"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const ListFinanceiroFornecedoresService = async ({ companyId, searchParam = "", categoria, ativo, pageNumber = 1 }) => {
    const where = { companyId };
    if (searchParam) {
        const term = `%${searchParam.trim().toLowerCase()}%`;
        where[sequelize_1.Op.or] = [
            { nome: { [sequelize_1.Op.iLike]: term } },
            { documento: { [sequelize_1.Op.iLike]: term } },
            { email: { [sequelize_1.Op.iLike]: term } },
            { telefone: { [sequelize_1.Op.iLike]: term } },
            { categoria: { [sequelize_1.Op.iLike]: term } }
        ];
    }
    if (categoria) {
        where.categoria = { [sequelize_1.Op.iLike]: `%${categoria.trim()}%` };
    }
    if (typeof ativo !== "undefined") {
        where.ativo = ativo;
    }
    const limit = 20;
    const offset = limit * (Number(pageNumber) - 1);
    const { count, rows: fornecedores } = await FinanceiroFornecedor_1.default.findAndCountAll({
        where,
        limit,
        offset,
        order: [["nome", "ASC"]]
    });
    const hasMore = count > offset + fornecedores.length;
    return {
        fornecedores,
        count,
        hasMore
    };
};
exports.default = ListFinanceiroFornecedoresService;
