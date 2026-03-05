"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnlinkGoogleCalendarFromScheduleService = exports.LinkGoogleCalendarToScheduleService = void 0;
const UserGoogleCalendarIntegration_1 = __importDefault(require("../../models/UserGoogleCalendarIntegration"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const LinkGoogleCalendarToScheduleService = async (userId, scheduleId) => {
    // Buscar integração do usuário
    const integration = await UserGoogleCalendarIntegration_1.default.findOne({
        where: {
            userId,
            active: true
        }
    });
    if (!integration) {
        throw new Error("Usuário não possui integração com Google Calendar");
    }
    // Buscar agenda
    const schedule = await UserSchedule_1.default.findOne({
        where: {
            id: scheduleId,
            userId
        }
    });
    if (!schedule) {
        throw new Error("Agenda não encontrada ou não pertence ao usuário");
    }
    // Vincular integração à agenda
    await schedule.update({
        userGoogleCalendarIntegrationId: integration.id
    });
    return schedule;
};
exports.LinkGoogleCalendarToScheduleService = LinkGoogleCalendarToScheduleService;
const UnlinkGoogleCalendarFromScheduleService = async (userId, scheduleId) => {
    const schedule = await UserSchedule_1.default.findOne({
        where: {
            id: scheduleId,
            userId
        }
    });
    if (!schedule) {
        throw new Error("Agenda não encontrada ou não pertence ao usuário");
    }
    // Desvincular integração da agenda
    await schedule.update({
        userGoogleCalendarIntegrationId: null
    });
    return schedule;
};
exports.UnlinkGoogleCalendarFromScheduleService = UnlinkGoogleCalendarFromScheduleService;
exports.default = {
    LinkGoogleCalendarToScheduleService: exports.LinkGoogleCalendarToScheduleService,
    UnlinkGoogleCalendarFromScheduleService: exports.UnlinkGoogleCalendarFromScheduleService
};
