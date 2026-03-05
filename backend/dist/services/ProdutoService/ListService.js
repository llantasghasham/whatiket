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
const ListService = async ({ companyId, tipo, categoriaId }) => {
    const whereCondition = {
        companyId
    };
    if (tipo) {
        whereCondition.tipo = tipo;
    }
    if (categoriaId) {
        whereCondition.categoriaId = categoriaId;
    }
    const produtos = await Produto_1.default.findAll({
        where: whereCondition,
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
        ],
        order: [["nome", "ASC"]]
    });
    return produtos;
};
exports.default = ListService;
