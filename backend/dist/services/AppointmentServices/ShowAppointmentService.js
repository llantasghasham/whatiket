"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const UserSchedule_1 = __importDefault(require("../../models/UserSchedule"));
const User_1 = __importDefault(require("../../models/User"));
const Servico_1 = __importDefault(require("../../models/Servico"));
const CrmClient_1 = __importDefault(require("../../models/CrmClient"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ShowAppointmentService = async (id, companyId) => {
    const appointment = await Appointment_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: UserSchedule_1.default,
                as: "schedule",
                include: [
                    {
                        model: User_1.default,
                        as: "user",
                        attributes: ["id", "name", "email", "startWork", "endWork"]
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
        ]
    });
    if (!appointment) {
        throw new AppError_1.default("Compromisso não encontrado", 404);
    }
    return appointment;
};
exports.default = ShowAppointmentService;
