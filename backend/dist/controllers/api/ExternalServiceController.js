"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListServicosService_1 = __importDefault(require("../../services/ServicoService/ListServicosService"));
const ShowServicoService_1 = __importDefault(require("../../services/ServicoService/ShowServicoService"));
const CreateServicoService_1 = __importDefault(require("../../services/ServicoService/CreateServicoService"));
const UpdateServicoService_1 = __importDefault(require("../../services/ServicoService/UpdateServicoService"));
const DeleteServicoService_1 = __importDefault(require("../../services/ServicoService/DeleteServicoService"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const services = await (0, ListServicosService_1.default)({ companyId });
    return res.json({ services });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const service = await (0, ShowServicoService_1.default)({ id, companyId });
    return res.json(service);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const data = req.body;
    const service = await (0, CreateServicoService_1.default)({
        ...data,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "service.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            service
        }
    });
    return res.status(201).json(service);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const data = req.body;
    const service = await (0, UpdateServicoService_1.default)({
        id,
        companyId: externalAuth.companyId,
        ...data
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "service.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            service
        }
    });
    return res.json(service);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    await (0, DeleteServicoService_1.default)({
        id,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "service.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            serviceId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
