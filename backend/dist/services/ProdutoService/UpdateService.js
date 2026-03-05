"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Produto_1 = __importDefault(require("../../models/Produto"));
const ProdutoCategoria_1 = __importDefault(require("../../models/ProdutoCategoria"));
const ProdutoVariacaoItem_1 = __importDefault(require("../../models/ProdutoVariacaoItem"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../models/ProdutoVariacaoOpcao"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const variacoes_1 = require("./helpers/variacoes");
const syncVariacoes_1 = require("./helpers/syncVariacoes");
const ALLOWED_TYPES = ["fisico", "digital", "imovel", "servico", "veiculo"];
const sanitizeStockValue = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return 0;
    }
    return parsed;
};
const UpdateService = async (id, companyId, data) => {
    const produto = await Produto_1.default.findOne({
        where: {
            id,
            companyId
        }
    });
    if (!produto) {
        throw new AppError_1.default("ERR_PRODUTO_NOT_FOUND", 404);
    }
    let categoriaId = data.categoriaId;
    if (data.hasOwnProperty("categoriaId")) {
        if (categoriaId) {
            const categoria = await ProdutoCategoria_1.default.findOne({
                where: {
                    id: categoriaId,
                    companyId
                }
            });
            if (!categoria) {
                throw new AppError_1.default("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
            }
        }
        else {
            categoriaId = null;
        }
    }
    else {
        categoriaId = produto.categoriaId;
    }
    const nextTipo = data.tipo ?? produto.tipo;
    if (!ALLOWED_TYPES.includes(nextTipo)) {
        throw new AppError_1.default("ERR_PRODUTO_INVALID_TYPE", 400);
    }
    let controleEstoque = produto.controleEstoque;
    let estoqueAtual = produto.estoqueAtual ?? 0;
    let estoqueMinimo = produto.estoqueMinimo ?? 0;
    if (nextTipo === "fisico") {
        if (data.hasOwnProperty("controleEstoque")) {
            controleEstoque = Boolean(data.controleEstoque);
        }
        if (controleEstoque) {
            if (data.hasOwnProperty("estoqueAtual")) {
                estoqueAtual = sanitizeStockValue(data.estoqueAtual);
            }
            if (data.hasOwnProperty("estoqueMinimo")) {
                estoqueMinimo = sanitizeStockValue(data.estoqueMinimo);
            }
        }
        else {
            estoqueAtual = 0;
            estoqueMinimo = 0;
        }
    }
    else {
        controleEstoque = false;
        estoqueAtual = 0;
        estoqueMinimo = 0;
    }
    const preparedVariacoes = await (0, variacoes_1.prepareVariacoes)(companyId, data.variacoes);
    await produto.update({
        ...data,
        tipo: nextTipo,
        categoriaId,
        controleEstoque,
        estoqueAtual,
        estoqueMinimo
    });
    await (0, syncVariacoes_1.syncVariacoes)(produto.id, preparedVariacoes);
    await produto.reload({
        include: [
            {
                model: ProdutoCategoria_1.default,
                attributes: ["id", "nome"]
            },
            {
                model: ProdutoVariacaoItem_1.default,
                include: [
                    {
                        model: ProdutoVariacaoOpcao_1.default,
                        attributes: ["id", "nome", "ordem", "grupoId"],
                        include: [
                            {
                                model: ProdutoVariacaoGrupo_1.default,
                                attributes: ["id", "nome"]
                            }
                        ]
                    }
                ]
            }
        ]
    });
    return produto;
};
exports.default = UpdateService;
