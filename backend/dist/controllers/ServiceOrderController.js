"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const ListServiceOrdersService_1 = __importDefault(require("../services/ServiceOrderService/ListServiceOrdersService"));
const CreateServiceOrderService_1 = __importDefault(require("../services/ServiceOrderService/CreateServiceOrderService"));
const ShowServiceOrderService_1 = __importDefault(require("../services/ServiceOrderService/ShowServiceOrderService"));
const UpdateServiceOrderService_1 = __importDefault(require("../services/ServiceOrderService/UpdateServiceOrderService"));
const DeleteServiceOrderService_1 = __importDefault(require("../services/ServiceOrderService/DeleteServiceOrderService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, status, customerId, pageNumber, limit } = req.query;
    const result = await (0, ListServiceOrdersService_1.default)({
        companyId,
        searchParam,
        status,
        customerId: customerId ? Number(customerId) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined
    });
    return res.json(result);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const payload = await (0, CreateServiceOrderService_1.default)({ ...req.body, companyId });
    return res.status(201).json(payload);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { serviceOrderId } = req.params;
    const order = await (0, ShowServiceOrderService_1.default)({ companyId, orderId: Number(serviceOrderId) });
    return res.json(order);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { serviceOrderId } = req.params;
    const payload = await (0, UpdateServiceOrderService_1.default)({
        ...req.body,
        companyId,
        orderId: Number(serviceOrderId)
    });
    return res.json(payload);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { serviceOrderId } = req.params;
    await (0, DeleteServiceOrderService_1.default)({ companyId, orderId: Number(serviceOrderId) });
    return res.status(204).send();
};
exports.remove = remove;
