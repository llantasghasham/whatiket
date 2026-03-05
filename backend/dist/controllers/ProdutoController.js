"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImagem = exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const ListService_1 = __importDefault(require("../services/ProdutoService/ListService"));
const CreateService_1 = __importDefault(require("../services/ProdutoService/CreateService"));
const ShowService_1 = __importDefault(require("../services/ProdutoService/ShowService"));
const UpdateService_1 = __importDefault(require("../services/ProdutoService/UpdateService"));
const DeleteService_1 = __importDefault(require("../services/ProdutoService/DeleteService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { tipo, categoriaId } = req.query;
    const produtos = await (0, ListService_1.default)({
        companyId,
        tipo,
        categoriaId: categoriaId ? Number(categoriaId) : undefined
    });
    return res.json(produtos);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const data = req.body;
    console.log("Dados recebidos no controller:", data);
    const produto = await (0, CreateService_1.default)({
        ...data,
        categoriaId: data.categoriaId ? Number(data.categoriaId) : null,
        companyId
    });
    return res.status(200).json(produto);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { produtoId } = req.params;
    const produto = await (0, ShowService_1.default)(produtoId, companyId);
    return res.status(200).json(produto);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { produtoId } = req.params;
    const data = req.body;
    console.log("Dados recebidos no update:", data);
    const produto = await (0, UpdateService_1.default)(produtoId, companyId, {
        ...data,
        categoriaId: data.hasOwnProperty("categoriaId") && data.categoriaId !== undefined
            ? data.categoriaId
                ? Number(data.categoriaId)
                : null
            : undefined
    });
    return res.status(200).json(produto);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { produtoId } = req.params;
    await (0, DeleteService_1.default)(produtoId, companyId);
    return res.status(200).json({ message: "Produto deleted" });
};
exports.remove = remove;
const uploadImagem = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }
    // multer já salvou o arquivo em disco usando uploadConfig
    // Precisamos devolver o caminho relativo dentro da pasta public
    // para que o frontend consiga montar a URL correta.
    const { companyId } = req.user || {};
    const { typeArch } = (req.body || {});
    let relativePath = file.filename;
    if (typeArch && typeArch !== "announcements" && typeArch !== "logo" && companyId) {
        // espelha a lógica de upload.ts (company{companyId}/typeArch/filename)
        relativePath = `company${companyId}/${typeArch}/${file.filename}`;
    }
    return res.status(200).json({ filename: relativePath });
};
exports.uploadImagem = uploadImagem;
