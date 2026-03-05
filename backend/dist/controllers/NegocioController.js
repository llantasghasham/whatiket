"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const ListService_1 = __importDefault(require("../services/NegocioService/ListService"));
const CreateService_1 = __importDefault(require("../services/NegocioService/CreateService"));
const ShowService_1 = __importDefault(require("../services/NegocioService/ShowService"));
const UpdateService_1 = __importDefault(require("../services/NegocioService/UpdateService"));
const DeleteService_1 = __importDefault(require("../services/NegocioService/DeleteService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const negocios = await (0, ListService_1.default)(companyId);
    return res.json(negocios);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { name, description, kanbanBoards, users } = req.body;
    const negocio = await (0, CreateService_1.default)({
        companyId,
        name,
        description,
        kanbanBoards,
        users
    });
    return res.status(200).json(negocio);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { negocioId } = req.params;
    const negocio = await (0, ShowService_1.default)(negocioId, companyId);
    return res.status(200).json(negocio);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { negocioId } = req.params;
    const data = req.body;
    const negocio = await (0, UpdateService_1.default)(negocioId, companyId, data);
    return res.status(200).json(negocio);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { negocioId } = req.params;
    await (0, DeleteService_1.default)(negocioId, companyId);
    return res.status(200).json({ message: "Negocio deleted" });
};
exports.remove = remove;
