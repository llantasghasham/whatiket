"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const ProjectTaskUser_1 = __importDefault(require("../../models/ProjectTaskUser"));
const Project_1 = __importDefault(require("../../models/Project"));
const User_1 = __importDefault(require("../../models/User"));
const sequelize_1 = require("sequelize");
const ListUserTasksService = async ({ companyId, userId, status, pageNumber = 1 }) => {
    const limit = 50;
    const offset = (pageNumber - 1) * limit;
    // Buscar IDs das tarefas atribuídas ao usuário
    const taskUserRecords = await ProjectTaskUser_1.default.findAll({
        where: { userId, companyId },
        attributes: ["taskId"]
    });
    const taskIds = taskUserRecords.map(tu => tu.taskId);
    if (taskIds.length === 0) {
        return { tasks: [], count: 0, hasMore: false };
    }
    const where = {
        id: { [sequelize_1.Op.in]: taskIds },
        companyId
    };
    if (status) {
        where.status = status;
    }
    const { count, rows: tasks } = await ProjectTask_1.default.findAndCountAll({
        where,
        include: [
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status"]
            },
            {
                model: User_1.default,
                as: "assignedUsers",
                attributes: ["id", "name", "email"],
                through: { attributes: ["responsibility"] }
            }
        ],
        order: [
            ["dueDate", "ASC"],
            ["order", "ASC"],
            ["createdAt", "DESC"]
        ],
        limit,
        offset
    });
    const hasMore = count > offset + tasks.length;
    return { tasks, count, hasMore };
};
exports.default = ListUserTasksService;
