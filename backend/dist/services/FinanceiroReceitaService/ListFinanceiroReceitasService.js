"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FinanceiroReceita_1 = __importDefault(require("../../models/FinanceiroReceita"));
const FinanceiroFornecedor_1 = __importDefault(require("../../models/FinanceiroFornecedor"));
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const ListFinanceiroReceitasService = async ({ companyId, searchParam = "", fornecedorId, categoriaId, status, dataVencimentoInicio, dataVencimentoFim, pageNumber = 1 }) => {
    const limit = 20;
    const offset = limit * (pageNumber - 1);
    const whereCondition = {
        companyId
    };
    if (searchParam) {
        whereCondition.descricao = { [require("sequelize").Op.iLike]: `%${searchParam}%` };
    }
    if (fornecedorId) {
        whereCondition.fornecedorId = fornecedorId;
    }
    if (categoriaId) {
        whereCondition.categoriaId = categoriaId;
    }
    if (status) {
        whereCondition.status = status;
    }
    if (dataVencimentoInicio || dataVencimentoFim) {
        whereCondition.dataVencimento = {};
        if (dataVencimentoInicio) {
            whereCondition.dataVencimento[require("sequelize").Op.gte] = dataVencimentoInicio;
        }
        if (dataVencimentoFim) {
            whereCondition.dataVencimento[require("sequelize").Op.lte] = dataVencimentoFim;
        }
    }
    const { count, rows: receitas } = await FinanceiroReceita_1.default.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: FinanceiroFornecedor_1.default,
                as: "fornecedor",
                attributes: ["id", "nome"]
            },
            {
                model: FinanceiroCategoria_1.default,
                as: "categoria",
                attributes: ["id", "nome", "tipo", "cor"]
            }
        ],
        limit,
        offset,
        order: [["dataVencimento", "ASC"]]
    });
    const hasMore = count > offset + receitas.length;
    return {
        receitas,
        count,
        hasMore
    };
};
exports.default = ListFinanceiroReceitasService;
