"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroCategoriaService_1 = __importDefault(require("../services/FinanceiroCategoriaService/CreateFinanceiroCategoriaService"));
const ListFinanceiroCategoriasService_1 = __importDefault(require("../services/FinanceiroCategoriaService/ListFinanceiroCategoriasService"));
const ShowFinanceiroCategoriaService_1 = __importDefault(require("../services/FinanceiroCategoriaService/ShowFinanceiroCategoriaService"));
const UpdateFinanceiroCategoriaService_1 = __importDefault(require("../services/FinanceiroCategoriaService/UpdateFinanceiroCategoriaService"));
const DeleteFinanceiroCategoriaService_1 = __importDefault(require("../services/FinanceiroCategoriaService/DeleteFinanceiroCategoriaService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, tipo, ativa, pageNumber } = req.query;
    const result = await (0, ListFinanceiroCategoriasService_1.default)({
        companyId: Number(companyId),
        searchParam,
        tipo,
        ativo: ativa === "true" ? true : ativa === "false" ? false : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, ShowFinanceiroCategoriaService_1.default)(id, Number(companyId));
    return res.json(record);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const record = await (0, CreateFinanceiroCategoriaService_1.default)({
        ...req.body,
        companyId: Number(companyId)
    });
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, UpdateFinanceiroCategoriaService_1.default)({
        id,
        companyId: Number(companyId),
        ...req.body
    });
    return res.json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFinanceiroCategoriaService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
