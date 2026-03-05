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
const Yup = __importStar(require("yup"));
const FinanceiroCategoria_1 = __importDefault(require("../../models/FinanceiroCategoria"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const socket_1 = require("../../libs/socket");
const schema = Yup.object().shape({
    companyId: Yup.number().required(),
    nome: Yup.string().required().max(100),
    tipo: Yup.string()
        .oneOf(["despesa", "receita"])
        .required(),
    paiId: Yup.number().nullable(),
    cor: Yup.string().max(7).default("#6B7280"),
    ativo: Yup.boolean().default(true)
});
const CreateFinanceiroCategoriaService = async ({ companyId, nome, tipo, paiId, cor = "#6B7280", ativo = true, transaction }) => {
    try {
        await schema.validate({
            companyId,
            nome,
            tipo,
            paiId,
            cor,
            ativo
        });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    // Verificar se já existe categoria com mesmo nome para esta empresa
    const existingCategoria = await FinanceiroCategoria_1.default.findOne({
        where: {
            companyId,
            nome: nome.trim(),
            tipo
        },
        transaction
    });
    if (existingCategoria) {
        throw new AppError_1.default("Já existe uma categoria com este nome para este tipo.");
    }
    // Se tiver paiId, verificar se o pai existe e é do mesmo tipo
    if (paiId) {
        const categoriaPai = await FinanceiroCategoria_1.default.findByPk(paiId, {
            transaction
        });
        if (!categoriaPai) {
            throw new AppError_1.default("Categoria pai não encontrada.");
        }
        if (categoriaPai.companyId !== companyId) {
            throw new AppError_1.default("Categoria pai não pertence a esta empresa.");
        }
        if (categoriaPai.tipo !== tipo) {
            throw new AppError_1.default("Categoria pai deve ser do mesmo tipo.");
        }
    }
    const categoria = await FinanceiroCategoria_1.default.create({
        companyId,
        nome: nome.trim(),
        tipo,
        paiId,
        cor,
        ativo
    }, {
        include: [
            {
                association: "pai"
            }
        ],
        transaction
    });
    const io = (0, socket_1.getIO)();
    io.to(`company-${companyId}`).emit("financeiro_categoria", {
        action: "create",
        data: categoria
    });
    return categoria;
};
exports.default = CreateFinanceiroCategoriaService;
