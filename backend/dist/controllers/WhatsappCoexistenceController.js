"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateRouting = exports.updateRouting = exports.getRouting = exports.sync = exports.status = exports.enable = void 0;
const ShowWhatsAppService_1 = __importDefault(require("../services/WhatsappService/ShowWhatsAppService"));
const CoexistenceService_1 = require("../services/WhatsappCoexistence/CoexistenceService");
const MessageRoutingService_1 = require("../services/WhatsappCoexistence/MessageRoutingService");
const enable = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const { phoneNumberId, wabaId, permanentToken, routingMode, routingRules } = req.body;
    const whatsapp = await (0, CoexistenceService_1.enableCoexistence)({
        whatsappId,
        companyId,
        phoneNumberId,
        wabaId,
        permanentToken,
        routingMode,
        routingRules
    });
    return res.status(200).json(whatsapp);
};
exports.enable = enable;
const status = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const result = await (0, CoexistenceService_1.checkAppStatus)({ whatsappId, companyId });
    return res.status(200).json(result);
};
exports.status = status;
const sync = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const { force = false } = req.body;
    const result = await (0, CoexistenceService_1.syncCoexistence)({ whatsappId, companyId, force });
    return res.status(200).json(result);
};
exports.sync = sync;
const getRouting = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    return res.status(200).json({
        enabled: whatsapp.coexistenceEnabled,
        mode: whatsapp.messageRoutingMode,
        rules: whatsapp.routingRules || [],
        businessAppConnected: whatsapp.businessAppConnected,
        lastCoexistenceSync: whatsapp.lastCoexistenceSync
    });
};
exports.getRouting = getRouting;
const updateRouting = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const { mode, rules } = req.body;
    const whatsapp = await (0, MessageRoutingService_1.updateRoutingStrategy)({
        whatsappId,
        companyId,
        mode,
        rules: rules || null
    });
    return res.status(200).json({
        mode: whatsapp.messageRoutingMode,
        rules: whatsapp.routingRules || []
    });
};
exports.updateRouting = updateRouting;
const simulateRouting = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const { messageBody, metadata } = req.body;
    if (!messageBody) {
        return res.status(400).json({ error: "messageBody is required" });
    }
    const destination = await (0, MessageRoutingService_1.resolveMessageDestination)(whatsappId, companyId, messageBody, metadata);
    return res.status(200).json({ destination });
};
exports.simulateRouting = simulateRouting;
