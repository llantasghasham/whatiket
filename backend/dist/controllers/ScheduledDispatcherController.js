"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.toggle = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateScheduledDispatcherService_1 = __importDefault(require("../services/ScheduledDispatcherService/CreateScheduledDispatcherService"));
const ListScheduledDispatchersService_1 = __importDefault(require("../services/ScheduledDispatcherService/ListScheduledDispatchersService"));
const ShowScheduledDispatcherService_1 = __importDefault(require("../services/ScheduledDispatcherService/ShowScheduledDispatcherService"));
const UpdateScheduledDispatcherService_1 = __importDefault(require("../services/ScheduledDispatcherService/UpdateScheduledDispatcherService"));
const DeleteScheduledDispatcherService_1 = __importDefault(require("../services/ScheduledDispatcherService/DeleteScheduledDispatcherService"));
const ToggleScheduledDispatcherService_1 = __importDefault(require("../services/ScheduledDispatcherService/ToggleScheduledDispatcherService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const dispatchers = await (0, ListScheduledDispatchersService_1.default)({ companyId });
    return res.json(dispatchers);
};
exports.index = index;
const show = async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const dispatcher = await (0, ShowScheduledDispatcherService_1.default)({
        id: Number(id),
        companyId
    });
    return res.json(dispatcher);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const payload = {
        companyId,
        title: req.body.title,
        messageTemplate: req.body.messageTemplate,
        eventType: req.body.eventType,
        whatsappId: req.body.whatsappId ?? null,
        startTime: req.body.startTime,
        sendIntervalSeconds: req.body.sendIntervalSeconds,
        daysBeforeDue: req.body.daysBeforeDue,
        daysAfterDue: req.body.daysAfterDue,
        active: req.body.active
    };
    const dispatcher = await (0, CreateScheduledDispatcherService_1.default)(payload);
    return res.status(201).json(dispatcher);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const dispatcher = await (0, UpdateScheduledDispatcherService_1.default)({
        dispatcherId: Number(id),
        companyId,
        title: req.body.title,
        messageTemplate: req.body.messageTemplate,
        eventType: req.body.eventType,
        whatsappId: req.body.whatsappId,
        startTime: req.body.startTime,
        sendIntervalSeconds: req.body.sendIntervalSeconds,
        daysBeforeDue: req.body.daysBeforeDue,
        daysAfterDue: req.body.daysAfterDue,
        active: req.body.active
    });
    return res.json(dispatcher);
};
exports.update = update;
const toggle = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const { active } = req.body;
    const dispatcher = await (0, ToggleScheduledDispatcherService_1.default)({
        dispatcherId: Number(id),
        companyId,
        active
    });
    return res.json(dispatcher);
};
exports.toggle = toggle;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteScheduledDispatcherService_1.default)({
        dispatcherId: Number(id),
        companyId
    });
    return res.status(204).send();
};
exports.remove = remove;
