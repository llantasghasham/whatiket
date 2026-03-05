"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const DeleteScheduledDispatcherService = async ({ dispatcherId, companyId }) => {
    const dispatcher = await ScheduledDispatcher_1.default.findOne({
        where: { id: dispatcherId, companyId }
    });
    if (!dispatcher) {
        throw new AppError_1.default("Scheduled dispatcher not found", 404);
    }
    await dispatcher.destroy();
};
exports.default = DeleteScheduledDispatcherService;
