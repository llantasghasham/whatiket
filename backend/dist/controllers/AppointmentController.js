"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateAppointmentService_1 = __importDefault(require("../services/AppointmentServices/CreateAppointmentService"));
const ListAppointmentsService_1 = __importDefault(require("../services/AppointmentServices/ListAppointmentsService"));
const ShowAppointmentService_1 = __importDefault(require("../services/AppointmentServices/ShowAppointmentService"));
const UpdateAppointmentService_1 = __importDefault(require("../services/AppointmentServices/UpdateAppointmentService"));
const DeleteAppointmentService_1 = __importDefault(require("../services/AppointmentServices/DeleteAppointmentService"));
const index = async (req, res) => {
    const { companyId, id: userId, profile } = req.user;
    const userType = req.user.userType;
    const { scheduleId, status, startDate, endDate, pageNumber } = req.query;
    const result = await (0, ListAppointmentsService_1.default)({
        companyId: Number(companyId),
        userId: Number(userId),
        profile,
        userType,
        scheduleId,
        status,
        startDate,
        endDate,
        pageNumber
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const appointment = await (0, ShowAppointmentService_1.default)(id, Number(companyId));
    return res.json(appointment);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { title, description, startDatetime, durationMinutes, status, scheduleId, serviceId, clientId, contactId } = req.body;
    console.log("Creating appointment:", {
        title,
        startDatetime,
        durationMinutes,
        scheduleId,
        companyId
    });
    try {
        const appointment = await (0, CreateAppointmentService_1.default)({
            title,
            description,
            startDatetime,
            durationMinutes: Number(durationMinutes),
            status,
            scheduleId: Number(scheduleId),
            serviceId: serviceId ? Number(serviceId) : undefined,
            clientId: clientId ? Number(clientId) : undefined,
            contactId: contactId ? Number(contactId) : undefined,
            companyId: Number(companyId)
        });
        return res.status(201).json(appointment);
    }
    catch (err) {
        console.error("Error creating appointment:", err);
        throw err;
    }
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const { title, description, startDatetime, durationMinutes, status, serviceId, clientId, contactId } = req.body;
    const appointment = await (0, UpdateAppointmentService_1.default)({
        id,
        title,
        description,
        startDatetime,
        durationMinutes,
        status,
        serviceId,
        clientId,
        contactId,
        companyId: Number(companyId)
    });
    return res.json(appointment);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteAppointmentService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
