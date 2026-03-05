"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Project_1 = __importDefault(require("../../models/Project"));
const DeleteProjectService = async ({ id, companyId }) => {
    const project = await Project_1.default.findOne({
        where: { id, companyId }
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    await project.destroy();
};
exports.default = DeleteProjectService;
