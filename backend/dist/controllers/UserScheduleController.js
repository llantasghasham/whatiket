"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkGoogleIntegration = exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateUserScheduleService_1 = __importDefault(require("../services/UserScheduleServices/CreateUserScheduleService"));
const ListUserSchedulesService_1 = __importDefault(require("../services/UserScheduleServices/ListUserSchedulesService"));
const ShowUserScheduleService_1 = __importDefault(require("../services/UserScheduleServices/ShowUserScheduleService"));
const UpdateUserScheduleService_1 = __importDefault(require("../services/UserScheduleServices/UpdateUserScheduleService"));
const DeleteUserScheduleService_1 = __importDefault(require("../services/UserScheduleServices/DeleteUserScheduleService"));
const index = async (req, res) => {
    const { companyId, id: userId, profile } = req.user;
    const userType = req.user.userType || "";
    const { searchParam, active, pageNumber } = req.query;
    const result = await (0, ListUserSchedulesService_1.default)({
        companyId: Number(companyId),
        userId: Number(userId),
        profile,
        userType,
        searchParam,
        active,
        pageNumber
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const schedule = await (0, ShowUserScheduleService_1.default)(id, Number(companyId));
    return res.json(schedule);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId, id: currentUserId, profile } = req.user;
    const userType = req.user.userType || "";
    const { name, description, active, userId } = req.body;
    // Se não for admin, só pode criar agenda para si mesmo
    let targetUserId = userId;
    if (profile !== "admin" && userType !== "admin") {
        targetUserId = Number(currentUserId);
    }
    const schedule = await (0, CreateUserScheduleService_1.default)({
        name,
        description,
        active,
        userId: targetUserId,
        companyId: Number(companyId)
    });
    return res.status(201).json(schedule);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const { name, description, active } = req.body;
    const schedule = await (0, UpdateUserScheduleService_1.default)({
        id,
        name,
        description,
        active,
        companyId: Number(companyId)
    });
    return res.json(schedule);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteUserScheduleService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
const linkGoogleIntegration = async (req, res) => {
    const { companyId, id: userId } = req.user;
    const { id: scheduleId } = req.params;
    const { userGoogleCalendarIntegrationId } = req.body;
    try {
        // Verificar se a integração pertence ao usuário logado
        const UserGoogleCalendarIntegration = require("../models/UserGoogleCalendarIntegration").default;
        const UserSchedule = require("../models/UserSchedule").default;
        const integration = await UserGoogleCalendarIntegration.findOne({
            where: {
                id: userGoogleCalendarIntegrationId,
                userId: userId
            }
        });
        if (!integration) {
            return res.status(404).json({ error: "Integração não encontrada ou não pertence ao usuário" });
        }
        // Verificar se a agenda pertence ao usuário ou se é admin
        const schedule = await UserSchedule.findOne({
            where: { id: scheduleId, companyId: companyId }
        });
        if (!schedule) {
            return res.status(404).json({ error: "Agenda não encontrada" });
        }
        // Vincular a integração à agenda
        await schedule.update({ userGoogleCalendarIntegrationId });
        return res.json({
            message: "Agenda vinculada ao Google Calendar com sucesso",
            schedule: schedule
        });
    }
    catch (error) {
        console.error("Erro ao vincular integração Google Calendar:", error);
        return res.status(500).json({ error: "Erro ao vincular integração" });
    }
};
exports.linkGoogleIntegration = linkGoogleIntegration;
