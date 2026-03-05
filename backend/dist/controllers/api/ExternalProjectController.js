"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Project_1 = __importDefault(require("../../models/Project"));
const ProjectUser_1 = __importDefault(require("../../models/ProjectUser"));
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const User_1 = __importDefault(require("../../models/User"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber, searchParam, status, clientId } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const whereCondition = { companyId };
    if (searchParam) {
        whereCondition.name = {
            [require("sequelize").Op.iLike]: `%${searchParam}%`
        };
    }
    if (status) {
        whereCondition.status = status;
    }
    if (clientId) {
        whereCondition.clientId = Number(clientId);
    }
    const { count, rows: projects } = await Project_1.default.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email"]
            },
            {
                model: ProjectUser_1.default,
                as: "users",
                include: [{
                        model: User_1.default,
                        attributes: ["id", "name", "email"]
                    }]
            }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });
    const hasMore = count > offset + projects.length;
    return res.json({ projects, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const project = await Project_1.default.findOne({
        where: { id: Number(id), companyId },
        include: [
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phoneNumber"]
            },
            {
                model: ProjectUser_1.default,
                as: "users",
                include: [{
                        model: User_1.default,
                        attributes: ["id", "name", "email"]
                    }]
            },
            {
                model: ProjectTask_1.default,
                as: "tasks",
                include: [{
                        model: User_1.default,
                        as: "assignedUsers",
                        attributes: ["id", "name", "email"],
                        through: { attributes: [] }
                    }]
            }
        ]
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    return res.json(project);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, description, clientId, status, startDate, endDate, deliveryTime, warranty, terms, userIds } = req.body;
    if (!name) {
        throw new AppError_1.default("ERR_PROJECT_NAME_REQUIRED", 400);
    }
    const project = await Project_1.default.create({
        name,
        description: description || null,
        clientId: clientId || null,
        status: status || "draft",
        startDate: startDate || null,
        endDate: endDate || null,
        deliveryTime: deliveryTime || null,
        warranty: warranty || null,
        terms: terms || null,
        companyId: externalAuth.companyId
    });
    // Adicionar usuários ao projeto
    if (userIds && Array.isArray(userIds)) {
        for (const userId of userIds) {
            await ProjectUser_1.default.create({
                projectId: project.id,
                userId,
                companyId: externalAuth.companyId
            });
        }
    }
    await project.reload({
        include: [
            { model: CrmClient_1.default, as: "client", attributes: ["id", "name", "email"] },
            { model: ProjectUser_1.default, as: "users", include: [{ model: User_1.default, attributes: ["id", "name", "email"] }] }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "project.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            project
        }
    });
    return res.status(201).json(project);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, description, clientId, status, startDate, endDate, deliveryTime, warranty, terms, userIds } = req.body;
    const project = await Project_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    await project.update({
        name: name !== undefined ? name : project.name,
        description: description !== undefined ? description : project.description,
        clientId: clientId !== undefined ? clientId : project.clientId,
        status: status !== undefined ? status : project.status,
        startDate: startDate !== undefined ? startDate : project.startDate,
        endDate: endDate !== undefined ? endDate : project.endDate,
        deliveryTime: deliveryTime !== undefined ? deliveryTime : project.deliveryTime,
        warranty: warranty !== undefined ? warranty : project.warranty,
        terms: terms !== undefined ? terms : project.terms
    });
    // Atualizar usuários se fornecido
    if (userIds !== undefined && Array.isArray(userIds)) {
        await ProjectUser_1.default.destroy({ where: { projectId: project.id } });
        for (const userId of userIds) {
            await ProjectUser_1.default.create({
                projectId: project.id,
                userId,
                companyId: externalAuth.companyId
            });
        }
    }
    await project.reload({
        include: [
            { model: CrmClient_1.default, as: "client", attributes: ["id", "name", "email"] },
            { model: ProjectUser_1.default, as: "users", include: [{ model: User_1.default, attributes: ["id", "name", "email"] }] }
        ]
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "project.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            project
        }
    });
    return res.json(project);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const project = await Project_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    // Remover usuários e tarefas relacionadas
    await ProjectUser_1.default.destroy({ where: { projectId: project.id } });
    await ProjectTask_1.default.destroy({ where: { projectId: project.id } });
    await project.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "project.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            projectId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
