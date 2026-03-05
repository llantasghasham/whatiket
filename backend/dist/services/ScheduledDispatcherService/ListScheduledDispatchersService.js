"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ListScheduledDispatchersService = async ({ companyId }) => {
    const dispatchers = await ScheduledDispatcher_1.default.findAll({
        where: { companyId },
        include: [
            {
                model: Whatsapp_1.default,
                attributes: ["id", "name", "channel"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
    return dispatchers;
};
exports.default = ListScheduledDispatchersService;
