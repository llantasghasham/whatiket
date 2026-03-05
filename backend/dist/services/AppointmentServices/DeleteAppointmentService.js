"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const googleCalendarClient_1 = require("../../helpers/googleCalendarClient");
const DeleteAppointmentService = async (id, companyId) => {
    const appointment = await Appointment_1.default.findOne({
        where: { id, companyId }
    });
    if (!appointment) {
        throw new AppError_1.default("Compromisso não encontrado", 404);
    }
    console.log("DEBUG - Excluindo appointment:", {
        id: appointment.id,
        title: appointment.title,
        googleEventId: appointment.googleEventId,
        scheduleId: appointment.scheduleId
    });
    // Sincronizar com Google Calendar se tiver evento vinculado
    if (appointment.googleEventId) {
        try {
            console.log("DEBUG - Excluindo evento no Google Calendar:", appointment.googleEventId);
            const schedule = await UserSchedule_1.default.findOne({
                where: { id: appointment.scheduleId }
            });
            console.log("DEBUG - Schedule encontrada:", {
                id: schedule?.id,
                userGoogleCalendarIntegrationId: schedule?.userGoogleCalendarIntegrationId
            });
            if (schedule?.userGoogleCalendarIntegrationId) {
                const integration = await UserGoogleCalendarIntegration_1.default.findOne({
                    where: { id: schedule.userGoogleCalendarIntegrationId }
                });
                console.log("DEBUG - Integração encontrada:", {
                    id: integration?.id,
                    email: integration?.email,
                    hasAccessToken: !!integration?.accessToken,
                    hasRefreshToken: !!integration?.refreshToken,
                    calendarId: integration?.calendarId
                });
                if (integration && integration.accessToken) {
                    console.log("DEBUG - Chamando deleteGoogleCalendarEvent...");
                    await (0, googleCalendarClient_1.deleteGoogleCalendarEvent)(integration.accessToken, integration.refreshToken, appointment.googleEventId, integration.calendarId);
                    console.log("DEBUG - Evento excluído do Google Calendar:", appointment.googleEventId);
                }
                else {
                    console.log("DEBUG - Integração não encontrada ou sem accessToken");
                }
            }
            else {
                console.log("DEBUG - Schedule não tem integração vinculada");
            }
        }
        catch (error) {
            console.error("ERROR - Falha ao excluir evento do Google Calendar:", error);
            // Não falhar a exclusão do appointment se falhar no Google Calendar
        }
    }
    else {
        console.log("DEBUG - Appointment não tem googleEventId para excluir");
    }
    await appointment.destroy();
};
exports.default = DeleteAppointmentService;
