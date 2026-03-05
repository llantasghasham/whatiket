"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserTasks = exports.removeTaskUser = exports.addTaskUser = exports.removeUser = exports.addUser = exports.removeProduct = exports.addProduct = exports.removeService = exports.addService = exports.removeTask = exports.updateTask = exports.storeTask = exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const ListProjectsService_1 = __importDefault(require("../services/ProjectServices/ListProjectsService"));
const ListUserTasksService_1 = __importDefault(require("../services/ProjectServices/ListUserTasksService"));
const CreateProjectService_1 = __importDefault(require("../services/ProjectServices/CreateProjectService"));
const ShowProjectService_1 = __importDefault(require("../services/ProjectServices/ShowProjectService"));
const UpdateProjectService_1 = __importDefault(require("../services/ProjectServices/UpdateProjectService"));
const DeleteProjectService_1 = __importDefault(require("../services/ProjectServices/DeleteProjectService"));
const CreateProjectTaskService_1 = __importDefault(require("../services/ProjectServices/CreateProjectTaskService"));
const UpdateProjectTaskService_1 = __importDefault(require("../services/ProjectServices/UpdateProjectTaskService"));
const DeleteProjectTaskService_1 = __importDefault(require("../services/ProjectServices/DeleteProjectTaskService"));
const ManageProjectItemsService_1 = require("../services/ProjectServices/ManageProjectItemsService");
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, status, clientId, pageNumber, limit } = req.query;
    const result = await (0, ListProjectsService_1.default)({
        companyId,
        searchParam,
        status,
        clientId: clientId ? Number(clientId) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined
    });
    return res.json(result);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { userIds, serviceIds, productIds, ...data } = req.body;
    const project = await (0, CreateProjectService_1.default)({
        ...data,
        companyId
    });
    // Adicionar usuários ao projeto
    if (userIds && Array.isArray(userIds)) {
        for (const userId of userIds) {
            try {
                await (0, ManageProjectItemsService_1.addUserToProject)({
                    companyId,
                    projectId: project.id,
                    userId: Number(userId)
                });
            }
            catch (err) {
                console.error(`Erro ao adicionar usuário ${userId}:`, err);
            }
        }
    }
    // Adicionar serviços ao projeto
    if (serviceIds && Array.isArray(serviceIds)) {
        for (const item of serviceIds) {
            try {
                const serviceId = typeof item === "object" ? item.serviceId : item;
                const quantity = typeof item === "object" ? item.quantity : 1;
                await (0, ManageProjectItemsService_1.addServiceToProject)({
                    companyId,
                    projectId: project.id,
                    serviceId: Number(serviceId),
                    quantity
                });
            }
            catch (err) {
                console.error(`Erro ao adicionar serviço:`, err);
            }
        }
    }
    // Adicionar produtos ao projeto
    if (productIds && Array.isArray(productIds)) {
        for (const item of productIds) {
            try {
                const productId = typeof item === "object" ? item.productId : item;
                const quantity = typeof item === "object" ? item.quantity : 1;
                await (0, ManageProjectItemsService_1.addProductToProject)({
                    companyId,
                    projectId: project.id,
                    productId: Number(productId),
                    quantity
                });
            }
            catch (err) {
                console.error(`Erro ao adicionar produto:`, err);
            }
        }
    }
    // Retornar projeto com associações
    const fullProject = await (0, ShowProjectService_1.default)({ id: project.id, companyId });
    return res.status(201).json(fullProject);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    const project = await (0, ShowProjectService_1.default)({
        id: Number(projectId),
        companyId
    });
    return res.json(project);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    const { userIds, serviceIds, productIds, ...data } = req.body;
    const project = await (0, UpdateProjectService_1.default)({
        id: Number(projectId),
        companyId,
        ...data
    });
    // Atualizar usuários - remover todos e adicionar novamente
    if (userIds !== undefined && Array.isArray(userIds)) {
        // Buscar usuários atuais
        const currentProject = await (0, ShowProjectService_1.default)({ id: Number(projectId), companyId });
        const currentUserIds = (currentProject.users || []).map((pu) => pu.user?.id || pu.userId);
        // Remover usuários que não estão mais na lista
        for (const userId of currentUserIds) {
            if (!userIds.includes(userId)) {
                try {
                    await (0, ManageProjectItemsService_1.removeUserFromProject)(companyId, Number(projectId), Number(userId));
                }
                catch (err) {
                    console.error(`Erro ao remover usuário ${userId}:`, err);
                }
            }
        }
        // Adicionar novos usuários
        for (const userId of userIds) {
            if (!currentUserIds.includes(userId)) {
                try {
                    await (0, ManageProjectItemsService_1.addUserToProject)({
                        companyId,
                        projectId: Number(projectId),
                        userId: Number(userId)
                    });
                }
                catch (err) {
                    console.error(`Erro ao adicionar usuário ${userId}:`, err);
                }
            }
        }
    }
    // Atualizar serviços
    if (serviceIds !== undefined && Array.isArray(serviceIds)) {
        const currentProject = await (0, ShowProjectService_1.default)({ id: Number(projectId), companyId });
        const currentServiceIds = (currentProject.services || []).map((ps) => ps.service?.id || ps.serviceId);
        const newServiceIds = serviceIds.map((item) => typeof item === "object" ? item.serviceId : item);
        // Remover serviços que não estão mais na lista
        for (const serviceId of currentServiceIds) {
            if (!newServiceIds.includes(serviceId)) {
                try {
                    await (0, ManageProjectItemsService_1.removeServiceFromProject)(companyId, Number(projectId), Number(serviceId));
                }
                catch (err) {
                    console.error(`Erro ao remover serviço ${serviceId}:`, err);
                }
            }
        }
        // Adicionar novos serviços
        for (const item of serviceIds) {
            const serviceId = typeof item === "object" ? item.serviceId : item;
            if (!currentServiceIds.includes(serviceId)) {
                try {
                    const quantity = typeof item === "object" ? item.quantity : 1;
                    await (0, ManageProjectItemsService_1.addServiceToProject)({
                        companyId,
                        projectId: Number(projectId),
                        serviceId: Number(serviceId),
                        quantity
                    });
                }
                catch (err) {
                    console.error(`Erro ao adicionar serviço ${serviceId}:`, err);
                }
            }
        }
    }
    // Atualizar produtos
    if (productIds !== undefined && Array.isArray(productIds)) {
        const currentProject = await (0, ShowProjectService_1.default)({ id: Number(projectId), companyId });
        const currentProductIds = (currentProject.products || []).map((pp) => pp.product?.id || pp.productId);
        const newProductIds = productIds.map((item) => typeof item === "object" ? item.productId : item);
        // Remover produtos que não estão mais na lista
        for (const productId of currentProductIds) {
            if (!newProductIds.includes(productId)) {
                try {
                    await (0, ManageProjectItemsService_1.removeProductFromProject)(companyId, Number(projectId), Number(productId));
                }
                catch (err) {
                    console.error(`Erro ao remover produto ${productId}:`, err);
                }
            }
        }
        // Adicionar novos produtos
        for (const item of productIds) {
            const productId = typeof item === "object" ? item.productId : item;
            if (!currentProductIds.includes(productId)) {
                try {
                    const quantity = typeof item === "object" ? item.quantity : 1;
                    await (0, ManageProjectItemsService_1.addProductToProject)({
                        companyId,
                        projectId: Number(projectId),
                        productId: Number(productId),
                        quantity
                    });
                }
                catch (err) {
                    console.error(`Erro ao adicionar produto ${productId}:`, err);
                }
            }
        }
    }
    // Retornar projeto com associações atualizadas
    const fullProject = await (0, ShowProjectService_1.default)({ id: Number(projectId), companyId });
    return res.json(fullProject);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    await (0, DeleteProjectService_1.default)({
        id: Number(projectId),
        companyId
    });
    return res.status(204).send();
};
exports.remove = remove;
// Tasks
const storeTask = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    const data = req.body;
    const task = await (0, CreateProjectTaskService_1.default)({
        ...data,
        projectId: Number(projectId),
        companyId
    });
    return res.status(201).json(task);
};
exports.storeTask = storeTask;
const updateTask = async (req, res) => {
    const { companyId } = req.user;
    const { taskId } = req.params;
    const data = req.body;
    const task = await (0, UpdateProjectTaskService_1.default)({
        id: Number(taskId),
        companyId,
        ...data
    });
    return res.json(task);
};
exports.updateTask = updateTask;
const removeTask = async (req, res) => {
    const { companyId } = req.user;
    const { taskId } = req.params;
    await (0, DeleteProjectTaskService_1.default)({
        id: Number(taskId),
        companyId
    });
    return res.status(204).send();
};
exports.removeTask = removeTask;
// Services
const addService = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    const { serviceId, quantity, unitPrice, notes } = req.body;
    const projectService = await (0, ManageProjectItemsService_1.addServiceToProject)({
        companyId,
        projectId: Number(projectId),
        serviceId: Number(serviceId),
        quantity,
        unitPrice,
        notes
    });
    return res.status(201).json(projectService);
};
exports.addService = addService;
const removeService = async (req, res) => {
    const { companyId } = req.user;
    const { projectId, serviceId } = req.params;
    await (0, ManageProjectItemsService_1.removeServiceFromProject)(companyId, Number(projectId), Number(serviceId));
    return res.status(204).send();
};
exports.removeService = removeService;
// Products
const addProduct = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    const { productId, quantity, unitPrice, notes } = req.body;
    const projectProduct = await (0, ManageProjectItemsService_1.addProductToProject)({
        companyId,
        projectId: Number(projectId),
        productId: Number(productId),
        quantity,
        unitPrice,
        notes
    });
    return res.status(201).json(projectProduct);
};
exports.addProduct = addProduct;
const removeProduct = async (req, res) => {
    const { companyId } = req.user;
    const { projectId, productId } = req.params;
    await (0, ManageProjectItemsService_1.removeProductFromProject)(companyId, Number(projectId), Number(productId));
    return res.status(204).send();
};
exports.removeProduct = removeProduct;
// Users
const addUser = async (req, res) => {
    const { companyId } = req.user;
    const { projectId } = req.params;
    const { userId, role, effortAllocation } = req.body;
    const projectUser = await (0, ManageProjectItemsService_1.addUserToProject)({
        companyId,
        projectId: Number(projectId),
        userId: Number(userId),
        role,
        effortAllocation
    });
    return res.status(201).json(projectUser);
};
exports.addUser = addUser;
const removeUser = async (req, res) => {
    const { companyId } = req.user;
    const { projectId, userId } = req.params;
    await (0, ManageProjectItemsService_1.removeUserFromProject)(companyId, Number(projectId), Number(userId));
    return res.status(204).send();
};
exports.removeUser = removeUser;
// Task Users
const addTaskUser = async (req, res) => {
    const { companyId } = req.user;
    const { taskId } = req.params;
    const { userId, responsibility } = req.body;
    const taskUser = await (0, ManageProjectItemsService_1.addUserToTask)({
        companyId,
        taskId: Number(taskId),
        userId: Number(userId),
        responsibility
    });
    return res.status(201).json(taskUser);
};
exports.addTaskUser = addTaskUser;
const removeTaskUser = async (req, res) => {
    const { companyId } = req.user;
    const { taskId, userId } = req.params;
    await (0, ManageProjectItemsService_1.removeUserFromTask)(companyId, Number(taskId), Number(userId));
    return res.status(204).send();
};
exports.removeTaskUser = removeTaskUser;
// Listar tarefas do usuário
const listUserTasks = async (req, res) => {
    const { companyId } = req.user;
    const { userId } = req.params;
    const { status, pageNumber } = req.query;
    const result = await (0, ListUserTasksService_1.default)({
        companyId,
        userId: Number(userId),
        status,
        pageNumber: pageNumber ? Number(pageNumber) : 1
    });
    return res.json(result);
};
exports.listUserTasks = listUserTasks;
