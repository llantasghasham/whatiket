"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListService_1 = __importDefault(require("../../services/ProdutoService/ListService"));
const ShowService_1 = __importDefault(require("../../services/ProdutoService/ShowService"));
const CreateService_1 = __importDefault(require("../../services/ProdutoService/CreateService"));
const UpdateService_1 = __importDefault(require("../../services/ProdutoService/UpdateService"));
const DeleteService_1 = __importDefault(require("../../services/ProdutoService/DeleteService"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { tipo, categoriaId } = req.query;
    const products = await (0, ListService_1.default)({
        companyId,
        tipo,
        categoriaId: categoriaId ? Number(categoriaId) : undefined
    });
    return res.json({ products });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const product = await (0, ShowService_1.default)(id, companyId);
    return res.json(product);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const data = req.body;
    const product = await (0, CreateService_1.default)({
        ...data,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "product.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            product
        }
    });
    return res.status(201).json(product);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const data = req.body;
    const product = await (0, UpdateService_1.default)(id, externalAuth.companyId, data);
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "product.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            product
        }
    });
    return res.json(product);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    await (0, DeleteService_1.default)(id, externalAuth.companyId);
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "product.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            productId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
