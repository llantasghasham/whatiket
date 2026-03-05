"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const ListService_1 = __importDefault(require("../services/FerramentaService/ListService"));
const CreateService_1 = __importDefault(require("../services/FerramentaService/CreateService"));
const ShowService_1 = __importDefault(require("../services/FerramentaService/ShowService"));
const UpdateService_1 = __importDefault(require("../services/FerramentaService/UpdateService"));
const DeleteService_1 = __importDefault(require("../services/FerramentaService/DeleteService"));
const index = async (req, res) => {
    const { status } = req.query;
    const { companyId } = req.user;
    const ferramentas = await (0, ListService_1.default)({ status, companyId });
    return res.json(ferramentas);
};
exports.index = index;
const store = async (req, res) => {
    const data = req.body;
    const { companyId } = req.user;
    const ferramenta = await (0, CreateService_1.default)({
        ...data,
        companyId
    });
    return res.status(200).json(ferramenta);
};
exports.store = store;
const show = async (req, res) => {
    const { ferramentaId } = req.params;
    const ferramenta = await (0, ShowService_1.default)(ferramentaId);
    return res.status(200).json(ferramenta);
};
exports.show = show;
const update = async (req, res) => {
    const { ferramentaId } = req.params;
    const data = req.body;
    const ferramenta = await (0, UpdateService_1.default)(ferramentaId, data);
    return res.status(200).json(ferramenta);
};
exports.update = update;
const remove = async (req, res) => {
    const { ferramentaId } = req.params;
    await (0, DeleteService_1.default)(ferramentaId);
    return res.status(200).json({ message: "Ferramenta deleted" });
};
exports.remove = remove;
