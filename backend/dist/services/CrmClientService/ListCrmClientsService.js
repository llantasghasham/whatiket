"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const ListCrmClientsService = async ({ companyId, searchParam, status, type, ownerUserId, pageNumber = 1, limit = 20 }) => {
    const where = {
        companyId
    };
    if (status) {
        where.status = status;
    }
    if (type) {
        where.type = type;
    }
    if (ownerUserId) {
        where.ownerUserId = ownerUserId;
    }
    if (searchParam) {
        const like = { [sequelize_1.Op.iLike]: `%${searchParam}%` };
        where[sequelize_1.Op.or] = [
            { name: like },
            { companyName: like },
            { email: like },
            { phone: like },
            { document: like },
            { city: like }
        ];
    }
    const offset = (pageNumber - 1) * limit;
    const { rows, count } = await CrmClient_1.default.findAndCountAll({
        where,
        order: [["updatedAt", "DESC"]],
        limit,
        offset
    });
    return {
        clients: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListCrmClientsService;
