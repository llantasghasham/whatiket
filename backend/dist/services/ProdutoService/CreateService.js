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
const ALLOWED_TYPES = ["fisico", "digital"];
const CreateService = async (data) => {
    let categoriaId = data.categoriaId;
    const tipo = data.tipo;
    if (!ALLOWED_TYPES.includes(tipo)) {
        throw new AppError_1.default("ERR_PRODUTO_INVALID_TYPE", 400);
    }
    let controleEstoque = false;
    let estoqueAtual = 0;
    let estoqueMinimo = 0;
    if (tipo === "fisico") {
        controleEstoque = Boolean(data.controleEstoque);
        if (controleEstoque) {
            estoqueAtual = Number.isFinite(Number(data.estoqueAtual)) ? Number(data.estoqueAtual) : 0;
            estoqueMinimo = Number.isFinite(Number(data.estoqueMinimo)) ? Number(data.estoqueMinimo) : 0;
            if (estoqueAtual < 0 || estoqueMinimo < 0) {
                throw new AppError_1.default("ERR_PRODUTO_INVALID_STOCK", 400);
            }
        }
    }
    if (categoriaId) {
        const categoria = await ProdutoCategoria_1.default.findOne({
            where: {
                id: categoriaId,
                companyId: data.companyId
            }
        });
        if (!categoria) {
            throw new AppError_1.default("ERR_PRODUTO_CATEGORIA_NOT_FOUND", 404);
        }
    }
    else {
        categoriaId = null;
    }
    const { variacoes, ...produtoPayload } = data;
    console.log("CreateService - variacoes recebidas:", variacoes);
    const preparedVariacoes = await (0, variacoes_1.prepareVariacoes)(data.companyId, variacoes);
    console.log("CreateService - variacoes preparadas:", preparedVariacoes);
    const produto = await Produto_1.default.create({
        ...produtoPayload,
        categoriaId,
        status: data.status || "disponivel",
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
exports.default = CreateService;
