"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const ProjectTaskUser_1 = __importDefault(require("../../models/ProjectTaskUser"));
const Project_1 = __importDefault(require("../../models/Project"));
const User_1 = __importDefault(require("../../models/User"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber, projectId, status, assignedUserId } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const whereCondition = { companyId };
    if (projectId) {
        whereCondition.projectId = Number(projectId);
    }
    if (status) {
        whereCondition.status = status;
    }
    const includeCondition = [
        {
            model: Project_1.default,
            as: "project",
            attributes: ["id", "name", "status"]
        },
        {
            model: User_1.default,
            as: "assignedUsers",
            attributes: ["id", "name", "email"],
            through: { attributes: [] }
        }
    ];
    // Filtrar por usuário atribuído
    if (assignedUserId) {
        includeCondition[1].where = { id: Number(assignedUserId) };
        includeCondition[1].required = true;
    }
    const { count, rows: tasks } = await ProjectTask_1.default.findAndCountAll({
        where: whereCondition,
        include: includeCondition,
        order: [["order", "ASC"], ["createdAt", "DESC"]],
        limit,
        offset
    });
    const hasMore = count > offset + tasks.length;
    return res.json({ tasks, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const task = await ProjectTask_1.default.findOne({
        where: { id: Number(id), companyId },
        include: [
            {
                model: Project_1.default,
                as: "project",
                attributes: ["id", "name", "status", "clientId"]
            },
            {
                model: User_1.default,
                as: "assignedUsers",
                attributes: ["id", "name", "email"],
                through: { attributes: [] }
            }
        ]
    });
    if (!task) {
        throw new AppError_1.default("ERR_TASK_NOT_FOUND", 404);
    }
    return res.json(task);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { projectId, title, description, status, order, startDate, dueDate, assignedUserIds } = req.body;
    if (!projectId) {
        throw new AppError_1.default("ERR_TASK_PROJECT_REQUIRED", 400);
    }
    if (!title) {
        throw new AppError_1.default("ERR_TASK_TITLE_REQUIRED", 400);
    }
    // Verificar se o projeto existe e pertence à empresa
    const project = await Project_1.default.findOne({
        where: { id: projectId, companyId: externalAuth.companyId }
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    const task = await ProjectTask_1.default.create({
        projectId,
        title,
        description: description || null,
        status: status || "pending",
        order: order || 0,
        startDate: startDate || null,
        dueDate: dueDate || null,
        companyId: externalAuth.companyId
    });
    // Adicionar usuários atribuídos
    if (assignedUserIds && Array.isArray(assignedUserIds)) {
        for (const userId of assignedUserIds) {
            await ProjectTaskUser_1.default.create({
                projectTaskId: task.id,
                userId
            });
        }
    }
    await task.reload({
        include: [
            { model: Project_1.default, as: "project", attributes: ["id", "name", "status"] },
            { model: User_1.default, as: "assignedUsers", attributes: ["id", "name", "email"], through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "projectTask.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            task
        }
    });
    return res.status(201).json(task);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { title, description, status, order, startDate, dueDate, completedAt, assignedUserIds } = req.body;
    const task = await ProjectTask_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!task) {
        throw new AppError_1.default("ERR_TASK_NOT_FOUND", 404);
    }
    // Se status mudou para completed, definir completedAt
    let newCompletedAt = completedAt;
    if (status === "completed" && task.status !== "completed" && !completedAt) {
        newCompletedAt = new Date();
    }
    await task.update({
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        status: status !== undefined ? status : task.status,
        order: order !== undefined ? order : task.order,
        startDate: startDate !== undefined ? startDate : task.startDate,
        dueDate: dueDate !== undefined ? dueDate : task.dueDate,
        completedAt: newCompletedAt !== undefined ? newCompletedAt : task.completedAt
    });
    // Atualizar usuários atribuídos se fornecido
    if (assignedUserIds !== undefined && Array.isArray(assignedUserIds)) {
        await ProjectTaskUser_1.default.destroy({ where: { projectTaskId: task.id } });
        for (const userId of assignedUserIds) {
            await ProjectTaskUser_1.default.create({
                projectTaskId: task.id,
                userId
            });
        }
    }
    await task.reload({
        include: [
            { model: Project_1.default, as: "project", attributes: ["id", "name", "status"] },
            { model: User_1.default, as: "assignedUsers", attributes: ["id", "name", "email"], through: { attributes: [] } }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "projectTask.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            task
        }
    });
    return res.json(task);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const task = await ProjectTask_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!task) {
        throw new AppError_1.default("ERR_TASK_NOT_FOUND", 404);
    }
    // Remover usuários atribuídos
    await ProjectTaskUser_1.default.destroy({ where: { projectTaskId: task.id } });
    await task.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "projectTask.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            taskId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
