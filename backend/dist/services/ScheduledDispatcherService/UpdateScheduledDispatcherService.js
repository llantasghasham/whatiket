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
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const allowedEvents = ["birthday", "invoice_reminder", "invoice_overdue"];
const UpdateScheduledDispatcherService = async (payload) => {
    const dispatcher = await ScheduledDispatcher_1.default.findOne({
        where: { id: payload.dispatcherId, companyId: payload.companyId }
    });
    if (!dispatcher) {
        throw new AppError_1.default("Scheduled dispatcher not found", 404);
    }
    const schema = Yup.object().shape({
        title: Yup.string().trim(),
        messageTemplate: Yup.string().trim(),
        eventType: Yup.mixed().oneOf(allowedEvents),
        startTime: Yup.string().matches(/^\d{2}:\d{2}$/),
        sendIntervalSeconds: Yup.number().min(1).max(3600),
        daysBeforeDue: Yup.number().min(0).nullable(),
        daysAfterDue: Yup.number().min(0).nullable()
    });
    try {
        await schema.validate(payload, { abortEarly: false });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const updates = {};
    if (payload.title !== undefined)
        updates.title = payload.title.trim();
    if (payload.messageTemplate !== undefined)
        updates.messageTemplate = payload.messageTemplate;
    if (payload.eventType !== undefined)
        updates.eventType = payload.eventType;
    if (payload.whatsappId !== undefined)
        updates.whatsappId = payload.whatsappId;
    if (payload.startTime !== undefined)
        updates.startTime = payload.startTime;
    if (payload.sendIntervalSeconds !== undefined)
        updates.sendIntervalSeconds = payload.sendIntervalSeconds;
    if (payload.active !== undefined)
        updates.active = payload.active;
    if (updates.eventType || payload.daysBeforeDue !== undefined || payload.daysAfterDue !== undefined) {
        const event = updates.eventType || dispatcher.eventType;
        if (event === "invoice_reminder") {
            updates.daysBeforeDue =
                payload.daysBeforeDue !== undefined ? payload.daysBeforeDue : dispatcher.daysBeforeDue ?? 0;
            updates.daysAfterDue = null;
        }
        else if (event === "invoice_overdue") {
            updates.daysAfterDue =
                payload.daysAfterDue !== undefined ? payload.daysAfterDue : dispatcher.daysAfterDue ?? 0;
            updates.daysBeforeDue = null;
        }
        else {
            updates.daysBeforeDue = null;
            updates.daysAfterDue = null;
        }
    }
    await dispatcher.update(updates);
    await dispatcher.reload();
    return dispatcher;
};
exports.default = UpdateScheduledDispatcherService;
