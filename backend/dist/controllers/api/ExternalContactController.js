"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListContactsService_1 = __importDefault(require("../../services/ContactServices/ListContactsService"));
const ShowContactService_1 = __importDefault(require("../../services/ContactServices/ShowContactService"));
const CreateContactService_1 = __importDefault(require("../../services/ContactServices/CreateContactService"));
const UpdateContactService_1 = __importDefault(require("../../services/ContactServices/UpdateContactService"));
const DeleteContactService_1 = __importDefault(require("../../services/ContactServices/DeleteContactService"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { searchParam, pageNumber, limit, isGroup } = req.query;
    const result = await (0, ListContactsService_1.default)({
        companyId,
        searchParam,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined,
        isGroup
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const contact = await (0, ShowContactService_1.default)(id, companyId);
    return res.json(contact);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const data = req.body;
    const contact = await (0, CreateContactService_1.default)({
        ...data,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "contact.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            contact
        }
    });
    return res.status(201).json(contact);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const data = req.body;
    const contact = await (0, UpdateContactService_1.default)({
        contactData: data,
        contactId: id,
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "contact.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            contact
        }
    });
    return res.json(contact);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    await (0, ShowContactService_1.default)(id, externalAuth.companyId);
    await (0, DeleteContactService_1.default)(id);
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "contact.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            contactId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
