"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const FinanceiroFatura_1 = __importDefault(require("../../models/FinanceiroFatura"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const ListFinanceiroFaturasService = async ({ companyId, searchParam = "", status, tipoRecorrencia, ativa, clientId, projectId, pageNumber = "1" }) => {
    const where = { companyId };
    if (searchParam) {
        const term = `%${searchParam.trim().toLowerCase()}%`;
        where[sequelize_1.Op.or] = [
            { descricao: { [sequelize_1.Op.iLike]: term } },
            { status: { [sequelize_1.Op.iLike]: term } }
        ];
    }
    if (status) {
        where.status = status;
    }
    if (tipoRecorrencia) {
        where.tipoRecorrencia = tipoRecorrencia;
    }
    if (typeof ativa !== "undefined") {
        where.ativa = ativa === "true";
    }
    if (clientId) {
        where.clientId = clientId;
    }
    if (projectId) {
        where.projectId = projectId;
    }
    const limit = 20;
    const offset = limit * (Number(pageNumber) - 1);
    const { rows, count } = await FinanceiroFatura_1.default.findAndCountAll({
        where,
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone", "status"]
            }
        ],
        limit,
        offset,
        order: [
            ["dataVencimento", "DESC"],
            ["id", "DESC"]
        ]
    });
    return {
        faturamentos: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListFinanceiroFaturasService;
