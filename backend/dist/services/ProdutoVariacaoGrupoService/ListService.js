"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../models/ProdutoVariacaoOpcao"));
const ListService = async (companyId) => {
    const grupos = await ProdutoVariacaoGrupo_1.default.findAll({
        where: { companyId },
        include: [
            {
                model: ProdutoVariacaoOpcao_1.default,
                as: "opcoes"
            }
        ],
        order: [
            ["nome", "ASC"],
            [{ model: ProdutoVariacaoOpcao_1.default, as: "opcoes" }, "ordem", "ASC"],
            [{ model: ProdutoVariacaoOpcao_1.default, as: "opcoes" }, "nome", "ASC"]
        ]
    });
    return grupos;
};
exports.default = ListService;
