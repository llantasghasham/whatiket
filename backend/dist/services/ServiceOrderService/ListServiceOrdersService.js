"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const ServiceOrder_1 = __importDefault(require("../../models/ServiceOrder"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ListServiceOrdersService = async ({ companyId, searchParam, status, customerId, pageNumber = 1, limit = 20 }) => {
    const where = { companyId };
    if (status) {
        where.status = status;
    }
    if (customerId) {
        where.customerId = customerId;
    }
    if (searchParam) {
        where[sequelize_1.Op.or] = [
            { "$customer.name$": { [sequelize_1.Op.iLike]: `%${searchParam}%` } },
            { "$customer.number$": { [sequelize_1.Op.iLike]: `%${searchParam}%` } },
            { "$customer.email$": { [sequelize_1.Op.iLike]: `%${searchParam}%` } },
            { "$ticket.id$": Number.isFinite(Number(searchParam)) ? Number(searchParam) : undefined }
        ].filter(Boolean);
    }
    const { count, rows } = await ServiceOrder_1.default.findAndCountAll({
        where,
        include: [
            {
                model: Contact_1.default,
                as: "customer",
                attributes: ["id", "name", "number", "email"]
            },
            {
                model: Ticket_1.default,
                as: "ticket",
                attributes: ["id", "status"]
            }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset: limit * (pageNumber - 1)
    });
    return {
        serviceOrders: rows,
        count,
        hasMore: count > limit * pageNumber
    };
};
exports.default = ListServiceOrdersService;
