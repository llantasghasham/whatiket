"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Project_1 = __importDefault(require("../../models/Project"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const ProjectUser_1 = __importDefault(require("../../models/ProjectUser"));
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const User_1 = __importDefault(require("../../models/User"));
const ListProjectsService = async ({ companyId, searchParam, status, clientId, pageNumber = 1, limit = 20 }) => {
    const where = {
        companyId
    };
    if (status) {
        where.status = status;
    }
    if (clientId) {
        where.clientId = clientId;
    }
    if (searchParam) {
        const like = { [sequelize_1.Op.iLike]: `%${searchParam}%` };
        where[sequelize_1.Op.or] = [
            { name: like },
            { description: like }
        ];
    }
    const offset = (pageNumber - 1) * limit;
    const { rows, count } = await Project_1.default.findAndCountAll({
        where,
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "companyName"]
            },
            {
                model: ProjectUser_1.default,
                as: "users",
                include: [
                    {
                        model: User_1.default,
                        as: "user",
                        attributes: ["id", "name"]
                    }
                ]
            },
            {
                model: ProjectTask_1.default,
                as: "tasks",
                attributes: ["id", "title", "status"]
            }
        ],
        order: [["updatedAt", "DESC"]],
        limit,
        offset
    });
    return {
        projects: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListProjectsService;
