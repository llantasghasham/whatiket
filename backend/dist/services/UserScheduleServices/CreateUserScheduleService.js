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
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const User_1 = __importDefault(require("../../models/User"));
const CreateUserScheduleService = async (data) => {
    const schema = Yup.object().shape({
        name: Yup.string().required("Nome é obrigatório").max(100),
        description: Yup.string().nullable(),
        active: Yup.boolean().default(true),
        userId: Yup.number().required("Usuário é obrigatório"),
        companyId: Yup.number().required()
    });
    try {
        await schema.validate(data);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const user = await User_1.default.findOne({
        where: { id: data.userId, companyId: data.companyId }
    });
    if (!user) {
        throw new AppError_1.default("Usuário não encontrado", 404);
    }
    const existingSchedule = await UserSchedule_1.default.findOne({
        where: { userId: data.userId }
    });
    if (existingSchedule) {
        throw new AppError_1.default("Este usuário já possui uma agenda vinculada", 400);
    }
    const schedule = await UserSchedule_1.default.create({
        name: data.name,
        description: data.description || null,
        active: data.active ?? true,
        userId: data.userId,
        companyId: data.companyId
    });
    return schedule;
};
exports.default = CreateUserScheduleService;
