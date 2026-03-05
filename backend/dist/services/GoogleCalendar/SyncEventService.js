"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GetIntegrationService_1 = __importDefault(require("./GetIntegrationService"));
const googleCalendarClient_1 = require("../../helpers/googleCalendarClient");
const SyncEventService = async ({ schedule }) => {
    const companyId = schedule.companyId;
    console.log("SyncEventService - iniciando sincronização com Google Calendar", "scheduleId:", schedule.id, "companyId:", companyId);
    const integration = await (0, GetIntegrationService_1.default)(companyId);
    if (!integration) {
        console.log("SyncEventService - nenhuma integração Google Calendar encontrada para companyId", companyId);
        return;
    }
    const { accessToken, refreshToken, expiryDate, calendarId } = integration;
    const tokens = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate ? expiryDate.getTime() : undefined
    };
    const calendar = (0, googleCalendarClient_1.buildCalendarClient)(tokens);
    const calendarIdToUse = calendarId || "primary";
    // Aqui vai a lógica real de montar o evento a partir do Schedule.
    // Por enquanto deixamos o esqueleto pronto para não quebrar nada.
    const event = {
        summary: schedule.body || "Compromisso",
        start: {
            dateTime: schedule.sendAt,
            timeZone: "America/Sao_Paulo"
        },
        end: {
            dateTime: schedule.sendAt,
            timeZone: "America/Sao_Paulo"
        }
    };
    try {
        const googleEventId = schedule.googleEventId;
        console.log("SyncEventService - googleEventId atual do schedule", schedule.id, "=", googleEventId);
        if (googleEventId) {
            console.log("SyncEventService - fazendo UPDATE de evento no Google Calendar para schedule", schedule.id, "eventId:", googleEventId);
            await calendar.events.update({
                calendarId: calendarIdToUse,
                eventId: googleEventId,
                requestBody: event
            });
        }
        else {
            const response = await calendar.events.insert({
                calendarId: calendarIdToUse,
                requestBody: event
            });
            const createdEvent = response.data;
            if (createdEvent && createdEvent.id) {
                console.log("SyncEventService - EVENTO CRIADO no Google Calendar para schedule", schedule.id, "eventId:", createdEvent.id);
                schedule.googleEventId = createdEvent.id;
                await schedule.save();
            }
        }
    }
    catch (err) {
        // Em caso de erro na integração, não quebra o fluxo principal.
        console.error("Erro ao sincronizar evento com Google Calendar", err);
    }
};
exports.default = SyncEventService;
