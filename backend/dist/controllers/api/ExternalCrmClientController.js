"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListCrmClientsService_1 = __importDefault(require("../../services/CrmClientService/ListCrmClientsService"));
const CreateCrmClientService_1 = __importDefault(require("../../services/CrmClientService/CreateCrmClientService"));
const ShowCrmClientService_1 = __importDefault(require("../../services/CrmClientService/ShowCrmClientService"));
const UpdateCrmClientService_1 = __importDefault(require("../../services/CrmClientService/UpdateCrmClientService"));
const DeleteCrmClientService_1 = __importDefault(require("../../services/CrmClientService/DeleteCrmClientService"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { searchParam, status, type, ownerUserId, pageNumber, limit } = req.query;
    const result = await (0, ListCrmClientsService_1.default)({
        companyId,
        searchParam,
        status,
        type,
        ownerUserId: ownerUserId ? Number(ownerUserId) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const client = await (0, ShowCrmClientService_1.default)({
        id: Number(id),
        companyId
    });
    return res.json(client);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const data = req.body;
    const client = await (0, CreateCrmClientService_1.default)({
        ...data,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "client.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            client
        }
    });
    return res.status(201).json(client);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const data = req.body;
    const client = await (0, UpdateCrmClientService_1.default)({
        id: Number(id),
        companyId: externalAuth.companyId,
        ...data
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "client.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            client
        }
    });
    return res.json(client);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    await (0, DeleteCrmClientService_1.default)({
        id: Number(id),
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "client.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            clientId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
