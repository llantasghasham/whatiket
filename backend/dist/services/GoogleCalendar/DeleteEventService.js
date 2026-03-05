"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GetIntegrationService_1 = __importDefault(require("./GetIntegrationService"));
const googleCalendarClient_1 = require("../../helpers/googleCalendarClient");
const DeleteEventService = async ({ schedule }) => {
    const companyId = schedule.companyId;
    const integration = await (0, GetIntegrationService_1.default)(companyId);
    if (!integration) {
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
    const googleEventId = schedule.googleEventId;
    if (!googleEventId) {
        return;
    }
    try {
        console.log("DeleteEventService - removendo evento do Google Calendar", "scheduleId:", schedule.id, "eventId:", googleEventId);
        await calendar.events.delete({
            calendarId: calendarIdToUse,
            eventId: googleEventId
        });
    }
    catch (err) {
        console.error("Erro ao remover evento do Google Calendar", err);
    }
};
exports.default = DeleteEventService;
