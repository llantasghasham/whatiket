"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const ListFinanceiroCategoriasService = async ({ companyId, searchParam = "", tipo, ativo, paiId, pageNumber = 1 }) => {
    const where = { companyId };
    if (searchParam) {
        const term = `%${searchParam.trim().toLowerCase()}%`;
        where[sequelize_1.Op.or] = [
            { nome: { [sequelize_1.Op.iLike]: term } },
            { tipo: { [sequelize_1.Op.iLike]: term } }
        ];
    }
    if (tipo) {
        where.tipo = { [sequelize_1.Op.iLike]: String(tipo).trim() };
    }
    if (typeof ativo !== "undefined") {
        where.ativo = ativo;
    }
    if (paiId) {
        where.paiId = paiId;
    }
    const limit = 20;
    const offset = limit * (Number(pageNumber) - 1);
    const { count, rows: categorias } = await FinanceiroCategoria_1.default.findAndCountAll({
        where,
        include: [
            {
                model: FinanceiroCategoria_1.default,
                as: "filhos",
                required: false
            },
            {
                model: FinanceiroCategoria_1.default,
                as: "pai",
                required: false
            }
        ],
        limit,
        offset,
        order: [["nome", "ASC"]]
    });
    const hasMore = count > offset + categorias.length;
    return {
        categorias,
        count,
        hasMore
    };
};
exports.default = ListFinanceiroCategoriasService;
