"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFaturaService_1 = __importDefault(require("../services/FaturasService/CreateFaturaService"));
const ListFaturasService_1 = __importDefault(require("../services/FaturasService/ListFaturasService"));
const ShowFaturaService_1 = __importDefault(require("../services/FaturasService/ShowFaturaService"));
const UpdateFaturaService_1 = __importDefault(require("../services/FaturasService/UpdateFaturaService"));
const DeleteFaturaService_1 = __importDefault(require("../services/FaturasService/DeleteFaturaService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam = "", pageNumber = "1" } = req.query;
    const result = await (0, ListFaturasService_1.default)({
        companyId: +companyId,
        searchParam: String(searchParam || ""),
        pageNumber: String(pageNumber || "1")
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const fatura = await (0, ShowFaturaService_1.default)(id, +companyId);
    return res.json(fatura);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const data = req.body;
    const fatura = await (0, CreateFaturaService_1.default)({
        ...data,
        companyId: +companyId
    });
    return res.status(201).json(fatura);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const fields = req.body;
    const fatura = await (0, UpdateFaturaService_1.default)({
        id,
        companyId: +companyId,
        ...fields
    });
    return res.json(fatura);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFaturaService_1.default)(id, +companyId);
    return res.status(204).send();
};
exports.remove = remove;
