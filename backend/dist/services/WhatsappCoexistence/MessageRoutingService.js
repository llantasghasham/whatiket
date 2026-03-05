"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMessageDestination = exports.updateRoutingStrategy = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const updateRoutingStrategy = async ({ whatsappId, companyId, mode, rules = null }) => {
    if (!["automatic", "manual", "balanced"].includes(mode)) {
        throw new AppError_1.default("ERR_INVALID_ROUTING_MODE", 400);
    }
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    await whatsapp.update({
        messageRoutingMode: mode,
        routingRules: rules || null
    });
    return whatsapp;
};
exports.updateRoutingStrategy = updateRoutingStrategy;
const resolveMessageDestination = async (whatsappId, companyId, messageBody, metadata) => {
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (!whatsapp.coexistenceEnabled) {
        return "api";
    }
    switch (whatsapp.messageRoutingMode) {
        case "manual":
            return applyManualRules(whatsapp.routingRules || null, messageBody, metadata);
        case "balanced":
            return applyBalancedStrategy(metadata);
        case "automatic":
        default:
            return applyAutomaticStrategy(messageBody, metadata);
    }
};
exports.resolveMessageDestination = resolveMessageDestination;
const applyManualRules = (rules, messageBody, metadata) => {
    if (!rules || rules.length === 0)
        return "api";
    for (const rule of rules) {
        if (matchConditions(rule.conditions, messageBody, metadata)) {
            return rule.destination;
        }
    }
    return "api";
};
const matchConditions = (conditions, messageBody, metadata) => {
    if (conditions.keywords) {
        const keywords = Array.isArray(conditions.keywords)
            ? conditions.keywords
            : String(conditions.keywords).split(",");
        const normalizedBody = messageBody.toLowerCase();
        if (keywords.some(keyword => normalizedBody.includes(keyword.trim().toLowerCase()))) {
            return true;
        }
    }
    if (conditions.queueId && metadata?.queueId) {
        if (String(metadata.queueId) === String(conditions.queueId)) {
            return true;
        }
    }
    if (conditions.period && conditions.period.start && conditions.period.end) {
        const now = new Date();
        const start = parseTime(conditions.period.start);
        const end = parseTime(conditions.period.end);
        if (now >= start && now <= end) {
            return true;
        }
    }
    return false;
};
const applyBalancedStrategy = (metadata) => {
    if (metadata?.ticketLoad) {
        return metadata.ticketLoad > 0.5 ? "app" : "api";
    }
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 18 ? "api" : "app";
};
const applyAutomaticStrategy = (messageBody, metadata) => {
    const keywords = ["preço", "comprar", "assinar", "orçamento", "venda", "contratar"];
    const normalizedBody = messageBody.toLowerCase();
    if (keywords.some(keyword => normalizedBody.includes(keyword))) {
        return "api";
    }
    if (metadata?.sentiment === "negative") {
        return "app";
    }
    return "app";
};
const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, minutes || 0, 0, 0);
    return now;
};
