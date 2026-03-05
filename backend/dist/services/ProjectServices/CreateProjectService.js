"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Project_1 = __importDefault(require("../../models/Project"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const CreateProjectService = async (data) => {
    const schema = Yup.object().shape({
        companyId: Yup.number().required(),
        clientId: Yup.number().required(),
        name: Yup.string().required().min(2),
        status: Yup.string()
            .oneOf(["draft", "active", "paused", "completed", "cancelled"])
            .default("draft")
    });
    await schema.validate(data);
    const client = await CrmClient_1.default.findOne({
        where: {
            id: data.clientId,
            companyId: data.companyId
        }
    });
    if (!client) {
        throw new AppError_1.default("ERR_CLIENT_NOT_FOUND", 404);
    }
    const project = await Project_1.default.create({
        ...data,
        status: data.status || "draft"
    });
    return project;
};
exports.default = CreateProjectService;
