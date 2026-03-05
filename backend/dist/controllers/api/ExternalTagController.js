"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListService_1 = __importDefault(require("../../services/TagServices/ListService"));
const ShowService_1 = __importDefault(require("../../services/TagServices/ShowService"));
const CreateService_1 = __importDefault(require("../../services/TagServices/CreateService"));
const UpdateService_1 = __importDefault(require("../../services/TagServices/UpdateService"));
const DeleteService_1 = __importDefault(require("../../services/TagServices/DeleteService"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { searchParam, pageNumber, limit, kanban, tagId } = req.query;
    const result = await (0, ListService_1.default)({
        companyId,
        searchParam,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined,
        kanban: kanban ? Number(kanban) : undefined,
        tagId: tagId ? Number(tagId) : undefined
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const tag = await (0, ShowService_1.default)(id, companyId);
    return res.json(tag);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, color, kanban, timeLane, nextLaneId, greetingMessageLane, rollbackLaneId } = req.body;
    const tag = await (0, CreateService_1.default)({
        name,
        color,
        kanban,
        companyId: externalAuth.companyId,
        timeLane,
        nextLaneId,
        greetingMessageLane,
        rollbackLaneId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "tag.created",
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
    const tagData = req.body;
    const tag = await (0, UpdateService_1.default)({
        tagData,
        id,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "tag.updated",
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
    await (0, ShowService_1.default)(id, externalAuth.companyId);
    await (0, DeleteService_1.default)({ id, companyId: externalAuth.companyId });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "tag.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            tagId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
