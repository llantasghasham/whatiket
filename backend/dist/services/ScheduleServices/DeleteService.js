"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schedule_1 = __importDefault(require("../../models/Schedule"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const DeleteEventService_1 = __importDefault(require("../GoogleCalendar/DeleteEventService"));
const DeleteService = async (id, companyId) => {
    console.log("DeleteService - iniciando remoção de schedule", "id:", id, "companyId:", companyId);
    const schedule = await Schedule_1.default.findOne({
        where: { id, companyId }
    });
    if (!schedule) {
        throw new AppError_1.default("ERR_NO_SCHEDULE_FOUND", 404);
    }
    // Remove evento correspondente no Google Calendar, se existir
    console.log("DeleteService - chamando DeleteEventService para schedule", schedule.id, "googleEventId:", schedule.googleEventId);
    await (0, DeleteEventService_1.default)({ schedule: schedule });
    await schedule.destroy();
    console.log("DeleteService - schedule removido do banco", schedule.id);
};
exports.default = DeleteService;
