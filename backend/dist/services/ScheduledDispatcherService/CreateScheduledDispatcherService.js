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
exports.CreateScheduledDispatcherService = void 0;
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ScheduledDispatcher_1 = __importDefault(require("../../models/ScheduledDispatcher"));
const allowedEvents = ["birthday", "invoice_reminder", "invoice_overdue"];
const CreateScheduledDispatcherService = async (payload) => {
    const schema = Yup.object().shape({
        title: Yup.string().trim().required("Título é obrigatório"),
        messageTemplate: Yup.string().trim().required("Mensagem é obrigatória"),
        eventType: Yup.mixed().oneOf(allowedEvents),
        startTime: Yup.string()
            .matches(/^\d{2}:\d{2}$/, "startTime deve estar no formato HH:mm")
            .required(),
        sendIntervalSeconds: Yup.number().min(1).max(3600).required(),
        daysBeforeDue: Yup.number().min(0).nullable(),
        daysAfterDue: Yup.number().min(0).nullable()
    });
    try {
        await schema.validate(payload, { abortEarly: false });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const dispatcher = await ScheduledDispatcher_1.default.create({
        companyId: payload.companyId,
        title: payload.title.trim(),
        messageTemplate: payload.messageTemplate,
        eventType: payload.eventType,
        whatsappId: payload.whatsappId ?? null,
        startTime: payload.startTime,
        sendIntervalSeconds: payload.sendIntervalSeconds,
        daysBeforeDue: payload.eventType === "invoice_reminder" ? payload.daysBeforeDue ?? 0 : null,
        daysAfterDue: payload.eventType === "invoice_overdue" ? payload.daysAfterDue ?? 0 : null,
        active: payload.active ?? true
    });
    return dispatcher;
};
exports.CreateScheduledDispatcherService = CreateScheduledDispatcherService;
exports.default = exports.CreateScheduledDispatcherService;
