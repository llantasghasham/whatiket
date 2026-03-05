"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserGoogleCalendarIntegrationService = void 0;
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const GetUserGoogleCalendarIntegrationService = async (userId) => {
    try {
        console.log("DEBUG GetUserGoogleCalendarIntegrationService - userId:", userId);
        console.log("DEBUG GetUserGoogleCalendarIntegrationService - Buscando integração...");
        const integration = await UserGoogleCalendarIntegration_1.default.findOne({
            where: {
                userId,
                active: true
            }
        });
        console.log("DEBUG GetUserGoogleCalendarIntegrationService - integration:", integration);
        return integration;
    }
    catch (err) {
        console.error("DEBUG GetUserGoogleCalendarIntegrationService - Erro:", err);
        throw err;
    }
};
exports.GetUserGoogleCalendarIntegrationService = GetUserGoogleCalendarIntegrationService;
exports.default = exports.GetUserGoogleCalendarIntegrationService;
