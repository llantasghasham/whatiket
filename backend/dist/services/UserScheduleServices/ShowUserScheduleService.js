"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const User_1 = __importDefault(require("../../models/User"));
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const ShowUserScheduleService = async (id, companyId) => {
    const schedule = await UserSchedule_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name", "email", "startWork", "endWork"]
            },
            {
                model: Appointment_1.default,
                as: "appointments"
            }
        ]
    });
    if (!schedule) {
        throw new AppError_1.default("Agenda não encontrada", 404);
    }
    return schedule;
};
exports.default = ShowUserScheduleService;
