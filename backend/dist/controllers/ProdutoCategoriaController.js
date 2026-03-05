"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const CreateService_1 = __importDefault(require("../services/ProdutoCategoriaService/CreateService"));
const ListService_1 = __importDefault(require("../services/ProdutoCategoriaService/ListService"));
const ShowService_1 = __importDefault(require("../services/ProdutoCategoriaService/ShowService"));
const UpdateService_1 = __importDefault(require("../services/ProdutoCategoriaService/UpdateService"));
const DeleteService_1 = __importDefault(require("../services/ProdutoCategoriaService/DeleteService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const categorias = await (0, ListService_1.default)({ companyId });
    return res.json(categorias);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { nome, slug, descricao } = req.body;
    const categoria = await (0, CreateService_1.default)({ companyId, nome, slug, descricao });
    return res.status(201).json(categoria);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { categoriaId } = req.params;
    const categoria = await (0, ShowService_1.default)({ id: categoriaId, companyId });
    return res.json(categoria);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { categoriaId } = req.params;
    const { nome, slug, descricao } = req.body;
    const categoria = await (0, UpdateService_1.default)({
        id: categoriaId,
        companyId,
        nome,
        slug,
        descricao
    });
    return res.json(categoria);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { categoriaId } = req.params;
    await (0, DeleteService_1.default)({ id: categoriaId, companyId });
    return res.json({ message: "Categoria removida" });
};
exports.remove = remove;
