"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromTask = exports.addUserToTask = exports.removeUserFromProject = exports.addUserToProject = exports.removeProductFromProject = exports.addProductToProject = exports.removeServiceFromProject = exports.addServiceToProject = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Project_1 = __importDefault(require("../../models/Project"));
const ProjectService_1 = __importDefault(require("../../models/ProjectService"));
const ProjectProduct_1 = __importDefault(require("../../models/ProjectProduct"));
const ProjectUser_1 = __importDefault(require("../../models/ProjectUser"));
const ProjectTaskUser_1 = __importDefault(require("../../models/ProjectTaskUser"));
const verifyProject = async (projectId, companyId) => {
    const project = await Project_1.default.findOne({
        where: { id: projectId, companyId }
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    return project;
};
const addServiceToProject = async (data) => {
    await verifyProject(data.projectId, data.companyId);
    const [projectService, created] = await ProjectService_1.default.findOrCreate({
        where: {
            projectId: data.projectId,
            serviceId: data.serviceId
        },
        defaults: {
            companyId: data.companyId,
            projectId: data.projectId,
            serviceId: data.serviceId,
            quantity: data.quantity || 1,
            unitPrice: data.unitPrice,
            notes: data.notes
        }
    });
    if (!created) {
        await projectService.update({
            quantity: data.quantity || projectService.quantity,
            unitPrice: data.unitPrice ?? projectService.unitPrice,
            notes: data.notes ?? projectService.notes
        });
    }
    return projectService;
};
exports.addServiceToProject = addServiceToProject;
const removeServiceFromProject = async (companyId, projectId, serviceId) => {
    await verifyProject(projectId, companyId);
    const deleted = await ProjectService_1.default.destroy({
        where: { projectId, serviceId }
    });
    if (!deleted) {
        throw new AppError_1.default("ERR_SERVICE_NOT_IN_PROJECT", 404);
    }
};
exports.removeServiceFromProject = removeServiceFromProject;
const addProductToProject = async (data) => {
    await verifyProject(data.projectId, data.companyId);
    const [projectProduct, created] = await ProjectProduct_1.default.findOrCreate({
        where: {
            projectId: data.projectId,
            productId: data.productId
        },
        defaults: {
            companyId: data.companyId,
            projectId: data.projectId,
            productId: data.productId,
            quantity: data.quantity || 1,
            unitPrice: data.unitPrice,
            notes: data.notes
        }
    });
    if (!created) {
        await projectProduct.update({
            quantity: data.quantity || projectProduct.quantity,
            unitPrice: data.unitPrice ?? projectProduct.unitPrice,
            notes: data.notes ?? projectProduct.notes
        });
    }
    return projectProduct;
};
exports.addProductToProject = addProductToProject;
const removeProductFromProject = async (companyId, projectId, productId) => {
    await verifyProject(projectId, companyId);
    const deleted = await ProjectProduct_1.default.destroy({
        where: { projectId, productId }
    });
    if (!deleted) {
        throw new AppError_1.default("ERR_PRODUCT_NOT_IN_PROJECT", 404);
    }
};
exports.removeProductFromProject = removeProductFromProject;
const addUserToProject = async (data) => {
    await verifyProject(data.projectId, data.companyId);
    const [projectUser, created] = await ProjectUser_1.default.findOrCreate({
        where: {
            projectId: data.projectId,
            userId: data.userId
        },
        defaults: {
            companyId: data.companyId,
            projectId: data.projectId,
            userId: data.userId,
            role: data.role || "participant",
            effortAllocation: data.effortAllocation
        }
    });
    if (!created) {
        await projectUser.update({
            role: data.role || projectUser.role,
            effortAllocation: data.effortAllocation ?? projectUser.effortAllocation
        });
    }
    return projectUser;
};
exports.addUserToProject = addUserToProject;
const removeUserFromProject = async (companyId, projectId, userId) => {
    await verifyProject(projectId, companyId);
    const deleted = await ProjectUser_1.default.destroy({
        where: { projectId, userId }
    });
    if (!deleted) {
        throw new AppError_1.default("ERR_USER_NOT_IN_PROJECT", 404);
    }
};
exports.removeUserFromProject = removeUserFromProject;
const addUserToTask = async (data) => {
    const [taskUser, created] = await ProjectTaskUser_1.default.findOrCreate({
        where: {
            taskId: data.taskId,
            userId: data.userId
        },
        defaults: {
            companyId: data.companyId,
            taskId: data.taskId,
            userId: data.userId,
            responsibility: data.responsibility
        }
    });
    if (!created && data.responsibility) {
        await taskUser.update({ responsibility: data.responsibility });
    }
    return taskUser;
};
exports.addUserToTask = addUserToTask;
const removeUserFromTask = async (companyId, taskId, userId) => {
    const deleted = await ProjectTaskUser_1.default.destroy({
        where: { taskId, userId, companyId }
    });
    if (!deleted) {
        throw new AppError_1.default("ERR_USER_NOT_IN_TASK", 404);
    }
};
exports.removeUserFromTask = removeUserFromTask;
