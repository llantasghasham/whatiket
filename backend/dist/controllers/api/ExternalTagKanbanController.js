"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber, searchParam } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const whereCondition = { companyId, kanban: 1 };
    if (searchParam) {
        whereCondition.name = {
            [require("sequelize").Op.iLike]: `%${searchParam}%`
        };
    }
    const { count, rows: tags } = await Tag_1.default.findAndCountAll({
        where: whereCondition,
        attributes: ["id", "name", "color", "kanban", "timeLane", "nextLaneId", "greetingMessageLane", "rollbackLaneId", "createdAt", "updatedAt"],
        order: [["name", "ASC"]],
        limit,
        offset
    });
    const hasMore = count > offset + tags.length;
    return res.json({ tags, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const tag = await Tag_1.default.findOne({
        where: { id: Number(id), companyId, kanban: 1 },
        attributes: ["id", "name", "color", "kanban", "timeLane", "nextLaneId", "greetingMessageLane", "rollbackLaneId", "createdAt", "updatedAt"]
    });
    if (!tag) {
        throw new AppError_1.default("ERR_TAG_KANBAN_NOT_FOUND", 404);
    }
    return res.json(tag);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, color, timeLane, nextLaneId, greetingMessageLane, rollbackLaneId } = req.body;
    if (!name || !color) {
        throw new AppError_1.default("ERR_TAG_NAME_COLOR_REQUIRED", 400);
    }
    // Verificar se já existe tag kanban com mesmo nome na empresa
    const existingTag = await Tag_1.default.findOne({
        where: { name, companyId: externalAuth.companyId, kanban: 1 }
    });
    if (existingTag) {
        throw new AppError_1.default("ERR_TAG_NAME_ALREADY_EXISTS", 400);
    }
    const tag = await Tag_1.default.create({
        name,
        color,
        kanban: 1,
        timeLane: timeLane || 0,
        nextLaneId: nextLaneId || null,
        greetingMessageLane: greetingMessageLane || null,
        rollbackLaneId: rollbackLaneId || null,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "tagKanban.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            tag
        }
    });
    return res.status(201).json(tag);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, color, timeLane, nextLaneId, greetingMessageLane, rollbackLaneId } = req.body;
    const tag = await Tag_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId, kanban: 1 }
    });
    if (!tag) {
        throw new AppError_1.default("ERR_TAG_KANBAN_NOT_FOUND", 404);
    }
    // Verificar se já existe outra tag com mesmo nome
    if (name && name !== tag.name) {
        const existingTag = await Tag_1.default.findOne({
            where: { name, companyId: externalAuth.companyId, kanban: 1 }
        });
        if (existingTag) {
            throw new AppError_1.default("ERR_TAG_NAME_ALREADY_EXISTS", 400);
        }
    }
    await tag.update({
        name: name !== undefined ? name : tag.name,
        color: color !== undefined ? color : tag.color,
        timeLane: timeLane !== undefined ? timeLane : tag.timeLane,
        nextLaneId: nextLaneId !== undefined ? nextLaneId : tag.nextLaneId,
        greetingMessageLane: greetingMessageLane !== undefined ? greetingMessageLane : tag.greetingMessageLane,
        rollbackLaneId: rollbackLaneId !== undefined ? rollbackLaneId : tag.rollbackLaneId
    });
    await tag.reload();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "tagKanban.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            tag
        }
    });
    return res.json(tag);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const tag = await Tag_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId, kanban: 1 }
    });
    if (!tag) {
        throw new AppError_1.default("ERR_TAG_KANBAN_NOT_FOUND", 404);
    }
    await tag.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "tagKanban.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            tagId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
