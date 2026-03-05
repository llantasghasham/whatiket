"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserGoogleCalendarIntegrationService = void 0;
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const CreateUserGoogleCalendarIntegrationService = async (data) => {
    const { userId, companyId, googleUserId, email, accessToken, refreshToken, expiryDate, calendarId } = data;
    // Verificar se já existe integração para este usuário
    const existingIntegration = await UserGoogleCalendarIntegration_1.default.findOne({
        where: { userId }
    });
    if (existingIntegration) {
        // Atualizar integração existente
        await existingIntegration.update({
            googleUserId,
            email,
            accessToken,
            refreshToken,
            expiryDate,
            calendarId,
            active: true,
            lastSyncAt: new Date()
        });
        return existingIntegration;
    }
    // Criar nova integração
    const integration = await UserGoogleCalendarIntegration_1.default.create({
        userId,
        companyId,
        googleUserId,
        email,
        accessToken,
        refreshToken,
        expiryDate,
        calendarId,
        active: true,
        lastSyncAt: new Date()
    });
    return integration;
};
exports.CreateUserGoogleCalendarIntegrationService = CreateUserGoogleCalendarIntegrationService;
exports.default = exports.CreateUserGoogleCalendarIntegrationService;
