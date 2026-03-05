"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const sequelize_1 = require("sequelize");
const Fatura_1 = __importDefault(require("../../models/Fatura"));
const ListFaturasService = async ({ companyId, searchParam = "", pageNumber = "1" }) => {
    const where = { companyId };
    if (searchParam) {
        where[sequelize_1.Op.or] = [
            { descricao: { [sequelize_1.Op.iLike]: `%${searchParam.toLowerCase().trim()}%` } },
            { status: { [sequelize_1.Op.iLike]: `%${searchParam.toLowerCase().trim()}%` } }
        ];
    }
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: faturas } = await Fatura_1.default.findAndCountAll({
        where,
        limit,
        offset,
        order: [["id", "DESC"]]
    });
    const hasMore = count > offset + faturas.length;
    return { faturas, count, hasMore };
};
exports.default = ListFaturasService;
