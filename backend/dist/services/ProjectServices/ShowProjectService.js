"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Project_1 = __importDefault(require("../../models/Project"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const Invoices_1 = __importDefault(require("../../models/Invoices"));
const ProjectService_1 = __importDefault(require("../../models/ProjectService"));
const ProjectProduct_1 = __importDefault(require("../../models/ProjectProduct"));
const ProjectUser_1 = __importDefault(require("../../models/ProjectUser"));
const ProjectTask_1 = __importDefault(require("../../models/ProjectTask"));
const ProjectTaskUser_1 = __importDefault(require("../../models/ProjectTaskUser"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const Produto_1 = __importDefault(require("../../models/Produto"));
const User_1 = __importDefault(require("../../models/User"));
const ShowProjectService = async ({ id, companyId }) => {
    const project = await Project_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: CrmClient_1.default,
                as: "client"
            },
            {
                model: Invoices_1.default,
                as: "invoice"
            },
            {
                model: ProjectService_1.default,
                as: "services",
                include: [
                    {
                        model: Servico_1.default,
                        as: "service"
                    }
                ]
            },
            {
                model: ProjectProduct_1.default,
                as: "products",
                include: [
                    {
                        model: Produto_1.default,
                        as: "product"
                    }
                ]
            },
            {
                model: ProjectUser_1.default,
                as: "users",
                include: [
                    {
                        model: User_1.default,
                        as: "user",
                        attributes: ["id", "name", "email"]
                    }
                ]
            },
            {
                model: ProjectTask_1.default,
                as: "tasks",
                include: [
                    {
                        model: ProjectTaskUser_1.default,
                        as: "taskUsers",
                        include: [
                            {
                                model: User_1.default,
                                as: "user",
                                attributes: ["id", "name"]
                            }
                        ]
                    }
                ],
                order: [["order", "ASC"]]
            }
        ]
    });
    if (!project) {
        throw new AppError_1.default("ERR_PROJECT_NOT_FOUND", 404);
    }
    return project;
};
exports.default = ShowProjectService;
