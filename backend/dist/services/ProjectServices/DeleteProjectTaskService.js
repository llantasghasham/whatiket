"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const DeleteProjectTaskService = async ({ id, companyId }) => {
    const task = await ProjectTask_1.default.findOne({
        where: { id, companyId }
    });
    if (!task) {
        throw new AppError_1.default("ERR_TASK_NOT_FOUND", 404);
    }
    await task.destroy();
};
exports.default = DeleteProjectTaskService;
