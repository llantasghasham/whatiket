"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const User_1 = __importDefault(require("../../models/User"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ListAppointmentsService = async ({ companyId, userId, profile, userType, scheduleId, status, startDate, endDate, pageNumber = "1" }) => {
    const where = { companyId };
    const normalizedUserType = (userType || "").toLowerCase();
    const isRestrictedUserType = ["attendant", "professional"].includes(normalizedUserType);
    const canViewAllSchedules = profile === "admin" || normalizedUserType === "manager";
    const shouldRestrictByUser = !canViewAllSchedules;
    // Se não for admin OU for atendente/profissional, filtra apenas compromissos das agendas do próprio usuário
    if (shouldRestrictByUser && userId) {
        const userSchedules = await UserSchedule_1.default.findAll({
            where: { userId, companyId },
            attributes: ["id"]
        });
        const scheduleIds = userSchedules.map(s => s.id);
        if (!scheduleIds.length) {
            where.scheduleId = { [sequelize_1.Op.in]: [] };
        }
        else if (scheduleId) {
            // Se especificou uma agenda, verifica se é do usuário
            if (scheduleIds.includes(Number(scheduleId))) {
                where.scheduleId = scheduleId;
            }
            else {
                // Não tem permissão, retorna vazio
                where.scheduleId = { [sequelize_1.Op.in]: [] };
            }
        }
        else {
            where.scheduleId = { [sequelize_1.Op.in]: scheduleIds };
        }
    }
    else if (scheduleId) {
        // Admin pode ver qualquer agenda
        where.scheduleId = scheduleId;
    }
    if (status) {
        where.status = status;
    }
    if (startDate && endDate) {
        where.startDatetime = {
            [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }
    else if (startDate) {
        where.startDatetime = {
            [sequelize_1.Op.gte]: new Date(startDate)
        };
    }
    else if (endDate) {
        where.startDatetime = {
            [sequelize_1.Op.lte]: new Date(endDate)
        };
    }
    const limit = 50;
    const offset = limit * (Number(pageNumber) - 1);
    const { rows, count } = await Appointment_1.default.findAndCountAll({
        where,
        include: [
            {
                model: UserSchedule_1.default,
                as: "schedule",
                include: [
                    {
                        model: User_1.default,
                        as: "user",
                        attributes: ["id", "name", "email"]
                    }
                ]
            },
            {
                model: Servico_1.default,
                as: "service",
                attributes: ["id", "nome", "valorOriginal", "valorComDesconto"]
            },
            {
                model: CrmClient_1.default,
                as: "client",
                attributes: ["id", "name", "email", "phone"]
            },
            {
                model: Contact_1.default,
                as: "contact",
                attributes: ["id", "name", "number"]
            }
        ],
        limit,
        offset,
        order: [["startDatetime", "ASC"]]
    });
    return {
        appointments: rows,
        count,
        hasMore: count > offset + rows.length
    };
};
exports.default = ListAppointmentsService;
