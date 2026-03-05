"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCoexistence = exports.checkAppStatus = exports.enableCoexistence = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const graphApiHelper_1 = require("./graphApiHelper");
const enableCoexistence = async ({ whatsappId, companyId, phoneNumberId, wabaId, permanentToken, routingMode = "automatic", routingRules = null }) => {
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    try {
        await (0, graphApiHelper_1.graphRequest)(permanentToken, "post", `${phoneNumberId}/enable_coexistence`, {
            waba_id: wabaId,
            coexistence: {
                mode: routingMode,
                enable_app: true,
                enable_api: true
            }
        });
    }
    catch (error) {
        throw new AppError_1.default(`ERR_COEXISTENCE_ENABLE: ${(0, graphApiHelper_1.extractGraphError)(error)}`);
    }
    await whatsapp.update({
        coexistenceEnabled: true,
        coexistencePhoneNumberId: phoneNumberId,
        coexistenceWabaId: wabaId,
        coexistencePermanentToken: permanentToken,
        messageRoutingMode: routingMode,
        routingRules: routingRules || null
    });
    return whatsapp;
};
exports.enableCoexistence = enableCoexistence;
const checkAppStatus = async ({ whatsappId, companyId }) => {
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (!whatsapp.coexistencePhoneNumberId || !whatsapp.coexistencePermanentToken) {
        throw new AppError_1.default("ERR_COEXISTENCE_MISSING_CREDENTIALS", 400);
    }
    try {
        const status = await (0, graphApiHelper_1.graphRequest)(whatsapp.coexistencePermanentToken, "get", `${whatsapp.coexistencePhoneNumberId}/coexistence_status`);
        await whatsapp.update({
            businessAppConnected: status.app_connected,
            lastCoexistenceSync: status.last_sync ? new Date(status.last_sync) : whatsapp.lastCoexistenceSync
        });
        return {
            appConnected: status.app_connected,
            apiConnected: status.api_connected,
            lastSync: status.last_sync || whatsapp.lastCoexistenceSync?.toISOString() || null
        };
    }
    catch (error) {
        throw new AppError_1.default(`ERR_COEXISTENCE_STATUS: ${(0, graphApiHelper_1.extractGraphError)(error)}`);
    }
};
exports.checkAppStatus = checkAppStatus;
const syncCoexistence = async ({ whatsappId, companyId, force = false }) => {
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (!whatsapp.coexistencePhoneNumberId || !whatsapp.coexistencePermanentToken) {
        throw new AppError_1.default("ERR_COEXISTENCE_MISSING_CREDENTIALS", 400);
    }
    try {
        await (0, graphApiHelper_1.graphRequest)(whatsapp.coexistencePermanentToken, "post", `${whatsapp.coexistencePhoneNumberId}/coexistence_sync`, {
            waba_id: whatsapp.coexistenceWabaId,
            force
        });
        await whatsapp.update({ lastCoexistenceSync: new Date() });
        return { synced: true, forced: force };
    }
    catch (error) {
        throw new AppError_1.default(`ERR_COEXISTENCE_SYNC: ${(0, graphApiHelper_1.extractGraphError)(error)}`);
    }
};
exports.syncCoexistence = syncCoexistence;
