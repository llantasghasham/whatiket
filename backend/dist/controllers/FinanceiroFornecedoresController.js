"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroFornecedorService_1 = __importDefault(require("../services/FinanceiroFornecedorService/CreateFinanceiroFornecedorService"));
const ListFinanceiroFornecedoresService_1 = __importDefault(require("../services/FinanceiroFornecedorService/ListFinanceiroFornecedoresService"));
const ShowFinanceiroFornecedorService_1 = __importDefault(require("../services/FinanceiroFornecedorService/ShowFinanceiroFornecedorService"));
const UpdateFinanceiroFornecedorService_1 = __importDefault(require("../services/FinanceiroFornecedorService/UpdateFinanceiroFornecedorService"));
const DeleteFinanceiroFornecedorService_1 = __importDefault(require("../services/FinanceiroFornecedorService/DeleteFinanceiroFornecedorService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, categoria, ativo, pageNumber } = req.query;
    const result = await (0, ListFinanceiroFornecedoresService_1.default)({
        companyId: Number(companyId),
        searchParam,
        categoria,
        ativo: ativo === "true" ? true : ativo === "false" ? false : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, ShowFinanceiroFornecedorService_1.default)(id, Number(companyId));
    return res.json(record);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const record = await (0, CreateFinanceiroFornecedorService_1.default)({
        ...req.body,
        companyId: Number(companyId)
    });
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, UpdateFinanceiroFornecedorService_1.default)({
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
    await (0, DeleteFinanceiroFornecedorService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
