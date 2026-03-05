"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const ListCrmLeadsService = async ({ companyId, searchParam, status, ownerUserId, pageNumber = 1, limit = 20 }) => {
    const where = {
        companyId
    };
    if (status) {
        where.status = status;
    }
    if (ownerUserId) {
        where.ownerUserId = ownerUserId;
    }
    if (searchParam) {
        const like = { [sequelize_1.Op.iLike]: `%${searchParam}%` };
        where[sequelize_1.Op.or] = [
            { name: like },
            { email: like },
            { phone: like },
            { companyName: like }
        ];
    }
    const offset = (pageNumber - 1) * limit;
    const { rows, count } = await CrmLead_1.default.findAndCountAll({
        where,
        order: [["updatedAt", "DESC"]],
        limit,
        offset
    });
    return {
        leads: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListCrmLeadsService;
