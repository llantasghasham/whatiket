"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GoogleCalendarIntegration_1 = __importDefault(require("../../models/GoogleCalendarIntegration"));
const UpsertIntegrationService = async ({ companyId, userId, googleUserId, email, accessToken, refreshToken, expiryDate, calendarId }) => {
    // Para compatibilidade, buscar por companyId apenas se userId for null
    const whereCondition = { companyId };
    if (userId !== null && userId !== undefined) {
        whereCondition.userId = userId;
    }
    const [integration] = await GoogleCalendarIntegration_1.default.findOrCreate({
        where: whereCondition,
        defaults: {
            companyId,
            userId: userId || null,
            googleUserId,
            email,
            accessToken,
            refreshToken,
            expiryDate: expiryDate || null,
            calendarId: calendarId || "primary"
        }
    });
    integration.googleUserId = googleUserId;
    integration.email = email;
    integration.accessToken = accessToken;
    integration.refreshToken = refreshToken;
    integration.expiryDate = expiryDate || null;
    integration.calendarId = calendarId || "primary";
    await integration.save();
    return integration;
};
exports.default = UpsertIntegrationService;
