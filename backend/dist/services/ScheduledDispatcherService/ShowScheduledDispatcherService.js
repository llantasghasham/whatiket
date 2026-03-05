"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ShowScheduledDispatcherService = async ({ id, companyId }) => {
    const dispatcher = await ScheduledDispatcher_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: Whatsapp_1.default,
                attributes: ["id", "name", "channel"]
            }
        ]
    });
    if (!dispatcher) {
        throw new AppError_1.default("Scheduled dispatcher not found", 404);
    }
    return dispatcher;
};
exports.default = ShowScheduledDispatcherService;
