"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const User_1 = __importDefault(require("../../models/User"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const { count, rows: queues } = await Queue_1.default.findAndCountAll({
        where: { companyId },
        attributes: ["id", "name", "color", "greetingMessage", "outOfHoursMessage", "schedules", "orderQueue", "createdAt", "updatedAt"],
        order: [["orderQueue", "ASC"], ["name", "ASC"]],
        limit,
        offset
    });
    const hasMore = count > offset + queues.length;
    return res.json({ queues, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const queue = await Queue_1.default.findOne({
        where: { id: Number(id), companyId },
        attributes: ["id", "name", "color", "greetingMessage", "outOfHoursMessage", "schedules", "orderQueue", "createdAt", "updatedAt"],
        include: [
            {
                model: User_1.default,
                as: "users",
                attributes: ["id", "name", "email"],
                through: { attributes: [] }
            }
        ]
    });
    if (!queue) {
        throw new AppError_1.default("ERR_QUEUE_NOT_FOUND", 404);
    }
    return res.json(queue);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, color, greetingMessage, outOfHoursMessage, schedules, orderQueue } = req.body;
    if (!name || !color) {
        throw new AppError_1.default("ERR_QUEUE_NAME_COLOR_REQUIRED", 400);
    }
    // Verificar se já existe fila com mesmo nome na empresa
    const existingQueue = await Queue_1.default.findOne({
        where: { name, companyId: externalAuth.companyId }
    });
    if (existingQueue) {
        throw new AppError_1.default("ERR_QUEUE_NAME_ALREADY_EXISTS", 400);
    }
    // Verificar se já existe fila com mesma cor na empresa
    const existingColor = await Queue_1.default.findOne({
        where: { color, companyId: externalAuth.companyId }
    });
    if (existingColor) {
        throw new AppError_1.default("ERR_QUEUE_COLOR_ALREADY_EXISTS", 400);
    }
    const queue = await Queue_1.default.create({
        name,
        color,
        greetingMessage: greetingMessage || "",
        outOfHoursMessage: outOfHoursMessage || "",
        schedules: schedules || [],
        orderQueue: orderQueue || 0,
        companyId: externalAuth.companyId,
        ativarRoteador: false,
        tempoRoteador: 0
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "queue.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            queue
        }
    });
    return res.status(201).json(queue);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, color, greetingMessage, outOfHoursMessage, schedules, orderQueue } = req.body;
    const queue = await Queue_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!queue) {
        throw new AppError_1.default("ERR_QUEUE_NOT_FOUND", 404);
    }
    // Verificar se já existe outra fila com mesmo nome
    if (name && name !== queue.name) {
        const existingQueue = await Queue_1.default.findOne({
            where: { name, companyId: externalAuth.companyId }
        });
        if (existingQueue) {
            throw new AppError_1.default("ERR_QUEUE_NAME_ALREADY_EXISTS", 400);
        }
    }
    // Verificar se já existe outra fila com mesma cor
    if (color && color !== queue.color) {
        const existingColor = await Queue_1.default.findOne({
            where: { color, companyId: externalAuth.companyId }
        });
        if (existingColor) {
            throw new AppError_1.default("ERR_QUEUE_COLOR_ALREADY_EXISTS", 400);
        }
    }
    await queue.update({
        name: name !== undefined ? name : queue.name,
        color: color !== undefined ? color : queue.color,
        greetingMessage: greetingMessage !== undefined ? greetingMessage : queue.greetingMessage,
        outOfHoursMessage: outOfHoursMessage !== undefined ? outOfHoursMessage : queue.outOfHoursMessage,
        schedules: schedules !== undefined ? schedules : queue.schedules,
        orderQueue: orderQueue !== undefined ? orderQueue : queue.orderQueue
    });
    await queue.reload();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "queue.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            queue
        }
    });
    return res.json(queue);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const queue = await Queue_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!queue) {
        throw new AppError_1.default("ERR_QUEUE_NOT_FOUND", 404);
    }
    await queue.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "queue.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            queueId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
