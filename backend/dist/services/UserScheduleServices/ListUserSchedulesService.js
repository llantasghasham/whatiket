"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const User_1 = __importDefault(require("../../models/User"));
const ListUserSchedulesService = async ({ companyId, userId, profile, userType, searchParam = "", active, pageNumber = "1" }) => {
    const where = { companyId };
    const normalizedUserType = (userType || "").toLowerCase();
    const canViewAllSchedules = ["administrador", "gerente", "admin", "manager"].includes(normalizedUserType);
    // Se não for administrador/gerente (via userType), filtra apenas as agendas do próprio usuário
    if (!canViewAllSchedules && userId) {
        where.userId = userId;
    }
    if (searchParam) {
        where[sequelize_1.Op.or] = [
            { name: { [sequelize_1.Op.iLike]: `%${searchParam}%` } },
            { description: { [sequelize_1.Op.iLike]: `%${searchParam}%` } }
        ];
    }
    if (typeof active !== "undefined" && active !== "") {
        where.active = active === "true";
    }
    const limit = 20;
    const offset = limit * (Number(pageNumber) - 1);
    const { rows, count } = await UserSchedule_1.default.findAndCountAll({
        where,
        include: [
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name", "email", "startWork", "endWork"]
            }
        ],
        limit,
        offset,
        order: [["name", "ASC"]]
    });
    return {
        schedules: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListUserSchedulesService;
