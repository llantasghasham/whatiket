"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const upload_1 = __importDefault(require("../config/upload"));
const ProdutoController = __importStar(require("../controllers/ProdutoController"));
const ProdutoCategoriaController = __importStar(require("../controllers/ProdutoCategoriaController"));
const ProdutoVariacaoController = __importStar(require("../controllers/ProdutoVariacaoController"));
const produtoRoutes = express_1.default.Router();
const upload = (0, multer_1.default)(upload_1.default);
produtoRoutes.get("/produtos", isAuth_1.default, ProdutoController.index);
produtoRoutes.post("/produtos", isAuth_1.default, ProdutoController.store);
produtoRoutes.get("/produtos/:produtoId", isAuth_1.default, ProdutoController.show);
produtoRoutes.put("/produtos/:produtoId", isAuth_1.default, ProdutoController.update);
produtoRoutes.delete("/produtos/:produtoId", isAuth_1.default, ProdutoController.remove);
produtoRoutes.post("/produtos/upload-imagem", isAuth_1.default, upload.single("file"), ProdutoController.uploadImagem);
produtoRoutes.get("/produto-categorias", isAuth_1.default, ProdutoCategoriaController.index);
produtoRoutes.post("/produto-categorias", isAuth_1.default, ProdutoCategoriaController.store);
produtoRoutes.get("/produto-categorias/:categoriaId", isAuth_1.default, ProdutoCategoriaController.show);
produtoRoutes.put("/produto-categorias/:categoriaId", isAuth_1.default, ProdutoCategoriaController.update);
produtoRoutes.delete("/produto-categorias/:categoriaId", isAuth_1.default, ProdutoCategoriaController.remove);
produtoRoutes.get("/produto-variacoes", isAuth_1.default, ProdutoVariacaoController.listGrupos);
produtoRoutes.post("/produto-variacoes/grupos", isAuth_1.default, ProdutoVariacaoController.createGrupo);
produtoRoutes.put("/produto-variacoes/grupos/:grupoId", isAuth_1.default, ProdutoVariacaoController.updateGrupo);
produtoRoutes.delete("/produto-variacoes/grupos/:grupoId", isAuth_1.default, ProdutoVariacaoController.deleteGrupo);
produtoRoutes.post("/produto-variacoes/opcoes", isAuth_1.default, ProdutoVariacaoController.createOpcao);
produtoRoutes.put("/produto-variacoes/opcoes/:opcaoId", isAuth_1.default, ProdutoVariacaoController.updateOpcao);
produtoRoutes.delete("/produto-variacoes/opcoes/:opcaoId", isAuth_1.default, ProdutoVariacaoController.deleteOpcao);
exports.default = produtoRoutes;
