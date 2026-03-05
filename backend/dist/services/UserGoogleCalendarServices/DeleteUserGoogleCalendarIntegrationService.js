"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserGoogleCalendarIntegrationService = void 0;
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const DeleteUserGoogleCalendarIntegrationService = async (userId) => {
    console.log("DEBUG - Deletando integração do usuário:", userId);
    // Buscar todas as integrações do usuário antes de deletar
    const integrations = await UserGoogleCalendarIntegration_1.default.findAll({
        where: { userId }
    });
    console.log("DEBUG - Integrações encontradas:", integrations.length);
    integrations.forEach(integration => {
        console.log("DEBUG - Integração:", {
            id: integration.id,
            email: integration.email,
            calendarId: integration.calendarId
        });
    });
    // Deletar apenas a integração pessoal do usuário (não empresariais)
    const deleted = await UserGoogleCalendarIntegration_1.default.destroy({
        where: {
            userId,
            // Garantir que só delete integrações pessoais (sem companyId nulo)
            companyId: { [require('sequelize').Op.ne]: null }
        }
    });
    console.log("DEBUG - Integrações deletadas:", deleted);
    return deleted > 0;
};
exports.DeleteUserGoogleCalendarIntegrationService = DeleteUserGoogleCalendarIntegrationService;
exports.default = exports.DeleteUserGoogleCalendarIntegrationService;
