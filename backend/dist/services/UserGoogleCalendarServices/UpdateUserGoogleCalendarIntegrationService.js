"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserGoogleCalendarIntegrationService = void 0;
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const UpdateUserGoogleCalendarIntegrationService = async (userId, data) => {
    const integration = await UserGoogleCalendarIntegration_1.default.findOne({
        where: { userId }
    });
    if (!integration) {
        return null;
    }
    await integration.update(data);
    return integration;
};
exports.UpdateUserGoogleCalendarIntegrationService = UpdateUserGoogleCalendarIntegrationService;
exports.default = exports.UpdateUserGoogleCalendarIntegrationService;
