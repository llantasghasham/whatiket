"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const DeleteUserScheduleService = async (id, companyId) => {
    const schedule = await UserSchedule_1.default.findOne({
        where: { id, companyId }
    });
    if (!schedule) {
        throw new AppError_1.default("Agenda não encontrada", 404);
    }
    await schedule.destroy();
};
exports.default = DeleteUserScheduleService;
